"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DoorTransitionProps {
    isOpen: boolean; // True = door opens (reveals content), False = door closes (hides content)
    onOpenComplete?: () => void;
    onCloseComplete?: () => void;
    children?: React.ReactNode;
}

export function DoorTransition({ isOpen, onOpenComplete, onCloseComplete, children }: DoorTransitionProps) {
    // When mounted, if isOpen is true, we want to animate from Closed -> Open
    // If isOpen is false, we want to animate Open -> Closed (or stay closed)

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
            {/* Left Door */}
            <motion.div
                initial={{ x: "0%" }}
                animate={{ x: isOpen ? "-100%" : "0%" }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }} // Slow, heavy ease
                className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#3e2723] border-r-4 border-[#2c1810]"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
                    boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Door Detail - Panels */}
                <div className="absolute inset-4 border-2 border-[#5d4037]/50 rounded-lg">
                    <div className="absolute top-1/4 left-4 right-4 h-2 bg-[#2c1810]/30" />
                    <div className="absolute bottom-1/4 left-4 right-4 h-2 bg-[#2c1810]/30" />
                </div>

                {/* Handle */}
                <div className="absolute top-1/2 right-6 w-4 h-12 bg-[#ffb74d] rounded-sm shadow-md flex items-center justify-center">
                    <div className="w-1 h-8 bg-[#e65100]/50" />
                </div>
            </motion.div>

            {/* Right Door */}
            <motion.div
                initial={{ x: "0%" }}
                animate={{ x: isOpen ? "100%" : "0%" }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={() => {
                    if (isOpen) onOpenComplete?.();
                    else onCloseComplete?.();
                }}
                className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#3e2723] border-l-4 border-[#2c1810]"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
                    boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Door Detail */}
                <div className="absolute inset-4 border-2 border-[#5d4037]/50 rounded-lg">
                    <div className="absolute top-1/4 left-4 right-4 h-2 bg-[#2c1810]/30" />
                    <div className="absolute bottom-1/4 left-4 right-4 h-2 bg-[#2c1810]/30" />
                </div>

                {/* Handle */}
                <div className="absolute top-1/2 left-6 w-4 h-12 bg-[#ffb74d] rounded-sm shadow-md flex items-center justify-center">
                    <div className="w-1 h-8 bg-[#e65100]/50" />
                </div>
            </motion.div>

            {/* Darkness behind doors (optional, but good for depth) */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 1.0 }}
                className="absolute inset-0 bg-black -z-10 pointer-events-none"
            />

            {/* Content Container - Only visible when doors are opening/open */}
            <div className="absolute inset-0 z-[-20] pointer-events-auto">
                {children}
            </div>
        </div>
    );
}
