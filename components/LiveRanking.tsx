"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/components/SocketProvider";
import Image from "next/image";

// Character Map for Image Lookup
const CHAR_IMAGES: Record<string, string> = {
    mario: "/characters/mario-pixel.png",
    luigi: "/characters/luigi-pixel.png",
    peach: "/characters/peach-pixel.png",
    toad: "/characters/toad-pixel.png",
    bowser: "/characters/bowser-pixel.png",
    yoshi: "/characters/yoshi-pixel.png",
    wario: "/characters/wario-pixel.png",
    waluigi: "/characters/waluigi-pixel.png",
};

interface RankingPlayer {
    id: string;
    z: number;
    characterId: string;
    rank: number;
}

export default function LiveRanking({ myId }: { myId: string }) {
    const { socket } = useSocket();
    const [rankings, setRankings] = useState<RankingPlayer[]>([]);
    const prevRankRef = useRef<number | null>(null);
    const [popup, setPopup] = useState<{ type: 'up' | 'down', text: string } | null>(null);

    useEffect(() => {
        if (!socket) return;

        console.log("LiveRanking: Component Mounted, ID:", myId);

        const handleRankings = (data: RankingPlayer[]) => {
            console.log("LiveRanking: Received Data:", data);
            setRankings(data);

            const myData = data.find(p => p.id === myId);
            if (myData) {
                const currentRank = myData.rank;
                const prev = prevRankRef.current;

                if (prev !== null && prev !== currentRank) {
                    if (currentRank < prev) {
                        // Improved Rank (e.g. 2 -> 1)
                        setPopup({ type: 'up', text: "Overtaken!" });
                    } else {
                        // Worse Rank (e.g. 1 -> 2)
                        setPopup({ type: 'down', text: "Passed!" });
                    }

                    // Clear popup
                    setTimeout(() => setPopup(null), 2000);
                }
                prevRankRef.current = currentRank;
            }
        };

        socket.on("live_rankings", handleRankings);
        return () => {
            socket.off("live_rankings", handleRankings);
        };
    }, [socket, myId]);

    // ALWAYS RENDER SOMETHING for debugging
    // even if empty
    return (
        <div className="absolute top-20 left-4 z-50 flex flex-col gap-2 w-64 pointer-events-none font-sans">
            {/* Title */}
            <div className="text-yellow-400 font-extrabold text-xl italic drop-shadow-md mb-2 flex items-center gap-2">
                <span>RANKINGS</span>
                {rankings.length === 0 && <span className="text-xs text-white/50">(Waiting...)</span>}
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {rankings.map((player) => {
                    const isMe = player.id === myId;
                    return (
                        <div
                            key={player.id}
                            className={`
                                relative flex items-center p-2 rounded-r-xl border-l-4 transition-all duration-500
                                ${isMe ? "bg-yellow-500/80 border-white scale-105" : "bg-black/50 border-transparent"}
                            `}
                        >
                            {/* Rank Number */}
                            <div className="w-12 text-center font-black text-white italic text-xl drop-shadow-md">
                                <span className={isMe ? "text-white" : "text-gray-300"}>
                                    {player.rank}
                                </span>
                                <span className="text-sm opacity-70 ml-1">
                                    /{rankings.length}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="w-[2px] h-8 bg-white/20 mx-2" />

                            {/* Character Image */}
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 bg-sky-900/50">
                                <Image
                                    src={CHAR_IMAGES[player.characterId] || CHAR_IMAGES['mario']}
                                    alt={player.characterId || "character"}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* You Tag */}
                            {isMe && (
                                <div className="absolute -right-2 -top-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    YOU
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Popup Indicator */}
            {popup && (
                <div className={`
                    absolute top-full mt-4 left-0 right-0 
                    flex items-center justify-center gap-2
                    px-4 py-2 rounded-lg font-bold text-white shadow-xl animate-in zoom-in slide-in-from-top-2 duration-300
                    ${popup.type === 'up' ? "bg-green-600" : "bg-red-600"}
                `}>
                    <span className="text-2xl">{popup.type === 'up' ? "▲" : "▼"}</span>
                    <span>{popup.text}</span>
                </div>
            )}
        </div>
    );
}
