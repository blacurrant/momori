"use client";

import React, { useState } from 'react';
import { Loader2, MessageCircle, Instagram, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatExport } from '@/lib/types';
import { parseWhatsAppChat } from '@/lib/parsers/whatsapp';
import { parseInstagramChat } from '@/lib/parsers/instagram';

interface PlatformSelectorProps {
    onLoadComplete: (data: ChatExport) => void;
}

export function PlatformSelector({ onLoadComplete }: PlatformSelectorProps) {
    const [loadingPlatform, setLoadingPlatform] = useState<'whatsapp' | 'instagram' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadWhatsApp = async () => {
        setLoadingPlatform('whatsapp');
        setError(null);
        try {
            // Try standard locations
            const paths = ['_chat.txt', 'whatsapp/_chat.txt', 'public/_chat.txt'];
            let content = null;
            let usedPath = '';

            for (const p of paths) {
                const res = await fetch(`/${p}`);
                if (res.ok) {
                    content = await res.text();
                    usedPath = p;
                    break;
                }
            }

            if (!content) throw new Error("Could not find '_chat.txt' in public folder.");

            const data = parseWhatsAppChat(content, usedPath);
            if (data.messages.length === 0) throw new Error("File found but contained 0 messages.");

            onLoadComplete(data);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to load WhatsApp chat");
        } finally {
            setLoadingPlatform(null);
        }
    };

    const loadInstagram = async () => {
        setLoadingPlatform('instagram');
        setError(null);
        try {
            // Instagram exports are often split: message_1.json, message_2.json...
            // We'll try to load them sequentially until one fails.
            let i = 1;
            const messages: any[] = [];
            const participants = new Set<string>();
            let foundAny = false;

            while (true) {
                const path = `instagram/message_${i}.json`;
                const res = await fetch(`/${path}`);

                if (!res.ok) {
                    if (i === 1) throw new Error("Could not find 'instagram/message_1.json' in public folder.");
                    break; // No more files
                }

                foundAny = true;
                const text = await res.text();
                // We use the existing parser for each file chunk
                // But since existing parser returns a full struct, we might need to be clever.
                // Or just manually parse here or adapt the parser. 
                // Let's adapt the parser call or just do raw parse here for the merge strategy.
                // actually, let's reuse logic.

                const chunkData = parseInstagramChat(text, path);
                messages.push(...chunkData.messages);
                chunkData.participants.forEach(p => participants.add(p));

                i++;
                if (i > 20) break; // Safety break
            }

            // Deduplicate logic if needed (ids might clash if parser is naive, but parser uses index so we might need to re-index)
            // Fix IDs
            const finalMessages = messages.map((m, idx) => ({ ...m, id: `ig-${idx}` }));
            const finalData: ChatExport = {
                fileName: 'Instagram Export',
                messages: finalMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
                participants: Array.from(participants),
                totalMessages: finalMessages.length
            };

            onLoadComplete(finalData);

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to load Instagram chat");
        } finally {
            setLoadingPlatform(null);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="grid md:grid-cols-2 gap-16 md:gap-32 relative">

                {/* WhatsApp Choice */}
                <button
                    onClick={loadWhatsApp}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center p-12 transition-all duration-700 hover:-translate-y-4 active:scale-95"
                >
                    {/* Bubbly Card */}
                    <div className={cn(
                        "absolute inset-0 rounded-[3rem] transition-all duration-700",
                        "bg-white border-8 border-[#D5ECC2]/40",
                        "shadow-[0_25px_80px_rgba(213,236,194,0.3)] group-hover:shadow-[0_45px_120px_rgba(213,236,194,0.5)] group-hover:border-[#D5ECC2]/80"
                    )} />

                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className={cn(
                            "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700 rotate-3 group-hover:rotate-0",
                            "bg-[#D5ECC2]/20 border-4 border-[#D5ECC2]/40 group-hover:scale-110 shadow-sm"
                        )}>
                            {loadingPlatform === 'whatsapp' ? (
                                <Loader2 className="w-10 h-10 text-[#D5ECC2] animate-spin" />
                            ) : (
                                <MessageCircle className="w-12 h-12 text-[#D5ECC2] group-hover:scale-110 transition-transform duration-700" />
                            )}
                        </div>

                        <div className="space-y-3 text-center">
                            <h3 className="text-4xl font-serif font-extrabold tracking-tight text-[#4A4A4A]">
                                The Bubbly Grove
                            </h3>
                            <p className="text-[11px] font-bold italic text-[#D5ECC2] uppercase tracking-[0.4em]">
                                WhatsApp Chronicles
                            </p>
                        </div>
                    </div>
                </button>

                {/* Instagram Choice */}
                <button
                    onClick={loadInstagram}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center p-12 transition-all duration-700 hover:-translate-y-4 active:scale-95"
                >
                    {/* Bubbly Card */}
                    <div className={cn(
                        "absolute inset-0 rounded-[3rem] transition-all duration-700",
                        "bg-white border-8 border-[#E0BBE4]/40",
                        "shadow-[0_25px_80px_rgba(224,187,228,0.3)] group-hover:shadow-[0_45px_120px_rgba(224,187,228,0.5)] group-hover:border-[#E0BBE4]/80"
                    )} />

                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className={cn(
                            "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700 -rotate-3 group-hover:rotate-0",
                            "bg-[#E0BBE4]/20 border-4 border-[#E0BBE4]/40 group-hover:scale-110 shadow-sm"
                        )}>
                            {loadingPlatform === 'instagram' ? (
                                <Loader2 className="w-10 h-10 text-[#E0BBE4] animate-spin" />
                            ) : (
                                <Instagram className="w-12 h-12 text-[#E0BBE4] group-hover:scale-110 transition-transform duration-700" />
                            )}
                        </div>

                        <div className="space-y-3 text-center">
                            <h3 className="text-4xl font-serif font-extrabold tracking-tight text-[#4A4A4A]">
                                The Pastel Stream
                            </h3>
                            <p className="text-[11px] font-bold italic text-[#E0BBE4] uppercase tracking-[0.4em]">
                                Instagram Echoes
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {error && (
                <div className="max-w-md mx-auto text-center font-serif text-red-300/80 text-lg italic animate-in fade-in">
                    &ldquo;{error}&rdquo;
                </div>
            )}
        </div>
    );
}
