import React from 'react';
import { 
  Building2, 
  Bell, 
  PhoneCall, 
  UserCheck, 
  User as UserIcon,
  LogOut,
  ChevronDown,
  Activity
} from 'lucide-react';
import { User } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onOpenSOS: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenNotifications,
  unreadCount,
  onOpenSOS,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: New Premium Healthcare Medical Emblem & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center text-left focus:outline-hidden group cursor-pointer"
            >
              <Logo size="md" />
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-teal-700 ${
                activeTab === 'home' ? 'text-teal-700 font-bold border-b-2 border-teal-600 py-4' : 'py-4'
              }`}
            >
              Healthcare Networks
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-teal-700 ${
                activeTab === 'hospitals' ? 'text-teal-700 font-bold border-b-2 border-teal-600 py-4' : 'py-4'
              }`}
            >
              Find Hospitals & Map
            </button>

            <button
              onClick={() => setActiveTab('patient-dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-teal-700 ${
                activeTab === 'patient-dashboard' ? 'text-teal-700 font-bold border-b-2 border-teal-600 py-4' : 'py-4'
              }`}
            >
              Patient Dashboard
            </button>

            <button
              onClick={() => setActiveTab('hospital-dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-teal-700 ${
                activeTab === 'hospital-dashboard' ? 'text-teal-700 font-bold border-b-2 border-teal-600 py-4' : 'py-4'
              }`}
            >
              Hospital Portal
            </button>

            <button
              onClick={() => setActiveTab('blood-labs')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-teal-700 ${
                activeTab === 'blood-labs' ? 'text-teal-700 font-bold border-b-2 border-teal-600 py-4' : 'py-4'
              }`}
            >
              Blood & Labs
            </button>
          </nav>

          {/* Zone 3: Actions + Login Button / User Name */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real Web Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Real Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Emergency SOS 112 Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-xs transition-colors whitespace-nowrap shrink-0 animate-pulse"
              title="National Emergency 112 & Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS 112</span>
            </button>

            {/* Authentication Section (Login / Sign Up or Real User Name) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold">
                    {currentUser.role === 'patient' ? (
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span className="max-w-[120px] truncate" title={currentUser.name}>
                      {currentUser.name}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'home' ? 'text-teal-700 font-bold' : ''}`}
          >
            Networks
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'hospitals' ? 'text-teal-700 font-bold' : ''}`}
          >
            Hospitals & Map
          </button>
          <button
            onClick={() => setActiveTab('patient-dashboard')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'patient-dashboard' ? 'text-teal-700 font-bold' : ''}`}
          >
            Patient DB
          </button>
          <button
            onClick={() => setActiveTab('hospital-dashboard')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'hospital-dashboard' ? 'text-teal-700 font-bold' : ''}`}
          >
            Hospital Portal
          </button>
          <button
            onClick={() => setActiveTab('blood-labs')}
            className={`px-2 py-1 whitespace-nowrap ${activeTab === 'blood-labs' ? 'text-teal-700 font-bold' : ''}`}
          >
            Blood & Labs
          </button>
        </div>
      </div>
    </header>
  );
};
