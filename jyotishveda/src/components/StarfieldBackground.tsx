import React, { useEffect, useRef } from 'react';

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; radius: number; speed: number; opacity: number, twinkleSpeed: number, colorType: number }[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 3500); // Responsive star count
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          speed: Math.random() * 0.15 + 0.05,
          opacity: Math.random(),
          twinkleSpeed: (Math.random() - 0.5) * 0.03,
          colorType: Math.random()
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth mouse interpolation for parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Base space color
      ctx.fillStyle = '#0D0D0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle nebula gradients
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5 - mouseX * 0.1, canvas.height * 0.5 - mouseY * 0.1, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7
      );
      gradient.addColorStop(0, 'rgba(201, 160, 80, 0.04)'); // subtle gold glow in center
      gradient.addColorStop(0.5, 'rgba(30, 25, 40, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Move star up slowly
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }

        // Parallax offset
        const offsetX = (mouseX / canvas.width) * star.speed * 40;
        const offsetY = (mouseY / canvas.height) * star.speed * 40;

        // Twinkle
        star.opacity += star.twinkleSpeed;
        if (star.opacity < 0.1 || star.opacity > 1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
        
        // Star colors
        if (star.colorType > 0.95) ctx.fillStyle = `rgba(201, 160, 80, ${star.opacity})`; // Gold
        else if (star.colorType > 0.85) ctx.fillStyle = `rgba(150, 200, 255, ${star.opacity})`; // Blueish
        else ctx.fillStyle = `rgba(229, 225, 216, ${star.opacity})`; // Silver/White

        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Center based coords (-width/2 to width/2)
      targetMouseX = e.clientX - window.innerWidth / 2;
      targetMouseY = e.clientY - window.innerHeight / 2;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-[-1] pointer-events-none"
    />
  );
};
