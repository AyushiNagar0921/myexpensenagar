
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileContextType {
  profileExists: boolean;
  setProfileExists: React.Dispatch<React.SetStateAction<boolean>>;
  ensureProfileExists: () => Promise<boolean>;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure user profile exists
  const ensureProfileExists = async (): Promise<boolean> => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error('No authenticated user found');
        return false;
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single();
        
      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userData.user.id }]);
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          return false;
        }
        setProfileExists(true);
        return true;
      }
      
      setProfileExists(!!profileData);
      return !!profileData;
    } catch (error) {
      console.error('Error checking/creating user profile:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profileExists,
        setProfileExists,
        ensureProfileExists,
        isLoading,
        logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
