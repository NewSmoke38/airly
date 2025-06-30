import React, { useState } from 'react';
import { Home, User, Settings, Upload, Search, Heart, Bookmark, LogOut, TrendingUp, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { logout } from '../../features/auth/authSlice';

interface SidebarProps {
  currentPage: string;
  onUploadClick: () => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onUploadClick, 
  isMobileMenuOpen, 
  onCloseMobileMenu 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logout button clicked - clearing local state');
    dispatch(logout());
    console.log('Logout action dispatched - user logged out');
    onCloseMobileMenu(); // Close mobile menu after logout
  };

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'search', icon: Search, label: 'Explore', path: '/search' },
    { id: 'trending', icon: TrendingUp, label: 'Trending', path: '/trending' },
    { id: 'favorites', icon: Heart, label: 'Favorites', path: '/favorites' },
    { id: 'saved', icon: Bookmark, label: 'Collections', path: '/saved' },
    { id: 'following', icon: Users, label: 'Following', path: '/following' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onCloseMobileMenu(); // Close mobile menu after navigation
  };

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out z-50
        
        /* Mobile styles */
        lg:z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isMobileMenuOpen ? 'w-64' : 'w-64 lg:w-16'}
        ${isHovered && !isMobileMenuOpen ? 'lg:w-64' : ''}
        
        /* Desktop hover behavior - only on lg+ screens */
        lg:hover:w-64
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span 
              className={`
                font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-opacity duration-300
                ${isMobileMenuOpen || isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
                lg:block
              `}
            >
              CreativeHub
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 shadow-sm border border-amber-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span
                      className={`
                        font-medium transition-opacity duration-300 whitespace-nowrap
                        ${isMobileMenuOpen || isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
                      `}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Upload Button */}
          <div className="mt-8">
            <button
              onClick={onUploadClick}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group ${
                currentPage === 'upload'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
              }`}
            >
              <Upload className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span
                className={`
                  font-medium transition-opacity duration-300 whitespace-nowrap
                  ${isMobileMenuOpen || isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
                `}
              >
                Create
              </span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100/50">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.pfp}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-100 flex-shrink-0"
            />
            <div
              className={`
                transition-opacity duration-300 min-w-0 flex-1
                ${isMobileMenuOpen || isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
              `}
            >
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200 group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <span
              className={`
                text-sm font-medium transition-opacity duration-300 whitespace-nowrap
                ${isMobileMenuOpen || isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
              `}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};