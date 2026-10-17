'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Layers } from 'lucide-react';

export interface MotionGraphicsPlayerProps {
  videoUrl?: string;
  storyboard?: Array<{
    scene?: number;
    duration?: string;
    narration?: string;
    caption?: string;
    visual_goal?: string;
    text?: string;
  }>;
  assetsUsed?: Array<{
    scene?: number;
    source?: string;
    author?: string;
    preview_link: string;
  }>;
  renderManifest?: {
    format?: string;
    fps?: number;
    motion_graphics?: {
      camera_motion?: string;
      transition_effects?: string;
      top_progress_bar?: { enabled: boolean; color: string; track_color?: string };
      hud_tech_frame?: { enabled: boolean; badge_text: string };
      floating_callout_badges?: { enabled: boolean; style: string };
      kinetic_pop_captions?: { enabled: boolean; color: string };
    };
  };
  hook?: string;
  title?: string;
  autoPlay?: boolean;
  maxWidth?: string;
}

export default function MotionGraphicsPlayer({
  videoUrl,
  storyboard = [],
  assetsUsed = [],
  renderManifest,
  hook = 'Forget everything you thought you knew about AI in 2026.',
  title = 'ViralFlow AI Render',
  autoPlay = true,
  maxWidth = '300px'
}: MotionGraphicsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [flashTransition, setFlashTransition] = useState(false);

  // Fallback default assets if none provided
  const resolvedAssets = assetsUsed.length > 0
    ? assetsUsed
    : [
        {
          scene: 1,
          preview_link: videoUrl || 'https://videos.pexels.com/video-files/8087073/8087073-hd_720_1280_25fps.mp4'
        }
      ];

  // Resolve scenes from storyboard or build defaults
  const scenes = storyboard.length > 0
    ? storyboard.map((s, idx) => {
        const rawDur = s.duration ? parseInt(s.duration.replace('s', ''), 10) : 7;
        const dur = isNaN(rawDur) ? 7 : rawDur;
        return {
          sceneNum: s.scene || idx + 1,
          durationSec: dur,
          narration: s.narration || s.text || hook,
          caption: s.caption || 'NEW AI PARADIGM!',
          visual: s.visual_goal || ''
        };
      })
    : [
        { sceneNum: 1, durationSec: 4, narration: hook, caption: 'NEW AI PARADIGM!', visual: 'Opening Hook' },
        { sceneNum: 2, durationSec: 9, narration: 'Single prompts hallucinate. Multi-agent swarms self-correct in real-time.', caption: 'SELF-CORRECTING SWARMS', visual: 'Multi-Agent Network' },
        { sceneNum: 3, durationSec: 10, narration: 'Teams deploying multi-agent pipelines report up to 70% fewer production bugs.', caption: '70% FEWER BUGS', visual: 'Productivity Metrics' },
        { sceneNum: 4, durationSec: 7, narration: 'Subscribe for weekly autonomous agent frameworks in production.', caption: 'GET THE FRAMEWORK ⚡', visual: 'Call to Action' }
      ];

  // Calculate cumulative timestamps for each scene
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0) || 30;

  // Compute active scene based on currentTime
  useEffect(() => {
    let elapsed = 0;
    let foundIdx = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (currentTime >= elapsed && currentTime < elapsed + scenes[i].durationSec) {
        foundIdx = i;
        break;
      }
      elapsed += scenes[i].durationSec;
    }
    if (foundIdx !== currentSceneIdx) {
      // Trigger white flash transition between scenes
      setFlashTransition(true);
      setTimeout(() => setFlashTransition(false), 300);
      setCurrentSceneIdx(foundIdx);
    }
  }, [currentTime, scenes, currentSceneIdx]);

  // Current video source based on active scene or primary URL
  const currentAsset = resolvedAssets[currentSceneIdx % resolvedAssets.length];
  const activeVideoSrc = currentAsset?.preview_link || videoUrl || 'https://videos.pexels.com/video-files/8087073/8087073-hd_720_1280_25fps.mp4';

  const activeScene = scenes[currentSceneIdx] || scenes[0];

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      width: '100%',
      maxWidth,
      margin: '0 auto',
      aspectRatio: '9/16',
      borderRadius: '20px',
      border: '6px solid #141414',
      backgroundColor: '#000000',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15)',
      userSelect: 'none'
    }}>
      
      {/* 1. Background Video Layer with Ken Burns slow zoom */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        transform: isPlaying ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 8s ease-out'
      }}>
        <video
          ref={videoRef}
          key={activeVideoSrc}
          src={activeVideoSrc}
          autoPlay={autoPlay}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* 2. White Flash / Light Leak Transition */}
      {flashTransition && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
          animation: 'fadeFlash 0.3s ease-out forwards',
          zIndex: 40
        }} />
      )}

      {/* 3. Top Progress Bar (from render_manifest.motion_graphics.top_progress_bar) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        backgroundColor: '#001525',
        zIndex: 50
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: '#00F0FF',
          boxShadow: '0 0 8px #00F0FF, 0 0 16px rgba(0, 240, 255, 0.8)',
          transition: 'width 0.15s linear'
        }} />
      </div>

      {/* 4. HUD Tech Frame - Cyber Corner Brackets */}
      <div style={{ position: 'absolute', top: '14px', left: '14px', width: '18px', height: '18px', borderTop: '2px solid #00F0FF', borderLeft: '2px solid #00F0FF', pointerEvents: 'none', zIndex: 30 }} />
      <div style={{ position: 'absolute', top: '14px', right: '14px', width: '18px', height: '18px', borderTop: '2px solid #00F0FF', borderRight: '2px solid #00F0FF', pointerEvents: 'none', zIndex: 30 }} />
      <div style={{ position: 'absolute', bottom: '14px', left: '14px', width: '18px', height: '18px', borderBottom: '2px solid #00F0FF', borderLeft: '2px solid #00F0FF', pointerEvents: 'none', zIndex: 30 }} />
      <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '18px', height: '18px', borderBottom: '2px solid #00F0FF', borderRight: '2px solid #00F0FF', pointerEvents: 'none', zIndex: 30 }} />

      {/* 5. Live AI Render Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        borderRadius: '4px',
        padding: '3px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 35,
        pointerEvents: 'none'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#00F0FF',
          boxShadow: '0 0 6px #00F0FF',
          animation: 'pulse 1.5s infinite'
        }} />
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#00F0FF', letterSpacing: '0.5px' }}>
          ● LIVE AI RENDER
        </span>
      </div>

      {/* 6. Scene Indicator Badge (Top Right) */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: '0.62rem',
        fontWeight: 700,
        color: '#ffffff',
        zIndex: 35,
        pointerEvents: 'none'
      }}>
        SCENE {currentSceneIdx + 1}/{scenes.length}
      </div>

      {/* 7. Floating Callout Badge (Lower-Third Neon Pill) */}
      {activeScene.caption && (
        <div style={{
          position: 'absolute',
          bottom: '105px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 35,
          pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(10, 10, 15, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #00F0FF',
            borderRadius: '9999px',
            padding: '5px 14px',
            color: '#00F0FF',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.35)',
            transform: 'scale(1)',
            animation: 'badgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            ⚡ {activeScene.caption}
          </div>
        </div>
      )}

      {/* 8. Kinetic Pop Captions (Hormozi / Beast style bold yellow text) */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        left: '14px',
        right: '14px',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        padding: '10px 14px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 0, 0.35)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
        zIndex: 35,
        pointerEvents: 'none'
      }}>
        <p style={{
          color: '#FFFF00',
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '0.82rem',
          fontWeight: 900,
          lineHeight: '1.25',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(255, 255, 0, 0.5)'
        }}>
          "{activeScene.narration}"
        </p>
      </div>

      {/* 9. Interactive Control Buttons Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '14px',
        right: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 45
      }}>
        <button
          onClick={togglePlay}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <span style={{ fontSize: '0.65rem', color: '#aaaaaa', fontWeight: 600 }}>
          {Math.floor(currentTime)}s / {Math.floor(duration || totalDuration)}s
        </span>

        <button
          onClick={toggleMute}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes badgePop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeFlash {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>

    </div>
  );
}
