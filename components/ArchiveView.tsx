"use client";

import React, { useMemo, useState } from 'react';
import { ChatExport, Message } from '@/lib/types';
import { FilterBar } from './FilterBar';
import { ChatList } from './ChatList';

interface ArchiveViewProps {
    data: ChatExport;
    starredMessageIds: Set<string>;
    onToggleStar: (id: string) => void;
}

export function ArchiveView({ data, starredMessageIds, onToggleStar }: ArchiveViewProps) {
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSender, setSelectedSender] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minWordCount, setMinWordCount] = useState(0);
    const [showStarredOnly, setShowStarredOnly] = useState(false);

    const filteredMessages = useMemo(() => {
        let filtered = data.messages.map(m => ({
            ...m,
            starred: starredMessageIds.has(m.id)
        }));

        if (showStarredOnly) {
            filtered = filtered.filter(m => m.starred);
        }

        if (selectedSender) {
            filtered = filtered.filter(m => m.sender === selectedSender);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.content.toLowerCase().includes(query)
            );
        }

        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(m => m.timestamp >= start);
        }

        if (endDate) {
            const endD = new Date(endDate);
            endD.setHours(23, 59, 59, 999);
            filtered = filtered.filter(m => m.timestamp <= endD);
        }

        if (minWordCount > 0) {
            filtered = filtered.filter(m => m.content.split(/\s+/).filter(w => w.length > 0).length >= minWordCount);
        }

        return filtered;
    }, [data.messages, starredMessageIds, showStarredOnly, selectedSender, searchQuery, startDate, endDate, minWordCount]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedSender('');
        setStartDate('');
        setEndDate('');
        setMinWordCount(0);
        setShowStarredOnly(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#FFFDF7]">
            <FilterBar
                participants={data.participants}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSender={selectedSender}
                onSenderChange={setSelectedSender}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                minWordCount={minWordCount}
                onMinWordCountChange={setMinWordCount}
                totalMessages={data.totalMessages}
                shownMessages={filteredMessages.length}
                onClearFilters={handleClearFilters}
                showStarredOnly={showStarredOnly}
                onShowStarredOnlyChange={setShowStarredOnly}
            />

            <div className="flex-1 overflow-hidden">
                <ChatList
                    messages={filteredMessages}
                    onToggleStar={onToggleStar}
                />
            </div>
        </div>
    );
}
