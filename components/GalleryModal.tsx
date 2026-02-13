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
    const [activeIndex, setActiveIndex] = useState(3); // Start in middle of 7 items

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

    // Helper to get relative index distance for 3D effect
    const getDist = (index: number) => {
        // Simple distance in array
        return index - activeIndex;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <DoorTransition isOpen={true}>
                    {/* Inner content wrapper with pointer-events-auto and touch-auto to ensure interaction works */}
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto touch-auto">

                        {/* Room Background */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="absolute inset-0 bg-[#1a0f0a] -z-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at center, #2c1810 0%, #0d0604 100%)',
                            }}
                        >
                            {/* Floor Perspective */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute bottom-0 left-[-50%] right-[-50%] h-[40vh] bg-[#3e2723]"
                                    style={{
                                        transform: 'perspective(1000px) rotateX(60deg)',
                                        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 48px, rgba(0,0,0,0.3) 50px)',
                                        opacity: 0.4
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 z-50 text-white/50 hover:text-white transition-colors cursor-pointer pointer-events-auto"
                        >
                            <X size={32} />
                        </button>

                        {/* Title */}
                        <div className="absolute top-12 left-0 right-0 text-center z-40 pointer-events-none">
                            <motion.h1
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="text-[#ffb74d] font-serif text-4xl drop-shadow-[0_2px_10px_rgba(255,183,77,0.3)]"
                            >
                                Hall of Memories
                            </motion.h1>
                        </div>

                        {/* 3D Carousel */}
                        <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000">
                            {HALL_OF_FAME.map((item, index) => {
                                const dist = getDist(index);
                                // Loop distribution for infinite carousel effect
                                let wrappedDist = dist;
                                if (dist > HALL_OF_FAME.length / 2) wrappedDist -= HALL_OF_FAME.length;
                                if (dist < -HALL_OF_FAME.length / 2) wrappedDist += HALL_OF_FAME.length;

                                const isActive = index === activeIndex;

                                // Only show neighbors
                                if (Math.abs(wrappedDist) > 2) return null;

                                return (
                                    <motion.div
                                        key={item.id}
                                        className="absolute w-[85vw] max-w-[360px] h-[480px] bg-white p-4 pb-16 shadow-2xl flex flex-col pointer-events-auto cursor-pointer"
                                        initial={false}
                                        animate={{
                                            x: wrappedDist * (window.innerWidth < 768 ? 40 : 380), // Responsive spacing: overlap on mobile, spread on desktop
                                            z: isActive ? 100 : -200, // Depth
                                            scale: isActive ? 1.0 : 0.8,
                                            opacity: Math.abs(dist) > 2 ? 0 : (Math.abs(dist) > 1 ? 0.5 : 1),
                                            rotateY: dist * 45, // Rotation
                                            rotateZ: (index % 2 === 0 ? 2 : -2) // Slight random tilt for realism
                                        }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop propagation just in case
                                            setActiveIndex(index);
                                        }}
                                        style={{
                                            zIndex: 100 - Math.abs(dist),
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        {/* Image Area */}
                                        <div className="flex-1 w-full bg-[#eee] overflow-hidden border border-gray-200 pointer-events-none">
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Caption Area (Polaroid style) */}
                                        <div className="h-12 mt-4 flex flex-col items-center justify-center pointer-events-none">
                                            <h3 className="text-[#2c1810] font-sans text-xl tracking-wide uppercase opacity-70" style={{ letterSpacing: '0.1em' }}>{item.title}</h3>
                                            <p className="text-gray-500 text-xs font-serif italic">{item.description}</p>
                                        </div>

                                        {/* Tape / Pin decoration (optional) */}
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/30 backdrop-blur-sm -rotate-2 shadow-sm border border-white/40 pointer-events-none" />
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-12 flex gap-8 z-50 pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/30 cursor-pointer"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/30 cursor-pointer"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
