import { MessageCircle, Instagram, User, Star, Image as ImageIcon, Video, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
    message: Message;
    previousMessage?: Message;
    onToggleStar?: (id: string) => void;
}

export function MessageBubble({ message, previousMessage, onToggleStar }: MessageBubbleProps) {
    const isChain = previousMessage && previousMessage.sender === message.sender;
    const isWhatsApp = message.platform === 'whatsapp';

    return (
        <div className={cn(
            "flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-700",
            message.isMe ? "justify-end" : "justify-start",
            isChain ? "mt-1" : "mt-8"
        )}>
            <div className={cn(
                "flex max-w-[85%] md:max-w-[70%] gap-4 items-end",
                message.isMe ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Minimal Avatar/Indicator */}
                {!isChain ? (
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <div className={cn(
                            "absolute inset-0 rounded-full border border-white/5 overflow-hidden transition-all duration-700",
                            isWhatsApp ? "bg-emerald-500/5 group-hover:bg-emerald-500/10" : "bg-fuchsia-500/5 group-hover:bg-fuchsia-500/10"
                        )}>
                            {message.avatar ? (
                                <img src={message.avatar} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-serif text-sm">
                                    {message.sender[0]}
                                </div>
                            )}
                        </div>
                        {/* Soft Platform Glow */}
                        <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full blur-[2px] opacity-40",
                            isWhatsApp ? "bg-emerald-400" : "bg-fuchsia-400"
                        )} />
                    </div>
                ) : (
                    <div className="w-10 flex-shrink-0" />
                )}

                {/* Bubble Container */}
                <div className="flex flex-col gap-1.5 relative min-w-0">
                    {!isChain && (
                        <span className={cn(
                            "text-[10px] font-sans font-bold uppercase tracking-[0.25em] px-1 opacity-20 group-hover:opacity-40 transition-opacity",
                            message.isMe ? "text-right" : "text-left"
                        )}>
                            {message.sender}
                        </span>
                    )}

                    <div className={cn(
                        "relative px-5 py-3.5 rounded-2xl transition-all duration-700",
                        "bg-white/5 backdrop-blur-3xl border border-white/5",
                        message.starred ? "border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]" : "group-hover:border-white/10",
                        message.isMe ? "rounded-tr-none" : "rounded-tl-none"
                    )}>
                        <div className="font-serif text-[15px] md:text-[17px] leading-relaxed text-white/70 selection:bg-white/10">
                            {renderContent(message)}
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-3">
                            <span className="text-[10px] font-serif italic text-white/10 tracking-[0.1em] group-hover:text-white/20 transition-colors uppercase">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <button
                                onClick={() => onToggleStar?.(message.id)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all duration-700",
                                    message.starred
                                        ? "text-amber-300 opacity-60"
                                        : "text-white/5 opacity-0 group-hover:opacity-100 hover:text-white/40"
                                )}
                            >
                                <Star className={cn("w-3.5 h-3.5", message.starred && "fill-current")} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderContent(message: Message) {
    if (message.type === 'image') return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
            <ImageIcon size={18} strokeWidth={1.5} />
            <span className="italic text-sm font-serif">A captured gaze</span>
        </div>
    );
    if (message.type === 'video') return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
            <Video size={18} strokeWidth={1.5} />
            <span className="italic text-sm font-serif">A moving breath</span>
        </div>
    );
    if (message.type === 'audio') return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
            <Mic size={18} strokeWidth={1.5} />
            <span className="italic text-sm font-serif">An echo in the mist</span>
        </div>
    );
    return message.content;
}
