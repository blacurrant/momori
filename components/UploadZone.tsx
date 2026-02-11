"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileText, FileJson, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatExport } from '@/lib/types';
import { parseWhatsAppChat } from '@/lib/parsers/whatsapp';
import { parseInstagramChat } from '@/lib/parsers/instagram';

interface UploadZoneProps {
    onUploadStart: () => void;
    onUploadComplete: (data: ChatExport) => void;
}

export function UploadZone({ onUploadStart, onUploadComplete }: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const processFile = useCallback(async (file: File) => {
        setError(null);
        setIsLoading(true);
        onUploadStart();

        // Small delay to show loading state (UX)
        await new Promise(resolve => setTimeout(resolve, 600));

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                let data: ChatExport;

                if (file.name.endsWith('.txt')) {
                    data = parseWhatsAppChat(content, file.name);
                } else if (file.name.endsWith('.json')) {
                    data = parseInstagramChat(content, file.name);
                } else {
                    throw new Error("Unsupported file type");
                }

                if (data.totalMessages === 0 && data.messages.length === 0) {
                    setError("No messages found in file. Please check the format.");
                    setIsLoading(false);
                    return;
                }

                onUploadComplete(data);
            } catch (err) {
                console.error(err);
                setError("Failed to parse file. Ensure it's a valid WhatsApp export or Instagram JSON.");
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file.");
            setIsLoading(false);
        };

        reader.readAsText(file);
    }, [onUploadComplete, onUploadStart]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
                processFile(file);
            } else {
                setError("Please upload a .txt (WhatsApp) or .json (Instagram) file.");
            }
        }
    }, [processFile]);

    const handleBrowseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    return (
        <div
            className={cn(
                "relative group cursor-pointer transition-all duration-300 ease-out",
                "w-full max-w-xl mx-auto rounded-3xl p-10",
                "border-2 border-dashed",
                "bg-card/30 backdrop-blur-md shadow-2xl hover:shadow-primary/20",
                isDragOver
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-white/10 hover:border-white/20 hover:bg-card/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt,.json"
                onChange={handleBrowseChange}
            />

            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className={cn(
                    "p-6 rounded-full transition-colors duration-300",
                    isLoading ? "bg-primary/20 text-primary animate-pulse" : "bg-white/5 text-white group-hover:bg-primary group-hover:text-white"
                )}>
                    {isLoading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">
                        {isLoading ? "Analyzing Memories..." : "Upload Chat Export"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Drag & drop your WhatsApp (.txt) or Instagram (.json) file here.
                    </p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground/60">
                    <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> WhatsApp
                    </div>
                    <div className="flex items-center gap-1">
                        <FileJson className="w-3 h-3" /> Instagram
                    </div>
                </div>

                {error && (
                    <div className="text-red-400 text-sm font-medium bg-red-400/10 px-4 py-2 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
