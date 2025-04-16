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
  ensureUserProfiles: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to add timeout to any promise, with proper type handling
function addTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise.then(result => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise
  ]);
}

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'startup' | 'student' | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initCalled, setInitCalled] = useState<boolean>(false);

  useEffect(() => {
    if (initCalled) return;
    setInitCalled(true);
    
    const initAuth = async () => {
      console.log("🔑 Initializing authentication...");
      setIsLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Error getting session:", sessionError);
          setUser(null);
          setUserType(null);
          setIsLoading(false);
          return;
        }
        
        console.log("📋 Session check:", session ? "User logged in" : "No user logged in");
        
        if (!session?.user) {
          setUser(null);
          setUserType(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Try to get user type from metadata
        const metadataType = session.user.user_metadata?.user_type as 'startup' | 'student' | null;
        
        if (metadataType) {
          console.log("👤 User type from metadata:", metadataType);
          setUserType(metadataType);
          
          // Ensure user_profiles exists
          await ensureUserProfilesExists(session.user.id, session.user.email || '', metadataType);
          setIsLoading(false);
          return;
        }
        
        // If not in metadata, try to get from database
        console.log("🔍 User type not in metadata, checking database...");
        try {
          const dbUserType = await getUserTypeFromDb(session.user.id);
          if (dbUserType) {
            console.log("👤 User type from database:", dbUserType);
            setUserType(dbUserType);
            
            // Update metadata for future sessions
            try {
              await supabase.auth.updateUser({
                data: { user_type: dbUserType }
              });
              console.log("✅ Updated user metadata with user_type");
            } catch (metadataError) {
              console.error("❌ Error updating user metadata:", metadataError);
            }
          } else {
            console.log("⚠️ No user type found in database");
            // Default to student if no type is set
            const defaultType = 'student';
            setUserType(defaultType);
            
            // Create user_profiles entry with default type
            await ensureUserProfilesExists(session.user.id, session.user.email || '', defaultType);
            
            // Update metadata for future sessions
            try {
              await supabase.auth.updateUser({
                data: { user_type: defaultType }
              });
              console.log("✅ Created default user type and updated metadata");
            } catch (metadataError) {
              console.error("❌ Error updating user metadata:", metadataError);
            }
          }
        } catch (typeError) {
          console.error("❌ Error getting user type:", typeError);
          setUserType(null);
        }
      } catch (error) {
        console.error("❌ Error in auth initialization:", error);
      } finally {
        setIsLoading(false);
        console.log("🏁 Auth initialization complete");
      }
    };
    
    // Start the auth initialization process
    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        
        if (session?.user) {
          console.log("👤 User logged in:", session.user.id);
          setUser(session.user);
          
          // Check user type from metadata first
          const metadataType = session.user.user_metadata?.user_type as 'startup' | 'student' | null;
          
          if (metadataType) {
            console.log("👤 User type from metadata:", metadataType);
            setUserType(metadataType);
            await ensureUserProfilesExists(session.user.id, session.user.email || '', metadataType);
          } else {
            try {
              const dbUserType = await getUserTypeFromDb(session.user.id);
              if (dbUserType) {
                setUserType(dbUserType);
              } else {
                // Set default type if not found
                const defaultType = 'student';
                setUserType(defaultType);
                await ensureUserProfilesExists(session.user.id, session.user.email || '', defaultType);
              }
            } catch (error) {
              console.error("❌ Error getting user type on auth change:", error);
              setUserType(null);
            }
          }
        } else {
          console.log("👤 User logged out");
          setUser(null);
          setUserType(null);
          setUserProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initCalled]);

  // Safe database query to get user type
  const getUserTypeFromDb = async (userId: string): Promise<'startup' | 'student' | null> => {
    try {
      // Execute the query
      const query = supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', userId)
        .single();
        
      // Add a timeout
      try {
        const response = await addTimeout(query, 5000);
        return response.data?.user_type as 'startup' | 'student' | null || null;
      } catch (error) {
        console.error("❌ Timeout or error getting user type:", error);
        return null;
      }
    } catch (error) {
      console.error("❌ Error in getUserTypeFromDb:", error);
      return null;
    }
  };

  // Ensure user_profiles record exists
  const ensureUserProfilesExists = async (userId: string, email: string, userType: 'startup' | 'student'): Promise<boolean> => {
    try {
      // Check if user profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("❌ Error checking user profile:", checkError);
        return false;
      }
      
      // If profile exists, no need to create
      if (existingProfile) {
        console.log("✅ User profile already exists");
        return true;
      }
      
      // Create new user profile
      console.log("📝 Creating new user profile for", userId);
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          user_type: userType,
          email: email
        });
        
      if (insertError) {
        console.error("❌ Error creating user profile:", insertError);
        return false;
      }
      
      console.log("✅ Created user profile successfully");
      
      // If student, also ensure student_profiles record exists
      if (userType === 'student') {
        await ensureStudentProfileExists(userId);
      }
      
      return true;
    } catch (error) {
      console.error("❌ Error in ensureUserProfilesExists:", error);
      return false;
    }
  };
  
  // Ensure student_profiles record exists
  const ensureStudentProfileExists = async (userId: string): Promise<boolean> => {
    try {
      // Check if student profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("❌ Error checking student profile:", checkError);
        return false;
      }
      
      // If profile exists, no need to create
      if (existingProfile) {
        console.log("✅ Student profile already exists");
        return true;
      }
      
      // Create new student profile
      console.log("📝 Creating new student profile for", userId);
      const { error: insertError } = await supabase
        .from('student_profiles')
        .insert({
          id: userId,
          full_name: '',
          skills: []
        });
        
      if (insertError) {
        console.error("❌ Error creating student profile:", insertError);
        return false;
      }
      
      console.log("✅ Created student profile successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in ensureStudentProfileExists:", error);
      return false;
    }
  };

  // Public method to ensure user profiles exist
  const ensureUserProfiles = async (): Promise<boolean> => {
    if (!user) return false;
    
    const type = userType || 'student';
    return ensureUserProfilesExists(user.id, user.email || '', type);
  };

  const refreshProfile = async () => {
    if (!user || !userType) return;
    
    try {
      if (userType === 'startup') {
        const query = supabase
          .from('startups')
          .select('*')
          .eq('owner_id', user.id)
          .single();
          
        try {
          const result = await addTimeout(query, 5000);
          if (result.data) {
            setUserProfile(result.data);
          }
        } catch (timeoutError) {
          console.error("❌ Timeout fetching startup profile:", timeoutError);
        }
      } else if (userType === 'student') {
        const query = supabase
          .from('student_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        try {
          const result = await addTimeout(query, 5000);
          if (result.data) {
            setUserProfile(result.data);
          }
        } catch (timeoutError) {
          console.error("❌ Timeout fetching student profile:", timeoutError);
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
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

      console.log("✅ User created:", data.user.id, "Type:", type);

      // Create user_profiles record
      const profileCreated = await ensureUserProfilesExists(data.user.id, email, type);
      
      if (!profileCreated) {
        console.error("⚠️ Failed to create user profile, but auth user was created");
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error signing up:', error);
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
          // Ensure user_profiles exists
          await ensureUserProfilesExists(data.user.id, data.user.email || '', type);
        } else {
          // If not, get from database
          const dbType = await getUserTypeFromDb(data.user.id);
          if (dbType) {
            setUserType(dbType);
          } else {
            // Default to student if no type exists
            const defaultType = 'student';
            setUserType(defaultType);
            await ensureUserProfilesExists(data.user.id, data.user.email || '', defaultType);
            
            // Update user metadata
            await supabase.auth.updateUser({
              data: { user_type: defaultType }
            });
          }
        }
      }
      
      return {};
    } catch (error: any) {
      console.error('❌ Error signing in:', error);
      return { error: 'An error occurred during sign in' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
    }
  };

  const value = {
    user,
    userType,
    signIn,
    signUp,
    signOut,
    isLoading,
    userProfile,
    refreshProfile,
    ensureUserProfiles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Define the useAuth hook as a named export
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}