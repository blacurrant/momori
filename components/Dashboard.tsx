"use client";

import React, { useMemo, useState } from 'react';
import { ChatExport, Message } from '@/lib/types';
import { FilterBar } from './FilterBar';
import { ChatList } from './ChatList';
import { AskMomori } from './AskMomori';
import { MediaGallery } from './MediaGallery';
import { cn } from '@/lib/utils';

interface DashboardProps {
    data: ChatExport;
}

export function Dashboard({ data }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'messages' | 'photos' | 'videos' | 'audio'>('messages');

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSender, setSelectedSender] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minWordCount, setMinWordCount] = useState(0);

    const filteredMessages = useMemo(() => {
        let filtered = data.messages;

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

        if (activeTab === 'messages' && minWordCount > 0) {
            filtered = filtered.filter(m => m.content.split(/\s+/).filter(w => w.length > 0).length >= minWordCount);
        }

        return filtered;
    }, [data.messages, selectedSender, searchQuery, startDate, endDate, minWordCount, activeTab]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedSender('');
        setStartDate('');
        setEndDate('');
        setMinWordCount(0);
    };

    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            <div className="sticky top-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-white/5">
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
                />

                {/* Navigation Tabs */}
                <div className="flex items-center justify-center gap-2 p-2 pb-0">
                    <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>Messages</TabButton>
                    <TabButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')}>Photos</TabButton>
                    <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>Videos</TabButton>
                    <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')}>Audio</TabButton>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4">
                {activeTab === 'messages' && <ChatList messages={filteredMessages} />}
                {activeTab === 'photos' && <MediaGallery messages={filteredMessages} type="image" />}
                {activeTab === 'videos' && <MediaGallery messages={filteredMessages} type="video" />}
                {activeTab === 'audio' && <MediaGallery messages={filteredMessages} type="audio" />}
            </main>

            <AskMomori messages={filteredMessages} />
        </div>
    );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white hover:border-white/10"
            )}
        >
            {children}
        </button>
    );
}
