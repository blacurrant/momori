import React, { useEffect, useRef } from 'react';

export function Atmosphere() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        const particleCount = 100;

        // Resize
        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Init particles (Snow)
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 0.5 + Math.random() * 1, // Slower snow
                radius: 1 + Math.random() * 2, // Snowflakes
                opacity: 0.3 + Math.random() * 0.4
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffffff';

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                p.y += p.speed;
                p.x += Math.sin(p.y * 0.01) * 0.5; // Slight sway

                if (p.y > canvas.height) {
                    p.y = -5;
                    p.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animate);
        };
        animate();

        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000">
            {/* Fireplace Glow (Animated via CSS) */}
            <div className="absolute bottom-[20%] right-[15%] w-[20%] h-[30%] bg-orange-500/20 blur-[100px] animate-pulse mix-blend-screen" />

            {/* General Warmth */}
            <div className="absolute inset-0 bg-orange-900/10 mix-blend-overlay" />

            {/* Snow Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

            {/* Frosty Window Effect */}
            <div className="absolute top-[10%] left-0 w-[40%] h-[60%] bg-gradient-to-r from-blue-100/10 to-transparent blur-xl mix-blend-overlay" />
        </div>
    );
}
