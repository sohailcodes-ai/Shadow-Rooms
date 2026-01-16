
import { useState, useEffect, useCallback } from 'react';
import { User, DirectMessage } from '../types';
import * as DB from '../data/mockDB';

export const useDms = (currentUser: User, friend: User) => {
    const [messages, setMessages] = useState<DirectMessage[]>([]);

    const fetchMessages = useCallback(() => {
        const dms = DB.getDirectMessages(currentUser.id, friend.id);
        if(dms.length !== messages.length) {
            setMessages(dms);
        }
    }, [currentUser.id, friend.id, messages.length]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // Poll for new messages
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        const newMessage = DB.sendDirectMessage(currentUser.id, friend.id, text);
        setMessages(prev => [...prev, newMessage]);
    };

    return { messages, sendMessage };
};
