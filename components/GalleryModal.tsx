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

// Sample Data
const SAMPLE_GALLERY: GalleryItem[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80', title: 'Village Mornings', description: 'The sun rising over the misty hills.' },
    { id: '2', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80', title: 'Cozy Hearth', description: 'Warmth in the middle of winter.' },
    { id: '3', url: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=800&q=80', title: 'Forest Path', description: 'Where the old oak trees whisper.' },
    { id: '4', url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80', title: 'Spring Bloom', description: 'Flowers returning to the meadow.' },
    { id: '5', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', title: 'Deep Woods', description: 'Secrets hidden in the shadows.' },
];

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
    const [activeIndex, setActiveIndex] = useState(2); // Start in middle

    // Reset index when opened
    useEffect(() => {
        if (isOpen) setActiveIndex(2);
    }, [isOpen]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % SAMPLE_GALLERY.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + SAMPLE_GALLERY.length) % SAMPLE_GALLERY.length);
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

                        {/* 3D Carousel Container */}
                        <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-center perspective-[1200px] z-30 pointer-events-none">

                            {SAMPLE_GALLERY.map((item, index) => {
                                const dist = index - activeIndex;
                                const isActive = index === activeIndex;

                                // Only show neighbors
                                if (Math.abs(dist) > 2) return null;

                                return (
                                    <motion.div
                                        key={item.id}
                                        className="absolute w-[85vw] max-w-[360px] h-[480px] bg-white p-4 pb-16 shadow-2xl flex flex-col pointer-events-auto cursor-pointer"
                                        initial={false}
                                        animate={{
                                            x: dist * (window.innerWidth < 768 ? 40 : 380), // Responsive spacing: overlap on mobile, spread on desktop
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
