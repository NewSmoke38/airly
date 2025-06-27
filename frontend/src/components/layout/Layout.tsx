import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'home';
    if (path === '/profile') return 'profile';
    if (path === '/upload') return 'upload';
    if (path === '/search') return 'search';
    if (path === '/trending') return 'trending';
    if (path === '/favorites') return 'favorites';
    if (path === '/saved') return 'saved';
    if (path === '/following') return 'following';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={getCurrentPage()} 
        onUploadClick={handleUploadClick}
      />
      
      <main className="ml-16 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}; 