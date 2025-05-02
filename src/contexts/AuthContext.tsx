
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: { username?: string; avatar_url?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { username?: string; avatar_url?: string | null }) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully');
      return;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: { username?: string; avatar_url?: string }
  ) => {
    try {
      // Sign up user with optional metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
  
      if (signUpError) throw signUpError;
  
      // Sign in immediately so auth.uid() becomes available
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (signInError) throw signInError;
  
      const signedInUser = signInData.user;
      if (!signedInUser) throw new Error("User not signed in after signup");
  
      // Now safe to upsert profile (RLS will work)
      if (userData && (userData.username || userData.avatar_url)) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signedInUser.id,
            username: userData.username,
            avatar_url: userData.avatar_url,
          });
  
        if (profileError) {
          console.error('Error saving profile data:', profileError.message, profileError.details);
          toast.error('Could not save profile info');
        }
      }
  
      toast.success('Signed up successfully and logged in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    }
  };
  

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  const updateUserProfile = async (data: { username?: string; avatar_url?: string | null }) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data
      });
      
      if (authError) throw authError;
      
      // Also update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          username: data.username,
          avatar_url: data.avatar_url 
        });
      
      if (profileError) throw profileError;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
