"use client";

import React, { useState } from 'react';
import { Message } from '@/lib/types';
import { Play, Pause, Music, Film, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
    messages: Message[];
    type: 'image' | 'video' | 'audio';
}

export function MediaGallery({ messages, type }: MediaGalleryProps) {
    // Filter messages to only show ones with actual media content if possible
    // Currently parser marks type, but content might be "Sent a photo".
    // For Instagram, we need to know the actual path.
    // NOTE: The current parser puts "Sent a photo" in content. We might need to enhance parser to store `mediaPath`.
    // But for now, assuming the public folder structure mirrors the export, we can try to guess or we need to update parser.
    // WAITING: The user said "use public/instagram/photos". The parser currently doesn't capture the URI.
    // CRITICAL: We need to parse the URI from the JSON.
    // However, purely for UI scaffolding, I will build the component assuming `message.mediaUri` exists or will be added.
    // For now, I'll filter by type and just show a placeholder or try to construct path if it was in the original JSON.

    // Actually, looking at standard Insta export:
    // It has "photos": [{"uri": "..."}]
    // I need to update the parser to capture this `uri`. 
    // BUT, the user asked for the UI. I will build the UI to handle a `mediaUri` property.
    // I will filter messages that have `type === type`.

    const mediaMessages = messages.filter(m => m.type === type);

    if (mediaMessages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground/50 space-y-4">
                {type === 'image' && <ImageIcon className="w-12 h-12 opacity-20" />}
                {type === 'video' && <Film className="w-12 h-12 opacity-20" />}
                {type === 'audio' && <Music className="w-12 h-12 opacity-20" />}
                <p>No {type}s found in this view.</p>
            </div>
        );
    }

    if (type === 'audio') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-24">
                {mediaMessages.map(msg => (
                    <AudioCard key={msg.id} message={msg} />
                ))}
            </div>
        );
    }

    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-8 p-8 pb-32 space-y-8">
            {mediaMessages.map(msg => (
                <div key={msg.id} className="break-inside-avoid relative group rounded-[2.5rem] bg-white border-4 border-[#E8E8E8] p-3 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-[#FFB7C5]/30">
                    <div className="relative rounded-[2rem] overflow-hidden bg-[#FEF9E7]">
                        {type === 'image' ? (
                            msg.mediaUri ? (
                                <img
                                    src={`/${msg.mediaUri}`}
                                    alt="Memory"
                                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="aspect-square flex items-center justify-center text-[#4A4A4A]/20 text-xs font-bold font-serif uppercase tracking-widest">
                                    {msg.sender[0]}
                                </div>
                            )
                        ) : (
                            <div className="aspect-video bg-[#4A4A4A]/5 flex items-center justify-center">
                                <Film className="w-10 h-10 text-[#4A4A4A]/10" />
                            </div>
                        )}
                    </div>
                    {/* Text overlays removed per user request */}
                </div>
            ))}
        </div>
    );
}

function AudioCard({ message }: { message: Message }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
            <button className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="h-6 flex items-center gap-0.5 opacity-50 group-hover:opacity-80 transition-opacity">
                    {/* Fake waveform */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-white rounded-full"
                            style={{ height: `${Math.random() * 100}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>{message.sender}</span>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
}
