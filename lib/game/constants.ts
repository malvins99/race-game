export const TRACK_LENGTH = 30000;
export const DRAW_DISTANCE = 200;
export const FIELD_OF_VIEW = 100;
export const CAMERA_HEIGHT = 1000;
export const CAMERA_DEPTH = 0.8; // 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180) approximately, tweaked
export const SEGMENT_LENGTH = 200;
export const ROAD_WIDTH = 2000;
export const LANES = 3;

export interface Point {
    x: number;
    y: number;
    z: number;
    w?: number;
    scale?: number;
}

export interface Segment {
    index: number;
    p1: { world: Point; camera: Point; screen: Point };
    p2: { world: Point; camera: Point; screen: Point };
    color: { road: string; grass: string; rumble: string; strip: string };
    curve: number;
    clip: number;
    checkpoint?: boolean;
    sprites: { source: any; offset: number; scale: number }[];
}

export const COLORS = {
    SKY: '#4a0e0e',
    TREE: '#005108',
    FOG: '#4a0e0e',
    LIGHT: { road: '#8B5A2B', grass: '#105110', rumble: '#4B2D16', lane: '#AD8E6D' },
    DARK: { road: '#6F4221', grass: '#004600', rumble: '#3B1E08', lane: '#8B5A2B' },
    START: { road: '#FFFFFF', grass: '#FFFFFF', rumble: '#FFFFFF', lane: '#FFFFFF' },
    FINISH: { road: '#000000', grass: '#000000', rumble: '#000000', lane: '#000000' }
};
