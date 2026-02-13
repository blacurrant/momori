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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0, rotateX: -20 }}
                            className={cn(
                                "relative w-full max-w-6xl h-[85vh] md:h-[80vh] overflow-hidden",
                                "bg-[#1a1a1a] border-4 md:border-[12px] border-[#2c1810]",
                                "rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)]",
                                "flex flex-col"
                            )}
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-0"
                                style={{
                                    backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-matter.png")`
                                }}
                            />

                            {/* Header */}
                            <div className="relative z-40 w-full p-6 md:p-8 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h2 className="text-[#ffb74d] text-2xl md:text-4xl font-serif tracking-tight drop-shadow-lg">
                                        Hall of Memories
                                    </h2>
                                    <p className="text-[#a1887f] text-[10px] md:text-xs font-serif italic mt-1 tracking-widest uppercase opacity-60">
                                        A collection of cherished digital moments
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="group relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center transition-all hover:rotate-90"
                                >
                                    <div className="absolute inset-0 bg-[#c62828] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] border-2 border-[#b71c1c]" />
                                    <X className="relative z-10 w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Carousel Area */}
                            <div className="flex-1 relative flex items-center justify-center perspective-1000 overflow-hidden pt-10 pb-20">
                                <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
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
                                                        x: wrappedDist * (isMobile ? 140 : 380),
                                                        z: isActive ? 100 : -200,
                                                        scale: isActive ? 1.0 : (isMobile ? 0.7 : 0.8),
                                                        opacity: 1 - Math.abs(wrappedDist) * 0.4,
                                                        rotateY: wrappedDist * (isMobile ? 30 : 45),
                                                        rotateZ: (i % 2 === 0 ? 1 : -1) * (isActive ? 0 : 2),
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 260,
                                                        damping: 25
                                                    }}
                                                    className={cn(
                                                        "absolute w-[260px] md:w-[500px] aspect-[4/3] cursor-pointer",
                                                        isActive ? "z-30" : "z-20"
                                                    )}
                                                    onClick={() => setActiveIndex(i)}
                                                >
                                                    {/* Frame */}
                                                    <div className={cn(
                                                        "w-full h-full p-2 md:p-4 rounded-xl shadow-2xl transition-all duration-500",
                                                        isActive
                                                            ? "bg-[#ffb74d] border-4 border-white shadow-[0_0_50px_rgba(255,183,77,0.3)]"
                                                            : "bg-[#2c1810] border-4 border-[#3e2723]"
                                                    )}>
                                                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/20">
                                                            <img
                                                                src={item.url}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                            />

                                                            {/* Caption Overlay */}
                                                            {isActive && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12"
                                                                >
                                                                    <h3 className="text-white text-lg font-serif font-bold text-center">
                                                                        {item.title}
                                                                    </h3>
                                                                    <p className="text-white/70 text-xs font-serif italic text-center mt-1">
                                                                        {item.description}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Shadow */}
                                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/40 blur-xl rounded-full scale-x-125" />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="relative z-40 w-full p-8 flex flex-col items-center gap-6">
                                <div className="flex items-center gap-8">
                                    <button
                                        onClick={handlePrev}
                                        className="w-12 h-12 rounded-full bg-[#2c1810] border-2 border-[#ffb74d]/30 flex items-center justify-center text-[#ffb74d] hover:bg-[#3e2723] hover:scale-110 active:scale-95 transition-all shadow-xl"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <div className="text-[#ffb74d] font-serif text-xl font-bold tracking-[0.3em]">
                                            {String(activeIndex + 1).padStart(2, '0')} / {String(HALL_OF_FAME.length).padStart(2, '0')}
                                        </div>
                                        <div className="w-32 h-1 bg-[#2c1810] mt-2 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-[#ffb74d]"
                                                animate={{ width: `${((activeIndex + 1) / HALL_OF_FAME.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="w-12 h-12 rounded-full bg-[#2c1810] border-2 border-[#ffb74d]/30 flex items-center justify-center text-[#ffb74d] hover:bg-[#3e2723] hover:scale-110 active:scale-95 transition-all shadow-xl"
                                    >
                                        <ChevronRight size={24} />
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
