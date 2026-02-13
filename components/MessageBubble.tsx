import React from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Video, Mic, Star } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    previousMessage?: Message;
    onToggleStar?: (id: string) => void;
}

export function MessageBubble({ message, previousMessage, onToggleStar }: MessageBubbleProps) {
    const isChain = previousMessage && previousMessage.sender === message.sender;

    const isWhatsApp = message.platform === 'whatsapp';
    const isInstagram = message.platform === 'instagram';

    const inkColor = isWhatsApp ? "text-[#2e7d32]" : isInstagram ? "text-[#880e4f]" : "text-[#3e2723]";
    const nameColor = isWhatsApp ? "text-[#1b5e20]" : isInstagram ? "text-[#4a148c]" : "text-[#3e2723]";

    return (
        <div className={cn(
            "flex gap-4 group px-4 py-2 hover:bg-[#5d4037]/5 transition-all duration-300 relative",
            !isChain && "mt-8 border-t border-dashed border-[#5d4037]/20 pt-8"
        )}>
            {/* Avatar as a 'Stamp' */}
            <div className="w-12 flex-shrink-0 flex flex-col items-center">
                {!isChain ? (
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2 rotate-3 transition-transform group-hover:rotate-0",
                        isWhatsApp ? "border-[#2e7d32]/20 bg-[#e8f5e9]" : "border-[#880e4f]/20 bg-[#fce4ec]",
                    )}>
                        <span className={cn("text-xl font-serif font-bold", nameColor)}>
                            {message.sender[0]?.toUpperCase()}
                        </span>
                    </div>
                ) : (
                    <div className="w-10 text-[10px] text-[#3e2723]/30 group-hover:opacity-100 opacity-0 text-center pt-2 font-serif italic transition-opacity">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {!isChain && (
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className={cn("font-bold font-serif text-lg tracking-tight", nameColor)}>
                            {message.sender}
                        </span>
                        <span className="text-[10px] font-serif italic text-black/30 uppercase tracking-widest">
                            {message.timestamp.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}

                <div className="relative group/content">
                    <div className={cn(
                        "text-base md:text-lg font-serif break-words whitespace-pre-wrap leading-relaxed max-w-[90%]",
                        inkColor,
                        message.type === 'system' && "italic text-sm text-[#3e2723]/40 border-l-4 border-[#3e2723]/10 pl-4 py-1"
                    )}>
                        {renderContent(message)}
                    </div>

                    {/* Star Toggle */}
                    {message.type !== 'system' && (
                        <button
                            onClick={() => onToggleStar?.(message.id)}
                            className={cn(
                                "absolute top-0 -right-8 p-2 rounded-full transition-all duration-500",
                                "opacity-0 group-hover/content:opacity-100",
                                message.starred ? "opacity-100 scale-110" : "hover:scale-125 hover:bg-[#ffb74d]/10"
                            )}
                        >
                            <Star
                                className={cn(
                                    "w-5 h-5 transition-all",
                                    message.starred
                                        ? "fill-[#ffb74d] text-[#ffb74d] drop-shadow-[0_0_8px_rgba(255,183,77,0.6)]"
                                        : "text-[#3e2723]/20 hover:text-[#ffb74d]"
                                )}
                            />
                        </button>
                    )}
                </div>
            </div>

            {/* Platform Seal */}
            {!isChain && (
                <div className="absolute top-8 right-4 opacity-10 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-700">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2",
                        isWhatsApp ? "border-[#25D366] text-[#25D366]" : "border-[#E1306C] text-[#E1306C]"
                    )}>
                        <span className="text-[10px] font-bold uppercase">{isWhatsApp ? 'WA' : 'IG'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderContent(message: Message) {
    if (message.type === 'image') return <div className="flex items-center gap-3 p-4 bg-[#2c1810]/5 rounded-2xl border-2 border-[#3e2723]/5"><ImageIcon size={20} className="opacity-50" /> <span className="italic opacity-70 font-serif">A captured frame of time</span></div>;
    if (message.type === 'video') return <div className="flex items-center gap-3 p-4 bg-[#2c1810]/5 rounded-2xl border-2 border-[#3e2723]/5"><Video size={20} className="opacity-50" /> <span className="italic opacity-70 font-serif">A moving chronicle</span></div>;
    if (message.type === 'audio') return <div className="flex items-center gap-3 p-4 bg-[#2c1810]/5 rounded-2xl border-2 border-[#3e2723]/5"><Mic size={20} className="opacity-50" /> <span className="italic opacity-70 font-serif">A whisper from the past</span></div>;
    return message.content;
}
