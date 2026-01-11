import { useEffect, useState } from "react";

interface WaitingViewProps {
    finishedCount: number;
    totalPlayers: number;
}

export default function WaitingView({ finishedCount, totalPlayers }: WaitingViewProps) {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length < 3 ? prev + "." : ".");
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                    <span className="material-symbols-outlined text-9xl text-primary relative z-10 animate-bounce">
                        hourglass_top
                    </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    FINISH LINE!
                </h2>

                <div className="space-y-2">
                    <p className="text-xl md:text-2xl text-slate-300 font-medium">
                        Waiting for other racers{dots}
                    </p>
                    <div className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white font-mono text-lg">
                        {finishedCount} / {totalPlayers} Finished
                    </div>
                </div>

                <div className="max-w-md mx-auto mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-slate-400">
                        Catch your breath! The global leaderboard will be revealed once everyone crosses the line.
                    </p>
                </div>
            </div>
        </div>
    );
}
