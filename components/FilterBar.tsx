import React from 'react';
import { Search, Calendar, User, X, AlignLeft, Star } from 'lucide-react';
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
    showStarredOnly: boolean;
    onShowStarredOnlyChange: (b: boolean) => void;
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
    onClearFilters,
    showStarredOnly,
    onShowStarredOnlyChange
}: FilterBarProps) {
    return (
        <div className="sticky top-0 z-50 py-4 px-2 md:px-6 bg-[#f4ece1]/80 backdrop-blur-md border-b-2 border-[#3e2723]/10">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">

                {/* Search and Stats */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-2xl group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-[#3e2723]/30 group-focus-within:text-[#ffb74d] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Sift through the archives..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(
                                "w-full pl-12 pr-12 py-3 bg-white/50 border-2 border-[#3e2723]/5 rounded-2xl",
                                "font-serif text-sm text-[#2c1810] placeholder:text-[#3e2723]/20",
                                "focus:outline-none focus:border-[#ffb74d]/50 focus:bg-white transition-all shadow-sm"
                            )}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3e2723]/30 hover:text-[#c62828] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#2c1810]/5 rounded-full border border-[#3e2723]/5">
                        <span className="text-[10px] font-sans font-bold text-[#3e2723]/40 uppercase tracking-widest">
                            Collection:
                        </span>
                        <span className="text-xs font-serif font-bold text-[#8d6e63]">
                            {shownMessages.toLocaleString()} / {totalMessages.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Sender Select */}
                    <div className="relative group min-w-[140px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <User className="w-3.5 h-3.5 text-[#3e2723]/40" />
                        </div>
                        <select
                            value={selectedSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            className={cn(
                                "pl-9 pr-8 py-2 w-full appearance-none bg-white/40 border-2 border-[#3e2723]/5 rounded-xl",
                                "font-serif text-xs text-[#2c1810] focus:outline-none focus:border-[#ffb74d]/30 cursor-pointer shadow-sm"
                            )}
                        >
                            <option value="">All Voices</option>
                            {participants.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 border-2 border-[#3e2723]/5 rounded-xl shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-[#3e2723]/40" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-transparent border-0 text-[10px] md:text-xs font-serif text-[#2c1810] focus:outline-none w-24"
                        />
                        <span className="text-[#3e2723]/20 font-serif">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-transparent border-0 text-[10px] md:text-xs font-serif text-[#2c1810] focus:outline-none w-24"
                        />
                    </div>

                    {/* Word Count */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 border-2 border-[#3e2723]/5 rounded-xl shadow-sm">
                        <AlignLeft className="w-3.5 h-3.5 text-[#3e2723]/40" />
                        <input
                            type="number"
                            min="0"
                            placeholder="Min Words"
                            value={minWordCount || ''}
                            onChange={(e) => onMinWordCountChange(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-0 text-[10px] md:text-xs font-serif text-[#2c1810] focus:outline-none w-16 placeholder:text-[#3e2723]/20"
                        />
                    </div>

                    {/* Starred Filter */}
                    <button
                        onClick={() => onShowStarredOnlyChange(!showStarredOnly)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 transition-all shadow-sm",
                            showStarredOnly
                                ? "bg-[#ffb74d]/20 border-[#ffb74d] text-[#e65100]"
                                : "bg-white/40 border-[#3e2723]/5 text-[#3e2723]/40 hover:bg-white/60"
                        )}
                    >
                        <Star className={cn("w-3.5 h-3.5", showStarredOnly ? "fill-current" : "")} />
                        <span className="text-[10px] md:text-xs font-serif font-bold uppercase tracking-wider">Treasures</span>
                    </button>

                    {(selectedSender || searchQuery || startDate || endDate || minWordCount > 0 || showStarredOnly) && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] md:text-xs font-serif italic text-blue-600 hover:text-blue-800 transition-colors underline decoration-blue-200 underline-offset-4 ml-auto"
                        >
                            Clear Sifters
                        </button>
                    )}

                    <div className="md:hidden ml-auto text-[10px] font-serif italic text-[#3e2723]/40">
                        {shownMessages} results
                    </div>
                </div>
            </div>
        </div>
    );
}
