import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              CreativeHub
            </span>
          </div>
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        currentPage={getCurrentPage()} 
        onUploadClick={handleUploadClick}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />
      
      {/* Main Content */}
      <main className="
        transition-all duration-300
        pt-16 lg:pt-0
        lg:ml-16
        min-h-screen
      ">
        <div className="p-2 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 