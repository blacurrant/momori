import React, { useRef } from 'react';
import { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface ChatListProps {
    messages: Message[];
    onToggleStar?: (id: string) => void;
}

export function ChatList({ messages, onToggleStar }: ChatListProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-[#3e2723]/40 p-10 text-center font-serif italic">
                <p>The archives are silent on this matter...</p>
            </div>
        );
    }

    return (
        <div className="h-full pr-2">
            <Virtuoso
                ref={virtuosoRef}
                data={messages}
                totalCount={messages.length}
                itemContent={(index, msg) => (
                    <div className="pb-4">
                        <MessageBubble
                            message={msg}
                            previousMessage={messages[index - 1]}
                            onToggleStar={onToggleStar}
                        />
                    </div>
                )}
                followOutput={"auto"}
                alignToBottom={false}
            />
        </div>
    );
}
