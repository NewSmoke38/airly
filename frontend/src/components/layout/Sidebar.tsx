import React, { useState } from 'react';
import { Home, User, Settings, Upload, Search, Heart, Bookmark, LogOut, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;  
  onPageChange: (page: string) => void; 
  onUploadClick: () => void;  
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onUploadClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Explore' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'saved', icon: Bookmark, label: 'Collections' },
    { id: 'following', icon: Users, label: 'Following' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out z-40 ${
        isHovered ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovered(true)}  // expand sidebar on hover , this is really nice 
      onMouseLeave={() => setIsHovered(false)} // collapse sidebar when mouse leaves 
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span
              className={`font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              CreativeHub
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 shadow-sm border border-amber-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span
                      className={`font-medium transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <button
              onClick={onUploadClick}
              className="w-full flex items-center space-x-3 px-3 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              <Upload className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span
                className={`font-medium transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                Create
              </span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100/50">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-100"
            />
            <div
              className={`transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200 group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <span
              className={`text-sm font-medium transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};