'use client';

import React, { useEffect, useRef } from 'react';

interface CyberCanvas3DProps {
  chapter?: number;
}

export default function CyberCanvas3D({ chapter = 1 }: CyberCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // 3D Perspective Wireframe & Particle Nodes Animation
    let angleX = 0;
    let angleY = 0;

    // Generate 3D grid nodes
    const numNodes = 70;
    const nodes: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number }> = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01,
        rz: (Math.random() - 0.5) * 0.01
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep obsidian space background
      ctx.fillStyle = '#020204';
      ctx.fillRect(0, 0, width, height);

      // 3D Perspective Grid Projection
      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      angleX += 0.003;
      angleY += 0.005;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Color scheme based on chapter
      const cyanColor = 'rgba(0, 240, 255, ';
      const limeColor = 'rgba(204, 255, 0, ';
      const magentaColor = 'rgba(255, 0, 85, ';

      const projectedNodes: Array<{ x: number; y: number; scale: number }> = [];

      nodes.forEach((node) => {
        // Rotate in 3D
        let x = node.x;
        let y = node.y * cosX - node.z * sinX;
        let z = node.y * sinX + node.z * cosX;

        let x2 = x * cosY + z * sinY;
        let y2 = y;
        let z2 = -x * sinY + z * cosY;

        const scale = fov / (fov + z2 + 500);
        const px = x2 * scale + cx;
        const py = y2 * scale + cy;

        projectedNodes.push({ x: px, y: py, scale });

        // Draw 3D wireframe node
        if (scale > 0) {
          const alpha = Math.min(1, Math.max(0.1, scale * 0.8));
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, 3 * scale), 0, Math.PI * 2);
          ctx.fillStyle = chapter === 3 ? limeColor + alpha + ')' : chapter === 5 ? magentaColor + alpha + ')' : cyanColor + alpha + ')';
          ctx.fill();
        }
      });

      // Draw 3D mesh connecting lines
      ctx.lineWidth = 1;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.35;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = i % 3 === 0 ? limeColor + alpha + ')' : cyanColor + alpha + ')';
            ctx.stroke();
          }
        }
      }

      // Draw 3D Perspective Ground Plane Grid
      const horizon = height * 0.75;
      const numGridLines = 16;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;

      for (let i = -numGridLines; i <= numGridLines; i++) {
        const xOffset = i * (width / numGridLines);
        ctx.beginPath();
        ctx.moveTo(cx + xOffset * 0.1, horizon);
        ctx.lineTo(cx + xOffset * 2.5, height);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [chapter]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div className="cyber-scanline" />
    </div>
  );
}
