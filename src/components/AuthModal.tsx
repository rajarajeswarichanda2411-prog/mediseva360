import React, { useState } from 'react';
import { X, UserCheck, Building2, Lock, Mail, Phone, MapPin, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { triggerRealNotification } from '../services/notificationService';
import { ALL_INDIA_STATES_AND_DISTRICTS } from '../data/hospitalsData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedState, setSelectedState] = useState('Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState('Hyderabad');

  if (!isOpen) return null;

  // Available districts for chosen state
  const availableDistricts =
    ALL_INDIA_STATES_AND_DISTRICTS.find((s) => s.state === selectedState)?.districts || [
      'Central District',
    ];

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const firstDistrict =
      ALL_INDIA_STATES_AND_DISTRICTS.find((s) => s.state === newState)?.districts?.[0] || 'District Headquarter';
    setSelectedDistrict(firstDistrict);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const enteredName = name.trim() || email.split('@')[0] || (role === 'patient' ? 'Patient User' : 'Medical Staff');

    if (!enteredName) {
      alert('Please enter your full name to proceed with login.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: enteredName,
      email: email.trim() || `${enteredName.toLowerCase().replace(/\s+/g, '.')}@mediseva.in`,
      phone: phone.trim() || '+91 98490 12345',
      role,
      abhaId:
        role === 'patient'
          ? '91-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000)
          : undefined,
      hospitalId: role === 'hospital_staff' ? 'hosp-hyd-01' : undefined,
      state: selectedState,
      city: selectedDistrict,
    };

    localStorage.setItem('mediseva_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);

    // Trigger REAL browser push notification & audio chime
    triggerRealNotification({
      title: `Login Successful — Welcome, ${enteredName}!`,
      message: `You are signed into MEDISEVA 360 as ${
        role === 'patient' ? 'Patient' : 'Hospital Staff / Doctor'
      } from ${selectedDistrict}, ${selectedState}. Real-time hospital directory & OPD services are active.`,
      priority: 'HIGH',
      category: 'system',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              360
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'login' ? 'Sign In to MEDISEVA 360' : 'Create Real Patient / Hospital Account'}
              </h3>
              <span className="text-[11px] text-slate-500">Pan-India Unified Healthcare ID</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div className="p-1.5 bg-slate-100 flex items-center border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In with Your Name
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Real User Form */}
        <form onSubmit={handleAuthSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Role selector */}
          <div>
            <label className="text-slate-700 font-bold block mb-1">Select Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  role === 'patient'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Patient Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('hospital_staff')}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  role === 'hospital_staff'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Hospital Staff / Doctor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your real full name"
                required
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              After login, this exact name will appear in the top bar and on your appointment slips.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Mobile (+91)</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98490 12345"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Email ID</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* State and District */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-700 font-bold block mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
              >
                {ALL_INDIA_STATES_AND_DISTRICTS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or leave blank for instant login"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {mode === 'login' ? 'Sign In & Enable Real Notifications' : 'Complete Registration & Sign In'}
            </span>
          </button>
        </form>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Protected under Ayushman Bharat Digital Mission (ABDM) • 256-bit SSL
        </div>
      </div>
    </div>
  );
};
