// src/lib/fcm.ts
import { getToken, isSupported } from 'firebase/messaging';
import { messaging } from '@/integrations/firebase/firebase';


export async function fetchFCMToken(): Promise<string | null> {
  const supported = await isSupported();
  if (!supported) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: 'BPzsBAKI5XquWqD6mS_lb1gwMv72ckzkENFP4fnCjaZjrO6jEDJ_7q-s-Ffb9v7roJI2NqmZxKs01s1NUuz43E0',
    });
    return token;
  } catch (error) {
    console.error('FCM token fetch error', error);
    return null;
  }
}
