"use client";

import React, { useMemo, useState } from 'react';
import { ChatExport, Message } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <div className="sticky top-0 z-[60] bg-white/50 border-b-2 border-[#E8E8E8]">
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

                {/* Bubbly Navigation Tabs */}
                <div className="flex items-center justify-start md:justify-center gap-6 p-6 overflow-x-auto no-scrollbar scroll-smooth">
                    <TabButton active={activeTab === 'messages'} color="#FFB7C5" onClick={() => setActiveTab('messages')}>Whispers</TabButton>
                    <TabButton active={activeTab === 'photos'} color="#D5ECC2" onClick={() => setActiveTab('photos')}>Visions</TabButton>
                    <TabButton active={activeTab === 'videos'} color="#B2E2F2" onClick={() => setActiveTab('videos')}>Chronicles</TabButton>
                    <TabButton active={activeTab === 'audio'} color="#E0BBE4" onClick={() => setActiveTab('audio')}>Echoes</TabButton>
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {activeTab === 'messages' && <ChatList messages={filteredMessages} />}
                        {activeTab === 'photos' && <MediaGallery messages={filteredMessages} type="image" />}
                        {activeTab === 'videos' && <MediaGallery messages={filteredMessages} type="video" />}
                        {activeTab === 'audio' && <MediaGallery messages={filteredMessages} type="audio" />}
                    </motion.div>
                </AnimatePresence>
            </main>

            <AskMomori messages={filteredMessages} />
        </div>
    );
}

interface TabButtonProps {
    children: React.ReactNode;
    active: boolean;
    color: string;
    onClick: () => void;
}

function TabButton({ children, active, color, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-8 py-4 font-serif font-extrabold text-lg tracking-wide transition-all duration-500 relative rounded-3xl",
                active
                    ? "text-white shadow-lg"
                    : "text-[#4A4A4A]/30 hover:text-[#4A4A4A]/50 hover:bg-[#E8E8E8]/20"
            )}
            style={{ backgroundColor: active ? color : 'transparent' }}
        >
            <span className="relative z-10">{children}</span>
            {active && (
                <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-3xl blur-xl opacity-40 -z-10"
                    style={{ backgroundColor: color }}
                />
            )}
        </button>
    );
}
