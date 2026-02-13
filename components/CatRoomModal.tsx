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
                        {/* Soft Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-[#E0BBE4]/20 backdrop-blur-sm"
                        />

                        {/* Modal Container: 2D Cartoon Style */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 60 }}
                            transition={{ type: "spring", damping: 25, stiffness: 150 }}
                            className={cn(
                                "relative w-full h-full flex flex-col items-center justify-center overflow-hidden",
                                "bg-[#FFFDF7] border-8 border-[#E0BBE4]/40",
                                "rounded-[3.5rem] shadow-[0_40px_120px_rgba(224,187,228,0.3)]"
                            )}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-10 right-10 z-50 group relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-[#E0BBE4] rounded-[2rem] rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-lg shadow-[#E0BBE4]/20" />
                                <X className="relative z-10 w-8 h-8 text-white" />
                            </button>

                            {/* Canvas Container */}
                            <div className="relative w-full h-full max-w-5xl max-h-[80vh] aspect-[4/3] z-10 p-6">
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-[#E8E8E8] shadow-inner">
                                    <CatRoomCanvas />
                                </div>
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute top-14 left-0 right-0 text-center z-40 pointer-events-none">
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 1.2 }}
                                    className="space-y-2"
                                >
                                    <h1 className="text-[#4A4A4A] font-serif font-bold text-4xl md:text-6xl tracking-tight leading-none">
                                        The Bubbly Nook
                                    </h1>
                                    <p className="text-[#E0BBE4] font-serif font-bold italic text-[11px] md:text-sm uppercase tracking-[0.4em]">
                                        Where soft whispers drift among the treats
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
