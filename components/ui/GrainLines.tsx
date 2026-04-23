"use client";

import { useEffect, useRef } from "react";

export default function GrainLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grain effect
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const buffer = new Uint32Array(imageData.data.buffer);
      
      for (let i = 0; i < buffer.length; i++) {
        if (Math.random() < 0.03) { // 3% pixel density
          buffer[i] = 0x10FFFFFF; // Faint white noise
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      
      const lines = 10;
      const step = canvas.height / lines;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const yBase = i * step + step / 2;
        
        for (let x = 0; x < canvas.width; x += 10) {
          // Sine wave movement
          const y = yBase + Math.sin(x * 0.005 + time + i) * 30; // 30px amplitude
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
