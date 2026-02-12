"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, ArrowLeft, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const MomoriPuzzle = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const SIZE = 6;
    const TOTAL_TILES = SIZE * SIZE;
    const EMPTY_TILE = TOTAL_TILES - 1;

    // Initial solved state: [0, 1, 2, ..., 35]
    const [tiles, setTiles] = useState<number[]>(Array.from({ length: TOTAL_TILES }, (_, i) => i));
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    // Shuffle tiles
    React.useEffect(() => {
        const shuffle = () => {
            let newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
            let emptyIdx = EMPTY_TILE;
            let previousIdx = -1;

            // Perform valid moves to shuffle (ensures solvability)
            for (let i = 0; i < 150; i++) {
                const neighbors = [];
                const row = Math.floor(emptyIdx / SIZE);
                const col = emptyIdx % SIZE;

                if (row > 0) neighbors.push(emptyIdx - SIZE); // Up
                if (row < SIZE - 1) neighbors.push(emptyIdx + SIZE); // Down
                if (col > 0) neighbors.push(emptyIdx - 1); // Left
                if (col < SIZE - 1) neighbors.push(emptyIdx + 1); // Right

                // Filter out the tile we just moved to avoid immediate undo
                const validNeighbors = neighbors.filter(n => n !== previousIdx);
                const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

                // Swap
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

        // Check adjacency (manhattan distance === 1)
        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
            setTiles(newTiles);
            setMoves(m => m + 1);

            // Check win
            const isNowSolved = newTiles.every((val, i) => val === i);
            if (isNowSolved) {
                setIsSolved(true);
                setTimeout(onComplete, 2000); // Auto-exit or show confetti after delay
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="flex justify-between w-full max-w-[500px] mb-4 items-center">
                <h2 className="text-2xl font-bold text-yellow-300 drop-shadow-md">Momori's Puzzle</h2>
                <div className="flex gap-4">
                    <div className="bg-black/40 px-3 py-1 rounded">Moves: {moves}</div>
                    <button onClick={onExit} className="bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded transition-colors text-sm">Exit</button>
                </div>
            </div>

            <div
                className="relative bg-black/50 p-2 rounded-lg shadow-2xl border border-white/10"
                style={{ width: 'min(80vh, 500px)', height: 'min(80vh, 500px)' }}
            >
                <div className="grid grid-cols-6 grid-rows-6 w-full h-full gap-[1px] bg-white/10">
                    {tiles.map((tileNumber, index) => {
                        // Don't render anything for the "current" position of the empty tile, 
                        // UNLESS solved, then show full image
                        if (tileNumber === EMPTY_TILE && !isSolved) return <div key={`empty-${index}`} className="opacity-0" />;

                        // If solved, tileNumber equals index. 
                        // Background position calculation:
                        // original x = (tileNumber % 6) * 100% / 5
                        // original y = floor(tileNumber / 6) * 100% / 5
                        const x = (tileNumber % SIZE) * 100 / (SIZE - 1);
                        const y = Math.floor(tileNumber / SIZE) * 100 / (SIZE - 1);

                        return (
                            <motion.button
                                key={tileNumber}
                                layoutId={`tile-${tileNumber}`}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={() => handleTileClick(index)}
                                className={`w-full h-full relative overflow-hidden ${isSolved ? 'cursor-default' : 'cursor-pointer hover:brightness-110'}`}
                                style={{
                                    backgroundImage: `url('/puzzle.png')`,
                                    backgroundPosition: `${x}% ${y}%`,
                                    backgroundSize: `${SIZE * 100}%`,
                                }}
                            >
                                {!isSolved && (
                                    <span className="absolute top-0.5 left-0.5 text-[8px] text-white/30 font-mono pointer-events-none">
                                        {tileNumber + 1}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
                {isSolved && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg z-50 pointer-events-none"
                    >
                        <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center backdrop-blur-md">
                            <Trophy size={64} className="text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]" />
                            <h3 className="text-3xl font-bold text-white mb-2">Solved!</h3>
                            <p className="text-white/80">Moves: {moves}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const KittyMatch = ({ onComplete, onExit }: { onComplete: () => void, onExit: () => void }) => {
    const ICONS = ['🐱', '😺', '😸', '😻', '😼', '😽', '🙀', '😿']; // 8 pairs
    const [cards, setCards] = useState<{ id: number; icon: string; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);

    useEffect(() => {
        // Initialize game
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
                // Match!
                setTimeout(() => {
                    const matchedCards = [...newCards];
                    matchedCards[firstIdx].isMatched = true;
                    matchedCards[secondIdx].isMatched = true;
                    setCards(matchedCards);
                    setFlippedIndices([]);
                    setMatches(m => m + 1);

                    if (matches + 1 === ICONS.length) {
                        setTimeout(onComplete, 1000);
                    }
                }, 500);
            } else {
                // No Match
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
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="flex justify-between w-full max-w-[500px] mb-4 items-center">
                <h2 className="text-2xl font-bold text-pink-300 drop-shadow-md">Kitty Match</h2>
                <div className="flex gap-4">
                    <button onClick={onExit} className="bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded transition-colors text-sm">Exit</button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                {cards.map((card, index) => (
                    <motion.button
                        key={card.id}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleCardClick(index)}
                        className={`w-20 h-24 relative preserve-3d cursor-pointer ${card.isMatched ? 'opacity-50' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front (Hidden) */}
                        <div
                            className="absolute inset-0 bg-pink-400 rounded-lg flex items-center justify-center backface-hidden shadow-lg border-2 border-pink-200"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <Gamepad2 className="text-white/20" size={32} />
                        </div>

                        {/* Back (Revealed) */}
                        <div
                            className="absolute inset-0 bg-white rounded-lg flex items-center justify-center backface-hidden shadow-lg border-2 border-pink-400"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <span className="text-4xl">{card.icon}</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {matches === ICONS.length && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 rounded-xl"
                >
                    <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-3xl font-bold mb-2">Purr-fect!</h3>
                        <button onClick={onExit} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">
                            Continue
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
            .then(data => setTargetWord(data.word || 'KITTY'));
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
                setTimeout(onComplete, 2000);
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
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                handleKey(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, guesses, status]);

    if (!targetWord) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="flex flex-col items-center h-full text-white">
            <h2 className="text-2xl font-bold text-green-300 mb-4">Cat-cha Word</h2>

            <div className="flex flex-col gap-2 mb-4">
                {[...Array(6)].map((_, i) => {
                    const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
                    return (
                        <div key={i} className="flex gap-2">
                            {[...Array(5)].map((_, j) => {
                                const letter = guess[j] || '';
                                let bg = 'bg-black/30';
                                if (i < guesses.length) {
                                    if (letter === targetWord[j]) bg = 'bg-green-500';
                                    else if (targetWord.includes(letter)) bg = 'bg-yellow-500';
                                    else bg = 'bg-gray-600';
                                }
                                return (
                                    <div key={j} className={`w-12 h-12 flex items-center justify-center border border-white/20 text-2xl font-bold rounded ${bg}`}>
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {status !== 'playing' && (
                <div className="mb-4 text-xl">
                    {status === 'won' ? 'Purr-fect!' : `The word was ${targetWord}`}
                </div>
            )}

            <button onClick={onExit} className="mt-4 px-4 py-2 bg-white/20 rounded hover:bg-white/30">Exit</button>
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
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then(data => {
                if (!data || !data.letters || !data.center) throw new Error('Invalid data');
                setData(data);
            })
            .catch(() => setData({ center: 'O', letters: ['O', 'M', 'R', 'I', 'C', 'A', 'T'] })); // Fallback
    }, []);

    const submit = () => {
        if (!data || !data.letters) return;
        const word = input.toUpperCase();

        if (word.length < 4) { setMessage('Too short!'); return; }
        if (!word.includes(data.center)) { setMessage('Must use center letter!'); return; }
        if ([...word].some(c => !data.letters.includes(c))) { setMessage('Invalid letters!'); return; }
        if (foundWords.includes(word)) { setMessage('Already found!'); return; }

        // Optimistic validation (real logic would validation against dictionary)
        setFoundWords([...foundWords, word]);
        setInput('');
        setMessage('Nice!');
        if (foundWords.length > 5) setTimeout(onComplete, 1000);
    };

    if (!data || !data.letters) return <div className="text-white text-center mt-20">Loading Bee...</div>;

    const outerLetters = (data.letters || []).filter(l => l !== data.center);

    return (
        <div className="flex flex-col items-center h-full text-white">
            <h2 className="text-2xl font-bold text-yellow-300 mb-8">Purr-sist Words</h2>

            <div className="relative w-64 h-64 mb-8">
                {/* Hexagon Layout - simplified with circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={() => setInput(p => p + data.center)} className="w-16 h-16 rounded-full bg-yellow-400 text-black text-2xl font-bold flex items-center justify-center z-10 shadow-lg active:scale-95 transition-transform">{data.center}</button>
                    {outerLetters.map((l, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const r = 80;
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;
                        return (
                            <button
                                key={l}
                                onClick={() => setInput(p => p + l)}
                                className="absolute w-14 h-14 rounded-full bg-gray-200 text-black text-xl font-bold flex items-center justify-center shadow active:scale-95 transition-transform"
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                            >
                                {l}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <div className="text-3xl font-mono border-b-2 border-white/30 min-w-[200px] text-center h-10">{input}</div>
            </div>

            <div className="flex gap-4 mb-8">
                <button onClick={() => setInput('')} className="px-4 py-2 bg-red-500/50 rounded">Clear</button>
                <button onClick={submit} className="px-6 py-2 bg-green-500 rounded font-bold">Enter</button>
            </div>

            <div className="text-yellow-200 h-6">{message}</div>

            <div className="mt-4 text-sm text-white/50">Found: {foundWords.join(', ')}</div>
            <button onClick={onExit} className="absolute top-4 right-4 px-4 py-2 bg-white/10 rounded hover:bg-white/20">Exit</button>
        </div>
    );
};

type GameType = 'puzzle' | 'whack' | 'memory' | 'wordle' | 'spelling' | null;

interface GameDefinition {
    id: GameType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const GAMES: GameDefinition[] = [
    { id: 'puzzle', title: "Momori's Puzzle", description: "Solve the sliding tile mystery!", icon: <Gamepad2 />, color: "bg-[#9fa8da]" }, // Soft Indigo
    { id: 'memory', title: "Kitty Match", description: "Test your memory with cute cats.", icon: <Gamepad2 />, color: "bg-[#f48fb1]" }, // Soft Pink
    { id: 'wordle', title: "Cat-cha Word", description: "Guess the secret word.", icon: <Gamepad2 />, color: "bg-[#a5d6a7]" }, // Soft Green
    { id: 'spelling', title: "Purr-sist Words", description: "Create words from letters.", icon: <Gamepad2 />, color: "bg-[#ce93d8]" }, // Soft Purple
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
        <div className="w-full h-full flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
                {activeGame ? (
                    <motion.div
                        key="game-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl"
                    >
                        {/* Game Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {GAMES.map((game) => (
                                <motion.button
                                    key={game.id}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onStartGame(game.id)}
                                    className="relative group overflow-hidden rounded-3xl aspect-[16/9] text-left shadow-lg border-4 border-[#3e2723]/10"
                                >
                                    {/* Paper Texture Overlay */}
                                    <div className="absolute inset-0 bg-[#fff9c4] opacity-20 z-0 pointer-events-none" />

                                    {/* Background Color */}
                                    <div className={cn("absolute inset-0 opacity-90 transition-opacity", game.color)} />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                                        <div className="bg-white/30 self-start p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                                            {React.cloneElement(game.icon as React.ReactElement, { size: 24, className: "text-[#3e2723]" })}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#3e2723] mb-1 font-serif">{game.title}</h3>
                                            <p className="text-[#3e2723]/70 text-sm font-medium leading-tight">{game.description}</p>
                                        </div>
                                    </div>

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#3e2723]/10 backdrop-blur-[2px] z-20">
                                        <span className="bg-[#3e2723] text-[#ffb74d] px-8 py-3 rounded-full font-bold shadow-xl border-2 border-[#ffb74d]/30 transform translate-y-4 group-hover:translate-y-0 transition-transform font-serif">
                                            Start Game
                                        </span>
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
