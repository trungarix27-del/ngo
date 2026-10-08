import React, { useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker: boolean;
  gravity: number;
  friction: number;
}

interface Rocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  type: 'sphere' | 'heart' | 'star' | 'ring' | 'willow';
  trail: { x: number; y: number; alpha: number }[];
}

interface FireworksCanvasProps {
  autoLaunch?: boolean;
  soundEnabled?: boolean;
  intensity?: 'gentle' | 'medium' | 'grand';
  className?: string;
}

const PALETTES = [
  ['#FF3366', '#FF9933', '#FFFF33', '#FF0066', '#FF66B2'], // Warm sunset
  ['#00F5D4', '#7B2CBF', '#9D4EDD', '#00BBF9', '#F15BB5'], // Cyber neon
  ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#FFE494'], // Festive gold & candy
  ['#FF85A1', '#FFC2D1', '#FBB1BD', '#E0AAFF', '#C77DFF'], // Cute pastel pink & violet
  ['#FFD700', '#FFA500', '#FF4500', '#FFFFE0', '#FFF8DC'], // Golden glitter
];

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  autoLaunch = true,
  soundEnabled = false,
  intensity = 'medium',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastAutoLaunchRef = useRef<number>(0);

  const createBurst = useCallback(
    (x: number, y: number, type: 'sphere' | 'heart' | 'star' | 'ring' | 'willow', baseColor: string) => {
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const particles: Particle[] = [];
      const count = type === 'willow' ? 120 : type === 'heart' ? 90 : 80;

      // Silent fireworks (no boom sound)


      if (type === 'heart') {
        // Parametric heart: x = 16 sin^3(t), y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
        for (let i = 0; i < count; i++) {
          const t = (Math.PI * 2 * i) / count;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const speedFactor = 0.22 + Math.random() * 0.05;
          particles.push({
            x,
            y,
            vx: heartX * speedFactor,
            vy: heartY * speedFactor,
            alpha: 1,
            decay: 0.012 + Math.random() * 0.008,
            color: palette[i % palette.length],
            size: 2.5 + Math.random() * 2,
            flicker: Math.random() > 0.4,
            gravity: 0.04,
            friction: 0.96,
          });
        }
      } else if (type === 'ring') {
        // Uniform circular shockwave ring
        const speed = 4 + Math.random() * 2;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            decay: 0.014 + Math.random() * 0.006,
            color: baseColor,
            size: 3 + Math.random() * 2,
            flicker: true,
            gravity: 0.03,
            friction: 0.97,
          });
        }
      } else if (type === 'star') {
        // 5-point star explosion
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const radius = (Math.sin(angle * 5) + 1.2) * (2.8 + Math.random() * 1.5);
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * radius,
            vy: Math.sin(angle) * radius,
            alpha: 1,
            decay: 0.015 + Math.random() * 0.008,
            color: palette[Math.floor(Math.random() * palette.length)],
            size: 2.8 + Math.random() * 1.8,
            flicker: true,
            gravity: 0.04,
            friction: 0.96,
          });
        }
      } else if (type === 'willow') {
        // Lingering gold glitter trails that fall like weeping willow
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 1;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            decay: 0.006 + Math.random() * 0.005, // longer decay
            color: Math.random() > 0.3 ? '#FFD700' : '#FFF2A8',
            size: 2.2 + Math.random() * 1.5,
            flicker: true,
            gravity: 0.07,
            friction: 0.95,
          });
        }
      } else {
        // Classic sphere burst
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5.5 + 1.5;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            decay: 0.013 + Math.random() * 0.01,
            color: palette[Math.floor(Math.random() * palette.length)],
            size: 2.6 + Math.random() * 2,
            flicker: Math.random() > 0.5,
            gravity: 0.05,
            friction: 0.96,
          });
        }
      }

      particlesRef.current.push(...particles);
    },
    [soundEnabled]
  );

  const launchRocket = useCallback(
    (targetX?: number, targetY?: number, forceType?: 'sphere' | 'heart' | 'star' | 'ring' | 'willow') => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const startX = targetX !== undefined ? targetX + (Math.random() * 60 - 30) : Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
      const tX = targetX ?? Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
      const tY = targetY ?? Math.random() * (canvas.height * 0.45) + canvas.height * 0.12;

      const dx = tX - startX;
      const dy = tY - canvas.height;
      const dist = Math.hypot(dx, dy);
      const speed = 12 + Math.random() * 4;
      const vx = (dx / dist) * speed;
      const vy = (dy / dist) * speed;

      const types: ('sphere' | 'heart' | 'star' | 'ring' | 'willow')[] = ['sphere', 'heart', 'star', 'ring', 'willow'];
      const chosenType = forceType || types[Math.floor(Math.random() * types.length)];
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const color = palette[Math.floor(Math.random() * palette.length)];

      if (soundEnabled) {
        audioEngine.playFireworkLaunch();
      }

      rocketsRef.current.push({
        x: startX,
        y: canvas.height,
        targetX: tX,
        targetY: tY,
        vx,
        vy,
        color,
        type: chosenType,
        trail: [],
      });
    },
    [soundEnabled]
  );

  // Screen click handler: launch rockets towards clicked point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Launch 1 or 2 celebratory rockets towards target
    launchRocket(x, y);
    if (Math.random() > 0.4) {
      setTimeout(() => {
        launchRocket(x + (Math.random() * 80 - 40), y + (Math.random() * 60 - 30));
      }, 150);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const intervalMs = intensity === 'grand' ? 1000 : intensity === 'medium' ? 1800 : 3200;

    const render = (timestamp: number) => {
      // Semi-transparent fade to produce motion trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      // Auto launch logic
      if (autoLaunch && timestamp - lastAutoLaunchRef.current > intervalMs) {
        lastAutoLaunchRef.current = timestamp;
        launchRocket();
        if (intensity === 'grand' && Math.random() > 0.4) {
          setTimeout(() => launchRocket(), 300);
        }
      }

      // Update & Draw Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.x += r.vx;
        r.y += r.vy;

        // Trail
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 8) r.trail.shift();

        // Draw trail
        for (let j = 0; j < r.trail.length; j++) {
          const pt = r.trail[j];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 150, ${j / r.trail.length})`;
          ctx.fill();
        }

        // Check if reached destination or started falling
        const reachedTarget = r.y <= r.targetY || r.vy >= 0;
        if (reachedTarget) {
          createBurst(r.x, r.y, r.type, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * (p.flicker && Math.random() > 0.5 ? 0.4 : 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Halo glow
        if (p.size > 2) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [autoLaunch, intensity, launchRocket, createBurst]);

  // Expose manual trigger function on window for custom buttons
  useEffect(() => {
    (window as unknown as { launchCelebrationFirework: (type?: 'sphere' | 'heart' | 'star' | 'ring' | 'willow') => void }).launchCelebrationFirework = (type) => {
      const c = canvasRef.current;
      if (!c) return;
      launchRocket(c.width * 0.5 + (Math.random() * 200 - 100), c.height * 0.35, type);
    };
  }, [launchRocket]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasClick}
      className={`fixed inset-0 pointer-events-auto z-0 ${className}`}
      style={{ touchAction: 'manipulation' }}
    />
  );
};
