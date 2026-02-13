"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DoorTransition } from './UI/DoorTransition';
import { CatRoomCanvas } from './CatRoomPixi';
import { cn } from '@/lib/utils';

interface CatRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CatRoomModal({ isOpen, onClose }: CatRoomModalProps) {
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
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        />

                        {/* Modal Container: Minimal Glass */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className={cn(
                                "relative w-full h-full flex flex-col items-center justify-center overflow-hidden",
                                "bg-black/20 backdrop-blur-3xl border border-white/5",
                                "rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
                            )}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-8 right-8 z-50 group relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-all duration-700 hover:rotate-90"
                            >
                                <div className="absolute inset-0 bg-white/5 rounded-full border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-700" />
                                <X className="relative z-10 w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                            </button>

                            {/* Canvas Container */}
                            <div className="relative w-full h-full max-w-5xl max-h-[85vh] aspect-[4/3] z-10">
                                <CatRoomCanvas />
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute top-12 left-0 right-0 text-center z-40 pointer-events-none">
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 1.2 }}
                                    className="space-y-1"
                                >
                                    <h1 className="text-white/90 font-serif text-3xl md:text-5xl tracking-tight leading-none">
                                        The Celestial Nook
                                    </h1>
                                    <p className="text-white/20 font-serif italic text-xs uppercase tracking-[0.3em]">
                                        Where whispers drift among the stars
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
