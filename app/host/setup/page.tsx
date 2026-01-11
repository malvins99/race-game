"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPICS = [
    { id: "general", name: "General Knowledge", icon: "school" },
    { id: "math", name: "Math", icon: "calculate" },
    { id: "science", name: "Science", icon: "science" },
    { id: "history", name: "History", icon: "history_edu" },
    { id: "gaming", name: "Gaming", icon: "sports_esports" }
];

const DIFFICULTIES = [
    { id: "easy", name: "Easy", color: "bg-green-500" },
    { id: "medium", name: "Medium", color: "bg-yellow-500" },
    { id: "hard", name: "Hard", color: "bg-red-500" }
];

export default function HostSetupPage() {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
    const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);

    const handleCreateRoom = () => {
        // Generate logical ID
        const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();

        // In a real app, save these settings to DB/Socket store associated with roomId
        // For now, passing as query params or just proceeding
        router.push(`/lobby/${roomId}?host=true&topic=${selectedTopic.id}&diff=${difficulty.id}`);
    };

    return (
        <div className="min-h-screen bg-background-dark text-white font-display flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#ea2a33 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-300">
                <header className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center size-16 bg-primary rounded-full mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-4xl text-white">tune</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Room Setup</h1>
                    <p className="text-white/60">Configure your race settings</p>
                </header>

                <div className="bg-[#2A1818] border border-[#472426] rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
                    {/* Topic Selection */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">library_books</span>
                            Select Quiz Topic
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {TOPICS.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedTopic.id === topic.id ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(234,42,51,0.3)]' : 'bg-black/20 border-transparent hover:bg-black/40 text-gray-400 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{topic.icon}</span>
                                    <span className="text-sm font-bold text-center">{topic.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Difficulty Selection */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">speed</span>
                            Select Difficulty
                        </h3>
                        <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5">
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff.id}
                                    onClick={() => setDifficulty(diff)}
                                    className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${difficulty.id === diff.id ? `${diff.color} text-white shadow-lg` : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {diff.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Action */}
                    <div className="pt-4">
                        <button
                            onClick={handleCreateRoom}
                            className="w-full py-5 bg-gradient-to-r from-primary to-red-600 hover:to-red-500 text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined text-3xl">add_circle</span>
                            Create Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
