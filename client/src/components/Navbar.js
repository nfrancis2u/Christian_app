import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Home, MessageCircle, Users, BookOpen, Pray, Settings, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-primary';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">ChristianConnect</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard')}`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/prayers"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/prayers')}`}
            >
              <Pray className="w-5 h-5" />
              <span className="font-medium">Prayers</span>
            </Link>

            <Link
              to="/groups"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/groups')}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Groups</span>
            </Link>

            <Link
              to="/verses"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/verses')}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Verses</span>
            </Link>

            <Link
              to="/messages"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive('/messages')}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || 'User'}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-semibold">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    View Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Link>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;