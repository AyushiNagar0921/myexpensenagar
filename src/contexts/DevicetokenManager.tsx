// src/components/DeviceTokenManager.tsx
import { useStoreDeviceToken } from "@/hooks/fcmtokenmanager/useStoreDeviceToken";

const DeviceTokenManager = () => {
  useStoreDeviceToken();
  return null;
};

export default DeviceTokenManager;
