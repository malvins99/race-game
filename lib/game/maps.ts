export interface MapConfig {
    id: string;
    name: string;
    description: string;
    theme: 'nature' | 'urban' | 'sci-fi';

    // Visual Properties
    roadColor: {
        light: string;
        dark: string;
    };
    grassColor: {
        light: string;
        dark: string;
    };
    rumbleColor: {
        light: string;
        dark: string;
    };
    laneColor: string;

    // Sky/Background
    skyGradient: {
        top: string;
        bottom: string;
    };
}

export const MAPS: MapConfig[] = [
    {
        id: "sawit-plants",
        name: "Sawit Plants",
        description: "Lush tropical palm plantation with dirt tracks.",
        theme: "nature",
        roadColor: { light: "#8B5A2B", dark: "#6F4221" }, // Muddy Brown
        grassColor: { light: "#105110", dark: "#004600" }, // Deep Forest Green
        rumbleColor: { light: "#4B2D16", dark: "#3B1E08" }, // Dark Mud/Wood Rumble
        laneColor: "#AD8E6D", // Faded dirt lane
        skyGradient: { top: "#7ec0ee", bottom: "#b3e5fc" } // (Ignored, uses image)
    },
    {
        id: "jakarta-streets",
        name: "Jakarta City Streets",
        description: "Urban racing on gray asphalt and concrete.",
        theme: "urban",
        roadColor: { light: "#808080", dark: "#606060" }, // Gray asphalt
        grassColor: { light: "#404040", dark: "#303030" }, // Dark concrete
        rumbleColor: { light: "#FFD700", dark: "#000000" }, // Caution stripes
        laneColor: "#FFFFFF",
        skyGradient: { top: "#263238", bottom: "#37474f" } // Cloudy City
    },
    {
        id: "alien-land",
        name: "Alien Land",
        description: "Mysterious alien planet with purple terrain.",
        theme: "sci-fi",
        roadColor: { light: "#1565C0", dark: "#0D47A1" }, // Navy blue
        grassColor: { light: "#7B1FA2", dark: "#4A148C" }, // Purple
        rumbleColor: { light: "#00E5FF", dark: "#FF00E6" }, // Neon
        laneColor: "#00E5FF", // Neon Blue
        skyGradient: { top: "#000000", bottom: "#1a237e" } // Deep Space
    }
];

export function getMap(id: string): MapConfig {
    return MAPS.find(m => m.id === id) || MAPS[0];
}
