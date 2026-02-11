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
        <div className="w-full max-w-5xl mx-auto p-4 space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block pointer-events-none" />

                {/* WhatsApp Portal */}
                <button
                    onClick={loadWhatsApp}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center gap-6 p-8 transition-all duration-700 hover:scale-105"
                >
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-green-500/20 group-hover:border-green-500/50 transition-colors duration-700" />
                        <div className="absolute inset-2 rounded-full border border-green-500/10 group-hover:scale-90 transition-transform duration-700" />

                        {loadingPlatform === 'whatsapp' ? (
                            <Loader2 className="w-8 h-8 text-green-400/80 animate-spin" />
                        ) : (
                            <MessageCircle className="w-8 h-8 text-green-400/50 group-hover:text-green-300 transition-colors duration-500" />
                        )}

                        {/* Glow */}
                        <div className="absolute inset-0 rounded-full bg-green-500/5 blur-2xl group-hover:bg-green-500/10 transition-colors duration-700" />
                    </div>

                    <div className="space-y-2 text-center relative z-10">
                        <h3 className="text-3xl font-serif text-[#d0d0d0] group-hover:text-white transition-colors duration-500">The Chat Log</h3>
                        <p className="text-sm font-serif italic text-[#707070] group-hover:text-[#a0a0a0] transition-colors">WhatsApp &bull; _chat.txt</p>
                    </div>
                </button>

                {/* Instagram Portal */}
                <button
                    onClick={loadInstagram}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center gap-6 p-8 transition-all duration-700 hover:scale-105"
                >
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-pink-500/20 group-hover:border-pink-500/50 transition-colors duration-700" />
                        <div className="absolute inset-2 rounded-full border border-pink-500/10 group-hover:scale-90 transition-transform duration-700" />

                        {loadingPlatform === 'instagram' ? (
                            <Loader2 className="w-8 h-8 text-pink-400/80 animate-spin" />
                        ) : (
                            <Instagram className="w-8 h-8 text-pink-400/50 group-hover:text-pink-300 transition-colors duration-500" />
                        )}

                        {/* Glow */}
                        <div className="absolute inset-0 rounded-full bg-pink-500/5 blur-2xl group-hover:bg-pink-500/10 transition-colors duration-700" />
                    </div>

                    <div className="space-y-2 text-center relative z-10">
                        <h3 className="text-3xl font-serif text-[#d0d0d0] group-hover:text-white transition-colors duration-500">The Visual Archive</h3>
                        <p className="text-sm font-serif italic text-[#707070] group-hover:text-[#a0a0a0] transition-colors">Instagram &bull; JSONs</p>
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
