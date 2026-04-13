import { writeFile, copyFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { v4 as uuidv4 } from "uuid";
import db from "../lib/db";

const execAsync = util.promisify(exec);

// --- Subtitle Presets ---
const SUBTITLE_STYLES: Record<string, string> = {
  tiktok: "Fontname=Arial Black,Fontsize=36,PrimaryColour=&H00FFFFFF,BackColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,Bold=1",
  netflix: "Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,Outline=0.5,Shadow=1,Alignment=2",
  anime: "Fontname=Arial Black,Fontsize=36,PrimaryColour=&H00FFFFFF,OutlineColour=&H000000,BorderStyle=1,Outline=3,Shadow=0,Alignment=2",
  minimalist: "Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,Outline=0,Shadow=0.5,Alignment=2",
};

async function transcribeLocal(audioPath: string, outputPath: string, safeFfmpegPath: string) {
  const pythonScript = path.join(process.cwd(), "src", "lib", "transcribe_local.py");
  const modelName = process.env.WHISPER_MODEL || "tiny";
  const pythonPath = process.env.PYTHON_PATH || "python3";
  
  // Only add ffmpeg to PATH if we are using a local binary (Windows)
  const updatedEnv = { ...process.env };
  if (process.platform === "win32") {
    const ffmpegDir = path.dirname(safeFfmpegPath);
    updatedEnv.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH}`;
  }
  
  try {
    const cmd = `"${pythonPath}" "${pythonScript}" "${audioPath}" "${outputPath}" ${modelName}`;
    console.log(`[WORKER-WHISPER] Running: ${cmd}`);
    await execAsync(cmd, { 
      maxBuffer: 1024 * 1024 * 100,
      env: updatedEnv
    });
  } catch (err: any) {
    console.error(`[WORKER-WHISPER] Error:`, err.message);
    await writeFile(outputPath, "1\n00:00:00,000 --> 00:00:05,000\n(Gagal transkripsi lokal)");
  }
}

async function updateJobStep(jobId: string, status: string, step: string) {
  db.prepare("UPDATE jobs SET status = ?, current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, step, jobId);
}

function sanitizeFilename(name: string) {
  // Hanya izinkan alfanumerik, spasi, dash, dan underscore
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
      const clipId = uuidv4();
      
      // Descriptive filename
      const descriptiveName = `${sanitizedTitle} [${timestamp}] ${i + 1} dari ${clipsConfig.length}.mp4`;
      const outputPath = path.join(resultsDir, descriptiveName);
      const encodedUrl = `/autoclip-results/${encodeURIComponent(descriptiveName)}`;
      const clipTitle = `${sanitizedTitle} [${new Date().toLocaleDateString()}]`;

      const assPath = path.join(tempDir, `${clipId}.ass`);
      const relativeAssPath = `public/temp/${clipId}.ass`;
      const audioTempPath = path.join(tempDir, `${clipId}.mp3`);
      const rawClipPath = path.join(tempDir, `${clipId}_raw.mp4`);

      console.log(`[WORKER] Clipping ${i + 1}/${clipsConfig.length}`);
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Memotong Video)`);
      await execAsync(`"${safeFfmpegPath}" -y -ss ${config.start_time} -to ${config.end_time} -i "${originalFilePath}" -c copy "${rawClipPath}"`);
      
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Ekstraksi Audio)`);
      await execAsync(`"${safeFfmpegPath}" -y -i "${rawClipPath}" -vn -ar 16000 -ac 1 -c:a libmp3lame "${audioTempPath}"`);
      
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Transkripsi AI Local)`);
      await transcribeLocal(audioTempPath, assPath, safeFfmpegPath);

      const style = process.env.SUBTITLE_STYLE || 'tiktok';
      
      await updateJobStep(jobId, 'PROCESSING', `${stepText} (Burning Subtitle)`);
      const burnCmd = `"${safeFfmpegPath}" -y -i "${rawClipPath}" -vf "ass='${assPath}'" -c:v libx264 -preset ultrafast -c:a copy "${outputPath}"`;
      
      try {
        await execAsync(burnCmd, { maxBuffer: 1024 * 1024 * 100 });
      } catch (e: any) {
        console.error(`[WORKER] Burning failed for ${clipId}:`, e.message);
        await copyFile(rawClipPath, outputPath);
      }

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
    console.error(`[WORKER] ERROR pada job ${jobId}:`, error);
    db.prepare("UPDATE jobs SET status = 'FAILED', error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      error.message,
      jobId
    );
  }
}

async function startWorker() {
  console.log("🚀 AutoClip Background Worker Aktif [VERSI: 1.0.2 - SANITIZER AKTIF]...");
  while (true) {
    const job = db.prepare("SELECT * FROM jobs WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1").get();
    if (job) {
      await processJob(job);
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

startWorker();
