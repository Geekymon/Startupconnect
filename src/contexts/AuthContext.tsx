import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  userType: 'startup' | 'student' | null;
  signIn: (email: string, password: string, type: 'startup' | 'student') => Promise<void>;
  signUp: (email: string, password: string, type: 'startup' | 'student') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'startup' | 'student' | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Get user type from metadata or profile
        getUserType(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id);
      } else {
        setUserType(null);
      }
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

  const signUp = async (email: string, password: string, type: 'startup' | 'student') => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (user) {
      // Create profile with user type
      await supabase.from('user_profiles').insert({
        id: user.id,
        user_type: type,
        email: email,
      });
    }
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
    <AuthContext.Provider value={{ user, userType, signIn, signUp, signOut }}>
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