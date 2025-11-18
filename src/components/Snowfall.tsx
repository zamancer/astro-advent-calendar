// Optional animated snowfall background effect

import { useEffect, useRef } from "react";

interface SnowfallProps {
  enabled: boolean;
}

export default function Snowfall({ enabled }: SnowfallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Detect current theme
    const isDarkMode = () => {
      return document.documentElement.classList.contains("dark");
    };

    // Get snowflake color based on theme
    const getSnowflakeColor = () => {
      return isDarkMode()
        ? "rgba(255, 255, 255, 0.8)"  // White for dark mode
        : "rgba(30, 41, 59, 0.6)";     // Dark slate for light mode
    };

    // Snowflake class
    class Snowflake {
      x: number;
      y: number;
      radius: number;
      speed: number;
      wind: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.radius = Math.random() * 2 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 0.5 - 0.25;
      }

      update() {
        this.y += this.speed;
        this.x += this.wind;

        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getSnowflakeColor();
        ctx.fill();
      }
    }

    // Create snowflakes
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < 100; i++) {
      snowflakes.push(new Snowflake());
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((snowflake) => {
        snowflake.update();
        snowflake.draw();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
