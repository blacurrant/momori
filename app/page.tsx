"use client";

import React from 'react';
import { Village } from '@/components/Village/Village';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#2a1f2b] text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      <Village width={1920} height={1080} />
    </div>
  );
}

