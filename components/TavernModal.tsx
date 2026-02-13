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
                        {/* Soft Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-[#FFB7C5]/20 backdrop-blur-sm"
                        />

                        {/* Modal Container: 2D Cartoon Style */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 60 }}
                            transition={{ type: "spring", damping: 25, stiffness: 150 }}
                            className={cn(
                                "relative w-full max-w-7xl h-full flex flex-col overflow-hidden",
                                "bg-[#FFFDF7] border-8 border-[#FFB7C5]/40",
                                "rounded-[3.5rem] shadow-[0_40px_120px_rgba(255,183,197,0.3)]"
                            )}
                        >
                            {/* Compact Header */}
                            <div className="relative z-40 w-full px-8 py-4 md:px-12 md:py-6 flex items-center justify-between border-b-2 border-[#E8E8E8]/10">
                                <div className="flex flex-col">
                                    <h2 className="text-[#4A4A4A] text-2xl md:text-3xl font-serif font-bold tracking-tight leading-none">
                                        The Soft Sanctuary
                                    </h2>
                                    <p className="text-[#FFB7C5] text-[10px] md:text-xs font-serif font-bold italic uppercase tracking-[0.2em] mt-1">
                                        A collection of sweet digital traces
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="group relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-[#FFB7C5] rounded-2xl rotate-45 group-hover:rotate-90 transition-all duration-700 shadow-md" />
                                    <X className="relative z-10 w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-hidden relative px-6 pb-6">
                                <div className="relative z-20 h-full bg-white rounded-[2.5rem] border-4 border-[#E8E8E8] shadow-inner overflow-hidden">
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
