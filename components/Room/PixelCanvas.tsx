"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PixelCanvasProps {
    width: number;
    height: number;
    onObjectClick?: (objectId: string) => void;
}

interface InteractableObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    sprite?: HTMLImageElement;
    hoverSprite?: HTMLImageElement;
}

export function PixelCanvas({ width, height, onObjectClick }: PixelCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredObject, setHoveredObject] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Define interactable objects (coordinates for isometric room)
    const interactables: InteractableObject[] = [
        { id: 'bookshelf', x: 1200, y: 300, width: 300, height: 400 },
        { id: 'desk', x: 800, y: 500, width: 250, height: 200 },
        { id: 'bed', x: 200, y: 400, width: 400, height: 300 },
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Disable image smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;

        const drawRoom = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // PLACEHOLDER: Draw a simple isometric room base
            // In production, this would load sprite sheets

            // Floor (isometric diamond)
            ctx.fillStyle = '#8B7355';
            ctx.beginPath();
            ctx.moveTo(width / 2, height - 100); // Bottom point
            ctx.lineTo(width / 2 - 400, height - 300); // Left point
            ctx.lineTo(width / 2, height - 500); // Top point
            ctx.lineTo(width / 2 + 400, height - 300); // Right point
            ctx.closePath();
            ctx.fill();

            // Back wall
            ctx.fillStyle = '#D4A574';
            ctx.fillRect(width / 2 - 400, 100, 800, 400);

            // Window (placeholder)
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(width / 2 - 150, 150, 300, 250);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 4;
            ctx.strokeRect(width / 2 - 150, 150, 300, 250);

            // Bed (left side - placeholder rectangle)
            ctx.fillStyle = hoveredObject === 'bed' ? '#FFB6C1' : '#FFC0CB';
            ctx.fillRect(200, 400, 400, 300);
            if (hoveredObject === 'bed') {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(200, 400, 400, 300);
            }

            // Desk (center - placeholder)
            ctx.fillStyle = hoveredObject === 'desk' ? '#A67B5B' : '#8B4513';
            ctx.fillRect(800, 500, 250, 200);
            if (hoveredObject === 'desk') {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(800, 500, 250, 200);
            }

            // Bookshelf (right side - placeholder)
            ctx.fillStyle = hoveredObject === 'bookshelf' ? '#9B7653' : '#8B4513';
            ctx.fillRect(1200, 300, 300, 400);
            if (hoveredObject === 'bookshelf') {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(1200, 300, 300, 400);
            }

            // Add some simple book spines on bookshelf
            const bookColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = bookColors[i % bookColors.length];
                ctx.fillRect(1220 + (i * 28), 320, 25, 100);
            }
        };

        drawRoom();
        setIsLoaded(true);

        // Redraw on hover state change
    }, [hoveredObject, width, height]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Check if mouse is over any interactable
        let found = false;
        for (const obj of interactables) {
            if (x >= obj.x && x <= obj.x + obj.width &&
                y >= obj.y && y <= obj.y + obj.height) {
                setHoveredObject(obj.id);
                found = true;
                break;
            }
        }

        if (!found) {
            setHoveredObject(null);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (hoveredObject && onObjectClick) {
            onObjectClick(hoveredObject);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className="w-full h-full cursor-pointer select-none"
            style={{
                imageRendering: 'pixelated',
            }}
        />
    );
}
