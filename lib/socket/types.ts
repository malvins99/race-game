
export interface ServerToClientEvents {
    room_joined: (data: { roomId: string; players: Player[] }) => void;
    update_players: (players: Player[]) => void;
    // Map events
    map_selected: (data: { mapId: string }) => void;
    // Updated start_game
    start_game: (data: { topic: string; difficulty: string; mapId: string }) => void;

    // In-Game Events
    player_progress_update: (data: { finishedCount: number, totalPlayers: number }) => void;
    game_over: (data: { leaderboard: any[] }) => void;
    leaderboard_update: (data: { leaderboard: any[] }) => void;
    race_update: (data: any) => void;
    live_rankings: (data: any[]) => void;
}

export interface ClientToServerEvents {
    join_room: (data: { roomId: string; player: Player }) => void;
    update_player: (data: { roomId: string; player: Player }) => void;
    // Map selection
    select_map: (data: { roomId: string; mapId: string }) => void;

    start_game: (data: { roomId: string; topic: string; difficulty: string; mapId: string }) => void;
    player_finished: (data: { roomId: string | null; player: { id: string; name: string; characterId: string }; score: number; time: number }) => void;
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    characterId: string;
    status: 'ready' | 'selecting';
    socketId?: string; // Optional, server side use mainly
}
