
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import GlassCard from './GlassCard';
import { useFriends } from '../hooks/useFriends';
import { UserPlusIcon, MessageSquareIcon, CheckIcon, XIcon, GlobeIcon, PencilIcon } from './icons';

interface FriendsSidebarProps {
    currentUser: User;
    onJoinRoom: (roomId: string) => void;
    onOpenDm: (friend: User) => void;
}

const FriendBubble: React.FC<{
    friend: any;
    position: { top: string; left: string };
    onClick: () => void;
}> = ({ friend, position, onClick }) => {
    
    const { status, currentRoomId, activity } = friend.presence || {};
    
    const colorClasses = useMemo(() => {
        if (activity === 'drawing') return { bg: 'bg-pink-500', shadow: 'shadow-pink-400' };
        if (currentRoomId) return { bg: 'bg-purple-500', shadow: 'shadow-purple-400' };
        if (status === 'online') return { bg: 'bg-green-500', shadow: 'shadow-green-400' };
        return { bg: 'bg-gray-600', shadow: 'shadow-gray-500' };
    }, [status, currentRoomId, activity]);

    const activityText = () => {
        if (activity === 'drawing') return 'Drawing';
        if (currentRoomId) return 'In Hangout';
        return status;
    };

    return (
        <button
            onClick={onClick}
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center text-center p-1 transition-all duration-500 ease-in-out transform hover:scale-110 focus:scale-110 focus:outline-none ${colorClasses.bg}`}
            style={{ 
                ...position,
                boxShadow: `0 0 15px ${colorClasses.shadow}, inset 0 0 5px rgba(255,255,255,0.3)`,
                transition: 'top 1s ease, left 1s ease, background-color 0.5s ease',
             }}
        >
            <span className="font-bold text-sm truncate">{friend.name}</span>
            <span className="text-xs opacity-80 capitalize">{activityText()}</span>
        </button>
    );
};

const FriendsSidebar: React.FC<FriendsSidebarProps> = ({ currentUser, onJoinRoom, onOpenDm }) => {
    const { friendsWithPresence, requests, searchResults, search, sendRequest, handleRequest, sentRequests } = useFriends(currentUser);
    const [searchQuery, setSearchQuery] = useState('');
    const [positions, setPositions] = useState<Map<string, { top: string; left: string }>>(new Map());
    const [selectedFriend, setSelectedFriend] = useState<any | null>(null);

    useEffect(() => {
        const newPositions = new Map(positions);
        friendsWithPresence.forEach(friend => {
            if (!newPositions.has(friend.id)) {
                newPositions.set(friend.id, {
                    top: `${Math.random() * 75 + 12.5}%`,
                    left: `${Math.random() * 75 + 12.5}%`,
                });
            }
        });
        setPositions(newPositions);
    }, [friendsWithPresence.length]);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        search(e.target.value);
    };

    const FriendActivityButton: React.FC<{friend: any}> = ({ friend }) => {
        const { presence } = friend;
        if (presence?.activity === 'drawing') {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/30 rounded-lg text-pink-300">
                    <PencilIcon className="w-4 h-4"/>
                    <span>Drawing on Whiteboard</span>
                </div>
            )
        }
        if (presence?.currentRoomId) {
             return (
                <button onClick={() => onJoinRoom(presence.currentRoomId)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 rounded-lg text-purple-300">
                    <GlobeIcon className="w-4 h-4"/>
                    Join "{presence.currentRoomName}"
                </button>
            )
        }
        return <p className="text-green-400">Online</p>
    };

    return (
        <GlassCard className="h-full flex flex-col p-4 overflow-hidden">
            <h2 className="text-xl mb-2 text-center">Friends Radar</h2>
            
             <div className="relative w-full aspect-square my-2 rounded-full bg-black/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <div className="absolute w-full h-full rounded-full border border-cyan-400/10"></div>
                <div className="absolute w-2/3 h-2/3 rounded-full border border-cyan-400/10"></div>
                <div className="absolute w-1/3 h-1/3 rounded-full border border-cyan-400/10"></div>
                
                {friendsWithPresence.map(friend => (
                     <FriendBubble 
                        key={friend.id} 
                        friend={friend} 
                        position={positions.get(friend.id) || {top: '50%', left: '50%'}} 
                        onClick={() => setSelectedFriend(friend)}
                    />
                ))}

                <div className="w-16 h-16 rounded-full bg-cyan-400/50 flex flex-col items-center justify-center text-xs shadow-lg shadow-cyan-400/30">
                    <p className="font-bold">You</p>
                </div>
            </div>

            {selectedFriend && (
                 <GlassCard className="absolute inset-0 z-10 m-auto w-64 h-fit p-4 flex flex-col items-center text-center">
                     <h3 className="text-lg font-bold">{selectedFriend.name}</h3>
                     <p className="text-sm text-gray-400">@{selectedFriend.username}</p>
                     
                     <div className="my-4">
                        <FriendActivityButton friend={selectedFriend} />
                     </div>

                     <div className="flex items-center gap-2">
                        <button onClick={() => { onOpenDm(selectedFriend); setSelectedFriend(null); }} className="px-4 py-2 bg-cyan-500/20 rounded-lg text-cyan-300 text-sm">Message</button>
                        <button onClick={() => setSelectedFriend(null)} className="px-4 py-2 bg-gray-500/20 rounded-lg text-gray-300 text-sm">Close</button>
                     </div>
                 </GlassCard>
            )}

            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                <div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Find users by username..."
                        className="w-full pl-3 pr-4 py-2 rounded-lg neon-input text-sm"
                    />
                     {searchQuery && (
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {searchResults.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 bg-white/5 rounded-md">
                                    <p className="font-semibold text-sm">{user.name}</p>
                                    {!currentUser.friends.includes(user.id) && !sentRequests.has(user.id) && (
                                    <button onClick={() => sendRequest(user.id)} className="p-1.5 hover:bg-cyan-500/20 rounded-full transition-colors" title="Send Friend Request">
                                            <UserPlusIcon className="w-4 h-4 text-cyan-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {requests.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Requests</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-md">
                                <p className="font-semibold text-sm">{req.fromUserName}</p>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => handleRequest(req.id, 'accept')} className="p-1.5 bg-green-500/20 hover:bg-green-500/40 rounded-full"><CheckIcon className="w-4 h-4 text-green-300" /></button>
                                    <button onClick={() => handleRequest(req.id, 'reject')} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full"><XIcon className="w-4 h-4 text-red-300" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </GlassCard>
    );
};

export default FriendsSidebar;
