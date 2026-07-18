'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { savePushSubscription, sendTestPush } from '@/app/push-actions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushSetup() {
  const [status, setStatus] = useState<'unsupported' | 'default' | 'granted' | 'denied' | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission as 'default' | 'granted' | 'denied');
  }, []);

  async function enableNotifications() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      alert('Push notifications are not configured on this deployment yet.');
      return;
    }

    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await savePushSubscription(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      await sendTestPush();
    } finally {
      setBusy(false);
    }
  }

  if (status === 'unsupported' || status === 'granted' || status === null) return null;

  return (
    <button
      onClick={enableNotifications}
      disabled={busy}
      className="flex items-center gap-2.5 rounded-2xl border border-dashed border-primary bg-secondary px-4 py-3 text-left text-xs font-bold text-secondary-foreground disabled:opacity-60"
    >
      {status === 'denied' ? <BellRing className="h-4 w-4 shrink-0" /> : <Bell className="h-4 w-4 shrink-0" />}
      {status === 'denied'
        ? 'Notifications are blocked — enable them in your browser settings to get reminders.'
        : busy
          ? 'Setting up...'
          : '🔔 Turn on reminders — birthdays, meals, visa, rent, and more.'}
    </button>
  );
}
