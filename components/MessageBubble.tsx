import React from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { User, Image as ImageIcon, Video, Mic } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    previousMessage?: Message;
}

export function MessageBubble({ message, previousMessage }: MessageBubbleProps) {
    const isChain = previousMessage && previousMessage.sender === message.sender;

    // Platform distinction
    // WhatsApp: Green ink, "Owl Post" style
    // Instagram: Purple/Pink ink, "Fancy Quill" style
    const isWhatsApp = message.platform === 'whatsapp';
    const isInstagram = message.platform === 'instagram';

    const inkColor = isWhatsApp ? "text-[#2e7d32]" : isInstagram ? "text-[#880e4f]" : "text-[#3e2723]";
    const borderColor = isWhatsApp ? "border-[#2e7d32]/20" : isInstagram ? "border-[#880e4f]/20" : "border-[#3e2723]/20";
    const nameColor = isWhatsApp ? "text-[#1b5e20]" : isInstagram ? "text-[#4a148c]" : "text-[#3e2723]";

    return (
        <div className={cn("flex gap-4 group px-4 py-2 hover:bg-[#5d4037]/5 transition-colors", !isChain && "mt-6 border-t border-dashed border-[#5d4037]/30 pt-6")}>
            {/* Avatar as a 'Stamp' */}
            <div className="w-12 flex-shrink-0 flex flex-col items-center">
                {!isChain ? (
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2",
                        borderColor,
                        "bg-[#f5f5f5]" // Paper-ish background for avatar
                    )}>
                        <span className={cn("text-lg font-serif font-bold", nameColor)}>
                            {message.sender[0]?.toUpperCase()}
                        </span>
                    </div>
                ) : (
                    <div className="w-10 text-[10px] text-[#5d4037]/60 group-hover:opacity-100 opacity-50 text-center pt-1 font-serif italic">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {!isChain && (
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className={cn("font-bold font-serif text-lg", nameColor)}>
                            {message.sender}
                        </span>
                        <span className="text-xs font-serif italic text-[#5d4037]/60">
                            {message.timestamp.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}

                <div className={cn(
                    "text-base/relaxed font-serif break-words whitespace-pre-wrap",
                    inkColor,
                    message.type === 'system' && "italic text-sm text-[#5d4037]/60 border-l-2 border-[#5d4037]/30 pl-2"
                )}>
                    {renderContent(message)}
                </div>
            </div>
        </div>
    );
}

function renderContent(message: Message) {
    if (message.type === 'image') return <div className="flex items-center gap-2 text-primary/80"><ImageIcon size={16} /> [Image Attachment]</div>;
    if (message.type === 'video') return <div className="flex items-center gap-2 text-primary/80"><Video size={16} /> [Video Attachment]</div>;
    if (message.type === 'audio') return <div className="flex items-center gap-2 text-primary/80"><Mic size={16} /> [Audio Attachment]</div>;
    return message.content;
}
