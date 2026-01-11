import { Segment, CAMERA_DEPTH, ROAD_WIDTH, CAMERA_HEIGHT } from './constants';

export class RenderUtils {

    static easeIn(a: number, b: number, percent: number) {
        return a + (b - a) * Math.pow(percent, 2);
    }

    static easeOut(a: number, b: number, percent: number) {
        return a + (b - a) * (1 - Math.pow(1 - percent, 2));
    }

    static easeInOut(a: number, b: number, percent: number) {
        return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
    }

    static project(
        p: { world: any; camera: any; screen: any },
        cameraX: number,
        cameraY: number,
        cameraZ: number,
        depth: number,
        width: number,
        height: number,
        roadWidth: number
    ) {
        p.camera.x = (p.world.x || 0) - cameraX;
        p.camera.y = (p.world.y || 0) - cameraY;
        p.camera.z = (p.world.z || 0) - cameraZ;
        p.screen.scale = depth / p.camera.z;
        p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
        p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
        p.screen.w = Math.round(p.screen.scale * roadWidth * width / 2);
    }

    static drawPolygon(
        ctx: CanvasRenderingContext2D,
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number,
        x4: number, y4: number,
        color: string
    ) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
    }

    static drawSegment(
        ctx: CanvasRenderingContext2D,
        width: number,
        lanes: number,
        x1: number, y1: number, w1: number,
        x2: number, y2: number, w2: number,
        fog: number,
        color: { grass: string; road: string; rumble: string; strip: string }
    ) {
        const r1 = w1 / Math.max(6, 2 * lanes);
        const r2 = w2 / Math.max(6, 2 * lanes);
        const l1 = w1 / Math.max(6, 2 * lanes);
        const l2 = w2 / Math.max(6, 2 * lanes);

        ctx.fillStyle = color.grass;
        ctx.fillRect(0, y2, width, y1 - y2);

        RenderUtils.drawPolygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
        RenderUtils.drawPolygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
        RenderUtils.drawPolygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);

        if (color.strip) {
            const value = 0.03;
            const lanew1 = w1 * 2 / lanes;
            const lanew2 = w2 * 2 / lanes;
            let lanex1 = x1 - w1 + lanew1;
            let lanex2 = x2 - w2 + lanew2;
            for (let lane = 1; lane < lanes;
                lanex1 += lanew1, lanex2 += lanew2, lane++) {
                RenderUtils.drawPolygon(ctx, lanex1 - w1 / 30, y1, lanex1 + w1 / 30, y1, lanex2 + w2 / 30, y2, lanex2 - w2 / 30, y2, color.strip);
            }
        }
    }

    static drawCheckeredSegment(ctx: CanvasRenderingContext2D, width: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: any) {
        // Draw Grass and Rumble first
        const r1 = w1 / 10;
        const r2 = w2 / 10;
        this.drawPolygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
        this.drawPolygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);

        // Draw Grass background
        ctx.fillStyle = color.grass;
        ctx.fillRect(0, y2, width, y1 - y2);

        // Draw checkered road
        const squares = 10;
        const sw1 = (w1 * 2) / squares;
        const sw2 = (w2 * 2) / squares;

        for (let i = 0; i < squares; i++) {
            const sqX1 = x1 - w1 + (i * sw1);
            const sqX2 = x2 - w2 + (i * sw2);
            const isWhite = i % 2 === 0;

            ctx.fillStyle = isWhite ? "#FFFFFF" : "#000000";
            this.drawPolygon(ctx, sqX1, y1, sqX1 + sw1, y1, sqX2 + sw2, y2, sqX2, y2, ctx.fillStyle as string);
        }
    }
}
