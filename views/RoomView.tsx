
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Room, User, Message, EventMode, Poll } from '../types';
import GlassCard from '../components/GlassCard';
import { FlameIcon, UsersIcon, SendIcon, ZapIcon, PinIcon, TrophyIcon, SparklesIcon, PollIcon, GamepadIcon } from '../components/icons';
import { useSocialPhysics } from '../hooks/useSocialPhysics';
import PollModal from '../components/PollModal';
import PollView from '../components/PollView';
import { updateUserPresence } from '../data/mockDB';

declare const confetti: any;

const generateColorFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
};

const UserAvatar: React.FC<{ userId: string; userName: string }> = ({ userId, userName }) => {
    const bgColor = generateColorFromId(userId);
    const initial = userName ? userName.charAt(0).toUpperCase() : '?';
    
    return (
        <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0"
            style={{ backgroundColor: bgColor, boxShadow: `0 0 10px ${bgColor}` }}
        >
            {initial}
        </div>
    );
};

const MessageItem: React.FC<{ message: Message; eventMode: EventMode }> = ({ message, eventMode }) => {
    const isConfession = eventMode === EventMode.CONFESSION;
    const displayName = isConfession ? "Anonymous" : message.userName;

    return (
        <div className={`flex items-start space-x-4 p-1 animate-fade-in`}>
             <UserAvatar userId={isConfession ? 'anonymous' : message.userId} userName={displayName} />
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{displayName}</span>
                    <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {message.isPinned && <PinIcon className="w-4 h-4 text-cyan-400" />}
                </div>
                 <div className={`inline-block px-4 py-2 mt-1 rounded-3xl rounded-tl-lg text-gray-200`} style={{backgroundColor: `rgba(26, 25, 54, 0.8)`}}>
                    {message.text}
                </div>
            </div>
        </div>
    );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5 px-4 py-2">
        <span className="text-sm text-gray-400">typing</span>
        <div className="flex items-end h-5 space-x-1">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
        </div>
    </div>
);


const RoomView: React.FC<{ room: Room, user: User, onExit: () => void }> = ({ room, user, onExit }) => {
    const { energy, presence, messages, addMessage, isTyping, boostEnergy } = useSocialPhysics(room, []);
    const [newMessage, setNewMessage] = useState('');
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const energyColor = `hsl(${120 + energy}, 100%, 60%)`;
    const typingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        updateUserPresence(user.id, { currentRoomId: room.id, currentRoomName: room.name, activity: 'idle' });
        return () => {
            updateUserPresence(user.id, { currentRoomId: null, currentRoomName: null, activity: 'idle' });
        };
    }, [user.id, room.id, room.name]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, activePoll, scrollToBottom]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            addMessage({ id: `${Date.now()}`, userId: user.id, userName: user.name, text: newMessage, timestamp: Date.now(), isBoosted: false, isPinned: false });
            setNewMessage('');
            updateUserPresence(user.id, { activity: 'idle' });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };
    
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        updateUserPresence(user.id, { activity: 'typing' });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = window.setTimeout(() => {
            updateUserPresence(user.id, { activity: 'idle' });
        }, 3000);
    };

    const handleConfettiBlast = () => {
        boostEnergy(5);
        if (typeof confetti === 'function') {
            const rect = document.querySelector('.container')?.getBoundingClientRect();
            confetti({ particleCount: 150, spread: 180, origin: { x: (rect?.left || 0 + (rect?.width || 0) / 2) / window.innerWidth, y: 0.6 }});
        }
    };
    
    return (
        <>
            {isPollModalOpen && <PollModal onCreatePoll={(poll) => { setActivePoll({ ...poll, id: `poll_${Date.now()}`, createdBy: user.id }); setIsPollModalOpen(false); boostEnergy(10);}} onClose={() => setIsPollModalOpen(false)} />}
            <div className="flex flex-col h-full container mx-auto p-4">
                <header className="p-4 rounded-t-2xl glass-card border-b-2" style={{borderColor: `${energyColor}50`}}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl">{room.name}</h2>
                            <p className="font-semibold" style={{color: energyColor}}>{room.eventMode}</p>
                        </div>
                        <div className="flex items-center space-x-6">
                             <div className="flex items-center space-x-2" title="Online Users">
                                <UsersIcon className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold">{presence}</span>
                            </div>
                            <div className="flex items-center space-x-2" title="Room Energy">
                                <FlameIcon className="w-5 h-5" style={{ color: energyColor }} />
                                <span className="font-semibold" style={{ color: energyColor, textShadow: `0 0 8px ${energyColor}`}}>{Math.round(energy)}%</span>
                            </div>
                            <button onClick={onExit} className="px-3 py-1 text-sm font-semibold bg-gray-600/50 hover:bg-gray-500/50 rounded-lg transition-colors">Exit</button>
                        </div>
                    </div>
                    <div className="w-full h-1 mt-3 rounded-full bg-black/30">
                        <div className="h-1 rounded-full" style={{ width: `${energy}%`, backgroundColor: energyColor, boxShadow: `0 0 8px ${energyColor}`, transition: 'all 0.5s ease' }}></div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 glass-card rounded-b-2xl bg-black/20">
                    <div className="flex flex-col space-y-2">
                        {messages.map(msg => <MessageItem key={msg.id} message={msg} eventMode={room.eventMode} />)}
                        {activePoll && <PollView poll={activePoll} onVote={(optId) => setActivePoll(p => p && ({ ...p, options: p.options.map(o => o.id === optId ? {...o, votes: o.votes+1} : o)}))} />}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <footer className="mt-4">
                    <GlassCard>
                        {isTyping && <TypingIndicator />}
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                             <div className="flex items-center space-x-1">
                                <button onClick={handleConfettiBlast} type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Confetti Blast"><SparklesIcon className="w-5 h-5 text-pink-400" /></button>
                                <button onClick={() => setIsPollModalOpen(true)} type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Start a Poll"><PollIcon className="w-5 h-5 text-green-400" /></button>
                             </div>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Send a message..."
                                className="w-full px-4 py-3 rounded-lg neon-input"
                            />
                            <button type="submit" className="p-3 rounded-lg neon-button">
                                <SendIcon className="w-6 h-6" />
                            </button>
                        </form>
                    </GlassCard>
                </footer>
            </div>
        </>
    );
};

export default RoomView;
