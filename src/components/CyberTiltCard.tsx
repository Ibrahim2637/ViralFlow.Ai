'use client';

import React, { useState, useRef, MouseEvent } from 'react';

interface CyberTiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderColor?: 'cyan' | 'lime' | 'pink';
  maxTilt?: number; // degrees
}

export default function CyberTiltCard({
  children,
  className = '',
  style = {},
  borderColor = 'cyan',
  maxTilt = 12
}: CyberTiltCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const px = (mouseX / width - 0.5) * 2; // -1 to 1
    const py = (mouseY / height - 0.5) * 2; // -1 to 1

    setRotateY(px * maxTilt);
    setRotateX(-py * maxTilt);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const getBorderColor = () => {
    if (borderColor === 'lime') return 'var(--accent-secondary)';
    if (borderColor === 'pink') return 'var(--accent-pink)';
    return 'var(--accent-primary)';
  };

  const getShadowColor = () => {
    if (borderColor === 'lime') return '#ccff00';
    if (borderColor === 'pink') return '#ff0055';
    return '#00f0ff';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`cyber-card ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        borderColor: isHovered ? getBorderColor() : 'var(--border-color)',
        boxShadow: isHovered
          ? `8px 8px 0px ${getShadowColor()}, 0 0 25px rgba(0, 240, 255, 0.25)`
          : `4px 4px 0px ${getShadowColor()}`,
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </div>
  );
}
