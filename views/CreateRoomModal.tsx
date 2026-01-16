
import React, { useState, useEffect } from 'react';
import { Room, RoomType, EventMode } from '../types';
import GlassCard from '../components/GlassCard';
import { GlobeIcon, LockIcon, ClipboardIcon } from '../components/icons';

interface CreateRoomModalProps {
  onCreateRoom: (roomData: Omit<Room, 'id' | 'energy' | 'presence'>) => void;
  onClose: () => void;
}

const eventModeDetails = {
    [EventMode.DEFAULT]: "A standard, balanced hangout.",
    [EventMode.CHILL]: "Relaxed atmosphere. Energy builds slowly.",
    [EventMode.DEBATE]: "High-energy discussion. Energy builds quickly.",
    [EventMode.CONFESSION]: "Anonymous messages for open sharing.",
    [EventMode.CHAOS]: "Anything goes. Maximum energy, maximum fun."
};

const generateInviteKey = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onCreateRoom, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RoomType>(RoomType.PUBLIC);
  const [eventMode, setEventMode] = useState<EventMode>(EventMode.DEFAULT);
  const [inviteKey, setInviteKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (type === RoomType.PRIVATE) {
        setInviteKey(generateInviteKey());
    } else {
        setInviteKey('');
    }
  }, [type]);

  const handleCopy = () => {
      if (!inviteKey) return;
      navigator.clipboard.writeText(inviteKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
        alert("Please fill out all fields.");
        return;
    }
    const roomData: Omit<Room, 'id' | 'energy' | 'presence'> = { name, description, type, eventMode };
    if (type === RoomType.PRIVATE) {
        roomData.inviteKey = inviteKey;
    }
    onCreateRoom(roomData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl text-center mb-6">Start a New Hangout</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Hangout Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg neon-input"
              placeholder="e.g., Late Night Study Group"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg neon-input"
              rows={2}
              placeholder="What's the vibe?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Hangout Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={() => setType(RoomType.PUBLIC)} className={`flex items-center justify-center text-center p-4 rounded-lg border-2 transition-all ${type === RoomType.PUBLIC ? 'bg-cyan-500/20 border-cyan-400' : 'border-gray-700 hover:border-gray-500'}`}>
                    <GlobeIcon className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Public</span>
                </button>
                <button type="button" onClick={() => setType(RoomType.PRIVATE)} className={`flex items-center justify-center text-center p-4 rounded-lg border-2 transition-all ${type === RoomType.PRIVATE ? 'bg-purple-500/20 border-purple-400' : 'border-gray-700 hover:border-gray-500'}`}>
                    <LockIcon className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Private (Invite Key)</span>
                </button>
            </div>
          </div>
          
          {type === RoomType.PRIVATE && (
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Invite Key</label>
                <div className="flex items-center space-x-2">
                    <input type="text" readOnly value={inviteKey} className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-lg font-mono tracking-widest" />
                    <button type="button" onClick={handleCopy} className="flex-shrink-0 px-4 py-2 font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                        {copied ? 'Copied!' : <ClipboardIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
          )}

           <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Event Mode</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.values(EventMode).map(mode => (
                    <button type="button" key={mode} onClick={() => setEventMode(mode)} className={`p-3 text-left rounded-lg border-2 transition-all ${eventMode === mode ? 'bg-cyan-500/20 border-cyan-400' : 'border-gray-700 hover:border-gray-500'}`}>
                        <p className="font-semibold text-sm">{mode}</p>
                        <p className="text-xs text-gray-400">{eventModeDetails[mode]}</p>
                    </button>
                ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg neon-button"
          >
            Launch Hangout
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default CreateRoomModal;
