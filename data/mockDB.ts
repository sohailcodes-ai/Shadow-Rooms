
import { User, Room, FriendRequest, UserPresence, RoomType, EventMode, DirectMessage, Activity, WhiteboardPath } from '../types';

// In-memory database
let users: User[] = [];
let rooms: Room[] = [];
let friendRequests: FriendRequest[] = [];
let presences: Record<string, UserPresence> = {};
let directMessages: DirectMessage[] = [];
let activityLog: Activity[] = [];
let whiteboardPaths: WhiteboardPath[] = [];
const MAX_ACTIVITY_LOG = 50;

// --- ACTIVITY LOGGING ---
const logActivity = (text: string) => {
    const newActivity: Activity = { id: `act_${Date.now()}`, text, timestamp: Date.now() };
    activityLog.unshift(newActivity);
    if (activityLog.length > MAX_ACTIVITY_LOG) {
        activityLog.pop();
    }
};

// --- INITIAL MOCK DATA ---
const init = () => {
    if (users.length > 0) return; // Already initialized

    // Create only the admin user
    const adminUser: User = {
        id: 'user_admin',
        name: 'Sohail Ali',
        username: 'sohail',
        email: 'sohailali8480@gmail.com',
        friends: [],
        role: 'admin',
    };
    users.push(adminUser);

    // Create admin presence
    presences[adminUser.id] = {
        status: 'offline',
        lastSeen: Date.now(),
        activity: 'idle'
    };
    
    logActivity("Database initialized for real user data.");
};

init();


// --- USER MANAGEMENT ---
export const getAllUsers = (): User[] => users;
export const findUserById = (id: string): User | undefined => users.find(u => u.id === id);
export const findUserByUsername = (username: string): User | undefined => users.find(u => u.username.toLowerCase() === username.toLowerCase());
export const findUserByEmail = (email: string): User | undefined => users.find(u => u.email.toLowerCase() === email.toLowerCase());
export const searchUsers = (query: string, currentUserId: string): User[] => {
    if (!query) return [];
    return users.filter(u => u.id !== currentUserId && (u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase())));
};
export const addUser = (data: { name: string; username: string; email: string; password?: string }): User => {
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        username: data.username,
        email: data.email,
        friends: [],
        role: 'user',
    };
    users.push(newUser);
    presences[newUser.id] = { status: 'offline', lastSeen: Date.now(), activity: 'idle' };
    logActivity(`New user signed up: ${newUser.name} (@${newUser.username})`);
    return newUser;
};

export const updateUser = (userId: string, data: Partial<Pick<User, 'name' | 'username'>>): User | null => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        return users[userIndex];
    }
    return null;
}

// --- FRIEND MANAGEMENT ---
export const getFriends = (userId: string): User[] => {
    const user = findUserById(userId);
    if (!user) return [];
    return user.friends.map(friendId => findUserById(friendId)).filter((u): u is User => !!u);
};
export const getFriendRequests = (userId: string): FriendRequest[] => friendRequests.filter(req => req.toUserId === userId && req.status === 'pending');
export const sendFriendRequest = (fromUserId: string, toUserId: string): FriendRequest | null => {
    const fromUser = findUserById(fromUserId);
    const toUser = findUserById(toUserId);
    if (!fromUser || !toUser || fromUser.friends.includes(toUserId)) return null;

    const existingRequest = friendRequests.find(r => (r.fromUserId === fromUserId && r.toUserId === toUserId) || (r.fromUserId === toUserId && r.toUserId === fromUserId));
    if (existingRequest) return null;

    const newRequest: FriendRequest = {
        id: `req_${Date.now()}`,
        fromUserId,
        fromUserName: fromUser.name,
        toUserId,
        status: 'pending',
    };
    friendRequests.push(newRequest);
    logActivity(`${fromUser.name} sent a friend request to ${toUser.name}.`);
    return newRequest;
};
export const handleFriendRequest = (requestId: string, action: 'accept' | 'reject'): boolean => {
    const reqIndex = friendRequests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;

    const request = friendRequests[reqIndex];
    const fromUser = findUserById(request.fromUserId);
    const toUser = findUserById(request.toUserId);

    if (action === 'accept') {
        if (fromUser && toUser) {
            fromUser.friends.push(toUser.id);
            toUser.friends.push(fromUser.id);
            friendRequests[reqIndex].status = 'accepted';
            logActivity(`${toUser.name} accepted ${fromUser.name}'s friend request.`);
            return true;
        }
    } else {
        friendRequests[reqIndex].status = 'rejected';
        logActivity(`${toUser?.name} rejected ${fromUser?.name}'s friend request.`);
        return true;
    }
    return false;
};

// --- PRESENCE MANAGEMENT ---
export const getAllPresences = (): Record<string, UserPresence> => presences;
export const getPresence = (userId: string): UserPresence | undefined => presences[userId];
export const updateUserPresence = (userId: string, presenceUpdate: Partial<UserPresence>) => {
    const user = findUserById(userId);
    if (!user) return;

    const oldPresence = presences[userId] ?? { status: 'offline', currentRoomId: null, lastSeen: Date.now(), activity: 'idle' };
    
    // Create a temporary new presence to check against
    const tempNewPresence = { ...oldPresence, ...presenceUpdate };

    if (oldPresence.status === 'offline' && tempNewPresence.status === 'online') {
        logActivity(`${user.name} came online.`);
    }
    if (oldPresence.status === 'online' && tempNewPresence.status === 'offline') {
        logActivity(`${user.name} went offline.`);
    }
    if (!oldPresence.currentRoomId && tempNewPresence.currentRoomId) {
        const room = findRoomById(tempNewPresence.currentRoomId);
        logActivity(`${user.name} joined room: ${room?.name || 'a room'}.`);
    }
    if (oldPresence.currentRoomId && !tempNewPresence.currentRoomId) {
         const room = findRoomById(oldPresence.currentRoomId);
        logActivity(`${user.name} left room: ${room?.name || 'a room'}.`);
    }
    
    presences[userId] = { ...presences[userId], ...presenceUpdate, lastSeen: Date.now() };
};

// --- ROOM MANAGEMENT ---
export const addRoom = (roomData: Omit<Room, 'id'>): Room => {
  const newRoom: Room = {
    ...roomData,
    id: `room_${Date.now()}`,
  };
  rooms.push(newRoom);
  logActivity(`New room created: "${newRoom.name}"`);
  return newRoom;
};
export const findRoomById = (roomId: string): Room | undefined => rooms.find(r => r.id === roomId);
export const getAllRooms = (): Room[] => rooms;

// --- DIRECT MESSAGING ---
const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
};

export const getDirectMessages = (userId1: string, userId2: string): DirectMessage[] => {
    const convId = getConversationId(userId1, userId2);
    const user1ConvId = getConversationId(userId1, userId2);
    const user2ConvId = getConversationId(userId2, userId1);
    
    return directMessages.filter(dm => {
        const dmConvId = getConversationId(dm.fromUserId, dm.toUserId);
        return dmConvId === convId;
    }).sort((a,b) => a.timestamp - b.timestamp);
};

export const sendDirectMessage = (fromUserId: string, toUserId: string, text: string): DirectMessage => {
    const newMessage: DirectMessage = {
        id: `dm_${Date.now()}`,
        fromUserId,
        toUserId,
        text,
        timestamp: Date.now(),
        read: false,
    };
    directMessages.push(newMessage);
    
    // Simulate a reply for demo purposes
    setTimeout(() => {
        if(findUserById(fromUserId)?.email === "sohailali8480@gmail.com") return;
        directMessages.push({
            id: `dm_${Date.now() + 1}`,
            fromUserId: toUserId,
            toUserId: fromUserId,
            text: "lol nice",
            timestamp: Date.now(),
            read: false,
        });
    }, 2000 + Math.random() * 3000);

    return newMessage;
};

// --- WHITEBOARD MANAGEMENT ---
export const getWhiteboardPaths = (): WhiteboardPath[] => [...whiteboardPaths];
export const addWhiteboardPath = (path: WhiteboardPath) => {
    whiteboardPaths.push(path);
};
export const clearWhiteboard = () => {
    whiteboardPaths = [];
    logActivity(`Whiteboard was cleared.`);
};


// --- ACTIVITY LOG ---
export const getActivityLog = (): Activity[] => activityLog;
