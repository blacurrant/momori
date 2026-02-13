"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, ArrowLeft, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const MomoriPuzzle = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const SIZE = 6;
    const TOTAL_TILES = SIZE * SIZE;
    const EMPTY_TILE = TOTAL_TILES - 1;

    const [tiles, setTiles] = useState<number[]>(Array.from({ length: TOTAL_TILES }, (_, i) => i));
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    React.useEffect(() => {
        const shuffle = () => {
            let newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
            let emptyIdx = EMPTY_TILE;
            let previousIdx = -1;

            for (let i = 0; i < 150; i++) {
                const neighbors = [];
                const row = Math.floor(emptyIdx / SIZE);
                const col = emptyIdx % SIZE;

                if (row > 0) neighbors.push(emptyIdx - SIZE);
                if (row < SIZE - 1) neighbors.push(emptyIdx + SIZE);
                if (col > 0) neighbors.push(emptyIdx - 1);
                if (col < SIZE - 1) neighbors.push(emptyIdx + 1);

                const validNeighbors = neighbors.filter(n => n !== previousIdx);
                const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

                [newTiles[emptyIdx], newTiles[randomNeighbor]] = [newTiles[randomNeighbor], newTiles[emptyIdx]];
                previousIdx = emptyIdx;
                emptyIdx = randomNeighbor;
            }
            setTiles(newTiles);
        };
        shuffle();
    }, []);

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        const emptyIdx = tiles.indexOf(EMPTY_TILE);
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const emptyRow = Math.floor(emptyIdx / SIZE);
        const emptyCol = emptyIdx % SIZE;

        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
            setTiles(newTiles);
            setMoves(m => m + 1);

            const isNowSolved = newTiles.every((val, i) => val === i);
            if (isNowSolved) {
                setIsSolved(true);
                setTimeout(onComplete, 2000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-4 text-[#3e2723]">
            <div className="flex flex-col md:flex-row justify-between w-full max-w-[500px] mb-6 items-center gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-serif font-bold text-[#3e2723] drop-shadow-sm">Momori's Puzzle</h2>
                    <p className="text-xs font-serif italic text-black/40">Restore the memory piece by piece</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-[#5d4037]/10 px-4 py-2 rounded-full border border-[#5d4037]/20 font-serif font-bold text-sm">
                        Moves: {moves}
                    </div>
                </div>
            </div>

            <div
                className="relative bg-[#3e2723] p-1.5 md:p-3 rounded-2xl shadow-2xl border-4 md:border-8 border-[#5d4037]"
                style={{ width: 'min(90vw, 500px)', height: 'min(90vw, 500px)' }}
            >
                <div className="grid grid-cols-6 grid-rows-6 w-full h-full gap-0.5 md:gap-1 bg-[#2c1810] rounded-lg overflow-hidden">
                    {tiles.map((tileNumber, index) => {
                        if (tileNumber === EMPTY_TILE && !isSolved) return <div key={`empty-${index}`} className="opacity-0" />;

                        const x = (tileNumber % SIZE) * 100 / (SIZE - 1);
                        const y = Math.floor(tileNumber / SIZE) * 100 / (SIZE - 1);

                        return (
                            <motion.button
                                key={tileNumber}
                                layoutId={`tile-${tileNumber}`}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={() => handleTileClick(index)}
                                className={`w-full h-full relative overflow-hidden group ${isSolved ? 'cursor-default' : 'cursor-pointer hover:brightness-110'}`}
                                style={{
                                    backgroundImage: `url('/puzzle.png')`,
                                    backgroundPosition: `${x}% ${y}%`,
                                    backgroundSize: `${SIZE * 100}%`,
                                }}
                            >
                                {!isSolved && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {isSolved && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#2c1810]/60 backdrop-blur-sm rounded-lg z-50 pointer-events-none"
                    >
                        <div className="bg-[#f4ece1] p-10 rounded-3xl border-4 border-[#ffb74d] text-center shadow-2xl">
                            <Trophy size={64} className="text-[#ffb74d] mx-auto mb-4 drop-shadow-xl" />
                            <h3 className="text-4xl font-serif font-bold text-[#3e2723] mb-2">Solved!</h3>
                            <p className="text-[#5d4037] font-serif italic">The memory is complete.</p>
                            <p className="mt-4 text-xs font-bold text-[#3e2723]/40 uppercase tracking-widest">Moves taken: {moves}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const KittyMatch = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const ICONS = ['🐱', '😺', '😸', '😻', '😼', '😽', '🙀', '😿'];
    const [cards, setCards] = useState<{ id: number; icon: string; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    useEffect(() => {
        const doubled = [...ICONS, ...ICONS];
        const shuffled = doubled
            .map(icon => ({ icon, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map((item, index) => ({ id: index, icon: item.icon, isFlipped: false, isMatched: false }));
        setCards(shuffled);
    }, []);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const [firstIdx, secondIdx] = newFlipped;
            if (newCards[firstIdx].icon === newCards[secondIdx].icon) {
                setTimeout(() => {
                    const matchedCards = [...newCards];
                    matchedCards[firstIdx].isMatched = true;
                    matchedCards[secondIdx].isMatched = true;
                    setCards(matchedCards);
                    setFlippedIndices([]);
                    setMatches(m => m + 1);

                    if (matches + 1 === ICONS.length) {
                        setTimeout(onComplete, 1500);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    const resetCards = [...newCards];
                    resetCards[firstIdx].isFlipped = false;
                    resetCards[secondIdx].isFlipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 text-[#3e2723]">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-[#3e2723]">Kitty Match</h2>
                <p className="text-xs font-serif italic text-black/40">Find the pairs of furry friends</p>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-[#5d4037]/5 p-6 rounded-3xl border-4 border-[#5d4037]/10 backdrop-blur-sm">
                {cards.map((card, index) => (
                    <motion.button
                        key={card.id}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                        onClick={() => handleCardClick(index)}
                        className={`w-16 h-20 md:w-24 md:h-32 relative preserve-3d cursor-pointer ${card.isMatched ? 'opacity-50' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div
                            className="absolute inset-0 bg-[#f48fb1] rounded-2xl flex items-center justify-center backface-hidden shadow-lg border-4 border-[#f8bbd0]"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white/40 text-2xl">?</span>
                            </div>
                        </div>

                        <div
                            className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center backface-hidden shadow-lg border-4 border-[#f48fb1]"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <span className="text-4xl md:text-6xl">{card.icon}</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {matches === ICONS.length && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 z-50"
                >
                    <div className="text-center p-12 bg-[#f4ece1] backdrop-blur-xl rounded-3xl border-8 border-pink-300 shadow-2xl">
                        <div className="text-8xl mb-4">🐾</div>
                        <h3 className="text-4xl font-serif font-bold text-[#3e2723] mb-4">Purr-fect Match!</h3>
                        <button onClick={onExit} className="bg-[#f48fb1] text-white px-10 py-4 rounded-full font-serif font-bold text-xl hover:scale-105 transition-transform shadow-xl">
                            Wonderful!
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const CatChaWord = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const [targetWord, setTargetWord] = useState('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    useEffect(() => {
        fetch('/api/groq', { method: 'POST', body: JSON.stringify({ type: 'wordle' }) })
            .then(res => res.json())
            .then(data => setTargetWord((data.word || 'KITTY').toUpperCase()));
    }, []);

    const handleKey = (key: string) => {
        if (status !== 'playing') return;

        if (key === 'ENTER') {
            if (currentGuess.length !== 5) return;
            const newGuesses = [...guesses, currentGuess];
            setGuesses(newGuesses);
            setCurrentGuess('');

            if (currentGuess === targetWord) {
                setStatus('won');
                setTimeout(onComplete, 2500);
            } else if (newGuesses.length >= 6) {
                setStatus('lost');
            }
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                e.preventDefault();
                handleKey(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, guesses, status, targetWord]);

    if (!targetWord) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-4 border-[#3e2723]/10 border-t-[#3e2723] rounded-full animate-spin" />
            <div className="font-serif italic text-[#3e2723]/60">Summoning a word...</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 text-[#3e2723]">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-[#3e2723]">Cat-cha Word</h2>
                <p className="text-xs font-serif italic text-black/40">Guess the 5-letter secret word</p>
            </div>

            <div className="flex flex-col gap-3 mb-8">
                {[...Array(6)].map((_, i) => {
                    const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
                    return (
                        <div key={i} className="flex gap-3">
                            {[...Array(5)].map((_, j) => {
                                const letter = guess[j] || '';
                                let bg = 'bg-[#f4ece1] border-[#5d4037]/20';
                                let text = 'text-[#3e2723]';

                                if (i < guesses.length) {
                                    if (letter === targetWord[j]) {
                                        bg = 'bg-[#81c784] border-[#66bb6a]';
                                        text = 'text-white';
                                    } else if (targetWord.includes(letter)) {
                                        bg = 'bg-[#ffb74d] border-[#ffa726]';
                                        text = 'text-white';
                                    } else {
                                        bg = 'bg-[#a1887f] border-[#8d6e63]';
                                        text = 'text-white/80';
                                    }
                                }

                                return (
                                    <motion.div
                                        key={j}
                                        initial={false}
                                        animate={letter ? { scale: [1, 1.1, 1] } : {}}
                                        className={cn(
                                            "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border-2 text-2xl md:text-3xl font-serif font-bold rounded-2xl shadow-sm transition-colors",
                                            bg, text
                                        )}
                                    >
                                        {letter}
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {status !== 'playing' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-[#f4ece1] rounded-3xl border-4 border-[#3e2723]/10 text-center"
                >
                    <div className="text-3xl font-serif font-bold mb-2">
                        {status === 'won' ? '✨ Purr-fect! ✨' : 'Oh No!'}
                    </div>
                    <div className="text-sm font-serif italic text-[#3e2723]/60">
                        {status === 'won' ? 'You caught the word!' : `The secret word was ${targetWord}`}
                    </div>
                    {status === 'lost' && (
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#3e2723] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                            Try Again
                        </button>
                    )}
                </motion.div>
            )}

            {/* Visual Keyboard - Only for hint, real input is physical */}
            <div className="text-[10px] font-bold text-[#3e2723]/30 uppercase tracking-[0.3em]">
                Use your keyboard to play
            </div>
        </div>
    );
};

const PurrSistWords = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const [data, setData] = useState<{ center: string; letters: string[] } | null>(null);
    const [input, setInput] = useState('');
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/groq', { method: 'POST', body: JSON.stringify({ type: 'spelling' }) })
            .then(res => res.json())
            .then(data => {
                if (!data || !data.letters || !data.center) throw new Error('Invalid data');
                setData(data);
            })
            .catch(() => setData({ center: 'O', letters: ['O', 'M', 'R', 'I', 'C', 'A', 'T'] }));
    }, []);

    const submit = () => {
        if (!data) return;
        const word = input.toUpperCase();

        if (word.length < 4) { setMessage('Too short!'); return; }
        if (!word.includes(data.center)) { setMessage('Must use center letter!'); return; }
        if ([...word].some(c => !data.letters.includes(c))) { setMessage('Invalid letters!'); return; }
        if (foundWords.includes(word)) { setMessage('Already found!'); return; }

        setFoundWords(prev => [word, ...prev]);
        setInput('');
        setMessage('✨ Amazing! ✨');
        setTimeout(() => setMessage(''), 1500);

        if (foundWords.length >= 6) setTimeout(onComplete, 2000);
    };

    if (!data) return <div className="text-[#3e2723] font-serif italic text-center mt-20 animate-pulse">Gathering letters...</div>;

    const outerLetters = (data.letters || []).filter(l => l !== data.center);

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 text-[#3e2723]">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-[#3e2723]">Purr-sist Words</h2>
                <p className="text-xs font-serif italic text-black/40">Create words that include the center letter</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setInput(p => p + data.center)}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#ffb74d] text-[#3e2723] text-3xl font-serif font-bold flex items-center justify-center z-10 shadow-2xl border-4 border-[#ffa726] active:scale-95 transition-transform"
                        >
                            {data.center}
                        </motion.button>
                        {outerLetters.map((l, i) => {
                            const angle = (i * (360 / outerLetters.length)) * (Math.PI / 180);
                            const r = window.innerWidth < 768 ? 90 : 110;
                            const x = Math.cos(angle) * r;
                            const y = Math.sin(angle) * r;
                            return (
                                <motion.button
                                    key={l}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setInput(p => p + l)}
                                    className="absolute w-14 h-14 md:w-18 md:h-18 rounded-full bg-[#f4ece1] text-[#3e2723] text-xl md:text-2xl font-serif font-bold flex items-center justify-center shadow-lg border-2 border-[#5d4037]/10 active:scale-95 transition-transform hover:bg-white"
                                    style={{ transform: `translate(${x}px, ${y}px)` }}
                                >
                                    {l}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full max-w-xs flex flex-col items-center gap-6">
                    <div className="h-14 flex items-center justify-center">
                        <div className="text-4xl font-serif font-bold border-b-4 border-[#3e2723]/10 min-w-[200px] text-center tracking-widest">
                            {input || <span className="opacity-10 text-2xl tracking-normal italic">Start typing...</span>}
                        </div>
                    </div>

                    <div className="text-[#ffb74d] font-serif font-bold h-6 text-sm">{message}</div>

                    <div className="flex gap-4 w-full">
                        <button onClick={() => setInput('')} className="flex-1 py-3 bg-[#a1887f]/20 rounded-full font-serif font-bold text-[#3e2723] hover:bg-[#a1887f]/30 transition-colors">
                            Oops!
                        </button>
                        <button onClick={submit} className="flex-[2] py-3 bg-[#3e2723] text-white rounded-full font-serif font-bold hover:scale-105 transition-transform shadow-lg">
                            Enter
                        </button>
                    </div>

                    <div className="w-full mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#3e2723]/40 uppercase tracking-widest">Found Words</span>
                            <span className="text-xs font-serif italic text-[#3e2723]/60">{foundWords.length} words found</span>
                        </div>
                        <div className="h-24 overflow-y-auto bg-[#5d4037]/5 rounded-2xl p-4 flex flex-wrap gap-2 content-start custom-scrollbar">
                            {foundWords.length === 0 ? (
                                <span className="text-[10px] italic text-[#3e2723]/20">No words found yet...</span>
                            ) : (
                                foundWords.map(w => (
                                    <span key={w} className="px-3 py-1 bg-white rounded-full text-xs font-serif font-bold border border-[#5d4037]/10">{w}</span>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

type GameType = 'puzzle' | 'whack' | 'memory' | 'wordle' | 'spelling' | null;

interface GameDefinition {
    id: GameType;
    title: string;
    description: string;
    icon: string;
    color: string;
}

const GAMES: GameDefinition[] = [
    { id: 'puzzle', title: "Momori's Puzzle", description: "Restore the memory piece by piece.", icon: "🧩", color: "bg-[#9fa8da]" },
    { id: 'memory', title: "Kitty Match", description: "Find pairs of furry friends.", icon: "🐱", color: "bg-[#f48fb1]" },
    { id: 'wordle', title: "Cat-cha Word", description: "Uncover the secret 5-letter word.", icon: "🔡", color: "bg-[#a5d6a7]" },
    { id: 'spelling', title: "Purr-sist Words", description: "The ultimate spelling challenge.", icon: "🐝", color: "bg-[#ce93d8]" },
];

export interface GameRoomOverlayProps {
    activeGame: GameType;
    onStartGame: (game: GameType) => void;
    onExitGame: () => void;
}

export function GameRoomOverlay({ activeGame, onStartGame, onExitGame }: GameRoomOverlayProps) {
    const handleGameComplete = () => {
        onExitGame();
    };

    return (
        <div className="w-full h-full">
            <AnimatePresence mode="wait">
                {activeGame ? (
                    <motion.div
                        key="game-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-full"
                    >
                        {activeGame === 'puzzle' && <MomoriPuzzle onComplete={handleGameComplete} onExit={onExitGame} />}
                        {activeGame === 'memory' && <KittyMatch onComplete={handleGameComplete} onExit={onExitGame} />}
                        {activeGame === 'wordle' && <CatChaWord onComplete={handleGameComplete} onExit={onExitGame} />}
                        {activeGame === 'spelling' && <PurrSistWords onComplete={handleGameComplete} onExit={onExitGame} />}
                    </motion.div>
                ) : (
                    <motion.div
                        key="menu-view"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-5xl mx-auto p-4 md:p-12"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3e2723] mb-3">Which game shall it be?</h2>
                            <p className="text-sm md:text-lg font-serif italic text-black/40">Pick a pastime for a cozy afternoon</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {GAMES.map((game) => (
                                <motion.button
                                    key={game.id}
                                    whileHover={{ scale: 1.03, y: -8 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => onStartGame(game.id)}
                                    className="relative group overflow-hidden rounded-[2.5rem] aspect-[16/10] text-left shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-4 border-[#3e2723]/5"
                                >
                                    {/* Paper Texture Overlay */}
                                    <div className="absolute inset-0 bg-[#f4ece1] opacity-50 z-0 pointer-events-none" />

                                    {/* Background Color */}
                                    <div className={cn("absolute inset-0 opacity-80 mix-blend-multiply transition-colors group-hover:opacity-100", game.color)} />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                        <div className="w-16 h-16 rounded-3xl bg-white/40 flex items-center justify-center text-4xl shadow-sm border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                            {game.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-serif font-bold text-[#3e2723] mb-2">{game.title}</h3>
                                            <p className="text-[#3e2723]/60 text-sm font-serif italic leading-snug max-w-[200px]">{game.description}</p>
                                        </div>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute bottom-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <div className="w-12 h-12 rounded-full bg-[#3e2723] flex items-center justify-center text-white shadow-xl">
                                            <Gamepad2 size={24} />
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
