import React, { useEffect, useState, useRef, useCallback } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const trailPoints = useRef([]);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const animationFrame = useRef();

  const calculateSpeed = useCallback((current, previous) => {
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    const maxAge = 2000;
    const maxPoints = 50;

    trailPoints.current = trailPoints.current
      .filter(point => now - point.timestamp < maxAge)
      .slice(-maxPoints);

    if (trailPoints.current.length < 2) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const time = now * 0.001;
    gradient.addColorStop(0, `hsl(${(time * 50) % 360}, 70%, 50%)`);
    gradient.addColorStop(0.25, `hsl(${(time * 50 + 90) % 360}, 70%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${(time * 50 + 180) % 360}, 70%, 50%)`);
    gradient.addColorStop(0.75, `hsl(${(time * 50 + 270) % 360}, 70%, 50%)`);
    gradient.addColorStop(1, `hsl(${(time * 50) % 360}, 70%, 50%)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = isHovering ? 4 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let i = 0; i < trailPoints.current.length; i++) {
      const point = trailPoints.current[i];
      const age = (now - point.timestamp) / maxAge;
      const alpha = Math.max(0, 1 - age);
      const waveFrequency = 0.1 + (point.speed * 0.01);
      const waveAmplitude = Math.min(20, point.speed * 0.5) * (isHovering ? 1.5 : 1);
      const waveOffset = Math.sin(point.timestamp * waveFrequency + time * 5) * waveAmplitude * alpha;
      const x = point.x;
      const y = point.y + waveOffset;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevPoint = trailPoints.current[i - 1];
        const prevWaveOffset = Math.sin(prevPoint.timestamp * waveFrequency + time * 5) * waveAmplitude * Math.max(0, 1 - ((now - prevPoint.timestamp) / maxAge));
        const cpx = (prevPoint.x + x) / 2;
        const cpy = (prevPoint.y + prevWaveOffset + y) / 2;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y + prevWaveOffset, cpx, cpy);
      }
    }
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    if (trailPoints.current.length > 5) {
      ctx.lineWidth = isHovering ? 2 : 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let i = 0; i < trailPoints.current.length; i++) {
        const point = trailPoints.current[i];
        const age = (now - point.timestamp) / maxAge;
        const alpha = Math.max(0, 1 - age);
        const waveFrequency = 0.2 + (point.speed * 0.02);
        const waveAmplitude = Math.min(10, point.speed * 0.25) * (isHovering ? 1.5 : 1);
        const waveOffset = Math.sin(point.timestamp * waveFrequency + time * 8) * waveAmplitude * alpha;
        const x = point.x;
        const y = point.y + waveOffset;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < trailPoints.current.length; i++) {
        const point = trailPoints.current[i];
        const age = (now - point.timestamp) / maxAge;
        const alpha = Math.max(0, 1 - age);
        const waveFrequency = 0.05 + (point.speed * 0.005);
        const waveAmplitude = Math.min(30, point.speed * 0.75) * (isHovering ? 1.5 : 1);
        const waveOffset = Math.sin(point.timestamp * waveFrequency + time * 3) * waveAmplitude * alpha;
        const x = point.x;
        const y = point.y + waveOffset;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [isHovering]);

  const animate = useCallback(() => {
    drawWaveform();
    animationFrame.current = requestAnimationFrame(animate);
  }, [drawWaveform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      const speed = calculateSpeed(newPosition, lastMousePosition.current);
      setMousePosition(newPosition);
      trailPoints.current.push({
        x: newPosition.x,
        y: newPosition.y,
        timestamp: Date.now(),
        speed: speed
      });
      lastMousePosition.current = newPosition;
      const target = e.target;
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.tagName === 'A' || 
                           target.classList.contains('cursor-interactive') ||
                           (target.closest && (target.closest('button') || target.closest('a')));
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [calculateSpeed, animate]);

  return (
    <>
      {/* Canvas for waveform trail */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          width: '100vw',
          height: '100vh',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Main cursor dot */}
      <div
        style={{
          position: 'fixed',
          width: '8px',
          height: '8px',
          background: 'black',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          mixBlendMode: 'difference',
          transition: 'all 0.2s',
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
          transform: isHovering ? 'scale(2)' : 'scale(1)',
        }}
      />
      {/* Hover indicator ring */}
      {isHovering && (
        <div
          style={{
            position: 'fixed',
            border: '2px solid black',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'all 0.3s',
            width: '40px',
            height: '40px',
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            opacity: 0.6,
            mixBlendMode: 'difference',
          }}
        />
      )}
    </>
  );
};

export default CursorTrail;