import { writeFile, copyFile, mkdir, unlink, chmod } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { v4 as uuidv4 } from "uuid";
import db from "../lib/db";
import http from "http";

const execAsync = util.promisify(exec);

// --- Subtitle Presets ---
const SUBTITLE_STYLES: Record<string, string> = {
  tiktok: "Fontname=Arial Black,Fontsize=36,PrimaryColour=&H00FFFFFF,BackColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,Bold=1",
  netflix: "Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,Outline=0.5,Shadow=1,Alignment=2",
  anime: "Fontname=Arial Black,Fontsize=36,PrimaryColour=&H00FFFFFF,OutlineColour=&H000000,BorderStyle=1,Outline=3,Shadow=0,Alignment=2",
  minimalist: "Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,Outline=0,Shadow=0.5,Alignment=2",
};

class MicroTasks {
  // Task A1: Potong klip mentah
  static async extractRawClip(ffmpegPath: string, original: string, start: string, end: string, out: string) {
    await execAsync(`"${ffmpegPath}" -y -ss ${start} -to ${end} -i "${original}" -c copy "${out}"`);
  }

  // Task A2: Ekstrak Audio
  static async extractAudio(ffmpegPath: string, rawVideo: string, outAudio: string) {
    await execAsync(`"${ffmpegPath}" -y -i "${rawVideo}" -vn -ar 16000 -ac 1 -c:a libmp3lame "${outAudio}"`);
  }

  // Task B: Panggil FastAPI Inference Engine
  static async generateSubtitles(audioPath: string, assPath: string, offsetSeconds: number = 0.0) {
    console.log(`[TASK-B] Sending audio to FastAPI Inference Engine with offset ${offsetSeconds}s...`);
    const apiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_path: audioPath, ass_path: assPath, offset_seconds: offsetSeconds })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI Error: ${response.status} ${errorText}`);
    }
  }

  // Task B2: Generate TTS and return duration
  static async generateTTS(text: string, outPath: string): Promise<number> {
    const isWin = process.platform === "win32";
    // We use edge-tts which should be available in PATH
    const safeText = text.replace(/"/g, '\\"');
    const ttsCmd = `edge-tts --voice id-ID-GadisNeural --text "${safeText}" --write-media "${outPath}"`;
    await execAsync(ttsCmd);

    // Get duration using ffprobe
    const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outPath}"`;
    const { stdout } = await execAsync(ffprobeCmd);
    return parseFloat(stdout.trim()) || 0;
  }

  // Task C: Render/Burn Subtitles
  static async renderFinalVideo(
    ffmpegPath: string, 
    rawVideo: string, 
    assPath: string, 
    finalOut: string, 
    userSettings: any, 
    ttsAudioPath: string | null, 
    freezeTime: number
  ) {
    const isWin = process.platform === "win32";
    const relativePathForFfmpeg = isWin ? assPath.replace(/\\/g, "/").replace(/:/g, "\\:") : assPath;
    
    let filterComplex = "";
    let inputs = `-i "${rawVideo}" `;
    let videoStream = "[0:v]";
    let inputCount = 1;

    // 1. Freeze Frame Pad
    if (freezeTime > 0) {
      filterComplex += `${videoStream}tpad=start_duration=${freezeTime}:start_mode=clone[v_frozen]; `;
      videoStream = "[v_frozen]";
    }

    // 2. Logo Overlay
    if (userSettings && userSettings.logo_url) {
      const logoPath = path.join(process.cwd(), "public", userSettings.logo_url);
      inputs += `-i "${logoPath}" `;
      const logoIdx = inputCount++;
      
      const sizeMap: Record<string, number> = { SMALL: 100, MEDIUM: 150, LARGE: 200 };
      const size = sizeMap[userSettings.logo_size] || 150;
      const opacity = userSettings.logo_opacity !== undefined ? userSettings.logo_opacity : 1.0;
      
      const posMap: Record<string, string> = {
        TOP_LEFT: "30:30",
        TOP_CENTER: "(W-w)/2:30",
        TOP_RIGHT: "W-w-30:30",
        BOTTOM_LEFT: "30:H-h-30",
        BOTTOM_CENTER: "(W-w)/2:H-h-30",
        BOTTOM_RIGHT: "W-w-30:H-h-30"
      };
      const pos = posMap[userSettings.logo_position] || posMap["TOP_CENTER"];

      filterComplex += `[${logoIdx}:v]crop=w='min(iw,ih)':h='min(iw,ih)',scale=${size}:${size},format=rgba,colorchannelmixer=aa=${opacity}[logo_processed]; `;
      filterComplex += `${videoStream}[logo_processed]overlay=x='${pos.split(':')[0]}':y='${pos.split(':')[1]}'[v_logo]; `;
      videoStream = "[v_logo]";
    }

    // 3. Scale and Pad 9:16 + Burn Subtitles
    filterComplex += `${videoStream}scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,ass='${relativePathForFfmpeg}'[vout]`;

    // Audio Processing
    let audioMap = "-map 0:a";
    if (freezeTime > 0 && ttsAudioPath) {
      inputs += `-i "${ttsAudioPath}" `;
      const ttsIdx = inputCount++;
      const delayMs = Math.round(freezeTime * 1000);
      
      // Filter graph for audio
      filterComplex += `; [0:a]adelay=delays=${delayMs}|${delayMs}[a_delayed]; `;
      filterComplex += `[a_delayed][${ttsIdx}:a]amix=inputs=2:duration=longest:dropout_transition=2[aout]`;
      audioMap = "-map \"[aout]\"";
    }

    const burnCmd = `"${ffmpegPath}" -y ${inputs} -filter_complex "${filterComplex}" -map "[vout]" ${audioMap} -c:v libx264 -preset ultrafast -c:a aac "${finalOut}"`;
    await execAsync(burnCmd, { maxBuffer: 1024 * 1024 * 100 });
  }
}

async function updateJobStep(jobId: string, status: string, step: string) {
  const result = db.prepare("UPDATE jobs SET status = ?, current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, step, jobId);
  if (result.changes === 0) {
    throw new Error("JOB_CANCELLED");
  }
}

function sanitizeFilename(name: string) {
  // Hanya izinkan alfanumerik, spasi, dash, dan underscore
  // Kita buang titik (.) karena terbukti merusak link URL di server
  return name.replace(/[^a-zA-Z0-9 \-_]/g, "").trim().substring(0, 100);
}

async function processJob(job: any) {
  const jobId = job.id;
  console.log(`[WORKER] Memproses job: ${jobId}`);

  await updateJobStep(jobId, 'PROCESSING', 'Menyiapkan folder pemrosesan...');

  try {
    const tempDir = path.join(process.cwd(), "public", "temp");
    const resultsDir = path.join(process.cwd(), "public", "autoclip-results");
    await mkdir(tempDir, { recursive: true });
    await mkdir(resultsDir, { recursive: true });

    const isWin = process.platform === "win32";
    const ytDlpPath = isWin
      ? path.join(process.cwd(), "bin", "yt-dlp.exe")
      : (process.env.YT_DLP_PATH || "yt-dlp");

    const safeFfmpegPath = isWin
      ? path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe")
      : (process.env.FFMPEG_PATH || "/usr/bin/ffmpeg");

    let originalFilePath = job.file_path;
    let videoTitle = job.video_title || "Video";

    // Get User Settings
    let userSettings = null;
    if (job.user_id) {
      userSettings = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(job.user_id);
    }

    // 1. Download YouTube if needed
    if (job.type === 'youtube' && job.url) {
      await updateJobStep(jobId, 'PROCESSING', 'Mendapatkan judul video YouTube...');
      try {
        const { stdout: ytTitle } = await execAsync(`"${ytDlpPath}" --get-title "${job.url}"`);
        videoTitle = ytTitle.trim();
        db.prepare("UPDATE jobs SET video_title = ? WHERE id = ?").run(videoTitle, jobId);
      } catch (e) {
        console.error("Gagal mengambil judul YT:", e);
      }

      await updateJobStep(jobId, 'PROCESSING', 'Mendownload video dari YouTube...');
      originalFilePath = path.join(tempDir, `${jobId}_original.mp4`);
      const fs = require('fs');
      const possibleCookiePaths = [
        path.join(process.cwd(), 'cookies.txt'),
        path.join(process.cwd(), 'data', 'cookies.txt'),
        '/app/cookies.txt',
        '/app/data/cookies.txt',
        path.join(tempDir, 'cookies.txt')
      ];

      let cookiesPath = "";
      for (const p of possibleCookiePaths) {
        if (fs.existsSync(p)) {
          cookiesPath = p;
          break;
        }
      }

      let cookiesArg = "";
      if (cookiesPath) {
        cookiesArg = ` --cookies "${cookiesPath}"`;
        console.log(`[WORKER] Menggunakan cookies di ${cookiesPath} untuk bypass YouTube Bot Check`);
      } else {
        console.warn(`[WORKER] cookies.txt tidak ditemukan di lokasi manapun. yt-dlp mungkin gagal jika diblokir bot.`);
      }

      const ytCmd = `"${ytDlpPath}" --ffmpeg-location "${safeFfmpegPath}" --no-check-certificates${cookiesArg} -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" -o "${originalFilePath}" "${job.url}"`;
      await execAsync(ytCmd, { maxBuffer: 1024 * 1024 * 100 });
    }

    const clipsConfig = JSON.parse(job.csv_config || "[]");
    const generatedClips = [];

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").split(".")[0].slice(0, 15);
    const sanitizedTitle = sanitizeFilename(videoTitle);

    // 2. FFMPEG Processing Loop
    for (let i = 0; i < clipsConfig.length; i++) {
      const stepText = `Memproses Klip ${i + 1} dari ${clipsConfig.length}...`;
      await updateJobStep(jobId, 'PROCESSING', stepText);

      const config = clipsConfig[i];
      
      // Keamanan & Pembersihan: Ambil hanya bagian waktu jika data tercampur (titik koma)
      let startTime = (config.start_time || "").toString().split(';')[0].trim();
      let endTime = (config.end_time || "").toString().split(';')[1] || (config.end_time || "").toString().split(';')[0];
      endTime = endTime.trim();

      if (!startTime || !endTime || startTime === "start_time") {
        console.warn(`[WORKER] Melewati klip ${i + 1} karena data tidak valid:`, config);
        continue;
      }

      const clipId = uuidv4();

      const topicTitle = config.topic ? sanitizeFilename(config.topic) : sanitizedTitle;

      // Descriptive filename
      const descriptiveName = `${topicTitle} [${timestamp}] ${i + 1} dari ${clipsConfig.length}.mp4`;
      const outputPath = path.join(resultsDir, descriptiveName);
      const encodedUrl = `/api/videos/${encodeURIComponent(descriptiveName)}`;
      const clipTitle = config.topic || `${sanitizedTitle} [${new Date().toLocaleDateString()}]`;

      const assPath = path.join(tempDir, `${clipId}.ass`);
      const relativeAssPath = `public/temp/${clipId}.ass`;
      const audioTempPath = path.join(tempDir, `${clipId}.mp3`);
      const rawClipPath = path.join(tempDir, `${clipId}_raw.mp4`);
      const ttsAudioPath = path.join(tempDir, `${clipId}_tts.mp3`);

      console.log(`[WORKER] Clipping ${i + 1}/${clipsConfig.length}`);
      
      // TASK A: Ekstraktor
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task A: Ekstrak Klip Mentah)`);
      await MicroTasks.extractRawClip(safeFfmpegPath, originalFilePath, startTime, endTime, rawClipPath);

      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task A: Ekstrak Audio)`);
      await MicroTasks.extractAudio(safeFfmpegPath, rawClipPath, audioTempPath);

      // TASK A3: Generate TTS
      let freezeTime = 0;
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task A: Generate AI TTS)`);
      try {
        const topicText = config.topic || "Klip Menarik";
        const ttsDuration = await MicroTasks.generateTTS(topicText, ttsAudioPath);
        if (ttsDuration > 0) {
          freezeTime = ttsDuration + 0.5;
        }
      } catch (err: any) {
        console.error(`[TASK-TTS] Error:`, err.message);
      }

      // TASK B: AI Teks
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task B: AI Transkripsi Cloud/Lokal)`);
      try {
        await MicroTasks.generateSubtitles(audioTempPath, assPath, freezeTime);
        
        // Inject Hook Subtitle
        if (freezeTime > 0) {
          const fs = require('fs');
          if (fs.existsSync(assPath)) {
            const formatAssTime = (seconds: number) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                const centiseconds = Math.floor((seconds % 1) * 100);
                return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
            };
            const hookEndStr = formatAssTime(freezeTime);
            const safeTopic = (config.topic || "").replace(/,/g, " ");
            const hookLine = `Dialogue: 1,0:00:00.00,${hookEndStr},Hook,,0,0,0,,${safeTopic}\n`;
            
            // Read ASS file and append after [Events]
            const assContent = fs.readFileSync(assPath, 'utf8');
            const newAssContent = assContent.replace('[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n', `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${hookLine}`);
            fs.writeFileSync(assPath, newAssContent);
          }
        }
      } catch (err: any) {
        console.error(`[TASK-B] Error:`, err.message);
        const fallbackAss = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,1,1,2,10,10,10,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,(Gagal transkripsi AI Cloud/Lokal)`;
        const fs = require('fs');
        fs.writeFileSync(assPath, fallbackAss);
      }

      // TASK C: Renderer
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task C: Render Efek & Subtitle FFMPEG)`);
      try {
        await MicroTasks.renderFinalVideo(safeFfmpegPath, rawClipPath, assPath, outputPath, userSettings, ttsAudioPath, freezeTime);
      } catch (e: any) {
        console.error(`[TASK-C] Burning failed for ${clipId}:`, e.message);
        await copyFile(rawClipPath, outputPath);
      }

      // Ensure public readability
      try {
        await chmod(outputPath, 0o644);
      } catch (e) { }

      // Cleanup individual clip temp files
      try {
        await unlink(rawClipPath);
        await unlink(audioTempPath);
        await unlink(assPath);
      } catch (e) {
        // Ignore if some files fail to delete
      }

      // INSERT into child table (clips)
      db.prepare(`
        INSERT INTO clips (id, job_id, title, url, start_time, end_time, topic, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        clipId,
        jobId,
        clipTitle,
        encodedUrl,
        config.start_time,
        config.end_time,
        config.topic,
        config.summary
      );

      generatedClips.push({
        id: clipId,
        url: encodedUrl,
        title: config.topic || `Klip ${i + 1}`,
        duration: `${config.start_time} - ${config.end_time}`
      });
    }

    // Cleanup per-clip temp files after loop (Optional, but good practice)
    for (let i = 0; i < clipsConfig.length; i++) {
      // clipId is local to the loop before, we might need a better way if we want to delete them here
      // Better: delete them inside the loop right after they are used.
    }

    // FINAL CLEANUP: Delete the original downloaded/uploaded file
    try {
      if (originalFilePath && originalFilePath.includes("temp/")) {
        console.log(`[WORKER] Cleaning up original file: ${originalFilePath}`);
        await unlink(originalFilePath);
      }
    } catch (e) {
      console.error("[WORKER] Cleanup original file failed:", e);
    }

    db.prepare("UPDATE jobs SET status = 'COMPLETED', current_step = 'Selesai!', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      jobId
    );
    console.log(`[WORKER] Job ${jobId} SELESAI!`);

  } catch (error: any) {
    if (error.message === "JOB_CANCELLED") {
      console.log(`[WORKER] Job ${jobId} di-cancel oleh user. Menghentikan pipeline.`);
      return;
    }
    console.error(`[WORKER] ERROR pada job ${jobId}:`, error);
    try {
      db.prepare("UPDATE jobs SET status = 'FAILED', error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        error.message,
        jobId
      );
    } catch(e) {}
  }
}

let isProcessing = false;

async function checkAndProcessJobs() {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    while (true) {
      const job = db.prepare("SELECT * FROM jobs WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1").get();
      if (!job) break;
      
      await processJob(job);
    }
  } catch (error) {
    console.error("[WORKER] Queue Loop Error:", error);
  } finally {
    isProcessing = false;
  }
}

async function startWorker() {
  console.log("🚀 AutoClip Background Worker Aktif [VERSI: 2.0 - EVENT DRIVEN]...");
  
  const server = http.createServer((req, res) => {
    if (req.url === '/ping' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'waking up' }));
      
      // Asynchronously trigger processing
      checkAndProcessJobs().catch(console.error);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(3002, '127.0.0.1', () => {
    console.log("📡 Worker mendengarkan event trigger di port 3002...");
    // Process any jobs left from previous crashes
    checkAndProcessJobs().catch(console.error);
  });
}

startWorker();
