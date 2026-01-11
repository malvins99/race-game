import { SEGMENT_LENGTH, ROAD_WIDTH } from './constants';

interface Entity {
    z: number;
    x: number;
    speed?: number; // Only for cars
    sprite?: HTMLImageElement; // Optional for rocks if separate, required for cars

    // AI State
    targetX?: number;
    laneChangeSpeed?: number;
    laneChangeTimer?: number;
}

interface CollisionResult {
    hit: boolean;
    speedModifier?: number;
    knockback?: boolean;
    forcePosition?: number; // New Z position
    impact?: boolean; // NEW: Signal visual impact occurred
}

export class ObstacleManager {
    rocks: Entity[] = [];
    cars: Entity[] = [];
    puddles: Entity[] = [];

    rockSprite: HTMLImageElement | null = null;
    obstacleSprite: HTMLImageElement | null = null;
    puddleSprite: HTMLImageElement | null = null;

    trackLength: number = 0;

    // Knockback State
    knockbackTimer: number = 0;

    constructor() { }

    loadAssets() {
        const car = new Image();
        car.src = "/sprites/car_obstacle.png";
        car.onload = () => { this.obstacleSprite = car; };

        const rock = new Image();
        rock.src = "/sprites/rock.png";
        rock.onload = () => { this.rockSprite = rock; };

        const puddle = new Image();
        puddle.src = "/sprites/puddle.png";
        puddle.onload = () => { this.puddleSprite = puddle; };
    }

    reset(trackLength: number, difficulty: string) {
        this.trackLength = trackLength;
        this.rocks = [];
        this.cars = [];
        this.puddles = [];
        this.knockbackTimer = 0;

        // --- Spawn Rocks ---
        // Increased count: Hard=80, Medium=50, Easy=25
        const rockCount = difficulty === 'hard' ? 80 : (difficulty === 'medium' ? 50 : 25);
        for (let i = 0; i < rockCount; i++) {
            const z = (Math.random() * (this.trackLength - 2000)) + 1000;
            // Placement: 60% Road, 40% Off-Road
            let x = 0;
            if (Math.random() > 0.4) {
                x = (Math.random() * 2) - 1; // -1 to 1
            } else {
                const side = Math.random() > 0.5 ? 1 : -1;
                x = side * (1.2 + Math.random() * 2);
            }
            this.rocks.push({ z, x });
        }

        // --- Spawn Cars ---
        const carsCount = difficulty === 'hard' ? 40 : (difficulty === 'medium' ? 20 : 10);
        for (let i = 0; i < carsCount; i++) {
            const z = (Math.random() * (this.trackLength - 2000)) + 1000;
            const x = (Math.random() * 1.2) - 0.6;
            const speed = (12000 * 0.4) + (Math.random() * 12000 * 0.2); // Base on maxSpeed 12k
            this.cars.push({ z, x, speed, targetX: x });
        }

        // --- Spawn Puddles ---
        const puddleCount = difficulty === 'hard' ? 40 : (difficulty === 'medium' ? 20 : 10);
        for (let i = 0; i < puddleCount; i++) {
            const z = (Math.random() * (this.trackLength - 2000)) + 1000;
            const x = (Math.random() * 1.6) - 0.8; // Only on road
            this.puddles.push({ z, x });
        }
    }

    update(dt: number, playerZ: number, playerX: number, playerSpeed: number): CollisionResult {
        let result: CollisionResult = { hit: false };

        // Handle Knockback Timer
        if (this.knockbackTimer > 0) {
            this.knockbackTimer -= dt;
            // While knockback is active, we don't check for new collisions to allow escape
            // Return 'knockback: true' to tell Engine to disable input
            return { hit: false, knockback: true };
        }

        // --- Update Cars ---
        for (const car of this.cars) {
            if (car.speed) {
                car.z += car.speed * dt;
                if (car.z >= this.trackLength) car.z -= this.trackLength;

                // AI Logic: Change Lane
                if (car.targetX !== undefined && Math.abs(car.x - car.targetX) > 0.05) {
                    const dir = Math.sign(car.targetX - car.x);
                    const moveSpeed = (car.laneChangeSpeed || 1.0) * dt;
                    car.x += dir * moveSpeed;

                    // Clamp to target to prevent flicker
                    if ((dir > 0 && car.x > car.targetX) || (dir < 0 && car.x < car.targetX)) {
                        car.x = car.targetX;
                    }
                }

                // Check if player is stuck behind us & change lane
                this.checkAvoidance(car, playerZ, playerX);
            }
        }

        // --- Check Collisions ---

        // 1. Rocks
        for (const rock of this.rocks) {
            if (this.checkCollision(playerZ, playerX, rock, 0.5, 0.4)) { // 0.5 player width, 0.4 rock width
                return this.handleHardHit(playerSpeed, rock.z);
            }
        }

        // 2. Cars
        for (const car of this.cars) {
            // Normalize Car Z for collision check
            // We need to handle the loop logic in checkCollision or here.
            // checkCollision handles linear distance.
            // Reduce car width tolerance (0.4) to prevent side-swiping phantom hits
            if (this.checkCollision(playerZ, playerX, car, 0.4, 0.5)) {
                // Logic: If player is faster and behind -> Crash
                // If player is slower or ahead -> Just bump? 
                // For simplicity, any touch is a hit.
                return this.handleCarHit(playerSpeed, car.z, car.speed || 0);
            }
        }


        return result;
    }

    private checkCollision(pZ: number, pX: number, entity: Entity, pW: number, eW: number): boolean {
        let distZ = entity.z - pZ;
        // Handle Loop
        if (distZ < -this.trackLength / 2) distZ += this.trackLength;
        if (distZ > this.trackLength / 2) distZ -= this.trackLength;

        // Collision Box
        // Reduced Z range to prevent "phantom hits" from behind or too far ahead.
        // We only want to hit if we are practically INSIDE the object visually.
        const HIT_Z_START = -20; // Hitting the back (almost past it)
        const HIT_Z_END = 150;   // Hitting the front (approaching)

        if (distZ > HIT_Z_START && distZ < HIT_Z_END) {
            const distX = Math.abs(pX - entity.x);
            const widthThreshold = (pW + eW) / 2 * 0.9; // 90% width forgiveness
            if (distX < widthThreshold) {
                return true;
            }
        }
        return false;
    }

    private handleHardHit(currentSpeed: number, objectZ: number): CollisionResult {
        // CHANGED: No more bounce back. Just STOP.
        // This allows the player to simply steer away and accelerate again.

        // We set knockbackTimer briefly to prevent instant re-acceleration if holding 'Up'
        // but short enough to feel responsive.
        this.knockbackTimer = 0.2;

        return {
            hit: true,
            speedModifier: 0, // Stop immediately
            // No forcePosition change - let the player stay where they are (stuck against rock)
            // They can then steer out.
            knockback: true,
            impact: true // NEW: Signal impact for VFX
        };
    }

    private handleCarHit(currentSpeed: number, objectZ: number, objectSpeed: number): CollisionResult {
        // Car hit is softer ? Or same ?
        // If we rear-end them: Bounce back.
        // If they rear-end us (unlikely since we are usually faster): We get pushed? 
        // Let's treat it as a crash.

        this.knockbackTimer = 0.3;

        // Match speed or bounce
        let newSpeed = objectSpeed * 0.8; // Slow down to their speed - 20%
        if (currentSpeed > objectSpeed + 2000) {
            // High impact
            newSpeed = -2000;
        }

        return {
            hit: true,
            speedModifier: newSpeed,
            forcePosition: objectZ - 250,
            knockback: true,
            impact: true // NEW: Signal impact for VFX
        };
    }

    checkPuddles(playerZ: number, playerX: number): boolean {
        for (const puddle of this.puddles) {
            let distZ = puddle.z - playerZ;
            // Handle Loop
            if (distZ < -this.trackLength / 2) distZ += this.trackLength;
            if (distZ > this.trackLength / 2) distZ -= this.trackLength;

            // WIDER Z RANGE for Puddles: Start hitting earlier (250) and linger longer (-100)
            if (distZ > -100 && distZ < 250) {
                const distX = Math.abs(playerX - puddle.x);
                // 1.2 puddle width vs 1.0 player width?
                // Let's use generous width:
                // Puddle is ~1200 wide (visual). Road is 2000. 1.2 is 60% of road?
                if (distX < 0.7) {
                    return true;
                }
            }
        }
        return false;
    }

    getSpritesForSegment(segmentIndex: number): { sprite: HTMLImageElement, x: number, scale: number }[] {
        // Return simplified sprite data. Position calculation (Screen X/Y) 
        // implies we need more context (Screen coordinates of the segment).
        // Standard pattern: The Engine loop calculates Screen X/Y. 
        // We just return the list of entities that belong to this segment.

        const result: { sprite: HTMLImageElement, x: number, scale: number }[] = [];

        // Rocks
        // Optimization: In a real engine, we'd use a map. for 100 items, loop is fine.
        if (this.rockSprite) {
            for (const rock of this.rocks) {
                // Determine Segment Index for the rock
                // This assumes static rocks.
                const rockSeg = Math.floor(rock.z / SEGMENT_LENGTH) % (this.trackLength / SEGMENT_LENGTH);
                if (rockSeg === segmentIndex) {
                    result.push({ sprite: this.rockSprite, x: rock.x, scale: 0.2 }); // scale multiplier?
                }
            }
        }

        return result;
    }

    // Engine needs to loop entities and project them.
    // Better pattern: Engine passes 'segment' and 'segmentIndex'.
    // We return 'Renderable' objects.
    // BUT, the Engine's render loop is specific.
    // Let's expose the raw arrays or a helper that filters them efficiently?
    // Exposing arrays is easiest for the refactor step.

    // Actually, `GameEngine.render` iterates Segments 0..DrawDistance.
    // Check `GameEngine.ts`:
    // It checks `if (carSegIndex === segment.index)`
    // So the Engine needs access to the list to iterate.

    // AI Avoidance Check
    private checkAvoidance(car: Entity, pZ: number, pX: number) {
        // Calculate relative distance including loop
        let distZ = car.z - pZ;
        if (distZ < -this.trackLength / 2) distZ += this.trackLength;
        if (distZ > this.trackLength / 2) distZ -= this.trackLength;

        // If Player is BEHIND (-Z) but close (within 800)
        // OR if Player is AHEAD but we are faster (we might hit them) -> Wait, user asked for "behind them".
        // "saay saya tepat berada di belakang nya bot" (when I am right behind the bot)
        // So distZ should be POSITIVE (Car is ahead of Player) but small.

        const DETECT_DIST = 600;

        if (distZ > 0 && distZ < DETECT_DIST) {
            // Check Lane overlap
            if (Math.abs(car.x - pX) < 0.8) { // Overlapping lanes
                // MOVE AWAY!
                if (car.targetX === undefined || Math.abs(car.x - car.targetX) < 0.1) {
                    // Pick a safe side
                    let newX = car.x;
                    if (car.x > 0) newX -= 1.5; // Move Left
                    else newX += 1.5; // Move Right

                    // Clamp
                    if (newX > 2) newX = 2;
                    if (newX < -2) newX = -2;

                    car.targetX = newX;
                    car.laneChangeSpeed = 2.0; // Fast reaction
                }
            }
        }
    }
}
