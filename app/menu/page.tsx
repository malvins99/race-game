"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import JoinRoomModal from "@/components/JoinRoomModal";

export default function MenuPage() {
    const [username, setUsername] = useState("Pro Racer");
    const [showJoinModal, setShowJoinModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedName = localStorage.getItem("mario-racer-username");
        if (storedName) {
            setUsername(storedName);
        }
    }, []);

    const handleHost = () => {
        router.push("/host/setup");
    };

    const handleJoinClick = () => {
        setShowJoinModal(true);
    };

    const handleJoinSubmit = (roomId: string) => {
        setShowJoinModal(false);
        router.push(`/lobby/${roomId}`);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-transparent font-display antialiased text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Header / Top Nav */}
            <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm bg-background-dark/50 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="size-8 text-primary flex items-center justify-center bg-white rounded-full">
                        <span className="material-symbols-outlined text-xl text-primary font-bold">sports_esports</span>
                    </div>
                    <h2 className="text-white text-lg font-bold tracking-tight uppercase">Mario Quiz Racing</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card-dark rounded-full border border-white/5">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-white/80">128 Online</span>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                            <span className="material-symbols-outlined">volume_up</span>
                        </button>
                        {/* User Profile Badge */}
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{username}</p>
                                <p className="text-xs text-white/50 font-medium">Lvl 12 Racer</p>
                            </div>
                            <div className="size-10 rounded-full bg-mario-yellow border-2 border-white/20 overflow-hidden relative shadow-lg shadow-primary/20">
                                <Image
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhrRrSuQiulaywDW5ILA-nrdRYHye42GetmH40viSXk7ut5E2FxjITU-ueXTor1wweoADKH9-XKqecYMQuMiVIzqQgd4GeC23Un0myo846-35-LE7gUs4lJ0-9kRxZg3qSeGZ09-bovIBqccC50EpYl7kc9ga9WwFXy9XEwDxNmVSbvxxdrhW2D6hP5fLAIFhdFR9YYIQaCtoGrpPn-HYdBuD6kv2PsNcfEmTg5lSmNGCdAJxbmUzpKXHbbOzFEcjHu456TQKJKps"
                                    width={40}
                                    height={40}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative">
                {/* Hero Section */}
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12 animate-in fade-in zoom-in duration-500">
                    {/* Welcome Message */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-lg">flag</span>
                            Season 4 Live
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
                            READY TO RACE,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 uppercase">{username}?</span>
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                            Start your engines, answer trivia, and boost your way to the finish line.
                        </p>
                    </div>

                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mt-4">
                        {/* Host Room Button */}
                        <button
                            onClick={handleHost}
                            className="group relative flex flex-col items-center justify-center h-48 rounded-2xl bg-gradient-to-br from-primary to-[#b91c23] hover:to-[#a0181e] text-white p-6 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 border-t border-white/20"
                        >
                            <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-4xl">add_circle</span>
                            </div>
                            <div className="size-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">podium</span>
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tight">Host Room</span>
                            <span className="text-white/80 text-sm mt-1 font-medium">Create a private track</span>
                        </button>

                        {/* Join Room Button */}
                        <button
                            onClick={handleJoinClick}
                            className="group relative flex flex-col items-center justify-center h-48 rounded-2xl bg-card-dark hover:bg-[#5a2e30] text-white p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/5 border-t-white/10"
                        >
                            <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-80 transition-opacity">
                                <span className="material-symbols-outlined text-4xl">login</span>
                            </div>
                            <div className="size-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">sports_score</span>
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tight">Join Room</span>
                            <span className="text-white/60 text-sm mt-1 font-medium group-hover:text-white/80">Enter a race code</span>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-mario-yellow/50 group min-w-[200px] justify-center">
                            <span className="material-symbols-outlined text-mario-yellow group-hover:animate-bounce">emoji_events</span>
                            <span className="font-bold text-white tracking-wide">LEADERBOARD</span>
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-blue-400/50 group min-w-[200px] justify-center">
                            <span className="material-symbols-outlined text-blue-400 group-hover:rotate-12 transition-transform">garage_home</span>
                            <span className="font-bold text-white tracking-wide">GARAGE</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer Decor */}
            <footer className="w-full py-6 text-center text-white/20 text-sm font-medium relative overflow-hidden">
                {/* Decorative Track Line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="flex justify-center items-center gap-6 mb-2">
                    <span className="hover:text-white/40 cursor-pointer transition-colors">Terms</span>
                    <span className="size-1 rounded-full bg-white/20"></span>
                    <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy</span>
                    <span className="size-1 rounded-full bg-white/20"></span>
                    <span className="hover:text-white/40 cursor-pointer transition-colors">Help</span>
                </div>
                <p>© 2024 Mario Quiz Racing. Not affiliated with Nintendo.</p>
            </footer>

            {/* Join Room Modal */}
            <JoinRoomModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoin={handleJoinSubmit}
            />
        </div>
    );
}
