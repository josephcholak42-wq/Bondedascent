import webpush from "web-push";
import { storage } from "./storage";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:bonded@ascent.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushToUser(userId: string, title: string, body: string, tag?: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await storage.getPushSubscriptions(userId);
  if (subs.length === 0) return;

  const payload = JSON.stringify({
    title,
    body,
    tag: tag || "bonded-ascent",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/" },
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await storage.deletePushSubscription(sub.endpoint);
      }
    }
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}
