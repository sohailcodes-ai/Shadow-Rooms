
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { useDms } from '../hooks/useDms';
import { SendIcon, XIcon } from './icons';

interface DirectMessageViewProps {
    currentUser: User;
    friend: User;
    onClose: () => void;
}

const DirectMessageView: React.FC<DirectMessageViewProps> = ({ currentUser, friend, onClose }) => {
    const { messages, sendMessage } = useDms(currentUser, friend);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div className="w-80 h-[28rem] flex flex-col glass-card rounded-t-lg shadow-2xl shadow-cyan-500/20">
            <header className="flex justify-between items-center p-3 rounded-t-lg border-b border-cyan-500/20" style={{background: 'rgba(15, 14, 35, 0.8)'}}>
                <h3 className="font-bold text-white neon-text">{friend.name}</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
                    <XIcon className="w-5 h-5 text-gray-400" />
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col space-y-1">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.fromUserId === currentUser.id ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-3xl ${msg.fromUserId === currentUser.id ? 'bg-cyan-600/80 text-white shadow-lg shadow-cyan-500/30 rounded-br-lg' : 'bg-gray-700/80 text-gray-200 rounded-bl-lg'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <footer className="p-2 border-t border-cyan-500/20" style={{background: 'rgba(15, 14, 35, 0.8)'}}>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-3 py-2 rounded-lg neon-input text-sm"
                        autoFocus
                    />
                    <button type="submit" className="p-2 rounded-lg neon-button">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default DirectMessageView;
