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
                "flex max-w-[85%] md:max-w-[70%] gap-3 items-end",
                message.isMe ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Cute Cartoon Avatar */}
                {!isChain ? (
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <div className={cn(
                            "absolute inset-0 rounded-2xl border-4 overflow-hidden transition-all duration-500",
                            isWhatsApp ? "bg-[#D5ECC2] border-[#D5ECC2]/50" : "bg-[#E0BBE4] border-[#E0BBE4]/50"
                        )}>
                            {message.avatar ? (
                                <img src={message.avatar} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#4A4A4A]/30 font-serif font-bold text-lg">
                                    {message.sender[0]}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-12 flex-shrink-0" />
                )}

                {/* Bubble Container */}
                <div className="flex flex-col gap-1.5 relative min-w-0">
                    {!isChain && (
                        <span className={cn(
                            "text-[11px] font-serif font-bold uppercase tracking-[0.2em] px-2 text-[#4A4A4A]/40 group-hover:text-[#4A4A4A]/60 transition-colors",
                            message.isMe ? "text-right" : "text-left"
                        )}>
                            {message.sender}
                        </span>
                    )}

                    <div className={cn(
                        "relative px-6 py-4 rounded-[2rem] transition-all duration-500 shadow-sm",
                        message.isMe
                            ? "bg-[#FFB7C5] text-white rounded-tr-none border-b-4 border-[#FFB7C5]/50"
                            : "bg-white text-[#4A4A4A] rounded-tl-none border-b-4 border-[#E8E8E8]",
                        message.starred && "ring-4 ring-[#FFB7C5]/30"
                    )}>
                        <div className="font-serif text-[16px] md:text-[18px] leading-relaxed selection:bg-black/10">
                            {renderContent(message)}
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-3">
                            <span className={cn(
                                "text-[10px] font-serif font-bold italic tracking-[0.1em] transition-colors uppercase",
                                message.isMe ? "text-white/60" : "text-[#4A4A4A]/20"
                            )}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <button
                                onClick={() => onToggleStar?.(message.id)}
                                className={cn(
                                    "p-1.5 rounded-xl transition-all duration-500",
                                    message.starred
                                        ? "text-yellow-400 opacity-100"
                                        : "opacity-0 group-hover:opacity-100 hover:text-yellow-400 text-black/10"
                                )}
                            >
                                <Star className={cn("w-4 h-4", message.starred && "fill-current")} />
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
        <div className="flex items-center gap-4 p-4 bg-[#4A4A4A]/5 rounded-2xl border-2 border-[#4A4A4A]/5">
            <ImageIcon size={20} className="text-[#4A4A4A]/40" />
            <span className="italic text-sm font-serif font-bold text-[#4A4A4A]/40 uppercase tracking-wider">A Sweet Snap</span>
        </div>
    );
    if (message.type === 'video') return (
        <div className="flex items-center gap-4 p-4 bg-[#4A4A4A]/5 rounded-2xl border-2 border-[#4A4A4A]/5">
            <Video size={20} className="text-[#4A4A4A]/40" />
            <span className="italic text-sm font-serif font-bold text-[#4A4A4A]/40 uppercase tracking-wider">A Tiny Tale</span>
        </div>
    );
    if (message.type === 'audio') return (
        <div className="flex items-center gap-4 p-4 bg-[#4A4A4A]/5 rounded-2xl border-2 border-[#4A4A4A]/5">
            <Mic size={20} className="text-[#4A4A4A]/40" />
            <span className="italic text-sm font-serif font-bold text-[#4A4A4A]/40 uppercase tracking-wider">A Soft Echo</span>
        </div>
    );
    return message.content;
}
