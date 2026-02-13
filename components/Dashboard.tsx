"use client";

import React, { useMemo, useState } from 'react';
import { ChatExport, Message } from '@/lib/types';
import { motion } from 'framer-motion';
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
    const [showStarredOnly, setShowStarredOnly] = useState(false);

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

        if (showStarredOnly) {
            filtered = filtered.filter(m => m.starred);
        }

        return filtered;
    }, [data.messages, selectedSender, searchQuery, startDate, endDate, minWordCount, showStarredOnly, activeTab]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedSender('');
        setStartDate('');
        setEndDate('');
        setMinWordCount(0);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0f0d11]/80 backdrop-blur-3xl">
            <div className="sticky top-0 z-[60] bg-black/20 backdrop-blur-2xl border-b border-white/5">
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
                    showStarredOnly={showStarredOnly}
                    onShowStarredOnlyChange={setShowStarredOnly}
                    totalMessages={data.totalMessages}
                    shownMessages={filteredMessages.length}
                    onClearFilters={handleClearFilters}
                />

                {/* Navigation Tabs */}
                <div className="flex items-center justify-start md:justify-center gap-6 p-4 pb-0 overflow-x-auto no-scrollbar scroll-smooth">
                    <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>Whispers</TabButton>
                    <TabButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')}>Visions</TabButton>
                    <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>Chronicles</TabButton>
                    <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')}>Echoes</TabButton>
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
                "px-8 py-4 font-serif text-base tracking-wide transition-all duration-700 relative",
                active
                    ? "text-white"
                    : "text-white/20 hover:text-white/40"
            )}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-200/40"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </button>
    );
}
