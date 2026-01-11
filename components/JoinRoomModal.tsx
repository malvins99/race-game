"use client";

import { useState } from "react";

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (roomId: string) => void;
}

export default function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
    const [roomId, setRoomId] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId.trim()) {
            onJoin(roomId.toUpperCase());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#2A1818] border-2 border-[#472426] rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 bg-primary/10 border-b border-[#472426] flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Join Race</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="roomId" className="text-sm font-medium text-gray-400 uppercase">
                            Enter Room Code
                        </label>
                        <input
                            id="roomId"
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="e.g. A1B2"
                            className="w-full h-14 px-4 bg-black/20 border-2 border-[#472426] rounded-xl text-2xl font-mono text-center text-white placeholder:text-white/10 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                            autoFocus
                            maxLength={6}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!roomId.trim()}
                            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            Join Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
