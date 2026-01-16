
import React, { useState } from 'react';
import { User } from '../types';
import GlassCard from '../components/GlassCard';
import { addUser, findUserByUsername, findUserByEmail } from '../data/mockDB';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        const user = findUserByEmail(email);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid credentials. (Hint: any password works for existing users).');
        }
    } else {
        if (!email || !password || !name || !username) {
            setError('Please fill in all fields.');
            return;
        }
        if (findUserByUsername(username)) {
            setError('Username is already taken.');
            return;
        }
        if (findUserByEmail(email)) {
            setError('Email is already registered.');
            return;
        }
        const newUser = addUser({ name, username, email, password });
        onLogin(newUser);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-white tracking-tighter neon-text">Shadow Rooms</h1>
            <p className="text-cyan-300/80 mt-2">The ultimate college hangout.</p>
        </div>
        <GlassCard>
            <h2 className="text-2xl text-center mb-6">{isLogin ? 'Enter the Shadows' : 'Join the Network'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg neon-input"
                        placeholder="Sohail Ali"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg neon-input"
                        placeholder="sohail_ali"
                      />
                    </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg neon-input"
                  placeholder="sohail@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg neon-input"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 font-semibold rounded-lg neon-button"
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-2 font-semibold text-cyan-400 hover:underline">
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default AuthView;
