
import { useState, useEffect, useCallback } from 'react';
import { Room, Message, EventMode } from '../types';

const getPhysicsConfig = (mode: EventMode) => {
    switch(mode) {
        case EventMode.CHILL:
            return { energyGain: 5, energyDecayFactor: 0.96, energyDecayConstant: 0.2 };
        case EventMode.CHAOS:
            return { energyGain: 15, energyDecayFactor: 0.99, energyDecayConstant: 0.05 };
        case EventMode.DEBATE:
            return { energyGain: 12, energyDecayFactor: 0.98, energyDecayConstant: 0.1 };
        case EventMode.CONFESSION:
        case EventMode.DEFAULT:
        default:
            return { energyGain: 10, energyDecayFactor: 0.98, energyDecayConstant: 0.1 };
    }
}

export const useSocialPhysics = (initialRoom: Room, initialMessages: Message[]) => {
    const [energy, setEnergy] = useState(initialRoom.energy);
    const [presence, setPresence] = useState(initialRoom.presence);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    
    const physicsConfig = getPhysicsConfig(initialRoom.eventMode);

    const addMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
        // Adding a message significantly boosts energy based on event mode
        setEnergy(h => Math.min(100, h + physicsConfig.energyGain));
    }, [physicsConfig.energyGain]);

    const boostEnergy = useCallback((amount: number) => {
        setEnergy(h => Math.min(100, h + amount));
    }, []);

    useEffect(() => {
        const physicsInterval = setInterval(() => {
            // Energy decays over time based on event mode
            setEnergy(h => Math.max(0, h * physicsConfig.energyDecayFactor - physicsConfig.energyDecayConstant));
        }, 1500);

        return () => clearInterval(physicsInterval);
    }, [physicsConfig]);

    return { energy, presence, messages, addMessage, isTyping, boostEnergy };
};
