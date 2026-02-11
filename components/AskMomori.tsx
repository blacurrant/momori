"use client";

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
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
            "fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out",
            isOpen ? "w-96" : "w-14"
        )}>
            <div className={cn(
                "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500",
                isOpen ? "rounded-2xl" : "rounded-full h-14"
            )}>

                {/* Header / Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-14 flex items-center transition-colors hover:bg-white/5",
                        isOpen ? "justify-between px-6 border-b border-white/5" : "justify-center"
                    )}
                >
                    <div className="flex items-center gap-2 font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        {isOpen && "Ask Momori"}
                    </div>
                    {isOpen && (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </button>

                {/* Content Area */}
                {isOpen && (
                    <div className="p-4 space-y-4">
                        {answer && (
                            <div className="bg-secondary/50 rounded-lg p-3 text-sm text-foreground/90 leading-relaxed border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                                {answer}
                            </div>
                        )}

                        <form onSubmit={handleAsk} className="relative">
                            <input
                                type="text"
                                placeholder="Ask about this chat..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-secondary/30 border border-white/5 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-muted-foreground/50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>

                        <div className="text-[10px] text-center text-muted-foreground/40">
                            Powered by Groq • AI can make mistakes
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
