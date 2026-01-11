"use client";

import { useEffect, useState } from "react";
import { GameEngine } from "@/lib/game/GameEngine";

export default function NosBar({ engine }: { engine: GameEngine | null }) {
    const [nos, setNos] = useState(100);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        if (!engine) return;

        let animationFrame: number;
        const update = () => {
            if ((engine as any).nosAmount !== undefined) {
                setNos((engine as any).nosAmount);
                setLocked((engine as any).nosLocked || false);
            }
            animationFrame = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(animationFrame);
    }, [engine]);

    // Calculate stroke dashoffset based on NOS percentage
    // Total path length is approximately 120 (needs tuning based on path)
    // The curve is roughly a 1/4 circle arc.

    // Logic: 
    // nos = 100 -> full bar
    // nos = 0 -> empty

    // We'll use a simple approach: Clip path or stroke-dasharray.
    // SVG stroke-dasharray approach is easiest for curves.

    const circumference = 180; // Approximate length of the curve
    const offset = circumference - (nos / 100) * circumference;

    // Color/Gradient Logic
    const getStrokeUrl = () => {
        if (locked) return "url(#lockedGrad)";
        if (nos < 10) return "url(#liquidGradRed)";
        return "url(#liquidGrad)";
    };

    return (
        <div className="flex flex-col items-center gap-1 select-none">
            {/* 32-bit Style Bevel Container */}
            <div
                className="relative w-16 h-48"
                style={{
                    filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.5))"
                }}
            >
                {/* Text Label - Rotated slightly to match curve top */}
                <div className="absolute -top-4 -left-2 transform -rotate-12 z-10">
                    <span
                        className={`font-black italic text-sm tracking-wider ${locked ? 'text-gray-500' : 'text-white'}`}
                        style={{
                            textShadow: '2px 2px 0 #000, -1px -1px 0 #005f73',
                            fontFamily: 'monospace'
                        }}
                    >
                        {locked ? "WAIT" : "N2O"}
                    </span>
                </div>

                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 60 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible"
                >
                    <defs>
                        {/* Metallic Gradient */}
                        <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#555" />
                            <stop offset="50%" stopColor="#eee" />
                            <stop offset="100%" stopColor="#777" />
                        </linearGradient>

                        {/* Liquid Gradient */}
                        <linearGradient id="liquidGrad" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#083344" /> {/* Dark Cyan */}
                            <stop offset="50%" stopColor="#06b6d4" /> {/* Cyan */}
                            <stop offset="100%" stopColor="#22d3ee" /> {/* Light Cyan */}
                        </linearGradient>
                        <linearGradient id="liquidGradRed" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#450a0a" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#fca5a5" />
                        </linearGradient>
                        {/* Locked Gradient (Gray) */}
                        <linearGradient id="lockedGrad" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#1f2937" />
                            <stop offset="50%" stopColor="#4b5563" />
                            <stop offset="100%" stopColor="#6b7280" />
                        </linearGradient>
                    </defs>

                    {/* Background Track (Empty) */}
                    {/* Path: A curve starting bottom right, curving up and left */}
                    <path
                        d="M 40 160 Q 10 100 10 20"
                        stroke="#374151"
                        strokeWidth="14"
                        strokeLinecap="round"
                        style={{
                            filter: "drop-shadow(1px 1px 0px rgba(255,255,255,0.2))" // Highlight edge
                        }}
                    />
                    {/* Inner bevel shadow */}
                    <path
                        d="M 40 160 Q 10 100 10 20"
                        stroke="#111"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Active Fill */}
                    <path
                        d="M 40 160 Q 10 100 10 20"
                        stroke={getStrokeUrl()}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
                            filter: locked ? "none" : "drop-shadow(0 0 2px rgba(6,182,212,0.8))"
                        }}
                    />

                    {/* Glass/Gloss Reflection Overlay */}
                    <path
                        d="M 38 158 Q 9 99 9 22"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeOpacity="0.4"
                        fill="none"
                        style={{ pointerEvents: 'none' }}
                    />

                    {/* Segment Lines (for 32-bit HUD feel) */}
                    {[...Array(5)].map((_, i) => (
                        <line
                            key={i}
                            x1="0" y1={30 + i * 30}
                            x2="60" y2={30 + i * 30}
                            stroke="black"
                            strokeWidth="1"
                            opacity="0.2"
                        />
                    ))}

                </svg>

                {/* Percentage Text Logic */}
                <div className="absolute bottom-0 right-0 text-right">
                    <span className={`text-[10px] font-bold ${locked ? 'text-gray-500' : (nos < 10 ? 'text-red-500' : 'text-cyan-300')}`}
                        style={{ textShadow: '1px 1px 0 #000' }}>
                        {Math.floor(nos)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
