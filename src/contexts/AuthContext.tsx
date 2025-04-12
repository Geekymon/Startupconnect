import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  userType: 'startup' | 'student' | null;
  signIn: (email: string, password: string, type: 'startup' | 'student') => Promise<void>;
  signUp: (email: string, password: string, type: 'startup' | 'student') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'startup' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Get user type from metadata or profile
        getUserType(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id);
      } else {
        setUserType(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserType = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    setUserType(data?.user_type || null);
  };

  const validateBITSEmail = (email: string, type: 'startup' | 'student'): boolean => {
    if (type === 'startup') {
      // BITS email domains
      const bitsEmailPattern = /@(goa|hyd|pilani)\.bits-pilani\.ac\.in$/i;
      return bitsEmailPattern.test(email);
    }
    return true; // No validation for students
  };

  const signUp = async (email: string, password: string, type: 'startup' | 'student') => {
    // For startups, validate BITS email
    if (type === 'startup' && !validateBITSEmail(email, type)) {
      return { 
        error: "At least one founder must have a BITS Pilani email (e.g., f20230233@goa.bits-pilani.ac.in)" 
      };
    }

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error: error.message };

    if (user) {
      // Create profile with user type
      await supabase.from('user_profiles').insert({
        id: user.id,
        user_type: type,
        email: email,
      });
    }
    
    return {};
  };

  const signIn = async (email: string, password: string, type: 'startup' | 'student') => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, userType, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};