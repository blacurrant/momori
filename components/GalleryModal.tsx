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
                        {/* Soft Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-[#D5ECC2]/20 backdrop-blur-sm"
                        />

                        {/* Modal Container: 2D Cartoon Style */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 60 }}
                            transition={{ type: "spring", damping: 25, stiffness: 150 }}
                            className={cn(
                                "relative w-full max-w-7xl h-full flex flex-col overflow-hidden",
                                "bg-[#FFFDF7] border-8 border-[#D5ECC2]/40",
                                "rounded-[3.5rem] shadow-[0_40px_120px_rgba(213,236,194,0.3)]"
                            )}
                        >
                            {/* Header */}
                            <div className="relative z-40 w-full px-10 py-8 md:px-14 md:py-12 flex items-center justify-between">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-[#4A4A4A] text-3xl md:text-5xl font-serif font-bold tracking-tight leading-none">
                                        The Bubbly Gallery
                                    </h2>
                                    <p className="text-[#D5ECC2] text-[11px] md:text-sm font-serif font-bold italic uppercase tracking-[0.3em]">
                                        Sweet fragments of a life lived
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="group relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-[#D5ECC2] rounded-3xl -rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-lg shadow-[#D5ECC2]/20" />
                                    <X className="relative z-10 w-8 h-8 text-white" />
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
                                                        z: isActive ? 120 : -250,
                                                        scale: isActive ? 1.0 : (isMobile ? 0.7 : 0.8),
                                                        opacity: 1 - Math.abs(wrappedDist) * 0.4,
                                                        rotateY: wrappedDist * (isMobile ? 25 : 35),
                                                        rotateZ: (i % 2 === 0 ? 1 : -1) * (isActive ? 0 : 3),
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 180,
                                                        damping: 25
                                                    }}
                                                    className={cn(
                                                        "absolute w-[280px] md:w-[620px] aspect-[4/3] cursor-pointer",
                                                        isActive ? "z-30" : "z-20"
                                                    )}
                                                    onClick={() => setActiveIndex(i)}
                                                >
                                                    {/* Frame: Polaroid Cartoon Style */}
                                                    <div className={cn(
                                                        "w-full h-full p-4 md:p-6 bg-white rounded-3xl transition-all duration-700 shadow-xl",
                                                        isActive
                                                            ? "ring-8 ring-[#D5ECC2]/50 shadow-[0_25px_90px_rgba(213,236,194,0.4)]"
                                                            : "grayscale opacity-60"
                                                    )}>
                                                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/5 border-2 border-[#E8E8E8]">
                                                            <img
                                                                src={item.url}
                                                                alt={item.title}
                                                                className={cn(
                                                                    "w-full h-full object-cover transition-all duration-1000",
                                                                    isActive ? "scale-100" : "scale-110"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Soft Shadow */}
                                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-[#D5ECC2]/20 blur-2xl rounded-full opacity-60" />
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
                                        className="w-16 h-16 rounded-3xl bg-white border-4 border-[#D5ECC2]/40 flex items-center justify-center text-[#D5ECC2] hover:bg-[#D5ECC2] hover:text-white transition-all duration-500 shadow-lg"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>

                                    <div className="flex flex-col items-center gap-3">
                                        <div className="text-[#4A4A4A]/40 font-serif font-bold text-sm tracking-[0.4em] uppercase">
                                            {String(activeIndex + 1).padStart(2, '0')} / {String(HALL_OF_FAME.length).padStart(2, '0')}
                                        </div>
                                        <div className="w-56 h-3 bg-[#E8E8E8] rounded-full relative overflow-hidden border-2 border-white">
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-[#D5ECC2]"
                                                animate={{ width: `${((activeIndex + 1) / HALL_OF_FAME.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="w-16 h-16 rounded-3xl bg-white border-4 border-[#D5ECC2]/40 flex items-center justify-center text-[#D5ECC2] hover:bg-[#D5ECC2] hover:text-white transition-all duration-500 shadow-lg"
                                    >
                                        <ChevronRight className="w-8 h-8" />
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
