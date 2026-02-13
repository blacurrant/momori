"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Music, Music2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlobalMusic() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio
        const audio = new Audio('/reawakening.mp3');
        audio.loop = true;
        audio.volume = 0.4;
        audioRef.current = audio;

        // Cleanup on unmount
        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    const toggleMusic = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => {
                console.warn("Playback blocked:", err);
            });
            setIsPlaying(true);
        }
    };

    return (
        <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
            <button
                onClick={toggleMusic}
                className={cn(
                    "group relative w-12 h-12 flex items-center justify-center transition-all duration-500",
                    "rounded-2xl shadow-xl border-2",
                    isPlaying
                        ? "bg-[#ffb74d] border-[#ffcc80] scale-110 rotate-6"
                        : "bg-[#3e2723] border-[#5d4037] hover:scale-105"
                )}
            >
                {/* Decorative Elements */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e57373] rounded-full border border-white/20 shadow-sm animate-pulse" />

                {isPlaying ? (
                    <Volume2 className="w-6 h-6 text-[#3e2723] animate-bounce" />
                ) : (
                    <VolumeX className="w-6 h-6 text-[#ffb74d] opacity-70 group-hover:opacity-100" />
                )}

                {/* Pulsing rings when playing */}
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-[#ffb74d] rounded-2xl -z-10"
                        />
                    )}
                </AnimatePresence>
            </button>

            {/* Label for better UX */}
            <div className={cn(
                "hidden md:block transition-all duration-500 overflow-hidden whitespace-nowrap px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10",
                isPlaying ? "w-32 opacity-100" : "w-0 opacity-0 px-0"
            )}>
                <span className="text-[10px] font-serif italic text-[#ffb74d] uppercase tracking-widest leading-none">
                    Now Playing...
                </span>
                <div className="text-[9px] font-sans font-bold text-white/70 truncate uppercase">
                    Reawakening
                </div>
            </div>
        </div>
    );
}
