"use client";

import React, { useState } from 'react';
import { Leaf, Send, Loader2, ChevronDown } from 'lucide-react';
import { generateInsights } from '@/lib/groq';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AskMomoriProps {
    messages: Message[];
}

export function AskMomori({ messages }: AskMomoriProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setAnswer('');

        const result = await generateInsights(messages, query);

        setAnswer(result);
        setIsLoading(false);
    };

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-[70] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen ? "w-[450px]" : "w-20"
        )}>
            <div className={cn(
                "bg-[#FFFDF7] border-4 border-[#FFB7C5]/40 shadow-[0_12px_40px_rgba(255,183,197,0.2)] overflow-hidden transition-all duration-700",
                isOpen ? "rounded-[2.5rem]" : "rounded-full h-20"
            )}>

                {/* Header / Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-20 flex items-center transition-all duration-500",
                        isOpen ? "justify-between px-8 border-b-2 border-[#FFB7C5]/20" : "justify-center hover:bg-[#FFB7C5]/5"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isOpen ? "bg-[#FFB7C5]/20" : "bg-transparent"
                        )}>
                            <Leaf
                                className={cn(
                                    "w-6 h-6 transition-all duration-700",
                                    isOpen ? "text-[#FFB7C5] rotate-45" : "text-[#FFB7C5]/60 rotate-0"
                                )}
                            />
                        </div>
                        {isOpen && (
                            <span className="font-serif text-xl font-bold tracking-tight text-[#4A4A4A]">
                                The Soft Whisper
                            </span>
                        )}
                    </div>
                    {isOpen && (
                        <ChevronDown className="w-6 h-6 text-[#FFB7C5]/40" />
                    )}
                </button>

                {/* Content Area */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-8 space-y-6"
                        >
                            {answer && (
                                <div className="bg-[#FEF9E7] rounded-[2rem] p-6 text-base/relaxed font-serif text-[#4A4A4A] italic border-2 border-[#FFB7C5]/10 shadow-sm animate-in zoom-in-95 duration-700">
                                    {answer}
                                </div>
                            )}

                            <form onSubmit={handleAsk} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Whisper something sweet..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className={cn(
                                        "w-full bg-[#FFFFFF] border-3 border-[#E8E8E8] rounded-2xl pl-6 pr-14 py-4",
                                        "font-serif text-base text-[#4A4A4A] placeholder:text-[#4A4A4A]/20",
                                        "focus:outline-none focus:border-[#FFB7C5]/40 focus:bg-[#FFFFFF] transition-all shadow-sm"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !query.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#FFB7C5]/20 text-[#FFB7C5] hover:bg-[#FFB7C5]/30 disabled:opacity-0 disabled:pointer-events-none transition-all duration-500"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>

                            <div className="text-[11px] text-center font-serif font-bold italic text-[#FFB7C5]/60 uppercase tracking-[0.2em] pt-2">
                                A bubbly moment of clarity
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
