"use client";

import { useEffect, useRef } from "react";
import { GameEngine } from "@/lib/game/GameEngine";

export default function Minimap({ engine }: { engine: GameEngine | null }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!engine || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        // 1. Calculate Track Bounds (Run once or memos if track changes, but track is static here)
        const map = engine.mapData;
        if (!map || map.length === 0) return;

        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const p of map) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.z < minZ) minZ = p.z;
            if (p.z > maxZ) maxZ = p.z;
        }

        const trackWidth = maxX - minX;
        const trackHeight = maxZ - minZ;

        // Add padding
        const padding = 300;
        const paddedWidth = trackWidth + padding * 2;
        const paddedHeight = trackHeight + padding * 2;

        // 2. Calculate Scale to Fit Canvas
        const canvasSize = 180; // Larger internal resolution for crispness
        const scaleX = canvasSize / paddedWidth;
        const scaleZ = canvasSize / paddedHeight;
        const scale = Math.min(scaleX, scaleZ); // Fit both dimensions

        // 3. Center Offset
        const trackCenterX = minX + trackWidth / 2;
        const trackCenterZ = minZ + trackHeight / 2;

        let frameId: number;

        const render = () => {
            if (!engine.running && !engine.finished) {
                // keep drawing even if paused
            }

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();

            // Transform Space:
            ctx.translate(canvasSize / 2, canvasSize / 2);
            ctx.scale(scale, scale);
            ctx.translate(-trackCenterX, -trackCenterZ);

            // --- DRAW TRACK ---
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // 1. Track Border (Dark Outline)
            ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
            ctx.lineWidth = 220;
            ctx.beginPath();
            ctx.moveTo(map[0].x, map[0].z);
            for (let i = 1; i < map.length; i++) ctx.lineTo(map[i].x, map[i].z);
            ctx.closePath();
            ctx.stroke();

            // 2. Track Body (Grey Asphalt)
            ctx.strokeStyle = "#555555";
            ctx.lineWidth = 160;
            ctx.stroke();

            // 3. Center Line (Faint)
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 20;
            ctx.setLineDash([100, 150]); // Dashed line
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // --- ANIMATION TIMING ---
            const time = performance.now();

            // --- DRAW PLAYER (Interpolated) ---
            const totalSegs = engine.segments.length;
            const segmentLength = 200; // Constant from engine
            const mapSampleRate = 5;   // Map points are every 5 segments

            // Precise segment position (float)
            const currentSegFloat = (engine.position / segmentLength) % totalSegs;

            // Which map index are we at?
            // map[i] corresponds to segment i * 5
            const mapIndexFloat = currentSegFloat / mapSampleRate;
            const idx1 = Math.floor(mapIndexFloat) % map.length;
            const idx2 = (idx1 + 1) % map.length;
            const t = mapIndexFloat - Math.floor(mapIndexFloat); // Fractional progress (0..1)

            // Interpolate
            const p1 = map[idx1];
            const p2 = map[idx2];

            if (p1 && p2) {
                const px = p1.x + (p2.x - p1.x) * t;
                const pz = p1.z + (p2.z - p1.z) * t;

                // 1. Radar Sweep (Rotating Gradient)
                ctx.save();
                ctx.translate(px, pz);
                ctx.rotate(time * 0.002); // Rotate speed
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
                gradient.addColorStop(0, "rgba(79, 209, 197, 0)");
                gradient.addColorStop(0.5, "rgba(79, 209, 197, 0.1)");
                gradient.addColorStop(1, "rgba(79, 209, 197, 0)");
                ctx.fillStyle = gradient;

                // Draw a wedge or full circle scan
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, 1000, 0, Math.PI / 4); // 45 degree wedge
                ctx.fill();
                ctx.restore();

                // 2. Pulse Ring
                const pulseScale = (Math.sin(time * 0.005) + 1) / 2; // 0..1
                ctx.fillStyle = `rgba(255, 0, 0, ${0.3 - pulseScale * 0.3})`;
                ctx.beginPath();
                ctx.arc(px, pz, 600 + pulseScale * 400, 0, Math.PI * 2);
                ctx.fill();

                // 3. Solid Marker
                ctx.fillStyle = "#ff2222";
                ctx.beginPath();
                ctx.arc(px, pz, 300, 0, Math.PI * 2);
                ctx.fill();

                // 4. White Border
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 80;
                ctx.stroke();
            }

            ctx.restore();

            frameId = requestAnimationFrame(render);
        };

        frameId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(frameId);
    }, [engine]);

    return (
        <div className="relative group">
            {/* 32-bit Pro Frame Container */}
            <div className="
                relative w-[180px] h-[180px] 
                bg-slate-900 
                border-4 border-slate-300 
                shadow-[0_0_0_4px_#1a202c,0_10px_20px_rgba(0,0,0,0.5)] 
                rounded-lg overflow-hidden
            ">
                {/* Tech Grid Background */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#4fd1c5 1px, transparent 1px), linear-gradient(90deg, #4fd1c5 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Canvas */}
                <canvas ref={canvasRef} width={180} height={180} className="relative z-10 block" />

                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] pointer-events-none opacity-50" />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-white z-20" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-white z-20" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-white z-20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-white z-20" />
            </div>

            {/* Label Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-500 shadow-md z-30">
                Course Map
            </div>
        </div>
    );
}
