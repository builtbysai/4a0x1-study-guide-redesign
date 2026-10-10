import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../store/useAppStore';

export const Layout: React.FC = () => {
  const storageError = useAppStore(s => s.storageError);
  const clearStorageError = useAppStore(s => s.clearStorageError);

  return (
    <div className="min-h-screen bg-appbg flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      {storageError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4">
          <div className="bg-brick text-white text-sm rounded-ctl px-4 py-3 flex items-center gap-3">
            <span className="flex-1">{storageError}</span>
            <button onClick={clearStorageError} className="font-bold text-white/80 hover:text-white flex-shrink-0" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};
