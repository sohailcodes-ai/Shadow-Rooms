
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, View } from './types';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import AdminView from './views/AdminView';
import WhiteboardView from './views/WhiteboardView';
import ProfileModal from './views/ProfileModal';
import { CogIcon, UserIcon, PencilIcon } from './components/icons';
import { updateUserPresence } from './data/mockDB';
import DirectMessageView from './components/DirectMessageView';

const ADMIN_EMAIL = 'sohailali8480@gmail.com';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeDms, setActiveDms] = useState<User[]>([]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        updateUserPresence(currentUser.id, { status: 'offline', currentRoomId: null, currentRoomName: null });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser]);
  
  // Set user ID in local storage for other components to access
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('currentUser_id', currentUser.id);
    } else {
        localStorage.removeItem('currentUser_id');
    }
  }, [currentUser]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsProfileDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    updateUserPresence(user.id, { status: 'online' });
    if (user.email === ADMIN_EMAIL) {
      user.role = 'admin';
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (currentUser) {
        updateUserPresence(currentUser.id, { status: 'offline', currentRoomId: null, currentRoomName: null });
    }
    setCurrentUser(null);
    setCurrentView(View.DASHBOARD);
    setIsProfileModalOpen(false);
    setIsProfileDropdownOpen(false);
    setActiveDms([]);
  }, [currentUser]);

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updatedData });
    }
    setIsProfileModalOpen(false);
  };

  const handleOpenDm = useCallback((friend: User) => {
    setActiveDms(currentDms => {
      if (currentDms.some(u => u.id === friend.id)) {
        return currentDms;
      }
      return [...currentDms, friend];
    });
  }, []);

  const handleCloseDm = useCallback((friendId: string) => {
    setActiveDms(currentDms => currentDms.filter(u => u.id !== friendId));
  }, []);

  const renderContent = () => {
    if (!currentUser) {
      return <AuthView onLogin={handleLogin} />;
    }

    switch (currentView) {
      case View.ADMIN:
        return <AdminView />;
      case View.WHITEBOARD:
        return <WhiteboardView />;
      case View.DASHBOARD:
      default:
        return <DashboardView user={currentUser} onOpenDm={handleOpenDm} />;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 antialiased">
      {currentUser && (
        <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 my-2 rounded-2xl">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 onClick={() => setCurrentView(View.DASHBOARD)} className="text-xl tracking-wider neon-text cursor-pointer">Shadow Rooms</h1>
            <nav className="flex items-center space-x-4">
              <button onClick={() => setCurrentView(View.WHITEBOARD)} className="px-3 py-1 text-sm font-semibold bg-pink-600/30 hover:bg-pink-500/30 rounded-lg transition-colors flex items-center gap-2">
                <PencilIcon className="w-4 h-4" /> Whiteboard
              </button>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setCurrentView(currentView === View.ADMIN ? View.DASHBOARD : View.ADMIN)}
                  className="px-3 py-1 text-sm font-semibold bg-purple-600/30 hover:bg-purple-500/30 rounded-lg transition-colors"
                >
                  {currentView === View.ADMIN ? 'Dashboard' : 'Admin'}
                </button>
              )}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileDropdownOpen(prev => !prev)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-black/20">
                    <UserIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium pr-2">Welcome, {currentUser.name}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card p-2 rounded-lg shadow-xl z-20">
                      <button onClick={() => { setIsProfileModalOpen(true); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/10 flex items-center space-x-2">
                          <CogIcon className="w-4 h-4" />
                          <span>Settings</span>
                      </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}
      <main className={`h-screen ${currentUser ? 'pt-20' : ''}`}>
        <div className="h-full overflow-y-auto">
            {isProfileModalOpen && currentUser && (
              <ProfileModal 
                user={currentUser} 
                onUpdateUser={handleUpdateUser} 
                onLogout={handleLogout}
                onClose={() => setIsProfileModalOpen(false)} 
              />
            )}
            {renderContent()}
        </div>
      </main>
      {currentUser && activeDms.length > 0 && (
          <div className="fixed bottom-0 right-4 flex items-end space-x-4 z-[101]">
              {activeDms.map(friend => (
                  <DirectMessageView 
                      key={friend.id}
                      currentUser={currentUser}
                      friend={friend}
                      onClose={() => handleCloseDm(friend.id)}
                  />
              ))}
          </div>
      )}
    </div>
  );
};

export default App;
