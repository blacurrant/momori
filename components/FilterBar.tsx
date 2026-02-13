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
        <div className="sticky top-0 z-50 py-6 px-4 md:px-10 bg-black/20 backdrop-blur-2xl border-b border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                {/* Search and Stats */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-white/20 group-focus-within:text-amber-200/50 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Sift through whispers..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(
                                "w-full pl-14 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl",
                                "font-serif text-base text-white/90 placeholder:text-white/10",
                                "focus:outline-none focus:border-white/10 focus:bg-white/10 transition-all shadow-inner"
                            )}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/5">
                        <span className="text-[10px] font-sans font-bold text-white/20 uppercase tracking-[0.2em]">
                            Collection:
                        </span>
                        <span className="text-sm font-serif italic text-white/60">
                            {shownMessages.toLocaleString()} / {totalMessages.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Sender Select */}
                    <div className="relative group min-w-[160px]">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <User className="w-4 h-4 text-white/20" />
                        </div>
                        <select
                            value={selectedSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            className={cn(
                                "pl-11 pr-10 py-2.5 w-full appearance-none bg-white/5 border border-white/5 rounded-xl",
                                "font-serif text-sm text-white/80 focus:outline-none focus:border-white/20 cursor-pointer transition-all"
                            )}
                        >
                            <option value="" className="bg-[#1a111a]">All Voices</option>
                            {participants.map(p => (
                                <option key={p} value={p} className="bg-[#1a111a]">{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                        <Calendar className="w-4 h-4 text-white/20" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-transparent border-0 text-xs font-serif text-white/80 focus:outline-none w-28 [color-scheme:dark]"
                        />
                        <span className="text-white/10 font-serif">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-transparent border-0 text-xs font-serif text-white/80 focus:outline-none w-28 [color-scheme:dark]"
                        />
                    </div>

                    {/* Word Count */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                        <AlignLeft className="w-4 h-4 text-white/20" />
                        <input
                            type="number"
                            min="0"
                            placeholder="Min Words"
                            value={minWordCount || ''}
                            onChange={(e) => onMinWordCountChange(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-0 text-xs font-serif text-white/80 focus:outline-none w-20 placeholder:text-white/10"
                        />
                    </div>

                    {/* Starred Filter */}
                    <button
                        onClick={() => onShowStarredOnlyChange(!showStarredOnly)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-2 rounded-xl border transition-all",
                            showStarredOnly
                                ? "bg-amber-400/10 border-amber-400/30 text-amber-200"
                                : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10 hover:text-white/40"
                        )}
                    >
                        <Star className={cn("w-4 h-4", showStarredOnly ? "fill-current" : "")} />
                        <span className="text-[10px] md:text-xs font-serif font-bold uppercase tracking-[0.15em]">Treasures</span>
                    </button>

                    {(selectedSender || searchQuery || startDate || endDate || minWordCount > 0 || showStarredOnly) && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] md:text-xs font-serif italic text-white/30 hover:text-white transition-colors underline decoration-white/10 underline-offset-4 ml-auto"
                        >
                            Clear Sifters
                        </button>
                    )}

                    <div className="md:hidden ml-auto text-[10px] font-serif italic text-white/20 tracking-wider">
                        {shownMessages} results
                    </div>
                </div>
            </div>
        </div>
    );
}
