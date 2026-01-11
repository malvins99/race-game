"use client";

import { useEffect, useRef } from "react";
import { GameEngine } from "@/lib/game/GameEngine";

export default function Speedometer({ engine }: { engine: GameEngine | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!engine || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        // Configuration
        const SEGMENTS = 20;
        const RADIUS = 80;
        const CENTER_X = canvas.width / 2;
        const CENTER_Y = canvas.height - 20; // Bottom centered arc
        const START_ANGLE = Math.PI * 1.2; // roughly 10 o'clock
        const END_ANGLE = Math.PI * 1.8;   // roughly 2 o'clock
        const BAR_WIDTH = 15;
        const BAR_HEIGHT = 20;

        let frameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentSpeed = engine.speed / engine.maxSpeed; // 0 to 1
            const displaySpeed = Math.floor(currentSpeed * 100); // Scale to 0-100 KM/H

            // Draw Segments
            const totalAngle = END_ANGLE - START_ANGLE;
            const anglePerSeg = totalAngle / SEGMENTS;

            for (let i = 0; i < SEGMENTS; i++) {
                const active = (i / SEGMENTS) < currentSpeed;
                const angle = START_ANGLE + (i * anglePerSeg);

                ctx.save();
                ctx.translate(CENTER_X, CENTER_Y);
                ctx.rotate(angle);

                // Draw Segment Box
                // We translate out to RADIUS
                ctx.translate(0, -RADIUS);

                ctx.fillStyle = active ? "#00BFFF" : "rgba(255, 255, 255, 0.2)"; // Cyan if active
                ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";

                // Rect
                ctx.beginPath();
                // Slight skew for arc effect? Rectangle is fine for "segmented bar" look
                ctx.rect(-BAR_WIDTH / 2, 0, BAR_WIDTH - 2, BAR_HEIGHT); // -2 for gap
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }

            // Draw Text
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "900 48px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.fillText(displaySpeed.toString(), CENTER_X, CENTER_Y - 30);

            ctx.font = "700 14px 'Inter', sans-serif";
            ctx.fillText("KM/H", CENTER_X, CENTER_Y + 10);

            frameId = requestAnimationFrame(render);
        };

        frameId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(frameId);
    }, [engine]);

    return (
        <div className="relative w-[300px] h-[150px]">
            <canvas ref={canvasRef} width={300} height={150} className="block" />
        </div>
    );
}
