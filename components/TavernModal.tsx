"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TavernModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function TavernModal({ isOpen, onClose, children }: TavernModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                    {/* Backdrop with blur and dim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container - The "Tavern Menu" / "Wooden Board" look */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "relative w-full max-w-5xl h-[85vh] overflow-hidden",
                            "bg-[#2c1810]", // Dark wood base
                            "border-[12px] border-[#3e2723]", // Thick wooden frame
                            "rounded-xl shadow-2xl",
                            "flex flex-col"
                        )}
                        style={{
                            boxShadow: '0 0 0 1px #5d4037, 0 20px 50px -10px rgba(0,0,0,0.7)',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%233e2723' fill-opacity='0.4'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` // Subtle texture
                        }}
                    >
                        {/* Decorative Corner Brackets (CSS simulated) */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#8d6e63]/30 rounded-tl-lg pointer-events-none" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#8d6e63]/30 rounded-tr-lg pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#8d6e63]/30 rounded-bl-lg pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#8d6e63]/30 rounded-br-lg pointer-events-none" />

                        {/* Hanging Sign Header */}
                        <div className="relative z-10 w-full bg-[#1a0f0a] border-b-4 border-[#3e2723] p-4 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                {/* Lantern Icon or similar could go here */}
                                <div className="w-10 h-10 rounded-full bg-[#ffb74d]/10 flex items-center justify-center border border-[#ffb74d]/30">
                                    <span className="text-2xl">🕯️</span>
                                </div>
                                <div>
                                    <h2 className="text-[#ffb74d] text-xl font-serif tracking-wide drop-shadow-md">
                                        The Whispering Hearth
                                    </h2>
                                    <p className="text-[#a1887f] text-xs font-serif italic">
                                        Where tales are told and memories kept
                                    </p>
                                </div>
                            </div>

                            {/* Close Button - Wax Seal Style */}
                            <button
                                onClick={onClose}
                                className="group relative w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-[#c62828] rounded-full shadow-inner border-2 border-[#e57373]/50" />
                                <X className="relative z-10 w-5 h-5 text-white/90 group-hover:text-white" />
                            </button>
                        </div>

                        {/* Content Area - Parchment/Paper look */}
                        <div className="flex-1 overflow-hidden relative p-6">
                            <div className="absolute inset-0 bg-[#e3dac9] opacity-[0.97]"
                                style={{
                                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' // Fallback/Texture
                                }}
                            />

                            {/* Inner Shadow to give depth to the paper area */}
                            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)] pointer-events-none z-10" />

                            {/* Actual Content */}
                            <div className="relative z-20 h-full overflow-hidden">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
