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
                    className="group relative flex flex-col items-center justify-center p-12 transition-all duration-700 hover:-translate-y-2 active:scale-[0.98]"
                >
                    {/* Glass Card */}
                    <div className={cn(
                        "absolute inset-0 rounded-[2rem] transition-all duration-700",
                        "bg-white/5 backdrop-blur-3xl border border-white/5",
                        "shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] group-hover:bg-white/10 group-hover:border-white/10 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                    )} />

                    {/* Subtle Glow Attachment */}
                    <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-3xl transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700",
                            "bg-white/5 border border-white/5 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20"
                        )}>
                            {loadingPlatform === 'whatsapp' ? (
                                <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
                            ) : (
                                <MessageCircle className="w-10 h-10 text-white/20 group-hover:text-emerald-300 transition-colors duration-700" />
                            )}
                        </div>

                        <div className="space-y-2 text-center">
                            <h3 className="text-3xl font-serif tracking-tight text-white/90">
                                The Emerald Grove
                            </h3>
                            <p className="text-xs font-serif italic text-white/10 uppercase tracking-[0.25em] group-hover:text-emerald-300/40 transition-colors">
                                WhatsApp Chronicles
                            </p>
                        </div>
                    </div>
                </button>

                {/* Instagram Choice */}
                <button
                    onClick={loadInstagram}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center p-12 transition-all duration-700 hover:-translate-y-2 active:scale-[0.98]"
                >
                    {/* Glass Card */}
                    <div className={cn(
                        "absolute inset-0 rounded-[2rem] transition-all duration-700",
                        "bg-white/5 backdrop-blur-3xl border border-white/5",
                        "shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] group-hover:bg-white/10 group-hover:border-white/10 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                    )} />

                    {/* Subtle Glow Attachment */}
                    <div className="absolute inset-0 rounded-[2rem] bg-fuchsia-500/0 group-hover:bg-fuchsia-500/5 blur-3xl transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700",
                            "bg-white/5 border border-white/5 group-hover:scale-110 group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/20"
                        )}>
                            {loadingPlatform === 'instagram' ? (
                                <Loader2 className="w-8 h-8 text-fuchsia-300 animate-spin" />
                            ) : (
                                <Instagram className="w-10 h-10 text-white/20 group-hover:text-fuchsia-300 transition-colors duration-700" />
                            )}
                        </div>

                        <div className="space-y-2 text-center">
                            <h3 className="text-3xl font-serif tracking-tight text-white/90">
                                The Violet Stream
                            </h3>
                            <p className="text-xs font-serif italic text-white/10 uppercase tracking-[0.25em] group-hover:text-fuchsia-300/40 transition-colors">
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
