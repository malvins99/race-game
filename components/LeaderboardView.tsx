"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from 'react-confetti';

import { getCharacter } from "@/lib/game/assets";

interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    time: number;
    characterId?: string;
}

interface LeaderboardViewProps {
    leaderboard: LeaderboardEntry[];
    myId: string;
}

export default function LeaderboardView({ leaderboard, myId }: LeaderboardViewProps) {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    // Split Top 3 and Rest
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    // Reorder Top 3 for Podium: [2nd, 1st, 3rd]
    const podiumOrder = [];
    if (top3[0]) podiumOrder[1] = top3[0]; // 1st -> Center
    if (top3[1]) podiumOrder[0] = top3[1]; // 2nd -> Left
    if (top3[2]) podiumOrder[2] = top3[2]; // 3rd -> Right

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#1a0d0e] overflow-hidden p-4">
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />

            <div className="w-full max-w-6xl flex flex-col h-full">
                <div className="text-center mt-4 mb-4 animate-in slide-in-from-top duration-700">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-2xl">
                        RACE FINISHED!
                    </h1>
                    <p className="text-primary text-xl font-bold uppercase tracking-[0.2em]">
                        Congratulations to the Winners
                    </p>
                </div>

                {/* PODIUM SECTION - Added mt-8 to separate from title */}
                <div className="flex items-end justify-center gap-2 md:gap-8 mb-8 mt-4 md:mt-12 h-1/2">
                    {/* Render Podium Spots: 2nd, 1st, 3rd */}
                    {[podiumOrder[0], podiumOrder[1], podiumOrder[2]].map((player, idx) => {
                        if (!player) return <div key={idx} className="w-32" />; // Spacer

                        // Determine visual rank based on position in array [2nd, 1st, 3rd]
                        const isFirst = idx === 1;
                        const isSecond = idx === 0;
                        const isThird = idx === 2;

                        // Map visual index to actual rank (1st=0, 2nd=1, 3rd=2)
                        const actualRank = isFirst ? 0 : isSecond ? 1 : 2;

                        const heightClass = isFirst ? "h-64" : isSecond ? "h-48" : "h-32";
                        const bgColor = isFirst ? "bg-yellow-500" : isSecond ? "bg-gray-300" : "bg-amber-700";
                        const icon = isFirst ? "👑" : isSecond ? "🥈" : "🥉";

                        // Get Character Data
                        const charData = getCharacter(player.characterId || "mario");

                        return (
                            <div key={player.id} className="flex flex-col items-center animate-in slide-in-from-bottom duration-1000" style={{ animationDelay: `${actualRank * 200}ms` }}>
                                {/* Spotlight for #1 (Improved) */}
                                {isFirst && (
                                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-[500px] bg-gradient-to-b from-yellow-300/30 via-yellow-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
                                )}

                                {/* Character Sprite (Lobby Style) */}
                                <div className="mb-2 relative">
                                    {isFirst && <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-5xl animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">{icon}</div>}
                                    <img
                                        src={charData.image}
                                        alt={player.name}
                                        className={`rendering-pixelated ${isFirst ? 'w-56' : 'w-36'} object-contain drop-shadow-2xl transition-transform hover:scale-110`}
                                    />
                                </div>

                                {/* Podium Box (Number Only) */}
                                <div className={`${heightClass} ${bgColor} w-24 md:w-32 rounded-t-lg flex flex-col items-center justify-start pt-2 shadow-2xl border-t-4 border-white/20 relative z-10`}>
                                    <span className="text-4xl md:text-5xl font-black text-black/20 select-none">
                                        {actualRank + 1}
                                    </span>
                                </div>

                                {/* Name & Info (Below Podium) */}
                                <div className="mt-2 text-center z-20">
                                    <div className="text-white font-black text-lg md:text-xl drop-shadow-md whitespace-nowrap">
                                        {player.name}
                                    </div>
                                    {player.id === myId && <div className="text-primary text-xs font-bold uppercase tracking-widest">(YOU)</div>}

                                    <div className="flex gap-2 justify-center text-xs text-white/60 mt-1">
                                        <span>{player.score.toFixed(0)}pts</span>
                                        <span>{player.time.toFixed(1)}s</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RANK LIST (Rest of players) */}
                <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto custom-scrollbar bg-black/20 rounded-t-2xl p-4 border border-white/5">
                    {rest.map((player, index) => (
                        <div
                            key={player.id}
                            className={`
                                flex items-center gap-4 p-3 rounded-lg border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors
                                ${player.id === myId ? 'bg-primary/10' : ''}
                            `}
                        >
                            <span className="text-white/50 font-black w-8">#{index + 4}</span>
                            <div className="flex-1 text-white font-bold">{player.name} {player.id === myId && '(YOU)'}</div>
                            <div className="flex gap-4 text-sm text-slate-400">
                                <span>{player.score.toFixed(0)} pts</span>
                                <span>{player.time.toFixed(2)}s</span>
                            </div>
                        </div>
                    ))}
                    {rest.length === 0 && <div className="text-center text-white/20 py-8">No other racers finished yet...</div>}
                </div>

                {/* Footer Buttons */}
                <div className="py-6 flex justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold"
                    >
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 rounded-full bg-primary hover:bg-red-600 text-white font-bold shadow-lg shadow-primary/30"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );
}
