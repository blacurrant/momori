import React, { useRef } from 'react';
import { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface ChatListProps {
    messages: Message[];
}

export function ChatList({ messages }: ChatListProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    if (messages.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                <p>No messages found matching your filter.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)]">
            {/* 
        Height calculation: 
        100vh - 
        (FilterBar height ~70px) - 
        (Top padding ~20px) - 
        (Bottom padding ~50px)
       */}
            <Virtuoso
                ref={virtuosoRef}
                data={messages}
                totalCount={messages.length}
                itemContent={(index, msg) => (
                    <div className="pb-2">
                        <MessageBubble
                            message={msg}
                            previousMessage={messages[index - 1]}
                        />
                    </div>
                )}
                followOutput={"auto"} // Auto-scroll to bottom like a real chat
                alignToBottom={false} // Start from top for history view
            />
        </div>
    );
}
