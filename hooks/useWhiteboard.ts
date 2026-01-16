
import { useState, useEffect, useRef, useCallback } from 'react';
import * as DB from '../data/mockDB';
import { WhiteboardPath } from '../types';

// Helper to get canvas-relative coordinates
const getCoords = (canvas: HTMLCanvasElement, event: { clientX: number; clientY: number }): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
};

export const useWhiteboard = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState<WhiteboardPath[]>([]);
    const [cursors, setCursors] = useState<Record<string, {x: number, y: number, color: string}>>({});
    const currentPathRef = useRef<WhiteboardPath | null>(null);

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        // Resize canvas to fit its container
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#0A0A10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        paths.forEach(path => {
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Neon effect
            ctx.shadowColor = path.color;
            ctx.shadowBlur = path.strokeWidth * 2;

            if (path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y);
                path.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            }
        });

        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

    }, [paths, canvasRef]);
    
    // Fetch and redraw on initial load and when paths change
    useEffect(() => {
        redrawCanvas();
    }, [paths, redrawCanvas]);

    // Poll for changes from the "server" (mockDB)
    useEffect(() => {
        const interval = setInterval(() => {
            const serverPaths = DB.getWhiteboardPaths();
            const serverPresences = DB.getAllPresences();
            
            if (serverPaths.length !== paths.length) {
                setPaths(serverPaths);
            }
            
            const currentUserId = localStorage.getItem('currentUser_id');
            const activeCursors: Record<string, {x: number, y: number, color: string}> = {};
            Object.entries(serverPresences).forEach(([userId, presence]) => {
                if (presence.activity === 'drawing' && presence.cursorPosition && userId !== currentUserId) {
                    activeCursors[userId] = {
                        ...presence.cursorPosition,
                        color: DB.findUserById(userId)?.name ? `#${userId.slice(-6)}` : '#ffffff' // basic color from ID
                    };
                }
            });
            setCursors(activeCursors);

        }, 200); // Poll every 200ms for a near real-time feel
        return () => clearInterval(interval);
    }, [paths.length]);

    const handleMouseDown = (event: { clientX: number; clientY: number }, color: string, strokeWidth: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsDrawing(true);
        const coords = getCoords(canvas, event);
        
        const newPath: WhiteboardPath = {
            id: `path_${Date.now()}`,
            points: [coords],
            color,
            strokeWidth,
        };
        currentPathRef.current = newPath;
    };
    
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
        const canvas = canvasRef.current;
        const userId = localStorage.getItem('currentUser_id');
        if (canvas && userId) {
            const pos = getCoords(canvas, event);
            DB.updateUserPresence(userId, { cursorPosition: pos });
        }
        
        if (!isDrawing || !currentPathRef.current) return;

        if (!canvas) return;
        const coords = getCoords(canvas, event);
        
        currentPathRef.current.points.push(coords);

        // Draw locally for immediate feedback
        const tempPaths = [...paths, currentPathRef.current];
        setPaths(tempPaths);
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentPathRef.current) return;
        setIsDrawing(false);
        
        // "Send" the completed path to the server
        if (currentPathRef.current.points.length > 1) {
            DB.addWhiteboardPath(currentPathRef.current);
        }
        currentPathRef.current = null;
    };

    const handleClear = () => {
        DB.clearWhiteboard();
        setPaths([]);
    };
    
    return { handleMouseDown, handleMouseMove, handleMouseUp, handleClear, cursors };
};
