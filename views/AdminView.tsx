
import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { UsersIcon, GlobeIcon, FlameIcon } from '../components/icons';
import { User, UserPresence, Activity } from '../types';
import * as DB from '../data/mockDB';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <GlassCard className="transform hover:-translate-y-1 transition-transform">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </GlassCard>
);

const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const AdminView: React.FC = () => {
    const [stats, setStats] = useState({ totalUsers: 0, onlineUsers: 0, activeRooms: 0, avgEnergy: 0 });
    const [users, setUsers] = useState<(User & { presence: UserPresence | undefined })[]>([]);
    const [activity, setActivity] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchData = () => {
            const allUsers = DB.getAllUsers();
            const allRooms = DB.getAllRooms();
            const allPresences = DB.getAllPresences();
            
            const onlineUsers = Object.values(allPresences).filter(p => p.status === 'online').length;
            const avgEnergy = allRooms.length > 0 ? Math.round(allRooms.reduce((sum, room) => sum + room.energy, 0) / allRooms.length) : 0;

            setStats({
                totalUsers: allUsers.length,
                onlineUsers,
                activeRooms: allRooms.length,
                avgEnergy,
            });

            const usersWithPresence = allUsers.map(u => ({ ...u, presence: allPresences[u.id] }));
            setUsers(usersWithPresence);

            const recentActivity = DB.getActivityLog();
            setActivity(recentActivity);
        };

        fetchData();
        const intervalId = setInterval(fetchData, 3000); // Refresh every 3 seconds

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Total Users" value={stats.totalUsers.toString()} color="cyan" />
        <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Online Users" value={stats.onlineUsers.toString()} color="green" />
        <StatCard icon={<GlobeIcon className="w-6 h-6" />} title="Active Rooms" value={stats.activeRooms.toString()} color="purple" />
        <StatCard icon={<FlameIcon className="w-6 h-6" />} title="Avg. Room Energy" value={`${stats.avgEnergy}%`} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">User Overview</h3>
            <div className="overflow-y-auto max-h-96">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-900/50 backdrop-blur-sm">
                        <tr className="border-b border-white/10">
                            <th className="p-2">User</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(user => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-2 font-semibold">
                                    {user.name} <span className="text-gray-400 font-normal">@{user.username}</span>
                                </td>
                                <td className="p-2 text-gray-400">{user.email}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        user.presence?.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {user.presence?.status === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td className="p-2 text-gray-400 text-sm">
                                    {user.presence ? formatTimeAgo(user.presence.lastSeen) : 'N/A'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-4 text-gray-500">No user data available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GlassCard>
        
        <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3 overflow-y-auto max-h-96">
                {activity.length > 0 ? activity.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                        <p className="pr-4">{item.text}</p>
                        <p className="text-gray-500 flex-shrink-0">{formatTimeAgo(item.timestamp)}</p>
                    </div>
                )) : (
                    <p className="text-center p-4 text-gray-500">No recent activity.</p>
                )}
            </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminView;
