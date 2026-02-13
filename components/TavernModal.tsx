"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorTransition } from './UI/DoorTransition';

interface TavernModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function TavernModal({ isOpen, onClose, children }: TavernModalProps) {
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

                            {/* Minimal Header */}
                            <div className="relative z-40 w-full px-8 py-6 md:px-12 md:py-10 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-white/90 text-2xl md:text-4xl font-serif tracking-tight leading-none">
                                        The Whispering Sanctuary
                                    </h2>
                                    <p className="text-white/20 text-[10px] md:text-xs font-serif italic uppercase tracking-[0.2em]">
                                        A collection of ephemeral digital traces
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

                            {/* Content Area */}
                            <div className="flex-1 overflow-hidden relative">
                                <div className="relative z-20 h-full">
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
