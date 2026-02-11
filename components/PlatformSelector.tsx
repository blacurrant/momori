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
                {/* Decoration: Hanging Ropes */}
                <div className="absolute -top-12 left-1/4 w-1 h-12 bg-[#3e2723] opacity-60" />
                <div className="absolute -top-12 right-1/4 w-1 h-12 bg-[#3e2723] opacity-60" />

                {/* WhatsApp Signboard */}
                <button
                    onClick={loadWhatsApp}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center p-8 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {/* Signboard Background */}
                    <div className="absolute inset-0 bg-[#4e342e] border-4 border-[#3e2723] rounded-lg shadow-xl"
                        style={{
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)'
                        }}
                    />

                    {/* Nail Heads */}
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-[#2e7d32]/20 border-2 border-[#2e7d32]/50 group-hover:bg-[#2e7d32]/30 transition-colors">
                            {loadingPlatform === 'whatsapp' ? (
                                <Loader2 className="w-12 h-12 text-[#4caf50] animate-spin" />
                            ) : (
                                <MessageCircle className="w-12 h-12 text-[#81c784] drop-shadow-md" />
                            )}
                        </div>

                        <div className="space-y-1 text-center">
                            <h3 className="text-2xl font-serif font-bold text-[#e8f5e9] drop-shadow-md tracking-wider">
                                The Green Log
                            </h3>
                            <p className="text-sm font-serif italic text-[#a5d6a7]/80">WhatsApp Chronicles</p>
                        </div>
                    </div>
                </button>

                {/* Instagram Signboard */}
                <button
                    onClick={loadInstagram}
                    disabled={!!loadingPlatform}
                    className="group relative flex flex-col items-center justify-center p-8 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {/* Signboard Background */}
                    <div className="absolute inset-0 bg-[#4e342e] border-4 border-[#3e2723] rounded-lg shadow-xl"
                        style={{
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)'
                        }}
                    />

                    {/* Nail Heads */}
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#1a0f0a] shadow-inner" />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-[#ad1457]/20 border-2 border-[#ad1457]/50 group-hover:bg-[#ad1457]/30 transition-colors">
                            {loadingPlatform === 'instagram' ? (
                                <Loader2 className="w-12 h-12 text-[#f48fb1] animate-spin" />
                            ) : (
                                <Instagram className="w-12 h-12 text-[#f48fb1] drop-shadow-md" />
                            )}
                        </div>

                        <div className="space-y-1 text-center">
                            <h3 className="text-2xl font-serif font-bold text-[#fce4ec] drop-shadow-md tracking-wider">
                                Visual Archive
                            </h3>
                            <p className="text-sm font-serif italic text-[#f8bbd0]/80">Instagram Memories</p>
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
