"use client";

import React, { useState } from 'react';
import { FileText, Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatExport } from '@/lib/types';
import { parseWhatsAppChat } from '@/lib/parsers/whatsapp';
import { parseInstagramChat } from '@/lib/parsers/instagram';

interface FileSelectorProps {
    onLoadComplete: (data: ChatExport) => void;
}

export function FileSelector({ onLoadComplete }: FileSelectorProps) {
    const [fileName, setFileName] = useState('_chat.txt'); // Default common name
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoad = async () => {
        if (!fileName) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/${fileName}`);
            if (!response.ok) throw new Error("File not found in public folder");

            const content = await response.text();
            let data: ChatExport;

            // Simple heuristic based on extension logic or content
            if (fileName.endsWith('.json')) {
                data = parseInstagramChat(content, fileName);
            } else {
                // Default to WhatsApp for txt or others
                data = parseWhatsAppChat(content, fileName);
            }

            if (data.totalMessages === 0 && data.messages.length === 0) {
                throw new Error("Parsed 0 messages. Check file format.");
            }

            onLoadComplete(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-card/30 backdrop-blur-md border border-white/10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Load from Public Folder</h3>
                <p className="text-sm text-muted-foreground">
                    Enter the filename stored in your project's <code className="bg-white/10 px-1 py-0.5 rounded">public/</code> folder.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Filename</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full bg-secondary/30 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                            placeholder="_chat.txt"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLoad}
                    disabled={isLoading || !fileName}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium shadow-lg shadow-pink-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load Chat"}
                </button>
            </div>
        </div>
    );
}
