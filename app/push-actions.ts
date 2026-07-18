'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { sendPushToUser } from '@/lib/push';

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const user = await requireUser();

  await db
    .insert(pushSubscriptions)
    .values({
      userId: user.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    });
}

export async function removePushSubscription(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendTestPush() {
  const user = await requireUser();
  await sendPushToUser(user.userId, {
    title: 'Jolly says hi! 👋',
    body: "Notifications are working — you'll get reminders like this one.",
    url: '/',
  });
}
