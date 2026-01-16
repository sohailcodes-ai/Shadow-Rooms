
import React, { useRef, useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { User } from '../types';
import { updateUserPresence } from '../data/mockDB';
import { useFriends } from '../hooks/useFriends';

// A placeholder user for the whiteboard view, as it's a global space
const whiteboardUser: User = {
    id: 'whiteboard_user',
    name: 'Whiteboard',
    email: '',
    username: 'whiteboard',
    friends: [],
    role: 'user',
};

const colors = [
  '#00f6ff', '#ff00ff', '#39ff14', '#ffff00', '#ff8000', '#ffffff',
];

const WhiteboardView: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#00f6ff');
    const [strokeWidth, setStrokeWidth] = useState(5);
    
    const { friendsWithPresence } = useFriends(whiteboardUser);

    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleClear,
        cursors,
    } = useWhiteboard(canvasRef);

    useEffect(() => {
        // This is a bit of a hack since we don't have a real currentUser here.
        // In a real app, this would come from a global context.
        const userId = localStorage.getItem('currentUser_id');
        if(userId) {
            updateUserPresence(userId, { activity: 'drawing' });
        }
        return () => {
            if(userId) {
                updateUserPresence(userId, { activity: 'idle' });
            }
        };
    }, []);

    const handleToolClick = (tool: 'pen' | 'eraser') => {
        if (tool === 'eraser') {
            setColor('#0A0A10'); // Background color for erasing
        } else {
            setColor(colors[0]); // Default back to pen
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
            <div className="relative w-full flex-1">
                <canvas
                    ref={canvasRef}
                    onMouseDown={(e) => handleMouseDown(e.nativeEvent, color, strokeWidth)}
                    onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                    onMouseUp={handleMouseUp}
                    onMouseOut={handleMouseUp} // Stop drawing if mouse leaves canvas
                    onTouchStart={(e) => handleMouseDown(e.nativeEvent.touches[0], color, strokeWidth)}
                    onTouchMove={(e) => handleMouseMove(e.nativeEvent.touches[0])}
                    onTouchEnd={handleMouseUp}
                    className="absolute inset-0 w-full h-full bg-black/50 rounded-2xl border border-white/10"
                />
                {/* Render live cursors */}
                {Object.entries(cursors).map(([userId, pos]) => (
                    <div
                        key={userId}
                        className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            backgroundColor: pos.color,
                            boxShadow: `0 0 10px ${pos.color}, 0 0 20px ${pos.color}`,
                            transition: 'left 0.1s linear, top 0.1s linear',
                        }}
                    />
                ))}
            </div>

            <GlassCard className="w-full max-w-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                                />
                            ))}
                        </div>
                        <button onClick={() => handleToolClick('eraser')} className="px-3 py-2 text-sm bg-white/10 rounded-lg">Eraser</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="2"
                            max="30"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            className="w-32"
                        />
                        <button onClick={handleClear} className="px-4 py-2 text-sm bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30">
                            Clear
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default WhiteboardView;
