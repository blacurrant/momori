import React from 'react';
import { Search, X, User, Star, Trash2, ChevronDown, Calendar, AlignLeft } from 'lucide-react';
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
        <div className="sticky top-0 z-50 py-4 px-4 md:px-8 bg-[#FFFDF7] border-b-2 border-[#FFB7C5]/10 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
                {/* Search and Stats */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-[#4A4A4A]/20 group-focus-within:text-[#FFB7C5] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search whispers..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn(
                                "w-full pl-12 pr-12 py-2.5 bg-white border-2 border-[#E8E8E8] rounded-2xl",
                                "font-serif text-sm text-[#4A4A4A] placeholder:text-[#4A4A4A]/20 shadow-inner",
                                "focus:outline-none focus:border-[#FFB7C5]/40 transition-all"
                            )}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A4A4A]/20 hover:text-[#FFB7C5] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-6 px-6 py-2.5 bg-[#FEF9E7] rounded-2xl border border-white/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-[#FFB7C5] uppercase tracking-wider">Total</span>
                            <span className="text-xl font-serif font-extrabold text-[#4A4A4A]">{totalMessages}</span>
                        </div>
                        <div className="w-px h-5 bg-[#E8E8E8]" />
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-[#D5ECC2] uppercase tracking-wider">Found</span>
                            <span className="text-xl font-serif font-extrabold text-[#4A4A4A]">{shownMessages}</span>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Sender Select */}
                    <div className="relative group min-w-[150px]">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <User className="w-4 h-4 text-[#4A4A4A]/20 group-focus-within:text-[#FFB7C5]" />
                        </div>
                        <select
                            value={selectedSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            className={cn(
                                "pl-10 pr-10 py-2 w-full appearance-none bg-white border-2 border-[#E8E8E8] rounded-xl",
                                "font-serif text-sm font-bold text-[#4A4A4A] focus:outline-none focus:border-[#FFB7C5]/40 cursor-pointer transition-all shadow-sm"
                            )}
                        >
                            <option value="">All Voices</option>
                            {participants.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A4A4A]/20 pointer-events-none" />
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-1.5 bg-white border-2 border-[#E8E8E8] rounded-xl p-1 shadow-sm">
                        <Calendar className="w-4 h-4 text-[#4A4A4A]/20 ml-2" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-transparent px-2 py-1 font-serif text-[11px] font-bold text-[#4A4A4A] focus:outline-none uppercase"
                        />
                        <span className="text-[#E8E8E8]">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="bg-transparent px-2 py-1 font-serif text-[11px] font-bold text-[#4A4A4A] focus:outline-none uppercase"
                        />
                    </div>

                    {/* Word Count */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#E8E8E8] rounded-xl shadow-sm">
                        <AlignLeft className="w-4 h-4 text-[#4A4A4A]/20" />
                        <input
                            type="number"
                            min="0"
                            placeholder="Min"
                            value={minWordCount || ''}
                            onChange={(e) => onMinWordCountChange(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-0 text-sm font-serif font-bold text-[#4A4A4A] focus:outline-none w-12 placeholder:text-[#4A4A4A]/20"
                        />
                    </div>

                    <button
                        onClick={() => onShowStarredOnlyChange(!showStarredOnly)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all shadow-sm",
                            showStarredOnly
                                ? "bg-[#FFFDF7] border-[#FFB7C5] text-[#FFB7C5]"
                                : "bg-white border-[#E8E8E8] text-[#4A4A4A]/20 hover:border-[#FFB7C5]/30 hover:text-[#FFB7C5]/40"
                        )}
                    >
                        <Star className={cn("w-4 h-4", showStarredOnly ? "fill-current" : "")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sweetness</span>
                    </button>

                    {(selectedSender || searchQuery || startDate || endDate || minWordCount > 0 || showStarredOnly) && (
                        <button
                            onClick={onClearFilters}
                            className="text-[10px] font-serif italic text-[#FFB7C5] hover:underline ml-auto"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
