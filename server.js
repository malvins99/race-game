
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Global room state
    let rooms = {};

    // Helper to get logic ID (host-roomId OR persistent ID)
    // Actually we rely entirely on the client sending us their ID in 'join_room'

    io.on("connection", (socket) => {
        // console.log("Socket connected:", socket.id);

        // Map socket.id -> { roomId, playerId } for disconnect handling
        socket.data.roomInfo = null;

        socket.on("join_room", ({ roomId, player }) => {
            socket.join(roomId);

            // Init room if not exists
            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }

            // Store context for disconnect
            socket.data.roomInfo = { roomId, playerId: player.id };

            // Update or Add player
            const existingIdx = rooms[roomId].findIndex(p => p.id === player.id);

            // Inject socketId so we can track connection status if needed
            const playerWithSocket = { ...player, socketId: socket.id, isOnline: true };

            if (existingIdx !== -1) {
                // Update existing player's socket and status
                // Preserve other data like characterId if not provided in 'player' payload (though payload usually has it)
                rooms[roomId][existingIdx] = {
                    ...rooms[roomId][existingIdx], // Keep existing state (like characterId, ready status)
                    ...player, // Overwrite with new info (like name if changed)
                    socketId: socket.id,
                    isOnline: true
                };
            } else {
                rooms[roomId].push(playerWithSocket);
            }

            // Broadcast
            io.to(roomId).emit("update_players", rooms[roomId]);
            console.log(`[Socket] Player ${player.name} (${player.id}) joined Room ${roomId}`);
        });

        // Using 'join_room' as 'update_player' is simpler, but let's support specific update too
        socket.on("update_player", ({ roomId, player }) => {
            if (!rooms[roomId]) return;

            const idx = rooms[roomId].findIndex(p => p.id === player.id);
            if (idx !== -1) {
                rooms[roomId][idx] = { ...player, socketId: socket.id };
                io.to(roomId).emit("update_players", rooms[roomId]);
            }
        });

        socket.on("start_game", ({ roomId, topic, difficulty, mapId }) => {
            console.log(`[Socket] Host started game in Room ${roomId} | Map: ${mapId}`);
            io.to(roomId).emit("start_game", { topic, difficulty, mapId });
        });



        // Race Update Relay (Essential for multiplayer movement)
        socket.on("race_update", (data) => {
            // Broadcast to everyone else in the room
            // data should contain { roomId, state: { id, x, z, ... } }
            socket.to(data.roomId).emit("race_update", data.state);

            // Live Rankings Logic
            const roomId = data.roomId;
            const state = data.state;

            if (rooms[roomId]) {
                // Update player Z in server memory
                // Match by ID (persistent) sent from client
                const player = rooms[roomId].find(p => p.id === state.id);
                if (player) {
                    player.z = state.z;
                }

                // Broadcast Rankings to ALL (including sender)
                // Throttle: For now, every update is fine for LAN/Local vibes (60fps updates x players might be heavy, but okay for MVP)
                const liveRankings = rooms[roomId]
                    .map(p => ({
                        id: p.id,
                        z: p.z || 0,
                        characterId: p.characterId
                    }))
                    .sort((a, b) => b.z - a.z)
                    .map((p, index) => ({ ...p, rank: index + 1 }));

                io.to(roomId).emit("live_rankings", liveRankings);
            }
        });

        // Player Finished Logic
        socket.on("player_finished", ({ roomId, player, score, time }) => {
            // Fallback to server-known room ID if client sends null/unknown
            // (This happens if client refreshed or joined via direct link without localStorage set)
            const activeRoomId = roomId && roomId !== "unknown" && roomId !== "null"
                ? roomId
                : socket.data.roomInfo?.roomId;

            console.log(`[Socket] Player ${player.id} FINISHED in Room ${activeRoomId} | Score: ${score} | Time: ${time}`);

            if (!activeRoomId || !rooms[activeRoomId]) {
                console.log(`[Socket] Error: Room ${activeRoomId} not found or invalid.`);
                return;
            }

            // Use activeRoomId from now on
            const currentRoom = rooms[activeRoomId];

            // 1. Mark player as finished in the room state if we need to track status there
            // (Optional, but good for "Waiting" UI if we wanted to show progress)

            // 2. Store Result
            if (!currentRoom.results) {
                currentRoom.results = [];
            }

            // Check if already finished (prevent double submission)
            const existingResultIndex = currentRoom.results.findIndex(r => r.id === player.id);
            if (existingResultIndex !== -1) {
                // Update or Ignore? Let's update just in case
                currentRoom.results[existingResultIndex] = { ...player, score, time };
            } else {
                currentRoom.results.push({ ...player, score, time });
            }

            // 3. Check if ALL players have finished
            // We need to count ACTIVE players.
            // Players might have disconnected.
            // rooms[roomId] is an ARRAY of players.
            const connectedPlayers = currentRoom.filter(p => p.isOnline !== false); // Provided we handle isOnline
            // Currently our rooms[roomId] is just the array of players. We don't distinctly track "offline" except by removal?
            // "rooms[roomId] = rooms[roomId].filter..." in disconnect removes them.
            // So rooms[roomId].length IS the active count.

            const totalPlayers = currentRoom.length;
            const finishedCount = currentRoom.results.length;

            console.log(`[Socket] Room ${activeRoomId} Progress: ${finishedCount}/${totalPlayers} finished.`);

            // Always calculate and broadcast latest leaderboard
            const leaderboard = currentRoom.results.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score; // Higher score first
                return a.time - b.time; // Lower time first (if scores equal)
            });

            // Broadcast LIVE leaderboard to everyone
            io.to(activeRoomId).emit("leaderboard_update", { leaderboard });

            if (finishedCount >= totalPlayers) {
                console.log(`[Socket] Room ${activeRoomId} ALL FINISHED!`);
                // Optional: Emit a 'completed' flag if clients need to know it's final
                io.to(activeRoomId).emit("game_over", { leaderboard });
            }
        });

        socket.on("disconnect", () => {
            const info = socket.data.roomInfo;
            if (info) {
                const { roomId, playerId } = info;
                if (rooms[roomId]) {
                    // Remove player
                    rooms[roomId] = rooms[roomId].filter(p => p.id !== playerId);

                    // Also remove from results if they disconnect? 
                    // No, preserve their legacy? 
                    // If they disconnect, they can't "finish" later, so we must check if game finishes NOW.

                    io.to(roomId).emit("update_players", rooms[roomId]);
                    console.log(`[Socket] Player ${playerId} disconnected from Room ${roomId}`);

                    // CHECK IF GAME OVER TRIGGERED BY DROP
                    if (rooms[roomId].results) {
                        const currentCount = rooms[roomId].length;
                        const finishedCount = rooms[roomId].results.length;
                        // Optimization: If the disconnected player was NOT finished, we might now be done.
                        // If they WERE finished, count stays same, total drops -> might be done.

                        // Exclude the disconnected player from results if we want to be strict?
                        // rooms[roomId].results = rooms[roomId].results.filter(r => r.id !== playerId);

                        if (currentCount > 0 && rooms[roomId].results.length >= currentCount) {
                            // Everyone remaining has finished
                            const leaderboard = rooms[roomId].results
                                .filter(r => rooms[roomId].some(rp => rp.id === r.id)) // Only active players? Or all? Let's keep all.
                                .sort((a, b) => {
                                    if (b.score !== a.score) return b.score - a.score;
                                    return a.time - b.time;
                                });
                            io.to(roomId).emit("game_over", { leaderboard });
                        }
                    }

                    if (rooms[roomId].length === 0) {
                        delete rooms[roomId];
                    }
                }
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
