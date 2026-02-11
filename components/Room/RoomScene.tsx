"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelCanvas } from './PixelCanvas';

type ViewMode = 'ROOM' | 'DIARY' | 'CONSOLE' | 'MUSIC' | 'WALL';

interface RoomSceneProps {
    children?: React.ReactNode;
}

export function RoomScene({ children }: RoomSceneProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('ROOM');

    const handleObjectClick = (objectId: string) => {
        switch (objectId) {
            case 'bookshelf':
                setViewMode('DIARY');
                break;
            case 'desk':
                setViewMode('CONSOLE');
                break;
            case 'bed':
                setViewMode('WALL');
                break;
        }
    };

    const handleBack = () => setViewMode('ROOM');

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#2a1f2b] flex items-center justify-center">

            {/* Pixel Art Room Container */}
            <div className="relative w-full max-w-[1920px] aspect-video bg-[#1a1520] shadow-2xl overflow-hidden">

                {viewMode === 'ROOM' && (
                    <PixelCanvas
                        width={1920}
                        height={1080}
                        onObjectClick={handleObjectClick}
                    />
                )}

                {/* Overlays when zoomed */}
                <AnimatePresence mode="wait">
                    {viewMode === 'DIARY' && <DiaryOverlay onClose={handleBack} />}
                    {viewMode === 'CONSOLE' && <ConsoleOverlay onClose={handleBack} />}
                    {viewMode === 'WALL' && <NapOverlay onClose={handleBack} />}
                </AnimatePresence>

                {viewMode !== 'ROOM' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.5 } }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.3em] font-mono cursor-pointer hover:text-white transition-colors uppercase"
                        onClick={handleBack}
                    >
                        ← Return to Room
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Overlay Components

function DiaryOverlay({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-8"
        >
            <div className="w-full h-full max-w-5xl bg-[#f0e6d2] shadow-2xl rounded-sm flex overflow-hidden relative border-4 border-[#8B7355]">
                <button onClick={onClose} className="absolute top-4 right-4 text-black/60 hover:text-black z-50 text-2xl">×</button>

                {/* Left Panel: Chapter List */}
                <div className="flex-1 p-8 border-r-4 border-[#d4c5a5] font-serif text-[#4a4a4a] bg-[#e6dcc5] overflow-y-auto">
                    <h2 className="text-3xl mb-6 font-bold border-b-2 border-[#c4b595] pb-3">Chapters</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-white/60 rounded shadow-sm border-l-4 border-pink-400">
                            <div className="font-bold text-lg">Our Story</div>
                            <div className="text-sm opacity-70 mt-1">Coming Soon...</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="flex-[2] p-12 bg-[#fffdf5] relative overflow-y-auto">
                    <div className="absolute top-0 right-0 p-6 opacity-5 font-serif text-8xl font-bold select-none">2026</div>
                    <h1 className="text-5xl text-[#2c2c2c] mb-8 font-serif italic">Dear Diary...</h1>
                    <p className="text-xl leading-relaxed text-[#555] font-serif">
                        Click on the bookshelf to read our conversations. <br /><br />
                        Every chat will be preserved here like entries in a journal.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function ConsoleOverlay({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/90"
        >
            <div className="relative w-[85%] aspect-video bg-black border-8 border-[#2a2a2a] rounded-2xl shadow-[0_0_80px_rgba(0,255,100,0.3)] overflow-hidden">
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-green-400 font-mono p-12">
                    <div className="text-6xl mb-6 animate-pulse font-bold">◆ SYSTEM READY ◆</div>
                    <p className="text-xl opacity-70">— Insert Game Cartridge —</p>
                    <p className="text-sm mt-8 opacity-50">Mini-games coming soon...</p>
                </div>
                {/* CRT scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] z-20 bg-[size:100%_4px] pointer-events-none opacity-30" />
            </div>
        </motion.div>
    );
}

function NapOverlay({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-gradient-to-b from-purple-900/60 to-pink-900/60 backdrop-blur-md"
        >
            <div className="text-center text-white p-12">
                <h1 className="text-6xl font-serif mb-6">💤</h1>
                <p className="text-3xl font-serif italic opacity-80">Rest & Recharge</p>
                <p className="text-lg mt-4 opacity-60">A cozy corner for quiet moments</p>
            </div>
        </motion.div>
    );
}
