import { AppNotification, NotificationPriority } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'mediseva_notifications';

// Play an audible Web Audio chime when a real notification arrives
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn('Audio chime playback omitted:', err);
  }
};

export const getStoredNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      const initial: AppNotification[] = [
        {
          id: 'notif-init-1',
          title: 'Welcome to MEDISEVA 360 24/7',
          message: 'Your pan-India healthcare portal is active. You can search verified hospitals, book appointments, and store medical records.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          priority: 'NORMAL',
          read: false,
          category: 'system'
        },
        {
          id: 'notif-init-2',
          title: 'Ayushman Bharat PM-JAY Empanelment Active',
          message: 'Over 27,000+ public and private hospitals accept cashless treatments up to ₹5,00,000. Check eligibility in Network #11.',
          timestamp: '1 hour ago',
          priority: 'NORMAL',
          read: false,
          category: 'health_alert'
        }
      ];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading notifications', err);
    return [];
  }
};

export const saveStoredNotifications = (notifications: AppNotification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed saving notifications', err);
  }
};

// Request real browser Web Push Notification permission
export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission', err);
    return 'denied';
  }
};

// Dispatch real Browser Notification + In-App notification
export const triggerRealNotification = async (params: {
  title: string;
  message: string;
  priority?: NotificationPriority;
  category?: AppNotification['category'];
  actionUrl?: string;
}): Promise<AppNotification> => {
  const { title, message, priority = 'NORMAL', category = 'system', actionUrl } = params;

  // 1. Play audio chime
  playNotificationChime();

  // 2. Trigger native browser notification if granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const nativeNotif = new Notification(`MEDISEVA 360: ${title}`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'mediseva-' + Date.now(),
        requireInteraction: priority === 'CRITICAL'
      });

      nativeNotif.onclick = () => {
        window.focus();
        nativeNotif.close();
      };
    } catch (e) {
      console.warn('Browser native notification dispatch note:', e);
    }
  }

  // 3. Save into in-app store
  const newNotif: AppNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    title,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Just now',
    priority,
    read: false,
    category,
    actionUrl
  };

  const current = getStoredNotifications();
  const updated = [newNotif, ...current];
  saveStoredNotifications(updated);

  // Dispatch custom window event so reactive components update instantly
  window.dispatchEvent(new CustomEvent('mediseva_notification_added', { detail: newNotif }));

  return newNotif;
};
