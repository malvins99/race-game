"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GameCanvas from "@/components/GameCanvas";
import QuizPhase from "@/components/QuizPhase";
import WaitingView from "@/components/WaitingView";
import LeaderboardView from "@/components/LeaderboardView";
import { useSocket } from "@/components/SocketProvider";

function PlayContent() {
    const searchParams = useSearchParams();
    const { socket, isConnected } = useSocket();

    // Stats
    const charId = searchParams?.get("char") || "mario";
    const topic = searchParams?.get("topic") || "general";
    const difficulty = searchParams?.get("diff") || "easy";
    const mapId = searchParams?.get("map") || "sawit-plants";

    // Identity
    const [myId, setMyId] = useState("");
    const [myName, setMyName] = useState("Player");

    // Game Phases: 'countdown' -> 'quiz' -> 'race' -> 'final_quiz' -> 'waiting' -> 'leaderboard'
    const [phase, setPhase] = useState<'countdown' | 'quiz' | 'race' | 'final_quiz' | 'waiting' | 'leaderboard'>('countdown');
    const [countdown, setCountdown] = useState(3);

    // Scores
    const [initialQuizScore, setInitialQuizScore] = useState(0); // 0-5
    const [finalQuizScore, setFinalQuizScore] = useState(0);     // 0-5
    const [raceTime, setRaceTime] = useState(0);

    // Sync State
    const [waitingStats, setWaitingStats] = useState({ finished: 0, total: 1 });
    const [finalLeaderboard, setFinalLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        let storedId = localStorage.getItem("mario-racer-userid");
        let storedName = localStorage.getItem("mario-racer-username");

        if (!storedId) {
            // Generate Guest ID for immediate play/testing
            storedId = `guest_${Math.floor(Math.random() * 10000)}`;
            storedName = "Guest Racer";
            localStorage.setItem("mario-racer-userid", storedId);
            localStorage.setItem("mario-racer-username", storedName);
        }

        setMyId(storedId);
        setMyName(storedName || "Guest");
    }, []);

    // Countdown Logic
    useEffect(() => {
        if (phase === 'countdown') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setPhase('quiz');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase]);

    // Auto-Join Room Logic (Recovery)
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Priority: URL Param > LocalStorage
        const urlRoomId = searchParams?.get('room');
        const storedRoomId = localStorage.getItem("mario-racer-roomid");
        const roomId = urlRoomId || storedRoomId;

        // Ensure we save the authoritative ID if we got it from URL
        if (urlRoomId && urlRoomId !== storedRoomId) {
            localStorage.setItem("mario-racer-roomid", urlRoomId);
        }

        const userId = localStorage.getItem("mario-racer-userid");
        const userName = localStorage.getItem("mario-racer-username");

        if (roomId && userId) {
            console.log(`[Client] Recovering connection to Room ${roomId} as ${userName}`);
            socket.emit("join_room", {
                roomId,
                player: {
                    id: userId,
                    name: userName || "Guest",
                    isHost: false,
                    characterId: charId,
                    status: "ready"
                }
            });
        }
    }, [socket, isConnected, searchParams]);

    // Socket Listeners for Game Over / Progress
    useEffect(() => {
        if (!socket) return;

        const onProgress = (data: { finishedCount: number, totalPlayers: number }) => {
            console.log("Progress Update:", data);
            setWaitingStats({ finished: data.finishedCount, total: data.totalPlayers });
        };

        const onGameOver = (data: { leaderboard: any[] }) => {
            console.log("Game Over! Leaderboard:", data.leaderboard);
            setFinalLeaderboard(data.leaderboard);
            setPhase('leaderboard');
        };

        const onLeaderboardUpdate = (data: { leaderboard: any[] }) => {
            console.log("Live Leaderboard Update:", data.leaderboard);
            setFinalLeaderboard(data.leaderboard);
        };

        socket.on("player_progress_update", onProgress);
        socket.on("game_over", onGameOver);
        socket.on("leaderboard_update", onLeaderboardUpdate);

        return () => {
            socket.off("player_progress_update", onProgress);
            socket.off("game_over", onGameOver);
            socket.off("leaderboard_update", onLeaderboardUpdate);
        };
    }, [socket]);

    // 1. Initial Quiz Complete
    const handleInitialQuizComplete = (score: number) => {
        console.log("Initial Quiz Finished! Score:", score);
        setInitialQuizScore(score);
        setPhase('race');
    };

    // 2. Race Complete (Triggered by GameCanvas)
    const handleRaceComplete = (time: number) => {
        console.log("Race Finished! Time:", time);
        setRaceTime(time);
        setPhase('final_quiz'); // Go to Final Quiz
    };

    // 3. Final Quiz Complete
    const handleFinalQuizComplete = (score: number) => {
        console.log("Final Quiz Finished! Score:", score);
        setFinalQuizScore(score);

        // Calculate FINAL Score
        const totalQuizPoints = initialQuizScore + score; // Max 10
        const quizComponent = (totalQuizPoints / 10) * 50; // Max 50

        const baseTime = 40; // Expected fast time
        const timeDiff = Math.max(0, raceTime - baseTime);
        const speedComponent = Math.max(0, 50 - (timeDiff * 1)); // Lose 1 pt per sec over 40s

        const totalScore = quizComponent + speedComponent;

        console.log(`Calc Score: Quiz(${quizComponent}) + Speed(${speedComponent}) = ${totalScore}`);

        // Submit to Server
        if (socket) {
            const savedRoomId = localStorage.getItem("mario-racer-roomid");

            socket.emit("player_finished", {
                roomId: savedRoomId,
                player: { id: myId, name: myName, characterId: charId },
                score: totalScore,
                time: raceTime
            });
        }

        // Direct transition to Leaderboard (Live)
        setPhase('leaderboard');
    };

    // RENDER logic
    if (phase === 'countdown') {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
                <div className="absolute inset-0 opacity-30 bg-[url('/sprites/background_forest_moon.png')] bg-cover bg-center" />
                <div className="relative z-10 text-center animate-in zoom-in duration-300">
                    <p className="text-2xl mb-4 font-bold tracking-widest uppercase text-primary">Get Ready</p>
                    <div className="text-9xl font-black tabular-nums transition-all scale-150">
                        {countdown}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'quiz') {
        return <QuizPhase topic={topic} onComplete={handleInitialQuizComplete} questionCount={3} />;
    }

    if (phase === 'final_quiz') {
        return (
            <div className="relative w-full h-screen bg-black">
                {/* Background can be the frozen game canvas if we kept it mounted, but simplified: just black or image */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuArFYH0tyfcdSDTt_XR_n-38TwP44U68xGjJoOQt4XgCfDI2pxxBuXfaxAWYew4pdJUIZYq8xzKkU725b9xnHRzaGBnH29QB9c0Uf2RP7-v0cT3Xb041uvXEJE7g-TpDqNGx9y4BtTk2YOzls5-9J8d-RWm4s5zOwfXnh0GxqBiI23oVC7MtiZxLsXtiBCyuiJiqYNdpBX4CSQ3cwackjgjUpllzu2VqzbswA_Q_b0GY--Avw-DFYU3ni_bq-GtI0ibIIJX3UkZ9NY')] bg-cover bg-center" />
                <QuizPhase topic={topic} onComplete={handleFinalQuizComplete} isFinal={true} questionCount={3} />
            </div>
        );
    }

    if (phase === 'leaderboard' || phase === 'waiting') {
        // We treat waiting as leaderboard now (live updates)
        return <LeaderboardView leaderboard={finalLeaderboard} myId={myId} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            <GameCanvas
                characterId={charId}
                roomId={typeof window !== 'undefined' ? (localStorage.getItem("mario-racer-roomid") || "unknown") : "unknown"}
                difficulty={difficulty}
                mapId={mapId}
                quizScore={initialQuizScore}
                onFinish={handleRaceComplete}
            />

            {/* In-Game HUD */}
            {/* In-Game HUD is handled by GameCanvas */}
        </div>
    );
}

export default function PlayPage() {
    return (
        <Suspense fallback={<div className="bg-black h-screen w-full flex items-center justify-center text-white font-mono text-xl animate-pulse">Initializing Race...</div>}>
            <PlayContent />
        </Suspense>
    );
}
