
import React, { useState, useCallback } from 'react';
import { User, Room, RoomType, EventMode } from '../types';
import GlassCard from '../components/GlassCard';
import RoomView from './RoomView';
import CreateRoomModal from './CreateRoomModal';
import { UsersIcon, FlameIcon, LockIcon, GlobeIcon, ShareIcon } from '../components/icons';
import { findRoomById, addRoom, getAllRooms } from '../data/mockDB';
import FriendsSidebar from '../components/FriendsSidebar';

interface DashboardViewProps {
  user: User;
  onOpenDm: (friend: User) => void;
}

const RingMeter: React.FC<{ progress: number, color: string }> = ({ progress, color }) => {
    const strokeWidth = 5;
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width="60" height="60" viewBox="0 0 60 60" className="transform -rotate-90">
            <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            <circle
                cx="30"
                cy="30"
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
        </svg>
    );
};


const RoomCard: React.FC<{ room: Room; onJoin: (room: Room) => void; onShare: (key: string) => void; copiedKey: string | null; }> = ({ room, onJoin, onShare, copiedKey }) => {
  const energyColor = `hsl(${120 + room.energy}, 100%, 60%)`;

  const handleShareClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (room.inviteKey) {
          onShare(room.inviteKey);
      }
  };

  return (
    <div className="group" style={{ perspective: '1000px' }}>
        <GlassCard 
          onClick={() => onJoin(room)}
          className={`cursor-pointer transform-gpu transition-all duration-300 ease-in-out group-hover:-translate-y-2`}
          style={{boxShadow: `0 0 ${10 + room.energy/2}px ${energyColor}80`, border: `1px solid ${energyColor}40`}}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <RingMeter progress={room.energy} color={energyColor} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {room.type === RoomType.PRIVATE ? <LockIcon className="w-5 h-5 text-gray-400" /> : <GlobeIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                    </div>
                    <h3 className="text-xl truncate">{room.name}</h3>
                </div>
                {room.type === RoomType.PRIVATE && room.inviteKey && (
                    <button onClick={handleShareClick} className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/10 transition-colors">
                        {copiedKey === room.inviteKey ? <span className="text-xs text-cyan-400">Copied!</span> : <ShareIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{room.description}</p>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span>{room.presence} present</span>
                </div>
                 <div className="text-center text-xs font-semibold py-1 px-3 rounded-full bg-black/30">
                    {room.eventMode}
                </div>
            </div>
          </div>
        </GlassCard>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({ user, onOpenDm }) => {
  const [rooms, setRooms] = useState<Room[]>(() => getAllRooms());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateRoom = useCallback((newRoomData: Omit<Room, 'id' | 'energy' | 'presence'>) => {
    const roomWithDefaults = { ...newRoomData, energy: 10, presence: 1 };
    const newRoom = addRoom(roomWithDefaults);
    setRooms(prevRooms => [newRoom, ...prevRooms]);
    setIsCreatingRoom(false);
  }, []);

  const handleShareKey = (key: string) => {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
  };
  
  const handleJoinRoom = (roomId: string) => {
      const roomToJoin = findRoomById(roomId) ?? rooms.find(r => r.id === roomId);
      if (roomToJoin) {
          setSelectedRoom(roomToJoin);
      } else {
          alert("Could not find room.");
      }
  };

  if (selectedRoom) {
      return <RoomView room={selectedRoom} user={user} onExit={() => setSelectedRoom(null)} />;
  }
  
  if(isCreatingRoom) {
      return <CreateRoomModal onCreateRoom={handleCreateRoom} onClose={() => setIsCreatingRoom(false)} />;
  }

  return (
    <div className="container mx-auto h-full flex space-x-4 p-4">
        <main className="flex-1 h-full overflow-y-auto pr-2">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl">Live Hangouts</h2>
                <button 
                    onClick={() => setIsCreatingRoom(true)}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg neon-button"
                >
                    Start a Hangout
                </button>
            </div>
            {rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <RoomCard key={room.id} room={room} onJoin={setSelectedRoom} onShare={handleShareKey} copiedKey={copiedKey} />
                ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <GlassCard className="max-w-md mx-auto">
                        <h3 className="text-2xl font-bold">No Hangouts Yet!</h3>
                        <p className="text-gray-400 mt-2">Be the first to start a hangout and invite your friends from the sidebar.</p>
                        <button 
                            onClick={() => setIsCreatingRoom(true)}
                            className="mt-6 px-6 py-2 rounded-lg neon-button"
                        >
                            Create Hangout
                        </button>
                    </GlassCard>
                </div>
            )}
        </main>
        <aside className="w-80 flex-shrink-0 h-full">
            <FriendsSidebar currentUser={user} onJoinRoom={handleJoinRoom} onOpenDm={onOpenDm} />
        </aside>
    </div>
  );
};

export default DashboardView;
