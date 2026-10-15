import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Volume2, 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Sparkles,
  Trash2
} from 'lucide-react';
import { AppNotification } from '../types';
import { 
  requestBrowserNotificationPermission, 
  triggerRealNotification, 
  playNotificationChime,
  saveStoredNotifications
} from '../services/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setBrowserPermission(res);
    if (res === 'granted') {
      await triggerRealNotification({
        title: 'Real Browser Notifications Enabled!',
        message: 'You will now receive instant desktop & mobile alerts for appointment confirmations, payment receipts, and emergency broadcasts.',
        priority: 'HIGH',
        category: 'system'
      });
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    await triggerRealNotification({
      title: 'Real Web Notification Test Alert',
      message: 'This is a live notification from MEDISEVA 360 24/7! Audio chime was played and notification is registered in both browser and app center.',
      priority: 'HIGH',
      category: 'health_alert'
    });
    setTimeout(() => setIsTesting(false), 800);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notification Centre</h2>
              <span className="text-xs text-slate-500">Live alerts & browser web push</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="p-4 bg-teal-50 border-b border-teal-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-teal-900">
                Browser Web Push Status:{' '}
                <span className={`font-mono uppercase px-1.5 py-0.5 rounded text-[11px] ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {browserPermission}
                </span>
              </p>
              <p className="text-[11px] text-teal-700 mt-1">
                {browserPermission === 'granted'
                  ? 'Real browser notifications are active on this device.'
                  : 'Click enable to receive real system tray & phone notifications.'}
              </p>
            </div>
            {browserPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="shrink-0 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition-colors"
              >
                Enable
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleTestNotification}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-teal-300 hover:bg-teal-100/60 text-teal-900 rounded-md text-xs font-medium shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isTesting ? 'Sending Notification...' : 'Send Test Notification Now'}</span>
            </button>
            <button
              onClick={() => playNotificationChime()}
              className="p-1.5 bg-white border border-teal-300 hover:bg-teal-100/60 text-teal-900 rounded-md text-xs transition-colors"
              title="Test sound chime"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
            </button>
          </div>
        </div>

        {/* Action strip */}
        <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{notifications.length} Total Alerts</span>
          <div className="flex items-center gap-3">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="hover:text-teal-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="hover:text-rose-600 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Use the test button above to verify web notifications.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isCritical = item.priority === 'CRITICAL';
              const isHigh = item.priority === 'HIGH';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg transition-colors mb-1 ${
                    !item.read ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      ) : isHigh ? (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            MEDISEVA 360 Real-Time Web Push Notification Engine
          </p>
        </div>
      </div>
    </div>
  );
};
