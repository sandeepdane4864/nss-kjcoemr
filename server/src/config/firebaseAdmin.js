
import {
  getApps,
  initializeApp,
  cert,
} from 'firebase-admin/app';

import { getMessaging } from 'firebase-admin/messaging';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/\\n/g, '\n')
  .trim();

let messaging = null;

if (projectId && clientEmail && privateKey) {
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

  messaging = getMessaging(app);
} else {
  console.error('Firebase Admin configuration is incomplete:', {
    projectIdPresent: Boolean(projectId),
    clientEmailPresent: Boolean(clientEmail),
    privateKeyPresent: Boolean(privateKey),
  });
}

export { messaging };