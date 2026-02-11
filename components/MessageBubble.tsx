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

    // Deterministic color based on sender name for avatar
    const getAvatarColor = (name: string) => {
        const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-orange-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className={cn("flex gap-4 group px-4 py-1 hover:bg-white/5 transition-colors", !isChain && "mt-4")}>
            <div className="w-10 flex-shrink-0 flex flex-col items-center">
                {!isChain ? (
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg", getAvatarColor(message.sender))}>
                        <span className="text-sm font-bold">{message.sender[0]?.toUpperCase()}</span>
                    </div>
                ) : (
                    <div className="w-10 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 text-center pt-1 transition-opacity">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {!isChain && (
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-foreground/90 text-sm hover:underline cursor-pointer">
                            {message.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}

                <div className={cn(
                    "text-sm/relaxed text-muted-foreground break-words whitespace-pre-wrap",
                    message.type === 'system' && "italic text-xs text-muted-foreground/60 border-l-2 border-primary/30 pl-2"
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
