
import { useState, useEffect, useCallback } from 'react';
import { User, FriendRequest, UserPresence } from '../types';
import * as DB from '../data/mockDB';

interface FriendsData {
  friendsWithPresence: (User & { presence: UserPresence | undefined })[];
  requests: FriendRequest[];
}

export const useFriends = (currentUser: User) => {
  const [data, setData] = useState<FriendsData>({ friendsWithPresence: [], requests: [] });
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const fetchData = useCallback(() => {
    const friends = DB.getFriends(currentUser.id);
    const friendsWithPresence = friends.map(friend => ({
      ...friend,
      presence: DB.getPresence(friend.id),
    }));
    const requests = DB.getFriendRequests(currentUser.id);
    setData({ friendsWithPresence, requests });
  }, [currentUser.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll for real-time updates
    return () => clearInterval(interval);
  }, [fetchData]);

  const search = (query: string) => {
    const results = DB.searchUsers(query, currentUser.id);
    setSearchResults(results);
  };

  const sendRequest = (toUserId: string) => {
    DB.sendFriendRequest(currentUser.id, toUserId);
    setSentRequests(prev => new Set(prev).add(toUserId));
    // Optimistically remove from search results
    setSearchResults(prev => prev.filter(u => u.id !== toUserId));
  };
  
  const handleRequest = (requestId: string, action: 'accept' | 'reject') => {
    DB.handleFriendRequest(requestId, action);
    fetchData(); // Immediately refetch data after action
  };


  return { ...data, searchResults, search, sendRequest, handleRequest, sentRequests };
};
