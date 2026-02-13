"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DoorTransition } from './UI/DoorTransition';

interface GalleryItem {
    id: string;
    url: string;
    title: string;
    description: string;
}

// Hall of Fame Data
const HALL_OF_FAME: GalleryItem[] = [
    { id: '1', url: '/images/IMG-20241203-WA0022.jpg', title: 'Golden Memories', description: 'A timeless moment captured in the village.' },
    { id: '2', url: '/images/IMG-20250102-WA0019.jpg', title: 'Winter Whimsy', description: 'The first frost on the cobblestones.' },
    { id: '3', url: '/images/IMG-20250102-WA0027.jpg', title: 'Emerald Canopy', description: 'Sunlight filtering through the oak leaves.' },
    { id: '4', url: '/images/IMG-20250102-WA0031.jpg', title: 'Riverside Peace', description: 'The gentle flow of the village brook.' },
    { id: '5', url: '/images/IMG-20250102-WA0033.jpg', title: 'Autumn Harvest', description: 'Celebrating the bounties of the land.' },
    { id: '6', url: '/images/IMG-20250102-WA0035.jpg', title: 'Twilight Glow', description: 'Lanterns lighting up the evening path.' },
    { id: '7', url: '/images/IMG-20250102-WA0038.jpg', title: 'Hidden Nook', description: 'A quiet place for reflection.' },
];

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
    const [activeIndex, setActiveIndex] = useState(3);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset index when opened
    useEffect(() => {
        if (isOpen) setActiveIndex(Math.floor(HALL_OF_FAME.length / 2));
    }, [isOpen]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % HALL_OF_FAME.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + HALL_OF_FAME.length) % HALL_OF_FAME.length);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <DoorTransition isOpen={true}>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 overflow-hidden">
                        {/* Ethereal Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
                        />

                        {/* Modal Container: Minimal Glass */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className={cn(
                                "relative w-full max-w-7xl h-full flex flex-col overflow-hidden",
                                "bg-black/20 backdrop-blur-3xl border border-white/5",
                                "rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
                            )}
                        >
                            {/* Static Dust Particle Overlay (Subtle) */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}
                            />

                            {/* Header */}
                            <div className="relative z-40 w-full px-8 py-6 md:px-12 md:py-10 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-white/90 text-2xl md:text-4xl font-serif tracking-tight leading-none text-amber-200/80">
                                        The Whispering Gallery
                                    </h2>
                                    <p className="text-white/20 text-[10px] md:text-xs font-serif italic uppercase tracking-[0.2em]">
                                        Captured fragments of a life lived
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="group relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all duration-700 hover:rotate-90"
                                >
                                    <div className="absolute inset-0 bg-white/5 rounded-full border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-700" />
                                    <X className="relative z-10 w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            {/* Carousel Area */}
                            <div className="flex-1 relative flex items-center justify-center perspective-1000 overflow-hidden pt-4 pb-12">
                                <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
                                    <AnimatePresence mode="popLayout">
                                        {HALL_OF_FAME.map((item, i) => {
                                            const dist = i - activeIndex;
                                            let wrappedDist = dist;
                                            if (dist > HALL_OF_FAME.length / 2) wrappedDist -= HALL_OF_FAME.length;
                                            if (dist < -HALL_OF_FAME.length / 2) wrappedDist += HALL_OF_FAME.length;

                                            const isActive = i === activeIndex;
                                            const isVisible = Math.abs(wrappedDist) <= (isMobile ? 1 : 2);

                                            if (!isVisible) return null;

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.5, x: wrappedDist * 100 }}
                                                    animate={{
                                                        x: wrappedDist * (isMobile ? 180 : 420),
                                                        z: isActive ? 100 : -200,
                                                        scale: isActive ? 1.0 : (isMobile ? 0.7 : 0.8),
                                                        opacity: 1 - Math.abs(wrappedDist) * 0.4,
                                                        rotateY: wrappedDist * (isMobile ? 30 : 45),
                                                        rotateZ: (i % 2 === 0 ? 0.5 : -0.5) * (isActive ? 0 : 2),
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 200,
                                                        damping: 30
                                                    }}
                                                    className={cn(
                                                        "absolute w-[280px] md:w-[580px] aspect-[4/3] cursor-pointer",
                                                        isActive ? "z-30" : "z-20"
                                                    )}
                                                    onClick={() => setActiveIndex(i)}
                                                >
                                                    {/* Frame: Minimal Glass */}
                                                    <div className={cn(
                                                        "w-full h-full p-2.5 rounded-2xl transition-all duration-1000",
                                                        isActive
                                                            ? "bg-white/10 ring-1 ring-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                                                            : "bg-black/20 ring-1 ring-white/5 grayscale"
                                                    )}>
                                                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/40">
                                                            <img
                                                                src={item.url}
                                                                alt={item.title}
                                                                className={cn(
                                                                    "w-full h-full object-cover transition-all duration-1000",
                                                                    isActive ? "scale-100" : "scale-110 opacity-40 group-hover:opacity-60"
                                                                )}
                                                            />

                                                            {/* Caption Overlay */}
                                                            {isActive && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent pt-20"
                                                                >
                                                                    <h3 className="text-white/90 text-xl font-serif tracking-tight text-center">
                                                                        {item.title}
                                                                    </h3>
                                                                    <p className="text-white/30 text-xs font-serif italic text-center mt-2 tracking-wide">
                                                                        {item.description}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Soft Shadow */}
                                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-black/60 blur-2xl rounded-full opacity-40" />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Minimal Navigation */}
                            <div className="relative z-40 w-full p-10 flex flex-col items-center gap-8">
                                <div className="flex items-center gap-12">
                                    <button
                                        onClick={handlePrev}
                                        className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all duration-500"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-white/20 font-serif text-sm tracking-[0.4em] uppercase">
                                            {String(activeIndex + 1).padStart(2, '0')} / {String(HALL_OF_FAME.length).padStart(2, '0')}
                                        </div>
                                        <div className="w-40 h-px bg-white/5 relative">
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-amber-200/40"
                                                animate={{ width: `${((activeIndex + 1) / HALL_OF_FAME.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all duration-500"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
