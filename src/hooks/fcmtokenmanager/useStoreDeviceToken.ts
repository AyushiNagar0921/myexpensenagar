// src/hooks/useStoreDeviceToken.ts
import { useEffect } from 'react';
import { fetchFCMToken } from '@/hooks/fcmtokenmanager/fcm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStoreDeviceToken() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const storeToken = async () => {
      const token = await fetchFCMToken();
      if (!token) return;

      // Optional: Add device info (e.g., platform)
      const deviceInfo = navigator.userAgent;

      const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        token,
        device_info: deviceInfo,
      }, {
        onConflict: 'user_id,token',
      });
    

      if (error) {
        console.error('Failed to save device token:', error.message);
      } else {
        console.log('Device token saved to Supabase');
      }
    };

    storeToken();
  }, [user]);
}
