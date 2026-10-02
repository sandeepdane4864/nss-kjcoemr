
import { messaging } from '../config/firebaseAdmin.js';

export async function sendPushToUsers(users, { title, body, url = '/me' }) {
  if (!messaging || !users?.length) {
    return { sent: 0 };
  }

  const tokens = [
    ...new Set(
      users.flatMap((user) => user.fcmTokens || []).filter(Boolean)
    ),
  ];

  if (!tokens.length) {
    return { sent: 0 };
  }

  const results = await Promise.allSettled(
    tokens.map((token) =>
      messaging.send({
        token,
        notification: { title, body },
        data: { url },
        webpush: {
          fcmOptions: {
            link: `https://nss-kjcoemr.vercel.app${url}`,
          },
        },
      })
    )
  );

  return {
    sent: results.filter((result) => result.status === 'fulfilled').length,
  };
}