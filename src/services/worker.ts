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
  static async generateSubtitles(audioPath: string, assPath: string) {
    console.log(`[TASK-B] Sending audio to FastAPI Inference Engine...`);
    const apiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_path: audioPath, ass_path: assPath })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI Error: ${response.status} ${errorText}`);
    }
  }

  // Task C: Render/Burn Subtitles
  static async renderFinalVideo(ffmpegPath: string, rawVideo: string, assPath: string, finalOut: string) {
    const isWin = process.platform === "win32";
    // For FFmpeg ASS filter, paths need strict formatting
    const relativePathForFfmpeg = isWin ? assPath.replace(/\\/g, "/").replace(/:/g, "\\:") : assPath;
    
    // Scale and pad to 9:16 portrait
    const filterGraph = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black`;
    
    // Wrap the ASS path in single quotes to handle spaces if isWin or fallback
    const burnCmd = `"${ffmpegPath}" -y -i "${rawVideo}" -vf "${filterGraph},ass='${relativePathForFfmpeg}'" -c:v libx264 -preset ultrafast -c:a copy "${finalOut}"`;
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
      console.log(`[WORKER] Downloading YouTube: ${job.url}`);
      const ytCmd = `"${ytDlpPath}" --ffmpeg-location "${safeFfmpegPath}" --no-check-certificates -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" -o "${originalFilePath}" "${job.url}"`;
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

      // Descriptive filename
      const descriptiveName = `${sanitizedTitle} [${timestamp}] ${i + 1} dari ${clipsConfig.length}.mp4`;
      const outputPath = path.join(resultsDir, descriptiveName);
      const encodedUrl = `/api/videos/${encodeURIComponent(descriptiveName)}`;
      const clipTitle = `${sanitizedTitle} [${new Date().toLocaleDateString()}]`;

      const assPath = path.join(tempDir, `${clipId}.ass`);
      const relativeAssPath = `public/temp/${clipId}.ass`;
      const audioTempPath = path.join(tempDir, `${clipId}.mp3`);
      const rawClipPath = path.join(tempDir, `${clipId}_raw.mp4`);

      console.log(`[WORKER] Clipping ${i + 1}/${clipsConfig.length}`);
      
      // TASK A: Ekstraktor
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task A: Ekstrak Klip Mentah)`);
      await MicroTasks.extractRawClip(safeFfmpegPath, originalFilePath, startTime, endTime, rawClipPath);

      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task A: Ekstrak Audio)`);
      await MicroTasks.extractAudio(safeFfmpegPath, rawClipPath, audioTempPath);

      // TASK B: AI Teks
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task B: AI Transkripsi Cloud/Lokal)`);
      try {
        await MicroTasks.generateSubtitles(audioTempPath, assPath);
      } catch (err: any) {
        console.error(`[TASK-B] Error:`, err.message);
        const fallbackAss = `[Script Info]\nScriptType: v4.00+\nPlayResX: 384\nPlayResY: 288\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,16,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,1,1,2,10,10,10,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,(Gagal transkripsi AI Cloud/Lokal)`;
        await writeFile(assPath, fallbackAss);
      }

      // TASK C: Renderer
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Task C: Render Subtitle FFMPEG)`);
      try {
        await MicroTasks.renderFinalVideo(safeFfmpegPath, rawClipPath, assPath, outputPath);
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
