"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DoorTransition } from './UI/DoorTransition';
import { CatRoomCanvas } from './CatRoomPixi';

interface CatRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CatRoomModal({ isOpen, onClose }: CatRoomModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <DoorTransition isOpen={true}>
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto touch-auto bg-black">

                        {/* Starry Background (CSS fallbacks if Pixi has transparency) */}
                        <div className="absolute inset-0 bg-black">
                            <div className="absolute inset-0 bg-[url('/img/stars.png')] opacity-50" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 z-50 text-white/50 hover:text-white transition-colors cursor-pointer pointer-events-auto"
                        >
                            <X size={32} />
                        </button>

                        {/* Visual Container */}
                        <div className="relative w-full h-full max-w-5xl max-h-[80vh] aspect-[4/3] pointer-events-auto">
                            <CatRoomCanvas />
                        </div>

                        {/* Title */}
                        <div className="absolute top-12 left-0 right-0 text-center z-40 pointer-events-none">
                            <motion.h1
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="text-[#ffb74d] font-serif text-4xl drop-shadow-[0_2px_10px_rgba(255,183,77,0.3)]"
                            >
                                The Cat's Nook
                            </motion.h1>
                        </div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
