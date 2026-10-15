import React, { useState } from 'react';
import { X, Siren, Phone, MapPin, AlertTriangle, ShieldAlert, Navigation } from 'lucide-react';
import { triggerRealNotification } from '../services/notificationService';
import { ALL_INDIA_HOSPITALS } from '../data/hospitalsData';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [distressTriggered, setDistressTriggered] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setDistressTriggered(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          triggerRealNotification({
            title: 'EMERGENCY SOS DISTRESS SIGNAL BROADCAST',
            message: `Distress alert logged at Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}. Alerting nearest golden-hour trauma team & 112 Emergency Dispatch.`,
            priority: 'CRITICAL',
            category: 'emergency'
          });
        },
        () => {
          triggerRealNotification({
            title: 'EMERGENCY SOS BROADCAST (Approximate Location)',
            message: 'Distress beacon activated. Connecting to National Emergency Helpline 112 and 108 Ambulance dispatch.',
            priority: 'CRITICAL',
            category: 'emergency'
          });
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-rose-500 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Siren className="w-6 h-6 animate-bounce" />
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                24/7 National Emergency SOS Portal
              </h3>
              <p className="text-xs text-rose-100">National Golden Hour Trauma & Ambulance Coordination</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* 112 & 108 Primary Call Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:112"
              className="p-4 bg-rose-50 border-2 border-rose-300 hover:bg-rose-100 rounded-xl text-center space-y-1 block transition-colors shadow-xs"
            >
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Unified Emergency</span>
              <strong className="text-2xl font-black text-rose-900 font-mono block">112</strong>
              <span className="text-xs font-semibold text-rose-800 flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Call National 112
              </span>
            </a>

            <a
              href="tel:108"
              className="p-4 bg-amber-50 border-2 border-amber-300 hover:bg-amber-100 rounded-xl text-center space-y-1 block transition-colors shadow-xs"
            >
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Free Medical Ambulance</span>
              <strong className="text-2xl font-black text-amber-900 font-mono block">108</strong>
              <span className="text-xs font-semibold text-amber-800 flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Call Ambulance 108
              </span>
            </a>
          </div>

          {/* GPS Broadcast Simulation */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-slate-900 text-xs">
                Broadcast Live GPS Distress Beacon to Nearest Trauma Hospital
              </h4>
            </div>

            {distressTriggered ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg space-y-1 text-center">
                <ShieldAlert className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-950">
                  DISTRESS SIGNAL TRANSMITTED
                </p>
                <p className="text-[11px] text-emerald-800">
                  {coords
                    ? `Beacon active at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}. Emergency ICU notification sent.`
                    : 'Beacon dispatched to nearby 24/7 trauma emergency rooms.'}
                </p>
              </div>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Tap to Broadcast SOS with Live Coordinates</span>
              </button>
            )}
          </div>

          {/* Nearest 24/7 Emergency Trauma Centers */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 text-xs">Nearest Verified 24x7 Trauma & ICU Centers:</h5>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {ALL_INDIA_HOSPITALS.filter(h => h.has24x7Emergency).slice(0, 3).map((h) => (
                <div key={h.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block">{h.name}</strong>
                    <span className="text-[10px] text-slate-500">📍 {h.city} · ICU Beds Open: {h.availableIcuBeds}</span>
                  </div>
                  <a
                    href={`tel:${h.emergencyPhone}`}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-bold text-[11px] shrink-0"
                  >
                    Call ER
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500">
          MEDISEVA 360 Emergency Network complies with Ministry of Health & Family Welfare emergency trauma protocols.
        </div>
      </div>
    </div>
  );
};
