"use client";

import { useState, useEffect } from "react";

interface TouchControlsProps {
    onControlChange: (controls: { up: boolean; down: boolean; left: boolean; right: boolean }) => void;
}

export default function TouchControls({ onControlChange }: TouchControlsProps) {
    const [pressed, setPressed] = useState({ up: false, down: false, left: false, right: false });

    useEffect(() => {
        onControlChange(pressed);
    }, [pressed, onControlChange]);

    // Keyboard Sync for Visual Feedback
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': setPressed(p => ({ ...p, up: true })); break;
                case 'ArrowDown': case 's': case 'S': setPressed(p => ({ ...p, down: true })); break;
                case 'ArrowLeft': case 'a': case 'A': setPressed(p => ({ ...p, left: true })); break;
                case 'ArrowRight': case 'd': case 'D': setPressed(p => ({ ...p, right: true })); break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': setPressed(p => ({ ...p, up: false })); break;
                case 'ArrowDown': case 's': case 'S': setPressed(p => ({ ...p, down: false })); break;
                case 'ArrowLeft': case 'a': case 'A': setPressed(p => ({ ...p, left: false })); break;
                case 'ArrowRight': case 'd': case 'D': setPressed(p => ({ ...p, right: false })); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handlePress = (key: 'up' | 'down' | 'left' | 'right', isPressed: boolean) => {
        setPressed(prev => ({ ...prev, [key]: isPressed }));
    };

    const buttonStyle = (isPressed: boolean): React.CSSProperties => ({
        width: 80,
        height: 80,
        borderRadius: '50%', // Circular
        border: '4px solid #333',
        backgroundColor: isPressed ? 'rgba(255, 255, 255, 0.9)' : 'rgba(128, 128, 128, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        imageRendering: 'pixelated',
        transition: 'transform 0.1s, background-color 0.1s',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        boxShadow: isPressed ? 'inset 0 2px 8px rgba(0,0,0,0.5)' : '0 4px 0 #222',
    });

    const arrowStyle: React.CSSProperties = {
        fontSize: 32,
        fontWeight: 'bold', // Heavier font for pixel look
        color: '#222',
        fontFamily: 'monospace',
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(30, 30, 40, 0.6)', // Dark semi-transparent background
        backdropFilter: 'blur(4px)',
        padding: 12,
        borderRadius: 16,
        border: '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: 12,
        pointerEvents: 'auto', // Ensure clicks register
    };

    return (
        <>
            {/* Left Side - Gas & Brake (Vertical) */}
            <div
                className="fixed left-6 bottom-8 z-50"
                style={{ touchAction: 'none' }}
            >
                <div style={{ ...containerStyle, flexDirection: 'column' }}>
                    {/* Gas (Up) */}
                    <div
                        style={buttonStyle(pressed.up)}
                        onMouseDown={() => handlePress('up', true)}
                        onMouseUp={() => handlePress('up', false)}
                        onMouseLeave={() => handlePress('up', false)}
                        onTouchStart={(e) => { e.preventDefault(); handlePress('up', true); }}
                        onTouchEnd={() => handlePress('up', false)}
                    >
                        <span style={arrowStyle}>▲</span>
                    </div>
                    {/* Brake (Down) */}
                    <div
                        style={buttonStyle(pressed.down)}
                        onMouseDown={() => handlePress('down', true)}
                        onMouseUp={() => handlePress('down', false)}
                        onMouseLeave={() => handlePress('down', false)}
                        onTouchStart={(e) => { e.preventDefault(); handlePress('down', true); }}
                        onTouchEnd={() => handlePress('down', false)}
                    >
                        <span style={arrowStyle}>▼</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Left & Right (Horizontal) */}
            <div
                className="fixed right-6 bottom-8 z-50"
                style={{ touchAction: 'none' }}
            >
                <div style={{ ...containerStyle, flexDirection: 'row' }}>
                    {/* Left */}
                    <div
                        style={buttonStyle(pressed.left)}
                        onMouseDown={() => handlePress('left', true)}
                        onMouseUp={() => handlePress('left', false)}
                        onMouseLeave={() => handlePress('left', false)}
                        onTouchStart={(e) => { e.preventDefault(); handlePress('left', true); }}
                        onTouchEnd={() => handlePress('left', false)}
                    >
                        <span style={arrowStyle}>◀</span>
                    </div>
                    {/* Right */}
                    <div
                        style={buttonStyle(pressed.right)}
                        onMouseDown={() => handlePress('right', true)}
                        onMouseUp={() => handlePress('right', false)}
                        onMouseLeave={() => handlePress('right', false)}
                        onTouchStart={(e) => { e.preventDefault(); handlePress('right', true); }}
                        onTouchEnd={() => handlePress('right', false)}
                    >
                        <span style={arrowStyle}>▶</span>
                    </div>
                </div>
            </div>
        </>
    );
}
