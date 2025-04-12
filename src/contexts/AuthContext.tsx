import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  userType: 'startup' | 'student' | null;
  signIn: (email: string, password: string) => Promise<{error?: string}>;
  signUp: (email: string, password: string, type: 'startup' | 'student') => Promise<{ error?: string, success?: boolean }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  userProfile: any | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'startup' | 'student' | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Get user type from metadata first, then from database
          const type = session.user.user_metadata?.user_type as 'startup' | 'student' | null;
          if (type) {
            setUserType(type);
          } else {
            // If not in metadata, try to get from database
            await getUserType(session.user.id);
          }
        } else {
          setUser(null);
          setUserType(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session?.user) {
          setUser(session.user);
          // Get user type from metadata first, then from database
          const type = session.user.user_metadata?.user_type as 'startup' | 'student' | null;
          if (type) {
            console.log("User type from metadata:", type);
            setUserType(type);
          } else {
            // If not in metadata, try to get from database
            await getUserType(session.user.id);
          }
        } else {
          setUser(null);
          setUserType(null);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getUserType = async (userId: string) => {
    try {
      console.log("Getting user type from database for:", userId);
      // Get user type from profile - with a timeout to prevent hanging
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error getting user type:", error);
        return;
      }
      
      if (profileData) {
        console.log("User type from database:", profileData.user_type);
        setUserType(profileData.user_type);
        
        // Update user metadata with this type for future sessions
        await supabase.auth.updateUser({
          data: { user_type: profileData.user_type }
        });
      } else {
        setUserType(null);
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
      setUserType(null);
    }
  };

  const refreshProfile = async () => {
    if (!user || !userType) return;
    
    try {
      if (userType === 'startup') {
        const { data } = await supabase
          .from('startups')
          .select('*')
          .eq('owner_id', user.id)
          .single();
          
        if (data) {
          setUserProfile(data);
        }
      } else if (userType === 'student') {
        const { data } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
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

    try {
      // Create auth user with user_type in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type: type }
        }
      });

      if (error) throw error;
      if (!data.user) {
        return { error: "Failed to create user" };
      }

      console.log("User created:", data.user.id, "Type:", type);

      // Create profile with user type (do this synchronously)
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            user_type: type,
            email: email,
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }

        // If student, create empty student profile
        if (type === 'student') {
          const { error: studentProfileError } = await supabase
            .from('student_profiles')
            .insert({
              id: data.user.id,
              full_name: '',
            });

          if (studentProfileError) {
            console.error("Error creating student profile:", studentProfileError);
          }
        }
      } catch (profileErr) {
        console.error("Error in profile creation:", profileErr);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error instanceof AuthError) {
        return { error: error.message };
      }
      return { error: 'An error occurred during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Check if user has user_type in metadata
        const type = data.user.user_metadata?.user_type as 'startup' | 'student' | null;
        if (type) {
          setUserType(type);
        } else {
          // If not, get from database
          await getUserType(data.user.id);
        }
      }
      
      return {};
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { error: 'An error occurred during sign in' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userType, 
        signIn, 
        signUp, 
        signOut, 
        isLoading,
        userProfile,
        refreshProfile
      }}
    >
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