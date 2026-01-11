"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameEngine } from "@/lib/game/GameEngine";
import { useSocket } from "@/components/SocketProvider";
import Minimap from "@/components/Minimap";
import Speedometer from "@/components/Speedometer";
import LiveRanking from "@/components/LiveRanking";
import TouchControls from "@/components/TouchControls";
import NosBar from "@/components/NosBar";

export default function GameCanvas({ characterId, roomId, difficulty, mapId, quizScore, onFinish }: { characterId?: string, roomId?: string, difficulty?: string, mapId?: string, quizScore?: number, onFinish?: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [engineInstance, setEngineInstance] = useState<GameEngine | null>(null);

    const { socket } = useSocket();
    const [myId, setMyId] = useState("");

    const handleTouchControl = useCallback((controls: { up: boolean; down: boolean; left: boolean; right: boolean }) => {
        if (engineRef.current) {
            engineRef.current.setTouchControls(controls);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get ID from storage
        const storedId = localStorage.getItem("mario-racer-userid") || "unknown";
        setMyId(storedId);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);
        handleResize();

        // Init Engine
        engineRef.current = new GameEngine(
            canvas,
            characterId || 'mario',
            (result) => {
                console.log("Race finished callback:", result);
                if (onFinish) onFinish(result.time);
            },
            socket,
            myId,
            roomId || "unknown",
            difficulty || "easy",
            mapId || "sawit-plants"
        );

        setEngineInstance(engineRef.current);

        // Listen for updates
        if (socket) {
            socket.on("race_update", (data: any) => {
                if (engineRef.current) engineRef.current.updateOpponent(data);
            });
        }

        return () => {
            window.removeEventListener("resize", handleResize);
            if (socket) socket.off("race_update");
            if (engineRef.current) engineRef.current.destroy();
            setEngineInstance(null);
        };
    }, [characterId, socket, roomId, difficulty, mapId]);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />

            {/* HUD Overlay */}
            {engineInstance && (
                <>
                    {/* Live Ranking Sidebar (Left) */}
                    <LiveRanking myId={myId} />

                    {/* Top Center Speedometer */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-in fade-in zoom-in duration-700">
                        <Speedometer engine={engineInstance} />
                    </div>

                    {/* Top Right Map & Score */}
                    <div className="absolute top-4 right-4 flex flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-none">
                        <div className="flex flex-col items-end">
                            <div className="bg-black/50 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full shadow-lg">
                                <span className="text-yellow-400 font-black italic mr-2 text-sm">QUIZ BOOST</span>
                                <span className="text-white text-xl font-bold">{quizScore || 0}/5</span>
                            </div>
                        </div>

                        <Minimap engine={engineInstance} />
                    </div>

                    {/* NOS Bar (Bottom Center-ish, left of player position) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-[200px] z-10">
                        <NosBar engine={engineInstance} />
                    </div>

                    {/* Touch Controls - Passed engine instance implicitly via callback */}
                    <TouchControls onControlChange={handleTouchControl} />
                </>
            )}
        </div>
    );
}

