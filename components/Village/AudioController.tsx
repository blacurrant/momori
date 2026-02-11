"use client";

import { useEffect, useRef } from 'react';

// Simple HTML5 Audio wrapper for ambience
export function AudioController({ src, volume = 0.3 }: { src: string; volume?: number }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        // Attempt autoplay (might be blocked by browser policy until interaction)
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay prevented:", error);
                // We could add a global "click to start" listener if needed, 
                // but usually the user has already interacted with the app by this point.
            });
        }

        return () => {
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
    }, [src, volume]);

    return null; // No UI
}
