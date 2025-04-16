import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Rocket } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'startup' | 'student';
}

// Using default export to fix the import issue
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredType }) => {
  const { user, userType, isLoading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);
  
  // Handle long-running auth checks
  useEffect(() => {
    // If not loading, auth check is complete
    if (!isLoading) {
      setAuthCheckComplete(true);
      return;
    }
    
    // Add a safety timeout to ensure we don't wait forever
    const timeoutId = setTimeout(() => {
      console.log("⏱️ Auth check timeout reached, proceeding anyway");
      setAuthCheckComplete(true);
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);
  
  // Show loading indicator while auth state is being determined
  // but only for a maximum of 3 seconds (controlled by the effect above)
  if (isLoading && !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-indigo-500 animate-bounce mx-auto mb-4" />
          <p className="text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to auth page
  if (!user) {
    console.log("🔒 Protected route: No user, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  // If a specific user type is required, check it
  if (requiredType && userType !== requiredType) {
    console.log(`🔒 Protected route: User type mismatch. Required: ${requiredType}, Current: ${userType}`);
    return <Navigate to="/" />;
  }

  console.log("✅ Protected route: Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;