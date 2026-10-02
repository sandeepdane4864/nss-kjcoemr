importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'nss-kjcoemr.firebaseapp.com',
  projectId: 'nss-kjcoemr',
  storageBucket: 'nss-kjcoemr.firebasestorage.app',
  messagingSenderId: '624766914439',
  appId: 'YOUR_FIREBASE_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'NSS KJCOEMR Update';

  self.registration.showNotification(title, {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/favicon.ico',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      event.notification.data?.url || '/me'
    )
  );
});