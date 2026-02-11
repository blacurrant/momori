import React from 'react';
import { Search, Calendar, User, X, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
    participants: string[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedSender: string;
    onSenderChange: (s: string) => void;
    startDate: string;
    onStartDateChange: (d: string) => void;
    endDate: string;
    onEndDateChange: (d: string) => void;
    minWordCount: number;
    onMinWordCountChange: (n: number) => void;
    totalMessages: number;
    shownMessages: number;
    onClearFilters: () => void;
}

export function FilterBar({
    participants,
    searchQuery,
    onSearchChange,
    selectedSender,
    onSenderChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    minWordCount,
    onMinWordCountChange,
    totalMessages,
    shownMessages,
    onClearFilters
}: FilterBarProps) {
    return (
        <div className="sticky top-0 z-50 p-4 border-b border-white/5 bg-background/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Top Row: Search & Stats */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent truncate tracking-tight">
                        Momori
                    </h1>

                    <div className="relative flex-1 max-w-xl w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search memories..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-white/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                        {searchQuery && (
                            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white text-muted-foreground">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden md:block">
                        Showing {shownMessages.toLocaleString()} / {totalMessages.toLocaleString()}
                    </div>
                </div>

                {/* Bottom Row: Filters */}
                <div className="flex flex-wrap gap-2 items-center">

                    {/* Sender Filter */}
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <select
                            value={selectedSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            className="pl-9 pr-8 py-1.5 bg-secondary/30 border border-white/5 rounded-lg text-xs text-foreground focus:outline-none focus:bg-secondary cursor-pointer appearance-none hover:bg-secondary/50 transition-colors w-32 md:w-40 truncate"
                        >
                            <option value="">All Senders</option>
                            {participants.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-secondary/30 border border-white/5 rounded-lg px-2 py-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-transparent border-0 text-xs text-foreground focus:outline-none w-24 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-transparent border-0 text-xs text-foreground focus:outline-none w-24 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>

                    {/* Word Count Filter */}
                    <div className="flex items-center gap-2 bg-secondary/30 border border-white/5 rounded-lg px-2 py-1" title="Min Words">
                        <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="number"
                            min="0"
                            placeholder="Min Words"
                            value={minWordCount || ''}
                            onChange={(e) => onMinWordCountChange(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-0 text-xs text-foreground focus:outline-none w-16 placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {(selectedSender || startDate || endDate || minWordCount > 0) && (
                        <button
                            onClick={onClearFilters}
                            className="ml-auto text-xs text-primary hover:text-primary/80 hover:underline px-2"
                        >
                            Clear Filters
                        </button>
                    )}

                    <div className="md:hidden ml-auto text-xs text-muted-foreground">
                        {shownMessages} results
                    </div>

                </div>
            </div>
        </div>
    );
}
