export const CHARACTERS = [
    {
        id: "mario",
        name: "Mario",
        stats: { speed: 85, acceleration: 70, handling: 80, weight: 60, type: "Balanced" },
        image: "/characters/mario.png",
        sprite: "/characters/mario.png"
    },
    {
        id: "luigi",
        name: "Luigi",
        stats: { speed: 80, acceleration: 75, handling: 85, weight: 60, type: "Technical" },
        image: "/characters/luigi.png",
        sprite: "/characters/luigi.png"
    },
    {
        id: "peach",
        name: "Peach",
        stats: { speed: 75, acceleration: 85, handling: 80, weight: 50, type: "Light" },
        image: "/characters/peach.png",
        sprite: "/characters/peach.png"
    },
    {
        id: "toad",
        name: "Toad",
        stats: { speed: 90, acceleration: 90, handling: 60, weight: 40, type: "Speedster" },
        image: "/characters/toad.png",
        sprite: "/characters/toad.png"
    },
    {
        id: "bowser",
        name: "Bowser",
        stats: { speed: 95, acceleration: 50, handling: 40, weight: 100, type: "Heavy" },
        image: "/characters/bowser-pixel.png",
        sprite: "/characters/bowser-pixel.png"
    },
    {
        id: "yoshi",
        name: "Yoshi",
        stats: { speed: 82, acceleration: 82, handling: 82, weight: 65, type: "Balanced" },
        image: "/characters/yoshi.png",
        sprite: "/characters/yoshi.png"
    },
    {
        id: "wario",
        name: "Wario",
        stats: { speed: 88, acceleration: 55, handling: 50, weight: 90, type: "Heavy" },
        image: "/characters/wario-pixel.png",
        sprite: "/characters/wario-pixel.png"
    },
    {
        id: "waluigi",
        name: "Waluigi",
        stats: { speed: 89, acceleration: 54, handling: 55, weight: 80, type: "Cruiser" },
        image: "/characters/waluigi-pixel.png",
        sprite: "/characters/waluigi-pixel.png"
    }
];

export const getCharacter = (id: string) => CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
