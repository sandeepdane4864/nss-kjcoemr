
importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

// Read Firebase configuration passed during service worker registration
const params = new URL(self.location.href).searchParams;

const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
  measurementId: params.get('measurementId') || undefined,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error('Firebase configuration is missing from service worker URL.');
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle notifications received while the website is in the background
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'NSS KJCOEMR Update';

  const options = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/favicon.ico',
    data: {
      url: payload.data?.url || '/me',
    },
  };

  return self.registration.showNotification(title, options);
});

// Open the relevant page when the user clicks a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/me',
    self.location.origin
  );

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (windowClients) => {
        for (const client of windowClients) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl.href);
            return client.focus();
          }
        }

        return clients.openWindow(targetUrl.href);
      }
    )
  );
});