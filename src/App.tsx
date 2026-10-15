/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  HeartHandshake, 
  Siren, 
  Video, 
  Activity, 
  Baby, 
  FileBadge, 
  Heart, 
  Radio, 
  Home as HomeIcon, 
  Accessibility,
  Search,
  MapPin,
  Calendar,
  Phone,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { NotificationModal } from './components/NotificationModal';
import { LeafletMap } from './components/LeafletMap';
import { NetworkModal } from './components/NetworkModal';
import { BookingModal } from './components/BookingModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { PatientDashboard } from './components/PatientDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { AuthModal } from './components/AuthModal';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { 
  ALL_INDIA_HOSPITALS, 
  ALL_INDIA_STATES_AND_DISTRICTS,
  HEALTHCARE_NETWORKS, 
  ALL_INDIA_BLOOD_STOCK, 
  ALL_INDIA_LAB_TESTS 
} from './data/hospitalsData';
import { 
  User, 
  Hospital, 
  Doctor, 
  Appointment, 
  PaymentReceipt, 
  AppNotification 
} from './types';
import { getStoredNotifications, triggerRealNotification } from './services/notificationService';
import { getStoredAppointments, getStoredReceipts } from './services/paymentService';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');

  // User Authentication State (Starts clean or loads logged-in user)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mediseva_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed?.name &&
          (parsed.name.toLowerCase().includes('raja') ||
            parsed.name.toLowerCase().includes('chanda') ||
            parsed.name.toLowerCase().includes('rajeswari'))
        ) {
          localStorage.removeItem('mediseva_current_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modals State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeNetworkId, setActiveNetworkId] = useState<string | null>(null);
  
  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState<Hospital | null>(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  // Payment Receipt Modal State
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<PaymentReceipt | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All States');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('All Districts');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // Load initial data
  useEffect(() => {
    setNotifications(getStoredNotifications());
    setAppointments(getStoredAppointments());
    setReceipts(getStoredReceipts());

    const handleNotifUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    const handleAptsUpdate = () => {
      setAppointments(getStoredAppointments());
    };
    const handleReceiptsUpdate = () => {
      setReceipts(getStoredReceipts());
    };

    window.addEventListener('mediseva_notification_added', handleNotifUpdate);
    window.addEventListener('mediseva_appointments_updated', handleAptsUpdate);
    window.addEventListener('mediseva_receipts_updated', handleReceiptsUpdate);

    return () => {
      window.removeEventListener('mediseva_notification_added', handleNotifUpdate);
      window.removeEventListener('mediseva_appointments_updated', handleAptsUpdate);
      window.removeEventListener('mediseva_receipts_updated', handleReceiptsUpdate);
    };
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('mediseva_current_user');
    setCurrentUser(null);
    triggerRealNotification({
      title: 'Signed Out Successfully',
      message: 'You have been signed out. You can browse hospitals or sign back in anytime.',
      priority: 'NORMAL',
      category: 'system'
    });
  };

  const handleStartBooking = (hospital: Hospital, doctor?: Doctor) => {
    setSelectedHospitalForBooking(hospital);
    setSelectedDoctorForBooking(doctor || null);
    setBookingModalOpen(true);
  };

  // Filter hospitals across all states and districts
  const filteredHospitals = ALL_INDIA_HOSPITALS.filter((h) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.district.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q) ||
      h.specialties.some(s => s.toLowerCase().includes(q));

    const matchesState = selectedStateFilter === 'All States' || h.state.toLowerCase() === selectedStateFilter.toLowerCase();
    const matchesDistrict = selectedDistrictFilter === 'All Districts' || h.district.toLowerCase().includes(selectedDistrictFilter.toLowerCase());
    const matchesType = 
      selectedTypeFilter === 'ALL' ||
      (selectedTypeFilter === 'GOVT' && (h.type === 'Government' || h.type === 'Autonomous Institute')) ||
      (selectedTypeFilter === 'PRIVATE' && (h.type === 'Private' || h.type === 'Charitable'));

    return matchesSearch && matchesState && matchesDistrict && matchesType;
  });

  // Map icon component resolver
  const getNetworkIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case 'Pill': return <Pill className="w-5 h-5 text-rose-600" />;
      case 'FlaskConical': return <FlaskConical className="w-5 h-5 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-red-600" />;
      case 'Siren': return <Siren className="w-5 h-5 text-red-600" />;
      case 'Video': return <Video className="w-5 h-5 text-indigo-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-cyan-600" />;
      case 'Baby': return <Baby className="w-5 h-5 text-pink-600" />;
      case 'FileBadge': return <FileBadge className="w-5 h-5 text-violet-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-red-600" />;
      case 'Radio': return <Radio className="w-5 h-5 text-sky-600" />;
      case 'Home': return <HomeIcon className="w-5 h-5 text-emerald-600" />;
      case 'Accessibility': return <Accessibility className="w-5 h-5 text-amber-600" />;
      default: return <Building2 className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadNotificationCount}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: HOME & 15 HEALTHCARE NETWORKS */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-xl border border-teal-900/40">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-400/30 rounded-full text-teal-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Unified Digital Health Mission & 24/7 National Emergency</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                  India’s Complete 24/7 Healthcare Grid & Multi-Hospital Network
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Connect instantly with premier Government Institutes (AIIMS, NIMS, KGH), top private multi-specialties, 24/7 trauma centers, blood banks, and verified specialists across all states in India.
                </p>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('hospitals')}
                    className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Find Hospitals on Interactive Map</span>
                  </button>

                  <button
                    onClick={() => setIsSOSOpen(true)}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Siren className="w-4 h-4" />
                    <span>Emergency 112 Distress</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('patient-dashboard')}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all"
                  >
                    Open Patient Dashboard
                  </button>
                </div>
              </div>

              {/* Stat Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-teal-800/40 text-xs text-slate-300">
                <div>
                  <span className="text-teal-400 font-bold block text-lg font-mono">15,000+</span>
                  <span>Verified Hospitals All-India</span>
                </div>
                <div>
                  <span className="text-teal-400 font-bold block text-lg font-mono">₹5 Lakhs</span>
                  <span>Ayushman Bharat PM-JAY Cover</span>
                </div>
                <div>
                  <span className="text-teal-400 font-bold block text-lg font-mono">100% Real</span>
                  <span>Web Notifications & Live Map</span>
                </div>
                <div>
                  <span className="text-teal-400 font-bold block text-lg font-mono">Online / Offline</span>
                  <span>Pay Online or at Hospital Desk</span>
                </div>
              </div>
            </div>

            {/* 15 Healthcare Networks Grid ("eachand every block open kaavalii") */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Comprehensive Care Ecosystem
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    All 15 Specialized Healthcare Networks
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any network block below to open its dedicated facilities, doctors, filters, and booking portal.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">15 Networks Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {HEALTHCARE_NETWORKS.map((net, idx) => (
                  <div
                    key={net.id}
                    onClick={() => setActiveNetworkId(net.id)}
                    className="group p-5 bg-white border border-slate-200 hover:border-teal-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-200 rounded-xl transition-colors">
                          {getNetworkIcon(net.icon)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-900 px-2 py-0.5 rounded-full transition-colors">
                          {net.badge}
                        </span>
                      </div>

                      <div className="mb-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                          {net.title}
                        </h3>
                        <span className="text-xs font-medium text-teal-700 block mt-0.5">
                          {net.teTitle}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {net.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 text-[11px]">{net.stats}</span>
                      <span className="font-bold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Open Network</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured All-India Hospitals Strip */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Apex Super-Specialty Medical Institutes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Equipped with state-of-the-art robotic suites, trauma emergency, and Ayushman Bharat PM-JAY empanelment.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('hospitals')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>View All on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ALL_INDIA_HOSPITALS.slice(0, 3).map((h) => (
                  <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {h.type}
                      </span>
                      <span className="text-xs font-bold text-slate-700">⭐ {h.rating}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{h.name}</h4>
                    <p className="text-[11px] text-slate-500">📍 {h.city}, {h.state}</p>
                    <div className="flex justify-between text-[11px] pt-2 border-t border-slate-200">
                      <span>Emergency ICU: <strong className="text-emerald-700">{h.availableIcuBeds} Open</strong></span>
                      <button
                        onClick={() => handleStartBooking(h)}
                        className="font-bold text-teal-700 hover:underline"
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: HOSPITALS DIRECTORY & INTERACTIVE LEAFLET MAP */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  All-India Hospital Discovery & Real Interactive Map
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Browse verified public and private hospitals across Delhi, Hyderabad, Bengaluru, Mumbai, Chennai, Kolkata, and more with live bed census.
                </p>
              </div>

              {/* State & District Two-Tier Filter */}
              <div className="flex flex-wrap items-center gap-2">
                {/* State Dropdown */}
                <select
                  value={selectedStateFilter}
                  onChange={(e) => {
                    setSelectedStateFilter(e.target.value);
                    setSelectedDistrictFilter('All Districts');
                  }}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold"
                >
                  <option value="All States">All States of India ({ALL_INDIA_STATES_AND_DISTRICTS.length})</option>
                  {ALL_INDIA_STATES_AND_DISTRICTS.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>

                {/* District Dropdown (Dynamic based on selected state) */}
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold"
                >
                  <option value="All Districts">All Districts</option>
                  {selectedStateFilter !== 'All States' &&
                    ALL_INDIA_STATES_AND_DISTRICTS.find(s => s.state === selectedStateFilter)?.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>

                {/* Type Filter */}
                <div className="flex border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <button
                    onClick={() => setSelectedTypeFilter('ALL')}
                    className={`px-3 py-1.5 font-medium ${selectedTypeFilter === 'ALL' ? 'bg-teal-700 text-white' : 'bg-white text-slate-700'}`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setSelectedTypeFilter('GOVT')}
                    className={`px-3 py-1.5 font-medium ${selectedTypeFilter === 'GOVT' ? 'bg-teal-700 text-white' : 'bg-white text-slate-700'}`}
                  >
                    Govt / AIIMS
                  </button>
                  <button
                    onClick={() => setSelectedTypeFilter('PRIVATE')}
                    className={`px-3 py-1.5 font-medium ${selectedTypeFilter === 'PRIVATE' ? 'bg-teal-700 text-white' : 'bg-white text-slate-700'}`}
                  >
                    Private NABH
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Summary Badge */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-teal-50/60 p-2.5 rounded-xl border border-teal-100">
              <span className="font-semibold text-teal-950">
                Displaying {filteredHospitals.length} verified hospitals in{' '}
                <strong className="text-teal-800">{selectedStateFilter}</strong>
                {selectedDistrictFilter !== 'All Districts' && (
                  <> &gt; <strong className="text-teal-800">{selectedDistrictFilter}</strong></>
                )}
              </span>
              <span className="text-[11px] text-teal-700 font-mono">
                Live OpenStreetMap Markers
              </span>
            </div>

            {/* Interactive Leaflet Map Component */}
            <LeafletMap
              hospitals={filteredHospitals}
              onSelectHospital={(h) => handleStartBooking(h)}
              selectedState={selectedStateFilter}
              selectedDistrict={selectedDistrictFilter}
            />

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospital name, city, or specialty (e.g. AIIMS, Apollo, Cardiology, Oncology, Delhi, Hyderabad)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Hospital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-teal-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          h.type === 'Government' || h.type === 'Autonomous Institute'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {h.type}
                        </span>
                        {h.accreditations.slice(0, 2).map((acc) => (
                          <span key={acc} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {acc}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">⭐ {h.rating}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2">{h.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">📍 {h.address}, {h.city}, {h.state}</p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{h.description}</p>

                    <div className="mt-3 p-2 bg-slate-50 rounded-xl text-xs grid grid-cols-2 gap-2 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Beds</span>
                        <strong className="text-slate-900 font-mono">{h.availableBeds} / {h.totalBeds}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency ICU</span>
                        <strong className="text-emerald-700 font-mono">{h.availableIcuBeds} Open</strong>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600">
                      <span className="font-bold">Specialties:</span> {h.specialties.slice(0, 3).join(', ')}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${h.phone}`}
                      className="text-xs text-slate-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Contact</span>
                    </a>

                    <button
                      onClick={() => handleStartBooking(h)}
                      className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DUAL DASHBOARDS SWITCHER HEADER (2 Dashboards) */}
        {(activeTab === 'patient-dashboard' || activeTab === 'hospital-dashboard') && (
          <div className="mb-6 p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Portals:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('patient-dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'patient-dashboard'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>👤 Patient Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('hospital-dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'hospital-dashboard'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>🏥 Hospital Management Dashboard</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Bed, OPD & Cashier Synchronization Active</span>
            </div>
          </div>
        )}

        {/* VIEW 3: PATIENT DASHBOARD */}
        {activeTab === 'patient-dashboard' && (
          <PatientDashboard
            currentUser={currentUser}
            appointments={appointments}
            receipts={receipts}
            onViewReceipt={(r) => setSelectedReceiptForView(r)}
            onBookNew={() => setActiveTab('hospitals')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* VIEW 4: HOSPITAL PORTAL DASHBOARD */}
        {activeTab === 'hospital-dashboard' && (
          <HospitalDashboard
            currentUser={currentUser}
            appointments={appointments}
            receipts={receipts}
            onViewReceipt={(r) => setSelectedReceiptForView(r)}
          />
        )}

        {/* VIEW 5: BLOOD BANKS & LABS */}
        {activeTab === 'blood-labs' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">National Blood Bank Live Inventory</h2>
              </div>
              <p className="text-xs text-slate-500">
                Live availability units verified under e-Rakt Kosh guidelines. Call licensed blood banks directly for urgent matching.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {ALL_INDIA_BLOOD_STOCK.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.bloodBankName}</h4>
                        <span className="text-[11px] text-slate-500">📍 {item.city}, {item.state}</span>
                      </div>
                      <span className="text-base font-black text-red-600 bg-red-100 px-2.5 py-0.5 rounded font-mono">
                        {item.bloodGroup}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                      <span>Available: <strong className="font-mono">{item.unitsAvailable} Units</strong></span>
                      <a href={`tel:${item.contactNumber}`} className="text-red-700 font-bold hover:underline">
                        Call {item.contactNumber.slice(0, 10)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-slate-900">NABL Accredited Preventive Lab Test Packages</h2>
              </div>
              <p className="text-xs text-slate-500">
                Comprehensive health checkups with certified phlebotomists and free home sample collection.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {ALL_INDIA_LAB_TESTS.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-teal-700">{t.category}</span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{t.testName}</h4>
                      </div>
                      <strong className="text-sm font-mono text-slate-900">₹{t.price}</strong>
                    </div>
                    <p className="text-xs text-slate-500">{t.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">Report in {t.reportWithinHours} hrs · {t.sampleType}</span>
                      <button
                        onClick={() => alert(`Lab Test "${t.testName}" booked for home collection! Contact: ${currentUser?.phone || '+91 98490 12345'}`)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                      >
                        Book Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MEDISEVA 360 24/7</span>
            <span>· Pan-India Healthcare Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>National Emergency: <strong className="text-rose-600">112</strong></span>
            <span>Ambulance: <strong className="text-amber-700">108</strong></span>
            <span>Ayushman Bharat: <strong className="text-teal-700">14555</strong></span>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Fixed Bottom-Right */}
      <FloatingAiAssistant />

      {/* Notification Drawer Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* Auth / Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* 15 Healthcare Networks Detail Modal */}
      <NetworkModal
        networkId={activeNetworkId}
        onClose={() => setActiveNetworkId(null)}
        onBookHospital={(h) => {
          setActiveNetworkId(null);
          handleStartBooking(h);
        }}
        onBookDoctor={(doc) => {
          setActiveNetworkId(null);
          const h = ALL_INDIA_HOSPITALS.find((x) => x.id === doc.hospitalId) || ALL_INDIA_HOSPITALS[0];
          handleStartBooking(h, doc);
        }}
      />

      {/* Smart Appointment Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        hospital={selectedHospitalForBooking}
        doctor={selectedDoctorForBooking}
        currentUser={currentUser}
        onSuccess={() => {
          setAppointments(getStoredAppointments());
          setReceipts(getStoredReceipts());
        }}
      />

      {/* Payment Receipt & Invoice Modal */}
      <PaymentReceiptModal
        receipt={selectedReceiptForView}
        onClose={() => setSelectedReceiptForView(null)}
      />
    </div>
  );
}
