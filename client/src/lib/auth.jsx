import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api, hasToken, setToken } from './api.js';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from './firebase.js';

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

const STAFF = ['superadmin', 'officer', 'coordinator'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasToken());

  // Enable browser push notifications and save the FCM token.
  const enableNotifications = useCallback(async () => {
    try {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        !('serviceWorker' in navigator)
      ) {
        return false;
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.warn('Firebase VAPID key is missing.');
        return false;
      }

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.info('Notification permission was not granted.');
        return false;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        console.warn('Firebase messaging is not supported.');
        return false;
      }

      // The public service worker cannot read Vite environment variables.
      // Pass the Firebase web-app config through its registration URL.
      const workerParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
      });

      const serviceWorkerRegistration =
        await navigator.serviceWorker.register(
          `/firebase-messaging-sw.js?${workerParams.toString()}`
        );

      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration,
      });

      if (!fcmToken) {
        console.warn('Could not obtain an FCM token.');
        return false;
      }

      await api.post('/notifications/token', {
        token: fcmToken,
      });

      console.info('Push notifications enabled.');
      return true;
    } catch (error) {
      // Notification setup should not prevent normal login.
      console.error('Could not enable notifications:', error);
      return false;
    }
  }, []);

  // Restore the logged-in user on page refresh.
  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      setToken(res.token);
      setUser(res.user);

      // Notification setup failures will not block normal login.
      enableNotifications().catch(() => {});

      return res.user;
    },
    [enableNotifications]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors and clear local authentication.
    }

    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      logout,
      enableNotifications,
      isStaff: Boolean(user && STAFF.includes(user.role)),
      isAdmin: Boolean(
        user && ['superadmin', 'officer'].includes(user.role)
      ),
    }),
    [user, loading, login, logout, enableNotifications]
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}
