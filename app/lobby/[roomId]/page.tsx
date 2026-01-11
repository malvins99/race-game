"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSocket } from "@/components/SocketProvider";
import { Player } from "@/lib/socket/types";

// Shared Character Data
import { CHARACTERS } from "@/lib/game/assets";
// Map Data
import { MAPS, getMap } from "@/lib/game/maps";

export default function LobbyPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const roomId = params?.roomId as string;
    const isHost = searchParams?.get("host") === "true";
    const topic = searchParams?.get("topic");
    const difficulty = searchParams?.get("diff");

    const [view, setView] = useState<'selection' | 'map_selection' | 'waiting'>('selection');
    const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
    const [selectedMap, setSelectedMap] = useState(MAPS[0].id);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentUser, setCurrentUser] = useState<Player | null>(null);

    // Initialize & Connect
    useEffect(() => {
        // Basic local user setup
        const storedName = localStorage.getItem("mario-racer-username") || "Guest Racer";
        const storedId = localStorage.getItem("mario-racer-userid") || `user-${Math.random().toString(36).substr(2, 9)}`;

        // Save if new
        if (!localStorage.getItem("mario-racer-userid")) {
            localStorage.setItem("mario-racer-userid", storedId);
        }

        const user: Player = {
            id: storedId,
            name: storedName,
            isHost: isHost,
            characterId: "mario", // default
            status: "selecting"
        };
        setCurrentUser(user);

        // Socket Events
        if (socket && isConnected) {
            console.log("Joining room:", roomId);

            socket.emit("join_room", { roomId, player: user });

            socket.on("room_joined", (data: { roomId: string, players: Player[] }) => {
                console.log("Room joined:", data);
                setPlayers(data.players);
            });

            socket.on("update_players", (updatedPlayers: Player[]) => {
                console.log("Players updated:", updatedPlayers);
                setPlayers(updatedPlayers);
            });

            socket.on("map_selected", (data: { mapId: string }) => {
                console.log("Host selected map:", data.mapId);
                setSelectedMap(data.mapId);
            });

            socket.on("start_game", (data: { topic: string, difficulty: string, mapId: string }) => {
                console.log("Game Starting!", data);
                // Redirect to game
                router.push(`/play?room=${roomId}&char=${currentUser?.characterId || 'mario'}&topic=${data.topic}&diff=${data.difficulty}&map=${data.mapId}`);
            });

            return () => {
                socket.off("room_joined");
                socket.off("update_players");
                socket.off("map_selected");
                socket.off("start_game");
            };
        }
    }, [socket, isConnected, roomId, isHost, router]);

    // Handle Character Confirm
    const confirmCharacter = () => {
        if (!socket || !currentUser) return;

        // Update local state
        const updatedUser = { ...currentUser, characterId: selectedChar.id, status: "ready" as const };
        setCurrentUser(updatedUser);

        // Notify server
        socket.emit("update_player", { roomId, player: updatedUser });

        // If Host -> Go to Map Selection, else -> Waiting
        if (isHost) {
            setView('map_selection');
        } else {
            setView('waiting');
        }
    };

    // Handle Map Selection (Host Only)
    const handleMapSelect = (mapId: string) => {
        if (!isHost) return;
        setSelectedMap(mapId);
        socket?.emit("select_map", { roomId, mapId });
    };

    const confirmMap = () => {
        setView('waiting');
    };

    const startGame = () => {
        if (!socket || !isHost) return;
        socket.emit("start_game", {
            roomId,
            topic: topic || "general",
            difficulty: difficulty || "easy",
            mapId: selectedMap
        });
    };

    // Render Helpers
    const getMapColor = (mapId: string) => {
        switch (mapId) {
            case 'sawit-plants': return 'border-green-500 shadow-green-500/50';
            case 'jakarta-streets': return 'border-gray-500 shadow-gray-500/50';
            case 'alien-land': return 'border-purple-500 shadow-purple-500/50';
            default: return 'border-white';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none animate-pulse-slow"></div>

            <header className="mb-8 z-10 text-center">
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 drop-shadow-lg">
                    LOBBY: {roomId}
                </h1>
                <p className="text-white/60 font-mono text-sm mt-2">
                    {isHost ? "YOU ARE THE HOST" : "WAITING FOR HOST"}
                </p>
                {/* Debug Info */}
                <div className="hidden">Map: {selectedMap}, View: {view}</div>
            </header>

            <main className="w-full max-w-6xl z-10 flex flex-col md:flex-row gap-8">

                {/* LEFT: Main User Action Area */}
                <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col items-center shadow-2xl">

                    {/* VIEW: CHARACTER SELECTION */}
                    {view === 'selection' && (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-yellow-400">SELECT YOUR DRIVER</h2>
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {CHARACTERS.map((char) => (
                                    <button
                                        key={char.id}
                                        onClick={() => setSelectedChar(char)}
                                        className={`group relative w-24 h-24 rounded-xl border-4 transition-all duration-300 transform hover:scale-110 ${selectedChar.id === char.id
                                                ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] bg-white/10"
                                                : "border-white/20 hover:border-white/60 bg-black/40"
                                            }`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Pixel art style rendering for consistency */}
                                            <img
                                                src={char.sprite}
                                                alt={char.name}
                                                className={`w-16 h-16 object-contain render-pixelated transition-transform duration-300 ${selectedChar.id === char.id ? "scale-125 drop-shadow-lg" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                                                    }`}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Character Stats Preview */}
                            <div className="w-full max-w-md bg-black/60 rounded-xl p-4 mb-8 border border-white/10">
                                <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                                    <h3 className="text-3xl font-black italic">{selectedChar.name.toUpperCase()}</h3>
                                    <span className="px-2 py-1 bg-yellow-400 text-black font-bold text-xs rounded uppercase tracking-wider">{selectedChar.stats.type}</span>
                                </div>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-24 text-white/50">SPEED</span>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${selectedChar.stats.speed}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-24 text-white/50">ACCEL</span>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${selectedChar.stats.acceleration}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-24 text-white/50">HANDLING</span>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${selectedChar.stats.handling}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={confirmCharacter}
                                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-black text-xl italic uppercase tracking-wider shadow-lg transform active:scale-95 transition-all hover:brightness-110"
                            >
                                CONTINUE &gt;
                            </button>
                        </>
                    )}

                    {/* VIEW: MAP SELECTION (HOST ONLY) */}
                    {view === 'map_selection' && (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-cyan-400">SELECT RACE TRACK</h2>

                            <div className="flex flex-col gap-4 w-full mb-8 max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                                {MAPS.map((map) => (
                                    <button
                                        key={map.id}
                                        onClick={() => handleMapSelect(map.id)}
                                        className={`relative w-full h-32 rounded-xl border-4 overflow-hidden transition-all duration-300 group text-left ${selectedMap === map.id
                                                ? `${getMapColor(map.id)} scale-[1.02] z-10 ring-4 ring-white/20`
                                                : "border-white/10 hover:border-white/40 opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                                            }`}
                                    >
                                        {/* Background Preview (Using CSS Gradients to simulate theme for now) */}
                                        <div
                                            className="absolute inset-0 z-0"
                                            style={{
                                                background: `linear-gradient(to bottom, ${map.skyGradient.top}, ${map.skyGradient.bottom} 50%, ${map.grassColor.dark})`
                                            }}
                                        />
                                        {/* Road Stripe */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-1/3 z-0 transform -skew-x-12 origin-bottom"
                                            style={{ backgroundColor: map.roadColor.dark }}
                                        />

                                        <div className="absolute inset-0 p-4 z-10 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center">
                                            <h3 className="text-2xl font-black italic text-white drop-shadow-md">{map.name.toUpperCase()}</h3>
                                            <p className="text-white/80 font-mono text-sm max-w-[70%]">{map.description}</p>
                                            {selectedMap === map.id && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-black font-bold text-xs rounded-full shadow-lg animate-pulse">
                                                    SELECTED
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={confirmMap}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-black text-xl italic uppercase tracking-wider shadow-lg transform active:scale-95 transition-all hover:brightness-110"
                            >
                                CONFIRM TRACK &gt;
                            </button>
                        </>
                    )}

                    {/* VIEW: WAITING ROOM */}
                    {view === 'waiting' && (
                        <>
                            <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in zoom-in duration-500">
                                <h2 className="text-3xl font-black italic mb-2 text-white/90">
                                    {isHost ? "READY TO START?" : "WAITING FOR HOST..."}
                                </h2>
                                <p className="text-white/50 font-mono mb-8 animate-pulse">
                                    {players.length} RACERS CONNECTED
                                </p>

                                {/* Selected Map Preview Badge */}
                                <div className="mb-8 px-6 py-3 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
                                    <span className="text-white/40 text-xs font-bold uppercase">TRACK:</span>
                                    <span className={`font-black italic text-lg ${selectedMap === 'sawit-plants' ? 'text-green-400' :
                                            selectedMap === 'jakarta-streets' ? 'text-gray-400' :
                                                'text-purple-400'
                                        }`}>
                                        {getMap(selectedMap).name.toUpperCase()}
                                    </span>
                                </div>

                                {isHost ? (
                                    <button
                                        onClick={startGame}
                                        disabled={players.length < 1}
                                        className="px-12 py-6 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl font-black text-3xl italic shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_10px_50px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-t border-white/20"
                                    >
                                        START RACE!
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-75"></div>
                                        <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
                                        <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* RIGHT: Player List Sidebar */}
                <div className="w-full md:w-80 bg-black/60 border-l border-white/10 p-6 flex flex-col">
                    <h3 className="text-white/50 font-bold text-xs uppercase tracking-widest mb-4">Lobby Players</h3>
                    <div className="space-y-3">
                        {players.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${p.isHost ? "bg-yellow-500 text-black" : "bg-white/10 text-white"
                                    }`}>
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{p.name} {p.id === currentUser?.id && "(YOU)"}</div>
                                    <div className="text-xs text-white/40 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${p.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        {p.status === 'ready' ? 'READY' : 'SELECTING...'}
                                    </div>
                                </div>
                                {p.status === 'ready' && (
                                    <div className="text-green-500">✓</div>
                                )}
                            </div>
                        ))}
                        {/* Empty Slots */}
                        {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="p-4 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-white/10 font-mono text-sm">
                                WAITING FOR PLAYER...
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
