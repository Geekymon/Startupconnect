import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Shield, BookOpen, Code, Award, 
  Briefcase, AlertCircle, CheckCircle, UploadCloud,
  ChevronRight, Edit, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadProfile();
  }, [user, navigate, userType]);

  const loadProfile = async () => {
    if (!user || !userType) return;
    
    setIsLoading(true);
    try {
      if (userType === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } else if (userType === 'startup') {
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('owner_id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (userType === 'student') {
      navigate('/profile/student');
    } else if (userType === 'startup') {
      navigate('/register-startup');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setSuccess('Password reset email has been sent to your email address');
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStudentProfileSummary = () => {
    if (!profile) return null;
    
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="mb-6 md:mb-0 md:mr-6 flex flex-col items-center">
            {profile.profile_photo_url ? (
              <img 
                src={profile.profile_photo_url} 
                alt={profile.full_name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-600"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{profile.full_name || 'Profile not complete'}</h2>
              <p className="text-indigo-400 mt-1">{profile.degree} {profile.major}</p>
              {profile.campus && (
                <p className="text-gray-400 text-sm mt-1">
                  BITS Pilani - {profile.campus.charAt(0).toUpperCase() + profile.campus.slice(1)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex-grow">
            {profile.bio ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">About Me</h3>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-center">Your profile is incomplete. Add a bio to tell startups about yourself.</p>
              </div>
            )}
            
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 mt-6">
              {profile.github_url && (
                <a 
                  href={profile.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <Code className="h-5 w-5 mr-1" />
                  GitHub
                </a>
              )}
              
              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <User className="h-5 w-5 mr-1" />
                  LinkedIn
                </a>
              )}
              
              {profile.resume_url && (
                <a 
                  href={profile.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <UploadCloud className="h-5 w-5 mr-1" />
                  Resume
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStartupProfileSummary = () => {
    if (!profile) return null;
    
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="mb-6 md:mb-0 md:mr-6 flex flex-col items-center">
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.name} 
                className="w-32 h-32 rounded-lg object-cover border-4 border-indigo-600"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{profile.name || 'Profile not complete'}</h2>
              <p className="text-indigo-400 mt-1">{profile.domain}</p>
            </div>
          </div>
          
          <div className="flex-grow">
            {profile.summary ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">About The Startup</h3>
                <p className="text-gray-300">{profile.summary}</p>
              </div>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-center">Your startup profile is incomplete. Add a description to tell students about your company.</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-gray-400 text-sm">Founded by</h4>
                <p className="text-white">{profile.founder_name}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Team Size</h4>
                <p className="text-white">{profile.team_size || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Funding Stage</h4>
                <p className="text-white">{profile.funding_stage || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Campus</h4>
                <p className="text-white">
                  {profile.founder_bits_campus ? 
                    `BITS ${profile.founder_bits_campus.charAt(0).toUpperCase() + profile.founder_bits_campus.slice(1)}` : 
                    'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <UploadCloud className="h-5 w-5 mr-1" />
                  Website
                </a>
              )}
              
              {profile.company_linkedin && (
                <a 
                  href={profile.company_linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors"
                >
                  <User className="h-5 w-5 mr-1" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <Settings className="h-8 w-8 mr-3 text-indigo-500" />
        Profile Settings
      </h1>
      
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/50 text-green-200 p-4 rounded-lg mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Profile Summary */}
          {userType === 'student' ? renderStudentProfileSummary() : renderStartupProfileSummary()}
          
          {/* Profile Completion */}
          {profile && (
            <div className="bg-gray-800 rounded-xl p-6 mt-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-indigo-400" />
                Profile Management
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-indigo-400 mr-3" />
                    <span className="text-white font-medium">
                      {userType === 'student' ? 'Edit Student Profile' : 'Edit Startup Profile'}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                
                {userType === 'student' && (
                  <button
                    onClick={() => navigate('/my-applications')}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-indigo-400 mr-3" />
                      <span className="text-white font-medium">My Applications</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                )}
                
                {userType === 'startup' && (
                  <button
                    onClick={() => navigate('/startup-dashboard')}
                    className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-indigo-400 mr-3" />
                      <span className="text-white font-medium">Dashboard</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div>
          {/* Account Settings */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-400" />
              Account Settings
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-white font-medium mb-1">Email</h3>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-indigo-400 mr-3" />
                  <span className="text-white font-medium">Change Password</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 bg-red-900/40 hover:bg-red-900/60 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 text-red-400 mr-3" />
                  <span className="text-red-300 font-medium">Sign Out</span>
                </div>
                <ChevronRight className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>
          
          {/* Account Type */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-400 text-sm">Account Type</h3>
                <p className="text-white font-medium capitalize">
                  {userType || 'Not specified'}
                </p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                userType === 'student' 
                  ? 'bg-blue-900/50 text-blue-200' 
                  : 'bg-green-900/50 text-green-200'
              }`}>
                {userType === 'student' ? 'Student' : 'Startup'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;