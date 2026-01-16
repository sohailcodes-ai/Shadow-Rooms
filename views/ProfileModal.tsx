
import React, { useState } from 'react';
import { User } from '../types';
import GlassCard from '../components/GlassCard';
import { findUserByUsername, updateUser } from '../data/mockDB';

interface ProfileModalProps {
    user: User;
    onUpdateUser: (updatedData: Partial<User>) => void;
    onLogout: () => void;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdateUser, onLogout, onClose }) => {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (name.trim() && username.trim()) {
            const existingUser = findUserByUsername(username);
            if (existingUser && existingUser.id !== user.id) {
                setError('Username is already taken.');
                return;
            }
            const updatedUser = updateUser(user.id, { name, username });
            if (updatedUser) {
                onUpdateUser(updatedUser);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
                <h2 className="text-2xl text-center mb-6">Profile & Settings</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg neon-input"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg neon-input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <p className="w-full px-3 py-2 bg-black/20 border border-gray-800 rounded-lg text-gray-400">{user.email}</p>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div className="flex space-x-4 pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg neon-button"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t border-red-500/20">
                    <h3 className="text-lg font-semibold text-red-400 text-center">Danger Zone</h3>
                    <div className="mt-4">
                        <button
                            onClick={onLogout}
                            className="w-full py-2 font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>

            </GlassCard>
        </div>
    );
};

export default ProfileModal;
