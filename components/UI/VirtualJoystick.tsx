import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
    onMove: (x: number, y: number) => void;
    size?: number;
    baseColor?: string;
    stickColor?: string;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
    onMove,
    size = 100,
    baseColor = 'rgba(255, 255, 255, 0.2)',
    stickColor = 'rgba(255, 255, 255, 0.8)',
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const touchIdRef = useRef<number | null>(null);

    const radius = size / 2;
    const stickRadius = size / 4;

    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        updatePosition(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        updatePosition(clientX, clientY);
    };

    const handleEnd = () => {
        setIsDragging(false);
        setStickPosition({ x: 0, y: 0 });
        onMove(0, 0);
        touchIdRef.current = null;
    };

    const updatePosition = (clientX: number, clientY: number) => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const centerX = rect.left + radius;
        const centerY = rect.top + radius;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = radius - stickRadius;

        // Normalize direction
        let nx = dx;
        let ny = dy;

        if (distance > maxDist) {
            const ratio = maxDist / distance;
            dx *= ratio;
            dy *= ratio;
        }

        // Output normalized vector (-1 to 1)
        // Divide by maxDist to get 0-1 range intensity
        const inputX = dx / maxDist;
        const inputY = dy / maxDist;

        setStickPosition({ x: dx, y: dy });
        onMove(inputX, inputY);
    };

    // Mouse events
    const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);

    // Touch events setup via ref to prevent passive listener issues if needed, 
    // but React events are usually fine.
    const onTouchStart = (e: React.TouchEvent) => {
        // Prevent default to stop scrolling
        // e.preventDefault(); // React synthetic event might not support this well without passive: false
        const touch = e.changedTouches[0];
        touchIdRef.current = touch.identifier;
        handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        // e.preventDefault();
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
        if (touch) handleMove(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        const handleGlobalMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX, e.clientY);
        };
        const handleGlobalUp = () => {
            if (isDragging) handleEnd();
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={wrapperRef}
            className="virtual-joystick"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: baseColor,
                position: 'relative',
                touchAction: 'none', // Critical for preventing scroll on mobile
                cursor: 'pointer',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
        >
            <div
                style={{
                    width: stickRadius * 2,
                    height: stickRadius * 2,
                    borderRadius: '50%',
                    backgroundColor: stickColor,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${stickPosition.x}px, ${stickPosition.y}px)`,
                    pointerEvents: 'none', // Pass events to parent
                }}
            />
        </div>
    );
};
