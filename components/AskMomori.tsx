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
            isOpen ? "w-[450px]" : "w-16"
        )}>
            <div className={cn(
                "bg-black/20 backdrop-blur-[40px] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700",
                isOpen ? "rounded-3xl" : "rounded-full h-16"
            )}>

                {/* Header / Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-16 flex items-center transition-all duration-500",
                        isOpen ? "justify-between px-8 border-b border-white/5" : "justify-center hover:bg-white/5"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                            isOpen ? "bg-white/5" : "bg-transparent"
                        )}>
                            <Leaf
                                className={cn(
                                    "w-5 h-5 transition-all duration-700",
                                    isOpen ? "text-white rotate-45" : "text-white/40 rotate-0"
                                )}
                            />
                        </div>
                        {isOpen && (
                            <span className="font-serif text-lg tracking-wide text-white/90">
                                Gather a Thought
                            </span>
                        )}
                    </div>
                    {isOpen && (
                        <ChevronDown className="w-5 h-5 text-white/20" />
                    )}
                </button>

                {/* Content Area */}
                {isOpen && (
                    <div className="p-8 space-y-6">
                        {answer && (
                            <div className="bg-white/5 rounded-2xl p-6 text-base/relaxed font-serif text-white/70 italic border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                {answer}
                            </div>
                        )}

                        <form onSubmit={handleAsk} className="relative group">
                            <input
                                type="text"
                                placeholder="Whisper a query..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={cn(
                                    "w-full bg-white/5 border border-white/5 rounded-2xl pl-6 pr-14 py-4",
                                    "font-serif text-base text-white/90 placeholder:text-white/20",
                                    "focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                                )}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-0 disabled:pointer-events-none transition-all duration-500"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>

                        <div className="text-[10px] text-center font-serif italic text-white/10 uppercase tracking-[0.2em] pt-2">
                            A fleeting moment of clarity
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
