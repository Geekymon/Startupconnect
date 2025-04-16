import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  positionId: string;
  positionTitle: string;
  companyName: string;
}

interface StudentProfile {
  full_name: string;
  skills: string[];
  bio: string;
  resume_url: string;
  profile_complete: boolean;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  positionId,
  positionTitle,
  companyName
}) => {
  const { user, ensureUserProfiles } = useAuth();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadStudentProfile();
      checkExistingApplication();
    }
  }, [isOpen, user, positionId]);

  const loadStudentProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First ensure user_profiles exists
      await ensureUserProfiles();
      
      const { data, error } = await supabase
        .from('student_profiles')
        .select('full_name, skills, bio, resume_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Check if profile is complete enough to apply
        const profileComplete = !!(
          data.full_name &&
          data.bio &&
          data.skills && data.skills.length > 0
        );
        
        setStudentProfile({
          ...data,
          profile_complete: profileComplete
        });
      } else {
        setStudentProfile(null);
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      setStudentProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!user || !positionId) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('position_id', positionId)
        .eq('student_id', user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setHasApplied(true);
      } else {
        setHasApplied(false);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !studentProfile?.profile_complete) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Make sure user_profiles exists to avoid RLS issues
      const profileExists = await ensureUserProfiles();
      
      if (!profileExists) {
        throw new Error("Failed to ensure user profiles exist");
      }
      
      // Check again if already applied
      const { data: existingApplications, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('position_id', positionId)
        .eq('student_id', user.id);
      
      if (checkError) throw checkError;
      
      if (existingApplications && existingApplications.length > 0) {
        setError('You have already applied for this position');
        return;
      }
      
      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          position_id: positionId,
          student_id: user.id,
          status: 'pending',
          cover_letter: coverLetter.trim(),
          applied_at: new Date().toISOString()
        });
      
      if (applicationError) {
        console.error("Application error:", applicationError);
        throw applicationError;
      }
      
      setSuccess('Application submitted successfully!');
      setHasApplied(true);
      
      // Close the modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error applying for position:', error);
      
      // More specific error message for RLS issues
      if (error.message.includes("violates row-level security policy")) {
        setError("Permission error: Your user profile may not be properly set up. Please try refreshing the page or contact support.");
      } else {
        setError(error.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProfile = () => {
    onClose();
    navigate('/profile/student');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Apply for Position</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading your profile...</p>
            </div>
          ) : hasApplied ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Already Applied</h3>
              <p className="text-gray-300">You have already applied for this position.</p>
              <button
                onClick={onClose}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : !studentProfile ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Profile Not Found</h3>
              <p className="text-gray-300 mb-6">You need to create a profile before applying for positions.</p>
              <button
                onClick={handleCompleteProfile}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Profile
              </button>
            </div>
          ) : !studentProfile.profile_complete ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Complete Your Profile</h3>
              <p className="text-gray-300 mb-6">Your profile is incomplete. Please fill in the required information before applying.</p>
              <button
                onClick={handleCompleteProfile}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-white mb-1">{positionTitle}</h3>
                  <p className="text-gray-300 text-sm">{companyName}</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-indigo-400 mr-2" />
                    <h3 className="font-semibold text-white">Your Profile</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{studentProfile.full_name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {studentProfile.skills.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {studentProfile.skills.length > 5 && (
                      <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                        +{studentProfile.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-300">
                    Cover Letter <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the company why you're interested in this position and why you're a good fit..."
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {studentProfile.resume_url && (
                  <div className="flex items-center mt-3 text-sm">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-300">Your resume will be included with this application</span>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 bg-red-900/50 text-red-200 p-3 rounded-lg text-sm flex items-start">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mr-2" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mt-4 bg-green-900/50 text-green-200 p-3 rounded-lg text-sm flex items-start">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mr-2" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </div>
                  ) : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;