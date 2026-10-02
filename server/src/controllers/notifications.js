import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { messaging } from '../config/firebaseAdmin.js';

export const saveToken = asyncHandler(async (req, res) => {
  const { token } = z.object({
    token: z.string().min(1).max(4096),
  }).parse(req.body);

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { fcmTokens: token },
  });

  res.json({ message: 'Notification token saved' });
});

export const testNotification = asyncHandler(async (req, res) => {
  if (!messaging) {
    throw new ApiError(503, 'Firebase messaging is not configured');
  }

  const user = await User.findById(req.user._id).select('fcmTokens');

  if (!user?.fcmTokens?.length) {
    throw new ApiError(400, 'No notification token found. Enable notifications first.');
  }

  const results = await Promise.allSettled(
    user.fcmTokens.map((token) =>
      messaging.send({
        token,
        notification: {
          title: 'NSS KJCOEMR',
          body: 'Push notifications are working!',
        },
        webpush: {
          fcmOptions: {
            link: 'https://nss-kjcoemr.vercel.app/me',
          },
        },
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;

  res.json({ message: 'Test notification processed', sent });
});