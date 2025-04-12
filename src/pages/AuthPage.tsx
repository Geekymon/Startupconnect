import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Rocket, AtSign, Lock, UserCheck, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading: authLoading, user, userType } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountType, setAccountType] = useState<'startup' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // If already logged in, redirect to appropriate page
      if (userType === 'startup') {
        navigate('/startup-dashboard');
      } else if (userType === 'student') {
        navigate('/internships');
      } else {
        // If user type not determined yet, wait for it
        // This is to handle the case when auth state is still loading
      }
    }
  }, [user, userType, navigate]);

  // Email validation for BITS domains
  const validateBITSEmail = (email: string): boolean => {
    if (accountType === 'startup') {
      const bitsEmailPattern = /@(goa|hyderabad|hyd|pilani)\.bits-pilani\.ac\.in$/i;
      return bitsEmailPattern.test(email);
    }
    return true; // No validation for students
  };

  // Password validation
  const validatePassword = (): boolean => {
    if (!isSignUp) return true;
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // For signup with startup account type, validate BITS email
    if (isSignUp && accountType === 'startup' && !validateBITSEmail(email)) {
      setError('Startup founders must use a valid BITS Pilani email (e.g., f20230233@goa.bits-pilani.ac.in)');
      return;
    }

    // Validate password
    if (!validatePassword()) return;

    setIsSubmitting(true);
    
    try {
      // Set a timeout to show error if it takes too long
      const timeoutId = setTimeout(() => {
        if (isSubmitting) {
          setError('The request is taking longer than expected. Please try again.');
          setIsSubmitting(false);
        }
      }, 8000);

      if (isSignUp) {
        const result = await signUp(email, password, accountType);
        
        clearTimeout(timeoutId);
        
        if (result.error) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
        
        // For signup, auto login instead of showing a message
        const loginResult = await signIn(email, password);
        
        if (loginResult.error) {
          setError(loginResult.error);
          setIsSubmitting(false);
          return;
        }
        
        // The auth state change will handle navigation
      } else {
        // For sign in
        const result = await signIn(email, password);
        
        clearTimeout(timeoutId);
        
        if (result.error) {
          setError(result.error);
          setIsSubmitting(false);
          return;
        }
        
        // Auth state change will navigate automatically
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  // If still checking auth state, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-indigo-500 animate-bounce" />
          <p className="mt-4 text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-indigo-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            {isSignUp ? 'Join BITS Nexus to connect with startups' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-sm font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex justify-between gap-3 p-1 bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setError('');
              }}
              className={`w-1/2 py-2.5 rounded-md text-sm font-medium flex justify-center items-center transition-all duration-200 ${
                accountType === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
            >
              <User className="mr-2 h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('startup');
                setError('');
              }}
              className={`w-1/2 py-2.5 rounded-md text-sm font-medium flex justify-center items-center transition-all duration-200 ${
                accountType === 'startup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-transparent text-gray-300 hover:text-white'
              }`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Startup
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                  placeholder={accountType === 'startup' ? "f20230233@goa.bits-pilani.ac.in" : "Email address"}
                />
              </div>
              {accountType === 'startup' && isSignUp && (
                <p className="mt-1 text-xs text-indigo-400">
                  Must be a valid BITS Pilani email address
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                  placeholder="Password"
                  minLength={8}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white ${
                isSubmitting
                  ? 'bg-indigo-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition duration-150 ease-in-out`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;