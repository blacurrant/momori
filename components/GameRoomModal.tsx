"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DoorTransition } from './UI/DoorTransition';
import { GameRoomOverlay } from './GameRoomOverlay';
import { cn } from '@/lib/utils';

interface GameRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GameRoomModal({ isOpen, onClose }: GameRoomModalProps) {
    const [activeGame, setActiveGame] = useState<'puzzle' | 'whack' | 'memory' | 'wordle' | 'spelling' | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <DoorTransition isOpen={true}>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "relative w-full max-w-6xl h-[95vh] md:h-[85vh] overflow-hidden",
                                "bg-[#2c1810]",
                                "border-4 md:border-[12px] border-[#3e2723]",
                                "rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]",
                                "flex flex-col"
                            )}
                        >
                            {/* Decorative Corner Brackets */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-[#8d6e63]/20 rounded-tl-lg pointer-events-none z-30" />
                            <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-[#8d6e63]/20 rounded-tr-lg pointer-events-none z-30" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-[#8d6e63]/20 rounded-bl-lg pointer-events-none z-30" />
                            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-[#8d6e63]/20 rounded-br-lg pointer-events-none z-30" />

                            {/* Header */}
                            <div className="relative z-40 w-full bg-[#1a0f0a] border-b-4 border-[#3e2723] p-3 md:p-5 flex items-center justify-between shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#ffb74d]/10 flex items-center justify-center border-2 border-[#ffb74d]/30 rotate-3">
                                        <span className="text-3xl drop-shadow-lg">🎮</span>
                                    </div>
                                    <div>
                                        <h2 className="text-[#ffb74d] text-xl md:text-3xl font-serif tracking-tight drop-shadow-md leading-none">
                                            The Game Room
                                        </h2>
                                        <p className="text-[#a1887f] text-[10px] md:text-xs font-serif italic mt-1 opacity-70">
                                            Fun and games for everyday cozy times
                                        </p>
                                    </div>
                                </div>

                                {/* Close / Exit Button */}
                                <div className="flex items-center gap-3">
                                    {activeGame && (
                                        <button
                                            onClick={() => setActiveGame(null)}
                                            className="px-4 py-2 bg-[#ffb74d] text-[#3e2723] rounded-full font-serif font-bold text-sm shadow-lg hover:scale-105 transition-transform active:scale-95"
                                        >
                                            ↩ Exit Game
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="group relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all hover:rotate-90"
                                    >
                                        <div className="absolute inset-0 bg-[#c62828] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] border-2 border-[#b71c1c]" />
                                        <X className="relative z-10 w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Area - Scrollable */}
                            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                                <div className="absolute inset-0 bg-[#f4ece1] opacity-[0.98]"
                                    style={{
                                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")'
                                    }}
                                />

                                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] pointer-events-none z-10" />

                                <div className="relative z-20 min-h-full">
                                    <GameRoomOverlay
                                        activeGame={activeGame}
                                        onStartGame={setActiveGame}
                                        onExitGame={() => setActiveGame(null)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </DoorTransition>
            )}
        </AnimatePresence>
    );
}
