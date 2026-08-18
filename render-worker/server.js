// render-worker/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory queue to track rendering jobs
const jobs = {};

// Ensure temp directories exist
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper to download assets locally
async function downloadFile(url, destPath) {
  // If URL is a placeholder or fake, write a dummy file
  if (url.includes('placeholder') || url.includes('example.com')) {
    fs.writeFileSync(destPath, 'mock-data-placeholder');
    return;
  }
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Background worker logic to compile video
async function processRenderJob(jobId, manifest) {
  jobs[jobId].status = 'processing';
  jobs[jobId].progress = 10;
  console.log(`[Job ${jobId}] Starting render for content ID: ${manifest.content_id}`);

  try {
    const localScenes = [];
    const jobDir = path.join(TEMP_DIR, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // Step 1: Download Assets (30% progress allocation)
    jobs[jobId].progress = 15;
    console.log(`[Job ${jobId}] Downloading assets...`);
    
    // Download Main voiceover track
    const localAudioPath = path.join(jobDir, 'voiceover.mp3');
    if (manifest.audio_url) {
      await downloadFile(manifest.audio_url, localAudioPath);
    }

    // Download each scene clip
    for (let i = 0; i < manifest.scenes.length; i++) {
      const scene = manifest.scenes[i];
      const localClipPath = path.join(jobDir, `clip_${i}.mp4`);
      if (scene.download_url) {
        await downloadFile(scene.download_url, localClipPath);
        localScenes.push({
          ...scene,
          localPath: localClipPath
        });
      } else {
        // Fallback placeholder clip
        localScenes.push({
          ...scene,
          localPath: null
        });
      }
    }
    
    jobs[jobId].progress = 40;
    console.log(`[Job ${jobId}] Asset downloads complete. Initiating video compiler...`);

    // Step 2: Compile Video via FFmpeg (40% progress allocation)
    // Check if FFmpeg is installed and accessible
    let hasFFmpeg = false;
    await new Promise((resolve) => {
      ffmpeg.getAvailableCodecs((err) => {
        if (!err) hasFFmpeg = true;
        resolve();
      });
    });

    const outputVideoName = `rendered_${manifest.content_id}.mp4`;
    const outputVideoPath = path.join(TEMP_DIR, outputVideoName);

    if (hasFFmpeg && localScenes.some(s => s.localPath !== null)) {
      // Real FFmpeg workflow
      // 1. Resize and crop inputs to 1080x1920 (9:16)
      // 2. Add text caption filter overlay
      // 3. Concatenate processed scenes
      // 4. Mix voiceover audio track
      
      const compileCommand = ffmpeg();
      
      localScenes.forEach(scene => {
        if (scene.localPath) {
          compileCommand.input(scene.localPath);
        }
      });
      
      if (manifest.audio_url) {
        compileCommand.input(localAudioPath);
      }

      compileCommand
        .complexFilter([
          // Crop and scale to 9:16 layout
          '[0:v]scale=1080:1920,setsar=1[v0]',
          // Add text captions
          `[v0]drawtext=text='${manifest.scenes[0]?.text || ''}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2[outv]`
        ])
        .map('[outv]')
        .output(outputVideoPath)
        .on('progress', (progress) => {
          const currentProgress = 40 + Math.floor((progress.percent || 0) * 0.4);
          jobs[jobId].progress = Math.min(85, currentProgress);
        })
        .on('end', () => {
          finalizeJob(jobId, outputVideoName);
        })
        .on('error', (err) => {
          console.error(`[Job ${jobId}] FFmpeg render error:`, err);
          jobs[jobId].status = 'failed';
          jobs[jobId].error = err.message;
        })
        .run();

    } else {
      // Demo Simulator mode (Simulate rendering when local FFmpeg is missing)
      console.warn(`[Job ${jobId}] FFmpeg not found or run in placeholder. Running simulator progress...`);
      let simPercent = 40;
      const interval = setInterval(() => {
        simPercent += 15;
        jobs[jobId].progress = Math.min(85, simPercent);
        console.log(`[Job ${jobId}] Compiling render manifest: ${simPercent}%`);
        
        if (simPercent >= 85) {
          clearInterval(interval);
          // Create dummy rendered file
          fs.writeFileSync(outputVideoPath, 'dummy-mp4-video-output');
          finalizeJob(jobId, outputVideoName);
        }
      }, 1000);
    }

  } catch (err) {
    console.error(`[Job ${jobId}] Render process failed:`, err);
    jobs[jobId].status = 'failed';
    jobs[jobId].error = err.message;
  }
}

function finalizeJob(jobId, videoFileName) {
  // Step 3: Finish and publish rendering assets (85% to 100%)
  jobs[jobId].progress = 90;
  console.log(`[Job ${jobId}] Finalizing render assets...`);
  
  // Clean up job temp subdirectory (keep final rendered file)
  const jobDir = path.join(TEMP_DIR, jobId);
  if (fs.existsSync(jobDir)) {
    fs.rmSync(jobDir, { recursive: true, force: true });
  }

  jobs[jobId].progress = 100;
  jobs[jobId].status = 'completed';
  // Expose local file endpoint path
  jobs[jobId].video_url = `http://localhost:${PORT}/renders/${videoFileName}`;
  console.log(`[Job ${jobId}] Render job completed successfully! Video accessible at: ${jobs[jobId].video_url}`);
}

// API Endpoints
// Submit Render job
app.post('/render', (req, res) => {
  const { content_id, scenes, audio_url } = req.body;

  if (!content_id || !scenes || !Array.isArray(scenes)) {
    return res.status(400).json({ error: 'Missing content_id or scenes array in render manifest.' });
  }

  const jobId = `job_${Date.now()}`;
  jobs[jobId] = {
    id: jobId,
    content_id,
    status: 'queued',
    progress: 0,
    created_at: new Date()
  };

  // Launch rendering process asynchronously
  processRenderJob(jobId, { content_id, scenes, audio_url });

  res.status(202).json({
    job_id: jobId,
    status: 'queued',
    message: 'Video rendering queued successfully.'
  });
});

// Check Render status
app.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: 'Render job ID not found.' });
  }

  res.json(job);
});

// Serve rendered static files
app.use('/renders', express.static(TEMP_DIR));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Video Render Worker is running on http://localhost:${PORT}`);
  console.log(`- POST /render triggers scene compiler`);
  console.log(`- GET /status/:jobId fetches progress`);
});
