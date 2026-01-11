import { RefObject } from 'react';
import { Controls } from './Controls';
import { RenderUtils } from './RenderUtils';
import { SEGMENT_LENGTH, DRAW_DISTANCE, FIELD_OF_VIEW, CAMERA_DEPTH, ROAD_WIDTH, CAMERA_HEIGHT, Segment } from './constants';
import { ObstacleManager } from './ObstacleManager';
import { getMap, MapConfig } from './maps';

export class GameEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    controls: Controls;
    segments: Segment[] = [];
    obstacleManager: ObstacleManager; // Manager

    // Game State
    speed: number = 0;
    maxSpeed: number = SEGMENT_LENGTH * 50; // ~100 km/h (easier to maneuver)
    position: number = 0;
    playerX: number = 0;
    trackLength: number = 0;

    // Physics
    inputDisabled: boolean = false; // Stun state

    // Generation State
    difficulty: string = "easy";
    lastY: number = 0;
    mapData: { x: number, z: number }[] = [];
    currentMap: MapConfig;

    // Animation
    lastTime: number = 0;
    running: boolean = false;
    animationFrameId: number | null = null;

    // Assets
    playerSprite: HTMLImageElement | null = null;
    playerSpriteLeft: HTMLImageElement | null = null;
    playerSpriteRight: HTMLImageElement | null = null;
    skyImage: HTMLImageElement | null = null;
    treeImage: HTMLImageElement | null = null;
    boostFlameSprite: HTMLImageElement | null = null;
    speedLinesSprite: HTMLImageElement | null = null;
    impactLinesSprite: HTMLImageElement | null = null;
    bushDrySprite: HTMLImageElement | null = null;
    bushGreenSprite: HTMLImageElement | null = null;
    billboard1Sprite: HTMLImageElement | null = null;
    billboard2Sprite: HTMLImageElement | null = null;
    houseSprite: HTMLImageElement | null = null;
    wellSprite: HTMLImageElement | null = null;
    palmTreeSprite: HTMLImageElement | null = null;

    // Multiplayer
    socket: any = null;
    myId: string = "";
    otherPlayers: Map<string, { x: number, z: number, characterId: string, sprite?: HTMLImageElement }> = new Map();
    lastSendTime: number = 0;

    myCharacterId: string;
    roomId: string;
    onFinish?: (data: { time: number }) => void;
    startTime: number = 0;
    finished: boolean = false;
    countdownTime: number = 3; // 3, 2, 1, GO!

    // NOS System
    nosAmount: number = 100;
    nosActive: boolean = false;
    nosLocked: boolean = false; // Prevents spamming when empty until recharged to 20%

    // Impact VFX
    impactTimer: number = 0;

    // Puddle State
    wasOnPuddle: boolean = false;
    puddleTargetLimit: number = 0;

    // Camera System
    cameraAngle: number = 0;
    targetCameraAngle: number = 0;
    cameraDepth: number = CAMERA_DEPTH; // Dynamic depth for zoom effect
    targetCameraDepth: number = CAMERA_DEPTH;

    constructor(canvas: HTMLCanvasElement, characterId: string = 'mario', onFinish?: (data: { time: number }) => void, socket?: any, myId?: string, roomId?: string, difficulty?: string, mapId: string = "sawit-plants") {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false; // Pixel art style
        this.controls = new Controls();
        this.obstacleManager = new ObstacleManager(); // Init Manager
        this.socket = socket;
        this.myId = myId || "unknown";
        this.roomId = roomId || "";
        this.difficulty = difficulty || "easy";
        this.myCharacterId = characterId;
        this.onFinish = onFinish;

        this.countdownTime = 0;

        // Load Map Config
        this.currentMap = getMap(mapId);

        this.loadAssets(characterId);
        this.reset();
    }

    loadMap(mapId: string) {
        this.currentMap = getMap(mapId);
        // If we had per-map assets (like different trees), we would trigger reload here
        // For now, we rely on the generic assets or shared ones
    }

    async loadAssets(characterId: string) {
        const { getCharacter } = await import('./assets');

        // Load Character
        const character = getCharacter(characterId);
        const img = new Image();
        img.src = character.sprite;
        img.onload = () => {
            // Only use as fallback if not already specialized (e.g. for non-mario characters)
            if (!this.playerSprite) {
                this.playerSprite = img;
            }
        };

        // Load Mario variants if character is mario
        if (characterId === 'mario') {
            const left = new Image();
            left.src = "/sprites/mario_left.png";
            left.onload = () => { this.playerSpriteLeft = left; };

            const right = new Image();
            right.src = "/sprites/mario_right.png";
            right.onload = () => { this.playerSpriteRight = right; };

            // Re-load center sprite just in case or use the default
            const center = new Image();
            center.src = "/sprites/mario_center.png";
            center.onload = () => { this.playerSprite = center; };
        }

        // Load Sky
        const sky = new Image();
        sky.src = "/sprites/background_forest_moon.png";
        sky.onload = () => {
            this.skyImage = sky;
        };

        // Load Trees
        const tree = new Image();
        tree.src = "/sprites/tree.png";
        tree.onload = () => {
            this.treeImage = tree;
        };

        // Load Boost Flame
        const flame = new Image();
        flame.src = "/sprites/boost_flame.png";
        flame.onload = () => { this.boostFlameSprite = flame; };



        // Load Impact Lines (Red)
        const impactLines = new Image();
        impactLines.src = "/sprites/impact_lines.png";
        impactLines.onload = () => { this.impactLinesSprite = impactLines; };

        // Load Bushes
        const bushDry = new Image();
        bushDry.src = "/sprites/bush_dry.png";
        bushDry.onload = () => { this.bushDrySprite = bushDry; };

        const bushGreen = new Image();
        bushGreen.src = "/sprites/bush_green.png";
        bushGreen.onload = () => { this.bushGreenSprite = bushGreen; };

        // Load Billboards
        const billboard1 = new Image();
        billboard1.src = "/sprites/billboard_1.png";
        billboard1.onload = () => { this.billboard1Sprite = billboard1; };

        const billboard2 = new Image();
        billboard2.src = "/sprites/billboard_2.png";
        billboard2.onload = () => { this.billboard2Sprite = billboard2; };

        // Load House and Well
        const house = new Image();
        house.src = "/sprites/house.png";
        house.onload = () => { this.houseSprite = house; };

        const well = new Image();
        well.src = "/sprites/well.png";
        well.onload = () => { this.wellSprite = well; };

        // Load Palm Tree
        const palmTree = new Image();
        palmTree.src = "/sprites/palm_tree.png";
        palmTree.onload = () => { this.palmTreeSprite = palmTree; };

        // Load Obstacles via Manager
        this.obstacleManager.loadAssets();
    }

    // ... (rest same until reset)

    addSegment(curve: number, y: number) {
        const n = this.segments.length;
        const map = this.currentMap;

        // Color Logic based on Map Config
        const isDark = Math.floor(n / 3) % 2 === 1;

        // Helper to get color
        const getColors = (dark: boolean) => {
            if (dark) {
                return {
                    road: map.roadColor.dark,
                    grass: map.grassColor.dark,
                    rumble: map.rumbleColor.dark,
                    strip: map.rumbleColor.dark // simplified
                };
            } else {
                return {
                    road: map.roadColor.light,
                    grass: map.grassColor.light,
                    rumble: map.rumbleColor.light,
                    strip: map.rumbleColor.light
                };
            }
        };

        const color = getColors(isDark);

        // Start line special
        if (n < 5) {
            // START LINE COLOR override (Checkered white/red usually, or just white)
            color.road = "#FFFFFF";
            color.grass = map.grassColor.light;
            color.rumble = "#FFFFFF";
            color.strip = "#FF0000";
        }

        const lastY = this.segments.length > 0 ? this.segments[this.segments.length - 1].p2.world.y : 0;

        this.segments.push({
            index: n,
            p1: { world: { z: n * SEGMENT_LENGTH, x: 0, y: lastY }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            p2: { world: { z: (n + 1) * SEGMENT_LENGTH, x: 0, y: y }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            color: color,
            curve: curve,
            clip: 0,
            sprites: []
        });
    }

    addRoad(enter: number, hold: number, leave: number, curve: number, y: number) {
        const startY = this.segments.length > 0 ? this.segments[this.segments.length - 1].p2.world.y : 0;
        const endY = startY + (y * SEGMENT_LENGTH);
        const total = enter + hold + leave;

        for (let n = 0; n < enter; n++) this.addSegment(RenderUtils.easeIn(0, curve, n / enter), RenderUtils.easeInOut(startY, endY, n / total));
        for (let n = 0; n < hold; n++) this.addSegment(curve, RenderUtils.easeInOut(startY, endY, (enter + n) / total));
        for (let n = 0; n < leave; n++) this.addSegment(RenderUtils.easeInOut(curve, 0, n / leave), RenderUtils.easeInOut(startY, endY, (enter + hold + n) / total));
    }

    addStraight(num: number) {
        const numSegments = num || 25;
        this.addRoad(numSegments, numSegments, numSegments, 0, 0);
    }

    addCurve(num: number, curve: number) {
        const numSegments = num || 25;
        this.addRoad(numSegments, numSegments, numSegments, curve, 0);
    }

    addHill(num: number, height: number) {
        const numSegments = num || 25;
    }

    addUnsafeSegment(curve: number, y: number) {
        const n = this.segments.length;
        const map = this.currentMap;
        const isDark = Math.floor(n / 3) % 2 === 1;

        const color = isDark ? {
            road: map.roadColor.dark,
            grass: map.grassColor.dark,
            rumble: map.rumbleColor.dark,
            strip: map.rumbleColor.dark
        } : {
            road: map.roadColor.light,
            grass: map.grassColor.light,
            rumble: map.rumbleColor.light,
            strip: map.rumbleColor.light
        };

        this.segments.push({
            index: n,
            p1: { world: { z: n * SEGMENT_LENGTH, x: 0, y: this.lastY }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            p2: { world: { z: (n + 1) * SEGMENT_LENGTH, x: 0, y: y }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, z: 0 } },
            color: color,
            curve: curve,
            clip: 0,
            sprites: []
        });
        this.lastY = y;
    }

    reset() {
        this.segments = [];
        this.lastY = 0;
        this.mapData = [];
        this.inputDisabled = false;
        const ROAD = { LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 }, CURVE: { NONE: 0, EASY: 1, MEDIUM: 2, HARD: 3 }, HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 } };

        // Helper to add sections
        const addS = (enter: number, hold: number, leave: number, curve: number, dY: number) => {
            const startY = this.lastY;
            const endY = startY + (dY * SEGMENT_LENGTH);
            const n = enter + hold + leave;

            for (let i = 0; i < enter; i++) this.addUnsafeSegment(RenderUtils.easeIn(0, curve, i / enter), RenderUtils.easeInOut(startY, endY, i / n));
            for (let i = 0; i < hold; i++) this.addUnsafeSegment(curve, RenderUtils.easeInOut(startY, endY, (enter + i) / n));
            for (let i = 0; i < leave; i++) this.addUnsafeSegment(RenderUtils.easeInOut(curve, 0, i / leave), RenderUtils.easeInOut(startY, endY, (enter + hold + i) / n));
        };

        const addFlags = () => {
            for (let i = 20; i < this.segments.length; i += 50) {
                (this.segments[i] as any).checkpoint = true;
            }
        };

        // Build Track based on Difficulty
        if (this.difficulty === 'hard') {
            addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, 0, 0);
            for (let i = 0; i < 20; i++) {
                addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, (i % 2 ? 1 : -1) * ROAD.CURVE.HARD, (i % 3 === 0 ? 1 : (i % 3 === 1 ? -1 : 0)) * ROAD.HILL.HIGH);
                addS(ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, 0, 0);
            }
        } else if (this.difficulty === 'medium') {
            addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, 0, 0);
            for (let i = 0; i < 10; i++) {
                addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, (i % 2 ? 1 : -1) * ROAD.CURVE.MEDIUM, (i % 3 === 0 ? 1 : (i % 3 === 1 ? -1 : 0)) * ROAD.HILL.LOW);
                addS(ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, 0, 0);
            }
        } else {
            addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, 0, 0);
            for (let i = 0; i < 15; i++) {
                addS(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, (i % 2 ? 1 : -1) * ROAD.CURVE.EASY, 0);
            }
        }

        // Finish Line
        for (let i = 0; i < 50; i++) {
            this.addUnsafeSegment(0, this.lastY);
        }

        addFlags();

        this.trackLength = this.segments.length * SEGMENT_LENGTH;

        // Use Manager to Spawn
        this.obstacleManager.reset(this.trackLength, this.difficulty);

        // POPULATE BUSHES ON SEGMENTS
        // We do this AFTER track is built so we have assets loaded (hopefully) or we assume they are.
        // Wait, sprites are loaded async. We just store the reference to the image object (which might be empty initially but fills later).
        for (let i = 0; i < this.segments.length; i++) {
            // Every 5 segments
            if (i % 5 === 0) {
                const side = (i % 10 === 0) ? 1 : -1;
                // Push sprite data
                // We need to access the sprite images. They are class properties.
                // We can assign them now.
                if (side > 0 && this.bushDrySprite) {
                    this.segments[i].sprites.push({ source: this.bushDrySprite, offset: 1.5 * side, scale: 500 });
                } else if (side < 0 && this.bushGreenSprite) {
                    this.segments[i].sprites.push({ source: this.bushGreenSprite, offset: 1.5 * side, scale: 500 });
                }
                // Note: offset 1.5 means 1.5 * ROAD_WIDTH from center. Road edge is 1.0. So 0.5 widths off-road.
            }
        }

        this.generateMapData();
        this.position = 0;
        this.speed = 0;
        this.playerX = 0;
        this.running = true;
        this.finished = false;
        // this.countdownTime = 0; // Handled in gameLoop to perform correctly
        this.lastTime = performance.now();
        this.startTime = this.lastTime;
        this.gameLoop();
    }

    generateMapData() {
        this.mapData = [];
        let x = 0;
        let z = 0;
        let angle = 0;

        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            // segment.curve is essentially dAngle/dDistance or change in X offset per step
            // Standard pseudo-3D racer logic for layout:
            // Inverted sign because screen render uses -curve for x offset (Left), 
            // while positive angle usually means Right. 
            // So to match screen left-turn (positive curve), we need to subtract angle.
            angle -= segment.curve * 0.003;

            // Advance Z forward relative to angle
            // Actually, we just step forward by 1 unit distance in 'angle' direction
            const dist = 1;
            x += Math.sin(angle) * dist;
            z += Math.cos(angle) * dist;

            if (i % 5 === 0) { // Optimize: store every 5th point
                this.mapData.push({ x, z });
            }
        }
    }

    update(dt: number) {
        if (this.finished) return;

        // NOS System
        const BOOST_FACTOR = 1.6;
        let currentMaxSpeed = this.maxSpeed;

        if (this.controls.nos && this.nosAmount > 0 && !this.nosLocked) {
            this.nosActive = true;
            this.nosAmount -= 15 * dt; // 15% per second

            if (this.nosAmount <= 0) {
                this.nosAmount = 0;
                this.nosLocked = true; // Lock when fully drained
            }

            currentMaxSpeed *= BOOST_FACTOR;
        } else {
            this.nosActive = false;
            // Recharge NOS moderately
            if (this.nosAmount < 100) {
                this.nosAmount += 5 * dt; // 5% per second
                if (this.nosAmount > 100) this.nosAmount = 100;

                // Unlock if recharged sufficiently (20%)
                if (this.nosLocked && this.nosAmount >= 20) {
                    this.nosLocked = false;
                }
            }
        }

        // --- Camera Zoom Logic (Smooth) ---
        // Zoom out (increase depth) when speed > 110 km/h (11000 units) OR NOS active
        const ZOOM_THRESHOLD = 11000;
        const BASE_DEPTH = CAMERA_DEPTH; // 0.8
        const ZOOM_DEPTH = 0.4; // Extreme wide angle for "hard" feel

        if (this.speed > ZOOM_THRESHOLD || this.nosActive) {
            this.targetCameraDepth = ZOOM_DEPTH;
        } else {
            this.targetCameraDepth = BASE_DEPTH;
        }

        // Snappier interpolation
        this.cameraDepth = RenderUtils.easeOut(this.cameraDepth, this.targetCameraDepth, 3 * dt);


        const onPuddle = this.obstacleManager.checkPuddles(this.position, this.playerX);

        // PUDDLE PHYSICS: FINAL "HEAVY" FEEL
        if (onPuddle && !this.wasOnPuddle) {
            // IMMEDIATE IMPACT: Drop speed by ~25 km/h (3000 units) instantly on entry.
            // This guarantees the player "feels" the water hit.
            this.speed = Math.max(0, this.speed - 3000);
        }
        this.wasOnPuddle = onPuddle;

        const DRAG_FACTOR = onPuddle ? 0.96 : 1.0; // Heavy Drag (holds speed down)
        const ACCEL_PENALTY = onPuddle ? 0.4 : 1.0; // Slippery (hard to accelerate)

        const accel = (currentMaxSpeed / 5) * ACCEL_PENALTY;
        const breaking = -currentMaxSpeed;
        const decel = -currentMaxSpeed / 5;

        // ... controls ...
        if (this.controls.up) {
            this.speed = this.speed + accel * dt;
            // Apply drag while accelerating on puddle
            if (onPuddle) this.speed *= DRAG_FACTOR;
        }
        else if (this.controls.down) this.speed = this.speed + breaking * dt;
        else {
            this.speed = this.speed + decel * dt;
            // Apply drag while coasting
            if (onPuddle) this.speed *= DRAG_FACTOR;
        }

        // Improved Steering for "Stuck" situations
        // User requested easy escape when hitting obstacles.
        // We allow turning even if speed is low/zero, provided we are trying to move.
        if (this.speed !== 0 || this.controls.up || this.controls.down) {
            // Calculate turn effectiveness. 
            // Normal: proportional to speed.
            // Stuck/Slow: Minimum 0.5 ratio to allow sliding out.
            let turnRatio = this.speed / currentMaxSpeed;
            if (Math.abs(turnRatio) < 0.1 && (this.controls.up || this.controls.down)) {
                turnRatio = 0.5;
            }

            // Allow turning in place if we are really stuck? 
            // Better: just clamp minimum effectiveness.
            const turnSpeed = dt * Math.max(Math.abs(turnRatio), 0.5);

            if (this.controls.left) this.playerX = this.playerX - turnSpeed;
            else if (this.controls.right) this.playerX = this.playerX + turnSpeed;
        }

        // CAMERA ROTATION SYSTEM - Smooth following when turning
        // Set target camera angle based on player input
        if (this.controls.left) {
            this.targetCameraAngle = -0.12; // Rotate left
        } else if (this.controls.right) {
            this.targetCameraAngle = 0.12;  // Rotate right
        } else {
            this.targetCameraAngle = 0;     // Return to center
        }

        // Smooth interpolation (lerp) towards target
        const cameraLerpSpeed = 0.04; // Lower = smoother, slower transition
        this.cameraAngle += (this.targetCameraAngle - this.cameraAngle) * cameraLerpSpeed;

        this.speed = Math.max(0, Math.min(this.speed, currentMaxSpeed));

        // Update Obstacles & Check Collisions
        const collision = this.obstacleManager.update(dt, this.position, this.playerX, this.speed);
        if (collision.hit) {
            if (collision.knockback) {
                this.inputDisabled = true;
                setTimeout(() => { this.inputDisabled = false; }, 500);
            }
            if (collision.speedModifier !== undefined) this.speed = collision.speedModifier;
            if (collision.forcePosition !== undefined) this.position = collision.forcePosition;

            // Puddle slowdown handled by currentMaxSpeed override at start of update

            // NEW: Set impact timer for VFX
            if (collision.impact) {
                this.impactTimer = 0.5; // 500ms impact effect
            }
        }

        // Decrement impact timer
        if (this.impactTimer > 0) {
            this.impactTimer -= dt;
            if (this.impactTimer < 0) this.impactTimer = 0;
        }

        /* // Rock Collision
        // Static obstacles check
        for (const rock of this.rocks) {
            let distZ = rock.z - this.position;
            // Handle looping for static objects? 
            // My track loop logic is simple.
            if (distZ < -this.trackLength / 2) distZ += this.trackLength;
            if (distZ > this.trackLength / 2) distZ -= this.trackLength;
    
            // Increased detection range to prevent tunneling at high speeds (maxSpeed*dt ~ 200 units)
            if (distZ > 0 && distZ < 250) { // Check only if rock is Ahead (positive distZ) and close
                // Check width overlap
                if (Math.abs(this.playerX - rock.x) < 0.6) { // Slightly wider check
                    // HIT ROCK
                    // Effect: Hard Bounce & Push Back
    
                    // 1. Force player position BACK to avoid sticking inside
                    this.position = rock.z - 250;
    
                    // 2. Reverse speed (Bounce)
                    if (this.speed > 1000) {
                        this.speed = -this.speed * 0.5; // Stronger bounce
                    } else {
                        this.speed = -500; // Minimum bounce
                    }
                }
            }
        }
    
        // Obstacle Cars Logic
        if (this.obstacleCars) {
            for (const car of this.obstacleCars) {
                // Move car forward
                car.z += car.speed * dt;
                if (car.z >= this.trackLength) car.z -= this.trackLength; // Loop track
    
                // Collision Detection
                // Dimensions: Car width ~0.5 units (road is -1 to 1 = width 2)
                const playerW = 0.6;
                const carW = 0.5;
    
                // Z Collision (Depth)
                // Need to cover wrapping? For simplicity, check linear distance first
                // Let's check if player Z is within bounds of car Z
                // Since Z loops, player position vs car Z needs care. 
                // But generally colliding happens when overtaking or getting hit.
                // Simple collision zone: +/- 100 units
    
                // Check if car is close to player
                let distZ = car.z - this.position;
                // Handle looping
                if (distZ < -this.trackLength / 2) distZ += this.trackLength;
                if (distZ > this.trackLength / 2) distZ -= this.trackLength;
    
                if (Math.abs(distZ) < 150) { // Overlap zone
                    // X Collision (Lane)
                    // If overlapping lanes
                    if (Math.abs(this.playerX - car.x) < 0.6) {
                        // HIT!
                        // Effect: Stop player movement, reduce speed
                        this.speed *= 0.8; // Lose momentum
    
                        // Push back slightly? Or simply clamp speed.
                        // User said: "terhalang" (blocked), "tidak bisa menerobos" (can't pass)
    
                        // Logic: If player is faster and behind, set speed to car speed
                        if (distZ > 0 && this.speed > car.speed) {
                            this.speed = car.speed;
                            this.position = car.z - 150; // Pin behind
                        }
                    }
                }
            }
        }
    
        */
        // Off-road penalty (grass) - very gradual slowdown
        if (Math.abs(this.playerX) > 1) {
            this.speed *= 0.975; // Gentle reduction, gives player time to return
        }

        this.position = this.position + this.speed * dt;

        // Finish Line Check
        if (this.position >= this.trackLength) {
            this.position = this.trackLength; // Clamp
            this.speed = 0; // Stop
            this.finished = true;
            this.running = false; // Stop loop eventually? Or just keep rendering static?
            // Keep rendering to show finish scene, but stop update inputs

            const totalTime = (performance.now() - this.startTime) / 1000;
            console.log("Finished! Time:", totalTime);

            if (this.onFinish) {
                this.onFinish({ time: totalTime });
            }
        }

        // Disable looping
        // while (this.position >= this.trackLength) this.position -= this.trackLength;
        while (this.position < 0) this.position += this.trackLength; // Allow reverse loop? Maybe irrelevant.

        while (this.position < 0) this.position += this.trackLength;

        // Multiplayer Sync
        if (this.socket && this.running && this.roomId) {
            const now = performance.now();
            if (now - this.lastSendTime > 50) {
                this.socket.emit("race_update", {
                    roomId: this.roomId,
                    state: {
                        id: this.myId,
                        x: this.playerX,
                        z: this.position,
                        characterId: this.myCharacterId // Use actual charId
                    }
                });
                this.lastSendTime = now;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- Screen Shake Calculation ---
        let shakeX = 0;
        let shakeY = 0;

        // Shake if speed is high (> 80 km/h, or 80% of max)
        // Display speed is speed/100, so 8000
        if (this.speed > 8000 && !this.finished) {
            // "Smooth" and "Not too crazy"
            const intensity = 2; // Fixed low intensity
            shakeX = (Math.random() - 0.5) * intensity;
            shakeY = (Math.random() - 0.5) * intensity;
        }

        // --- Camera Rotation Offset & Tilt ---
        // --- Camera Rotation Offset & Tilt ---
        // Creates smooth horizontal shift AND tilt when turning
        // EXTREME VALUES FOR TESTING
        const cameraOffset = this.cameraAngle * this.canvas.width * 1.0; // 100% screen width shift
        const rotationStrength = 0.5; // ~30 degrees tilt (very extreme)

        this.ctx.save();

        // Center pivot for rotation
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.cameraAngle * rotationStrength); // Rotate world opposite to camera tilt
        this.ctx.translate(-cx, -cy);

        this.ctx.translate(shakeX + cameraOffset, shakeY);

        // Sky Background
        // Sky Background - Oversized for rotation
        const overscan = 2.0; // 2x width/height
        const skyWidth = this.canvas.width * overscan;
        const skyHeight = this.canvas.height * overscan;

        // Draw sky centered but large
        if (this.currentMap.id === 'sawit-plants' && this.skyImage) {
            this.ctx.drawImage(this.skyImage, -this.canvas.width * 0.5, -this.canvas.height * 0.5, skyWidth, skyHeight);
        } else {
            // Draw Gradient Sky
            const grad = this.ctx.createLinearGradient(0, -this.canvas.height, 0, this.canvas.height);
            grad.addColorStop(0, this.currentMap.skyGradient.top);
            grad.addColorStop(1, this.currentMap.skyGradient.bottom);
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(-this.canvas.width, -this.canvas.height, this.canvas.width * 3, this.canvas.height * 3);
        }

        // GROUND FILL - Important for rotation clipping
        // Draw a giant rectangle of ground color behind everything
        this.ctx.fillStyle = this.currentMap.grassColor.light; // Use current map grass color
        this.ctx.fillRect(-this.canvas.width, this.canvas.height / 2, this.canvas.width * 3, this.canvas.height * 2);

        const baseSegment = this.findSegment(this.position);
        const basePercent = (this.position % SEGMENT_LENGTH) / SEGMENT_LENGTH;

        let dx = -(baseSegment.curve * basePercent);
        let x = 0;
        let maxy = this.canvas.height;

        // Sprite Collection
        const sprites: { source: HTMLImageElement, x: number, y: number, w: number, h: number, clip: number }[] = [];

        for (let n = 0; n < DRAW_DISTANCE; n++) {
            const segment = this.segments[(baseSegment.index + n) % this.segments.length];
            const segmentLooped = segment.index < baseSegment.index;
            segment.clip = maxy;

            RenderUtils.project(
                segment.p1,
                (this.playerX * ROAD_WIDTH) - x,
                CAMERA_HEIGHT + baseSegment.p1.world.y,
                (segmentLooped ? this.trackLength : 0) + (this.position), // Pass position for smooth Z
                this.cameraDepth,
                this.canvas.width,
                this.canvas.height,
                ROAD_WIDTH
            );

            RenderUtils.project(
                segment.p2,
                (this.playerX * ROAD_WIDTH) - x - dx,
                CAMERA_HEIGHT + baseSegment.p1.world.y,
                (segmentLooped ? this.trackLength : 0) + (this.position), // Pass position
                this.cameraDepth,
                this.canvas.width,
                this.canvas.height,
                ROAD_WIDTH
            );

            x += dx;
            dx += segment.curve;

            // Near Plane Clipping
            let drawRoad = true;

            if (segment.p1.camera.z <= CAMERA_DEPTH) {
                if (segment.p2.camera.z > CAMERA_DEPTH) {
                    segment.p1.screen.y = this.canvas.height;
                    segment.p1.screen.x = this.canvas.width / 2;
                    segment.p1.screen.w = this.canvas.width * 5;
                } else {
                    drawRoad = false;
                }
            } else if (segment.p2.screen.y >= maxy || segment.p2.screen.y >= segment.p1.screen.y) {
                drawRoad = false;
            }

            if (drawRoad) {
                const isStartLine = segment.index === 0;
                const isFinishLine = segment.index === Math.floor(this.trackLength / SEGMENT_LENGTH) - 50;

                if (isStartLine || isFinishLine) {
                    RenderUtils.drawCheckeredSegment(
                        this.ctx,
                        this.canvas.width,
                        segment.p1.screen.x,
                        segment.p1.screen.y,
                        segment.p1.screen.w || 0,
                        segment.p2.screen.x,
                        segment.p2.screen.y,
                        segment.p2.screen.w || 0,
                        segment.color
                    );
                } else {
                    RenderUtils.drawSegment(
                        this.ctx,
                        this.canvas.width,
                        3,
                        segment.p1.screen.x,
                        segment.p1.screen.y,
                        segment.p1.screen.w || 0,
                        segment.p2.screen.x,
                        segment.p2.screen.y,
                        segment.p2.screen.w || 0,
                        0,
                        segment.color
                    );
                }
            }

            // Collect Rocks from Manager
            if (this.obstacleManager.rockSprite) {
                for (const rock of this.obstacleManager.rocks) {
                    const rockSegIndex = Math.floor(rock.z / SEGMENT_LENGTH) % this.segments.length;
                    if (rockSegIndex === segment.index) {
                        const scale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                        const screenX = segment.p1.screen.x;
                        const screenY = segment.p1.screen.y;
                        const screenW = segment.p1.screen.w || 0;

                        const spriteScale = 800 * scale;

                        const rockScreenX = screenX + (rock.x * screenW);
                        const rockScreenY = screenY;

                        if (rockScreenY < segment.clip) {
                            sprites.push({ source: this.obstacleManager.rockSprite, x: rockScreenX - spriteScale / 2, y: rockScreenY - spriteScale, w: spriteScale, h: spriteScale, clip: segment.clip });
                        }
                    }
                }
            }

            // Collect Puddles from Manager
            if (this.obstacleManager.puddleSprite) {
                for (const puddle of this.obstacleManager.puddles) {
                    const puddleSegIndex = Math.floor(puddle.z / SEGMENT_LENGTH) % this.segments.length;
                    if (puddleSegIndex === segment.index) {
                        const scale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                        const screenX = segment.p1.screen.x;
                        const screenY = segment.p1.screen.y;
                        const screenW = segment.p1.screen.w || 0;

                        // Puddles should be wide and flat
                        const spriteW = 1200 * scale;
                        const spriteH = 400 * scale;

                        const puddleScreenX = screenX + (puddle.x * screenW);
                        const puddleScreenY = screenY;

                        if (puddleScreenY < segment.clip) {
                            sprites.push({
                                source: this.obstacleManager.puddleSprite,
                                x: puddleScreenX - spriteW / 2,
                                y: puddleScreenY - spriteH / 2, // Slightly offset so it feels flat on ground
                                w: spriteW,
                                h: spriteH,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // Collect Cars from Manager
            if (this.obstacleManager.obstacleSprite) {
                for (const car of this.obstacleManager.cars) {
                    const carSegIndex = Math.floor(car.z / SEGMENT_LENGTH) % this.segments.length;
                    if (carSegIndex === segment.index) {
                        const scale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                        const screenX = segment.p1.screen.x;
                        const screenY = segment.p1.screen.y;
                        const screenW = segment.p1.screen.w || 0;
                        const carAspect = this.obstacleManager.obstacleSprite.width / this.obstacleManager.obstacleSprite.height;
                        const spriteW = 750 * scale;
                        const spriteH = spriteW / carAspect;

                        const carScreenX = screenX + (car.x * screenW);
                        const carScreenY = screenY;

                        // Visibility Check
                        if (carScreenY < segment.clip) {
                            sprites.push({
                                source: this.obstacleManager.obstacleSprite,
                                x: carScreenX - spriteW / 2,
                                y: carScreenY - spriteH,
                                w: spriteW,
                                h: spriteH,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // Collect Trees (Don't draw yet)
            if (this.treeImage && this.treeImage.complete) {
                const scale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                const screenW = segment.p1.screen.w || 0;
                const screenX = segment.p1.screen.x;
                const screenY = segment.p1.screen.y;

                const seededRandom = (seed: number, offset: number = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                // TREES: Random placement 
                const shouldDrawTree = seededRandom(segment.index, 100) > 0.9; // Very sparse distribution (10%)

                // Lower threshold to 0.001 to prevent flickering/pop-in at horizon
                if (shouldDrawTree && scale > 0.001) {
                    // Increased size significantly as requested (1500 * scale is massive, fitting typically large assets)
                    const treeSize = 1500 * scale;

                    const srcX = 0;
                    const srcY = 0;
                    const srcW = this.treeImage.width;
                    const srcH = this.treeImage.height;

                    const distanceVariation = 400 + seededRandom(segment.index, 60) * 800; // Further out
                    const side = seededRandom(segment.index, 70);

                    // Right side tree
                    if (side > 0.3) {
                        const treeX = screenX + screenW + (distanceVariation * scale);
                        const treeAspect = this.treeImage.width / this.treeImage.height;
                        const w = treeSize * treeAspect;
                        const h = treeSize;
                        const treeY = screenY - h; // Anchor EXACTLY at ground line

                        // Bounds check logic for sprites
                        if (treeX < this.canvas.width + 1000 && treeX > -1000 && treeY > -1000) {
                            sprites.push({
                                source: this.treeImage,
                                x: treeX,
                                y: treeY,
                                w: w,
                                h: h,
                                clip: segment.clip
                            });
                        }
                    }

                    // Left side tree
                    if (side < 0.7) {
                        const leftDistanceVariation = 400 + seededRandom(segment.index, 80) * 800;
                        const treeAspect = this.treeImage.width / this.treeImage.height;
                        const w = treeSize * treeAspect;
                        const h = treeSize;
                        const treeX = screenX - screenW - w - (leftDistanceVariation * scale);
                        const treeY = screenY - h; // Anchor EXACTLY at ground line

                        if (treeX < this.canvas.width + 1000 && treeX > -1000 && treeY > -1000) {
                            sprites.push({
                                source: this.treeImage,
                                x: treeX,
                                y: treeY,
                                w: w,
                                h: h,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // BUSHES: Procedural placement (like trees)
            // Must check .complete to ensure async load finished
            if ((this.bushDrySprite && this.bushDrySprite.complete) || (this.bushGreenSprite && this.bushGreenSprite.complete)) {
                const bScale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                const bScreenW = segment.p1.screen.w || 0;
                const bScreenX = segment.p1.screen.x;
                const bScreenY = segment.p1.screen.y;

                const seededRandom = (seed: number, offset: number = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                // BUSHES: 15% chance per segment
                const shouldDrawBush = seededRandom(segment.index, 500) > 0.85;

                if (shouldDrawBush && bScale > 0.001) {
                    const bushSize = 400 * bScale; // Smaller than trees
                    const side = seededRandom(segment.index, 510) > 0.5 ? 1 : -1;
                    const distanceVariation = 100 + seededRandom(segment.index, 520) * 300; // Close to road

                    // Select sprite
                    const bushSprite = seededRandom(segment.index, 530) > 0.5 ? this.bushDrySprite : this.bushGreenSprite;

                    if (bushSprite && bushSprite.complete) {
                        const bushAspect = bushSprite.width / bushSprite.height;
                        const w = bushSize * bushAspect;
                        const h = bushSize;

                        let bushX: number;
                        if (side > 0) {
                            bushX = bScreenX + bScreenW + (distanceVariation * bScale);
                        } else {
                            bushX = bScreenX - bScreenW - w - (distanceVariation * bScale);
                        }
                        const bushY = bScreenY - h;

                        if (bushX < this.canvas.width + 500 && bushX > -500 && bushY > -500) {
                            sprites.push({
                                source: bushSprite,
                                x: bushX,
                                y: bushY,
                                w: w,
                                h: h,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // BILLBOARDS: Procedural placement (like trees, but rarer)
            if ((this.billboard1Sprite && this.billboard1Sprite.complete) || (this.billboard2Sprite && this.billboard2Sprite.complete)) {
                const bbScale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                const bbScreenW = segment.p1.screen.w || 0;
                const bbScreenX = segment.p1.screen.x;
                const bbScreenY = segment.p1.screen.y;

                const seededRandom = (seed: number, offset: number = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                // BILLBOARDS: 2% chance per segment (very rare)
                const shouldDrawBillboard = seededRandom(segment.index, 700) > 0.98;

                if (shouldDrawBillboard && bbScale > 0.001) {
                    const billboardSize = 2000 * bbScale; // Taller than trees
                    const side = seededRandom(segment.index, 710) > 0.5 ? 1 : -1;
                    const distanceVariation = 200 + seededRandom(segment.index, 720) * 400;

                    // Select billboard sprite
                    const billboardSprite = seededRandom(segment.index, 730) > 0.5 ? this.billboard1Sprite : this.billboard2Sprite;

                    if (billboardSprite && billboardSprite.complete) {
                        const bbAspect = billboardSprite.width / billboardSprite.height;
                        const w = billboardSize * bbAspect;
                        const h = billboardSize;

                        let bbX: number;
                        if (side > 0) {
                            bbX = bbScreenX + bbScreenW + (distanceVariation * bbScale);
                        } else {
                            bbX = bbScreenX - bbScreenW - w - (distanceVariation * bbScale);
                        }
                        const bbY = bbScreenY - h;

                        if (bbX < this.canvas.width + 500 && bbX > -500 && bbY > -500) {
                            sprites.push({
                                source: billboardSprite,
                                x: bbX,
                                y: bbY,
                                w: w,
                                h: h,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // HOUSES AND WELLS: Procedural placement (very rare, large)
            if ((this.houseSprite && this.houseSprite.complete) || (this.wellSprite && this.wellSprite.complete)) {
                const hScale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                const hScreenW = segment.p1.screen.w || 0;
                const hScreenX = segment.p1.screen.x;
                const hScreenY = segment.p1.screen.y;

                const seededRandom = (seed: number, offset: number = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                // HOUSES/WELLS: 2% chance per segment (very rare like billboards)
                const shouldDrawHouse = seededRandom(segment.index, 800) > 0.98;

                if (shouldDrawHouse && hScale > 0.001) {
                    const side = seededRandom(segment.index, 810) > 0.5 ? 1 : -1;
                    const distanceVariation = 300 + seededRandom(segment.index, 820) * 500;

                    // Select house or well sprite
                    const isHouse = seededRandom(segment.index, 830) > 0.5;
                    const selectedSprite = isHouse ? this.houseSprite : this.wellSprite;

                    // Different sizes: House big, Well smaller
                    const spriteSize = isHouse ? 2500 * hScale : 800 * hScale;

                    if (selectedSprite && selectedSprite.complete) {
                        const hAspect = selectedSprite.width / selectedSprite.height;
                        const w = spriteSize * hAspect;
                        const h = spriteSize;

                        let hX: number;
                        if (side > 0) {
                            hX = hScreenX + hScreenW + (distanceVariation * hScale);
                        } else {
                            hX = hScreenX - hScreenW - w - (distanceVariation * hScale);
                        }

                        // House gets Y offset to sit lower (not floating)
                        const yOffset = isHouse ? h * 0.15 : 0;
                        const hY = hScreenY - h + yOffset;

                        if (hX < this.canvas.width + 500 && hX > -500 && hY > -500) {
                            sprites.push({
                                source: selectedSprite,
                                x: hX,
                                y: hY,
                                w: w,
                                h: h,
                                clip: segment.clip
                            });
                        }
                    }
                }
            }

            // PALM TREES: Fill background with forest theme (tall, semi-frequent)
            if (this.palmTreeSprite && this.palmTreeSprite.complete) {
                const pScale = (segment.p1.screen.w || 0) / ROAD_WIDTH;
                const pScreenW = segment.p1.screen.w || 0;
                const pScreenX = segment.p1.screen.x;
                const pScreenY = segment.p1.screen.y;

                const seededRandom = (seed: number, offset: number = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                // HIGH DENSITY Palm Trees (Filling all background)
                // Layer 1: Foreground edges (15%)
                const shouldDrawPalm1 = seededRandom(segment.index, 900) > 0.85;
                if (shouldDrawPalm1 && pScale > 0.001) {
                    const palmSize1 = 2000 * pScale;
                    const palmAspect1 = this.palmTreeSprite.width / this.palmTreeSprite.height;
                    const w1 = palmSize1 * palmAspect1;
                    const h1 = palmSize1;
                    const side1 = seededRandom(segment.index, 910) > 0.5 ? 1 : -1;
                    const dist1 = 800 + seededRandom(segment.index, 920) * 800;

                    let pX: number;
                    if (side1 > 0) pX = pScreenX + pScreenW + (dist1 * pScale);
                    else pX = pScreenX - pScreenW - w1 - (dist1 * pScale);

                    if (pX < this.canvas.width + 1000 && pX > -1000 && pScreenY - h1 > -500) {
                        sprites.push({ source: this.palmTreeSprite, x: pX, y: pScreenY - h1, w: w1, h: h1, clip: segment.clip });
                    }
                }

                // Layer 2: Mid background density (40%)
                const shouldDrawPalm2 = seededRandom(segment.index, 1000) > 0.60;
                if (shouldDrawPalm2 && pScale > 0.001) {
                    const palmSize2 = 1800 * pScale;
                    const palmAspect2 = this.palmTreeSprite.width / this.palmTreeSprite.height;
                    const w2 = palmSize2 * palmAspect2;
                    const h2 = palmSize2;
                    const side2 = seededRandom(segment.index, 1010) > 0.5 ? 1 : -1;
                    const dist2 = 1500 + seededRandom(segment.index, 1020) * 1500;

                    let pX: number;
                    if (side2 > 0) pX = pScreenX + pScreenW + (dist2 * pScale);
                    else pX = pScreenX - pScreenW - w2 - (dist2 * pScale);

                    if (pX < this.canvas.width + 1500 && pX > -1500 && pScreenY - h2 > -500) {
                        sprites.push({ source: this.palmTreeSprite, x: pX, y: pScreenY - h2, w: w2, h: h2, clip: segment.clip });
                    }
                }

                // Layer 3: Far background wall (60%)
                const shouldDrawPalm3 = seededRandom(segment.index, 1100) > 0.40;
                if (shouldDrawPalm3 && pScale > 0.001) {
                    const palmSize3 = 2400 * pScale;
                    const palmAspect3 = this.palmTreeSprite.width / this.palmTreeSprite.height;
                    const w3 = palmSize3 * palmAspect3;
                    const h3 = palmSize3;
                    const side3 = seededRandom(segment.index, 1110) > 0.5 ? 1 : -1;
                    const dist3 = 3000 + seededRandom(segment.index, 1120) * 3000;

                    let pX: number;
                    if (side3 > 0) pX = pScreenX + pScreenW + (dist3 * pScale);
                    else pX = pScreenX - pScreenW - w3 - (dist3 * pScale);

                    if (pX < this.canvas.width + 2000 && pX > -2000 && pScreenY - h3 > -500) {
                        sprites.push({ source: this.palmTreeSprite, x: pX, y: pScreenY - h3, w: w3, h: h3, clip: segment.clip });
                    }
                }
            }

            // Draw Checkpoint Flag (Canvas drawing since no sprite)
            if ((segment as any).checkpoint && drawRoad) {
                const x = segment.p2.screen.x + (segment.p2.screen.w || 0); // Right side
                const y = segment.p2.screen.y;
                const scale = (segment.p2.screen.w || 0) / ROAD_WIDTH;

                // Only draw if reasonable scale
                if (scale > 0) {
                    // Pole
                    this.ctx.fillStyle = "#555";
                    this.ctx.fillRect(x, y - (100 * scale), 5 * scale, 100 * scale);

                    // Yellow Flag
                    this.ctx.fillStyle = "#FFD700";
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y - (100 * scale));
                    this.ctx.lineTo(x + (60 * scale), y - (80 * scale));
                    this.ctx.lineTo(x, y - (60 * scale));
                    this.ctx.fill();

                    // Left Side Flag
                    const xl = segment.p2.screen.x - (segment.p2.screen.w || 0) - (5 * scale);
                    // Pole
                    this.ctx.fillStyle = "#555";
                    this.ctx.fillRect(xl, y - (100 * scale), 5 * scale, 100 * scale);
                    // Flag
                    this.ctx.fillStyle = "#FFD700";
                    this.ctx.beginPath();
                    this.ctx.moveTo(xl + (5 * scale), y - (100 * scale));
                    this.ctx.lineTo(xl + (5 * scale) - (60 * scale), y - (80 * scale));
                    this.ctx.lineTo(xl + (5 * scale), y - (60 * scale));
                    this.ctx.fill();
                }
            }

            if (drawRoad) {
                maxy = segment.p1.screen.y;
            }
        }

        // Draw Sprites (Painters Algorithm: Back to Front)
        for (let i = sprites.length - 1; i >= 0; i--) {
            const s = sprites[i];

            // Depth Clipping against Road
            // If sprite bottom is below clip line, cut it.
            const bottom = s.y + s.h;
            if (bottom > s.clip) {
                const clipH = Math.max(0, s.clip - s.y);
                if (clipH > 0 && clipH < s.h) {
                    // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
                    const srcH = (clipH / s.h) * s.source.height;
                    this.ctx.drawImage(s.source, 0, 0, s.source.width, srcH, s.x, s.y, s.w, clipH);
                } else if (s.y <= s.clip) {
                    // Entire sprite above clip? (unlikely if bottom > clip, but safety)
                    this.ctx.drawImage(s.source, s.x, s.y, s.w, s.h);
                }
            } else {
                // Entirely above clip
                this.ctx.drawImage(s.source, s.x, s.y, s.w, s.h);
            }
        }


        // Render Opponents
        this.otherPlayers.forEach(p => {
            let relZ = p.z - this.position;
            if (relZ < -this.trackLength / 2) relZ += this.trackLength;
            if (relZ > this.trackLength / 2) relZ -= this.trackLength;

            if (relZ > 0 && relZ < DRAW_DISTANCE * SEGMENT_LENGTH) {
                const scale = CAMERA_DEPTH / relZ;
                const spriteX = this.canvas.width / 2 + (scale * (p.x - this.playerX) * this.canvas.width / 2 * ROAD_WIDTH * 150); // Magic tweak
                const spriteY = (this.canvas.height / 2) + (CAMERA_HEIGHT * scale * this.canvas.height / 2); // Rough horizon offset

                // Draw
                // Use a fallback rect if no sprite
                this.ctx.fillStyle = 'blue';
                const size = 2000 * scale;
                this.ctx.fillRect(spriteX - size / 2, this.canvas.height / 2 + 20 /* Horizon */ + (size * 0.5) /* Offset to ground */, size, size);
            }
        });


        // Draw Player Sprite
        let activeSprite = this.playerSprite;
        // SWAPPED: If controls.left is pressed, use the right-facing sprite asset (per user report of inversion)
        if (this.controls.left && this.playerSpriteRight) activeSprite = this.playerSpriteRight;
        else if (this.controls.right && this.playerSpriteLeft) activeSprite = this.playerSpriteLeft;

        if (activeSprite && activeSprite.complete) {
            const spriteScale = 0.0025 * (this.canvas.width / 1000);
            const spriteW = activeSprite.width * spriteScale * 250; // Increased size
            const spriteH = activeSprite.height * spriteScale * 250; // Increased size

            // Simple bounce effect
            const bounce = (1.5 * Math.random() * (this.speed / this.maxSpeed) * (this.canvas.height / 480) * Math.random()) * 10;

            // --- NOS Flame VFX (Before Car) ---
            if (this.nosActive && this.boostFlameSprite && this.boostFlameSprite.complete) {
                const flameW = 40;
                const flameH = 60;
                const flicker = Math.random() * 0.2 + 0.8;

                // Position relative to car base
                const centerX = this.canvas.width / 2;
                // Car draws at: canvas.height - spriteH - 20 - bounce
                // We want flame slightly lower? 
                const carY = this.canvas.height - spriteH - 20 - bounce;

                this.ctx.save();
                this.ctx.globalCompositeOperation = 'lighter';
                this.ctx.translate(centerX, carY + spriteH - 10); // At bottom of car
                this.ctx.rotate((Math.random() - 0.5) * 0.1);

                this.ctx.drawImage(
                    this.boostFlameSprite!,
                    -flameW / 2 * flicker,
                    0,
                    flameW * flicker,
                    flameH * flicker
                );
                this.ctx.restore();
            }

            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height - spriteH - 20 - bounce);

            const tilt = (this.controls.left ? -0.1 : (this.controls.right ? 0.1 : 0)) * (this.speed / this.maxSpeed);
            this.ctx.rotate(tilt);

            this.ctx.drawImage(
                activeSprite,
                -spriteW / 2,
                0,
                spriteW,
                spriteH
            );
            this.ctx.restore();
        }



        // --- Impact Lines VFX (Red - takes priority over blue) ---
        if (this.impactTimer > 0 && this.impactLinesSprite && this.impactLinesSprite.complete) {
            // Fade in/out based on timer
            // Peak at 0.25s (middle), fade out towards 0s
            const normalizedTime = this.impactTimer / 0.5;
            const opacity = Math.min(normalizedTime * 2, (1 - normalizedTime) * 2, 0.8);

            if (opacity > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = opacity;

                // Draw Left
                this.ctx.drawImage(this.impactLinesSprite!, 0, 0, this.canvas.width / 3, this.canvas.height);

                // Draw Right (Flipped)
                this.ctx.translate(this.canvas.width, 0);
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(this.impactLinesSprite!, 0, 0, this.canvas.width / 3, this.canvas.height);

                this.ctx.restore();
            }
        }


        this.ctx.restore(); // Restore shake translation

        // Debug HUD
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px monospace";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 3;
        const speedText = `Speed: ${Math.round(this.speed / 100)}`;
        this.ctx.strokeText(speedText, 10, 20);
        this.ctx.fillText(speedText, 10, 20);

        // Countdown Overlay - REMOVED
    }


    findSegment(z: number): Segment {
        return this.segments[Math.floor(z / SEGMENT_LENGTH) % this.segments.length];
    }

    gameLoop() {
        if (!this.running) return;

        const now = performance.now();
        const dt = Math.min(1, (now - this.lastTime) / 1000);
        this.lastTime = now;

        // Countdown handling - REMOVED, controlled by UI now
        this.update(dt);

        this.render();

        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    updateOpponent(data: { id: string, x: number, z: number, characterId: string }) {
        if (data.id === this.myId) return; // Should not happen if filtered, but safety
        this.otherPlayers.set(data.id, data);
    }

    destroy() {
        this.running = false;
        if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    }

    setTouchControls(controls: { up: boolean; down: boolean; left: boolean; right: boolean }) {
        this.controls.up = controls.up;
        this.controls.down = controls.down;
        this.controls.left = controls.left;
        this.controls.right = controls.right;
    }
}
