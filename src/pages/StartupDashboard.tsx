import React, { useEffect, useState } from 'react';
import { 
  Plus, Users, Briefcase, Clock, UserCheck, UserX, BarChart, 
  Calendar, Eye, PenLine, MessageSquare, BarChart3, TrendingUp, FileText, Radio,
  MapPin, X, ChevronUp, Loader, AlertCircle, Globe, Linkedin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  student_name: string;
  student_email: string;
  position_title: string;
  position_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  student_image?: string;
  skills?: string[];
}

interface InternshipPosition {
  id: string;
  title: string;
  applications_count: number;
  status: 'active' | 'closed';
  location: 'Remote' | 'On-campus' | 'Hybrid';
  deadline: string;
  created_at: string;
  description: string;
  duration: string;
  stipend: string;
  skills: string[];
}

interface Insight {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

const StartupDashboard: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [positions, setPositions] = useState<InternshipPosition[]>([]);
  const [showNewPositionModal, setShowNewPositionModal] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'positions'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [newPosition, setNewPosition] = useState({
    title: '',
    description: '',
    location: 'Remote',
    duration: '3 months',
    stipend: '',
    skills: '',
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  // Default insights with placeholders
  const defaultInsights: Insight[] = [
    {
      label: "Total Applications",
      value: 0,
      change: 0,
      icon: <Users className="h-5 w-5 text-indigo-400" />
    },
    {
      label: "Open Positions",
      value: 0,
      change: 0,
      icon: <Briefcase className="h-5 w-5 text-green-400" />
    },
    {
      label: "Hired Interns",
      value: 0,
      change: 0,
      icon: <UserCheck className="h-5 w-5 text-blue-400" />
    },
    {
      label: "Profile Views",
      value: 0,
      change: 0,
      icon: <Eye className="h-5 w-5 text-purple-400" />
    }
  ];

  // Ensure user profile is loaded
  useEffect(() => {
    const loadProfile = async () => {
      setIsProfileLoading(true);
      if (user) {
        // Make sure we have the profile
        if (!userProfile) {
          await refreshProfile();
        }
        await fetchData();
      }
      setIsProfileLoading(false);
    };
    
    loadProfile();
  }, [user, userProfile]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchApplications(),
        fetchPositions()
      ]);
      
      // Calculate insights after data is loaded
      updateInsights();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    
    try {
      // Use the RPC function to get applications for this startup owner
      const { data, error } = await supabase.rpc('get_startup_applications', {
        owner_id: user.id
      });
      
      if (error) throw error;
      
      // Transform data to match our interface
      const formattedApplications = data || [];
      
      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  };

  const fetchPositions = async () => {
    if (!user || !userProfile) return;
    
    try {
      // Get all positions for this startup
      const { data, error } = await supabase
        .from('internship_positions')
        .select('*, applications(count)')
        .eq('startup_id', userProfile.id);
      
      if (error) throw error;
      
      // Transform data to match our interface
      const formattedPositions = data || [];
      
      setPositions(formattedPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  };

  const updateInsights = () => {
    const totalApplications = applications.length;
    const openPositions = positions.filter(p => p.status === 'active').length;
    const hiredInterns = applications.filter(a => a.status === 'accepted').length;
    
    const updatedInsights: Insight[] = [
      {
        label: "Total Applications",
        value: totalApplications,
        change: 0, // We would need historical data for this
        icon: <Users className="h-5 w-5 text-indigo-400" />
      },
      {
        label: "Open Positions",
        value: openPositions,
        change: 0,
        icon: <Briefcase className="h-5 w-5 text-green-400" />
      },
      {
        label: "Hired Interns",
        value: hiredInterns,
        change: 0,
        icon: <UserCheck className="h-5 w-5 text-blue-400" />
      },
      {
        label: "Profile Views",
        value: 0, // Would need a view tracking system
        change: 0,
        icon: <Eye className="h-5 w-5 text-purple-400" />
      }
    ];
    
    setInsights(updatedInsights);
  };

  const updateApplicationStatus = async (id: string, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      // Update the application status in Supabase
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status } : app)
      );
      
      // Refresh insights
      updateInsights();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const createNewPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!userProfile) {
        // If profile isn't loaded, try to refresh it
        await refreshProfile();
        
        // Check again if we have the profile
        if (!userProfile) {
          throw new Error('User profile not loaded');
        }
      }
      
      // Parse skills from comma-separated string to array
      const skillsArray = newPosition.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Insert new position
      const { data, error } = await supabase
        .from('internship_positions')
        .insert({
          startup_id: userProfile.id, // This should now be available
          title: newPosition.title,
          description: newPosition.description,
          location: newPosition.location,
          duration: newPosition.duration,
          stipend: newPosition.stipend,
          skills: skillsArray,
          status: 'active',
          deadline: new Date(newPosition.deadline).toISOString()
        })
        .select();
      
      if (error) throw error;
      
      // Close modal and refresh positions
      setShowNewPositionModal(false);
      await fetchPositions();
      updateInsights();
      
      // Reset form
      setNewPosition({
        title: '',
        description: '',
        location: 'Remote',
        duration: '3 months',
        stipend: '',
        skills: '',
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      
    } catch (error: any) {
      console.error('Error creating position:', error);
      setError(`Failed to create position: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePositionStatus = async (id: string, status: 'active' | 'closed') => {
    try {
      // Update the position status in Supabase
      const { error } = await supabase
        .from('internship_positions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setPositions(prev => 
        prev.map(pos => pos.id === id ? { ...pos, status } : pos)
      );
      
      // Refresh insights
      updateInsights();
    } catch (error) {
      console.error('Error updating position status:', error);
      alert('Failed to update position status. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Calculate days left until deadline
  const getDaysLeft = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Render insight card
  const renderInsightCard = (insight: Insight): JSX.Element => (
    <div className="bg-gray-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm mb-1">{insight.label}</p>
          <p className="text-3xl font-bold text-white">{insight.value}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-700">{insight.icon}</div>
      </div>
      {insight.change !== 0 && (
        <div className="mt-4 flex items-center">
          <span className={`flex items-center ${insight.change >= 0 ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
            {insight.change >= 0 ? 
              <TrendingUp className="h-3 w-3 mr-1" /> : 
              <ChevronUp className="h-3 w-3 mr-1 transform rotate-180" />}
            {insight.change >= 0 ? '+' : ''}{insight.change}
          </span>
          <span className="text-gray-500 text-sm ml-1">vs last month</span>
        </div>
      )}
    </div>
  );

  // Overview Tab Content
  const renderOverviewTab = (): JSX.Element => (
    <div className="space-y-8">
      {/* Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <div key={index}>
            {renderInsightCard(insight)}
          </div>
        ))}
      </div>
      
      {/* Recent Applications and Active Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-indigo-400" />
              Recent Applications
            </h2>
            <button 
              onClick={() => setSelectedTab('applications')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {applications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {application.student_image ? (
                    <img 
                      src={application.student_image} 
                      alt={application.student_name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {application.student_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white">{application.student_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'pending'
                          ? 'bg-yellow-900/50 text-yellow-200'
                          : application.status === 'accepted'
                          ? 'bg-green-900/50 text-green-200'
                          : 'bg-red-900/50 text-red-200'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{application.position_title}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">{formatDate(application.applied_at)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <UserX className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <p>No applications received yet</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-400" />
              Active Positions
            </h2>
            <button
              onClick={() => setShowNewPositionModal(true)}
              className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </button>
          </div>
          
          <div className="space-y-4">
            {positions.filter(p => p.status === 'active').slice(0, 3).map((position) => (
              <div
                key={position.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white mb-1">{position.title}</h3>
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        position.location === 'Remote' ? 'bg-green-900/50 text-green-200' :
                        position.location === 'On-campus' ? 'bg-blue-900/50 text-blue-200' :
                        'bg-purple-900/50 text-purple-200'
                      }`}>
                        {position.location}
                      </span>
                      <span className="text-gray-400 text-xs ml-2 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {position.applications_count} applicants
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className={`font-medium ${
                        getDaysLeft(position.deadline) > 5 ? 'text-green-400' : 
                        getDaysLeft(position.deadline) > 2 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {getDaysLeft(position.deadline)} days
                      </span>
                      <span className="text-gray-400"> left</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Posted on {formatDate(position.created_at)}</span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => updatePositionStatus(position.id, 'closed')}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 transition-colors"
                      title="Close position"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {positions.filter(p => p.status === 'active').length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                <p>No active positions</p>
                <button
                  onClick={() => setShowNewPositionModal(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Position
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {userProfile ? (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Radio className="h-5 w-5 mr-2 text-purple-400" />
            Startup Profile
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-full md:w-1/3">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="mx-auto h-32 w-32 rounded-lg overflow-hidden bg-white mb-4">
                  <img 
                    src={userProfile.logo_url || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800"} 
                    alt={userProfile.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <h3 className="text-center text-xl font-bold text-white">{userProfile.name}</h3>
                <p className="text-center text-indigo-400 text-sm mb-4">{userProfile.domain}</p>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>BITS Pilani {userProfile.founder_bits_campus ? `(${userProfile.founder_bits_campus.charAt(0).toUpperCase() + userProfile.founder_bits_campus.slice(1)})` : ''}</span>
                  </div>
                  {userProfile.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                        {userProfile.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                  {userProfile.team_size && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userProfile.team_size} team members</span>
                    </div>
                  )}
                  {userProfile.funding_stage && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{userProfile.funding_stage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="bg-gray-700 p-4 rounded-lg h-full">
                <h4 className="font-medium text-white mb-3">About</h4>
                <p className="text-gray-300 mb-6">{userProfile.summary}</p>
                
                <h4 className="font-medium text-white mb-3">Founder</h4>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mr-3">
                    {userProfile.founder_name ? userProfile.founder_name.charAt(0) : ''}
                  </div>
                  <div>
                    <p className="text-white font-medium">{userProfile.founder_name}</p>
                    <p className="text-sm text-gray-400">{userProfile.founder_email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/register-startup')} 
                  className="text-indigo-400 hover:text-indigo-300 flex items-center text-sm mt-auto"
                >
                  <PenLine className="h-4 w-4 mr-1" />
                  Edit Startup Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
            <h3 className="text-xl font-bold text-white mb-2">Complete Your Profile</h3>
            <p className="text-gray-400 mb-6">You need to register your startup details to access all features</p>
            <button
              onClick={() => navigate('/register-startup')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Register Startup
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Applications Tab Content
  const renderApplicationsTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">All Applications</h2>
          <div className="flex items-center space-x-2">
            <select 
              className="bg-gray-700 text-white border border-gray-600 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select 
              className="bg-gray-700 text-white border border-gray-600 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Positions</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {application.student_image ? (
                          <img 
                            src={application.student_image} 
                            alt={application.student_name}
                            className="h-10 w-10 rounded-full object-cover mr-3" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold mr-3">
                            {application.student_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">{application.student_name}</div>
                          <div className="text-sm text-gray-400">{application.student_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {application.position_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(application.applied_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'pending'
                          ? 'bg-yellow-900/50 text-yellow-200'
                          : application.status === 'accepted'
                          ? 'bg-green-900/50 text-green-200'
                          : 'bg-red-900/50 text-red-200'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button 
                              className="text-green-400 hover:text-green-300"
                              onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'accepted' && (
                          <button 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                            Reject
                          </button>
                        )}
                        {application.status === 'rejected' && (
                          <button 
                            className="text-green-400 hover:text-green-300"
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <UserX className="h-12 w-12 mx-auto mb-2 text-gray-600" />
            <p>No applications received yet</p>
            <button
              onClick={() => setSelectedTab('positions')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              Manage Positions
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Positions Tab Content
  const renderPositionsTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">All Positions</h2>
        <button
          onClick={() => setShowNewPositionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Position
        </button>
      </div>
      
      {positions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.map((position) => (
            <div
              key={position.id}
              className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 
                ${position.status === 'closed' ? 'opacity-70' : ''}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white">{position.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    position.status === 'active' ? 'bg-green-900/50 text-green-200' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center mt-3 space-x-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {position.location}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(position.created_at)}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                    position.applications_count > 0 ? 'bg-indigo-900/50 text-indigo-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Applications</span>
                    <p className="text-lg font-semibold text-white">{position.applications_count}</p>
                  </div>
                  
                  <div className="ml-6">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                      getDaysLeft(position.deadline) > 5 ? 'bg-green-900/50 text-green-300' : 
                      getDaysLeft(position.deadline) > 2 ? 'bg-yellow-900/50 text-yellow-300' : 
                      'bg-red-900/50 text-red-300'
                    }`}>
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Deadline</span>
                    <p className="text-lg font-semibold text-white">{formatDate(position.deadline)}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  {position.status === 'active' ? (
                    <button 
                      onClick={() => updatePositionStatus(position.id, 'closed')}
                      className="px-4 py-2 bg-red-600/30 hover:bg-red-700/30 text-red-200 rounded-lg transition-colors"
                    >
                      Close Position
                    </button>
                  ) : (
                    <button 
                      onClick={() => updatePositionStatus(position.id, 'active')}
                      className="px-4 py-2 bg-green-600/30 hover:bg-green-700/30 text-green-200 rounded-lg transition-colors"
                    >
                      Reopen Position
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-xl">
          <Briefcase className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No positions created yet</h3>
          <p className="text-gray-400 mb-6">Start posting internship positions to receive applications</p>
          <button
            onClick={() => setShowNewPositionModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Position
          </button>
        </div>
      )}
    </div>
  );

  // Form Modal for New Position
  const renderNewPositionModal = (): JSX.Element | null => {
    if (!showNewPositionModal) return null;
    
    // If we don't have a user profile yet, show a loading state
    if (isProfileLoading || !userProfile) {
      return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Loading Profile</h2>
              <button 
                onClick={() => setShowNewPositionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-300">Loading your startup profile...</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Post New Internship Position</h2>
              <button 
                onClick={() => setShowNewPositionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-sm font-medium mb-6 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <form 
              className="space-y-6"
              onSubmit={createNewPosition}
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPosition.title}
                  onChange={(e) => setNewPosition({...newPosition, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Frontend Developer"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={newPosition.description}
                  onChange={(e) => setNewPosition({...newPosition, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <select
                    id="location"
                    value={newPosition.location}
                    onChange={(e) => setNewPosition({...newPosition, location: e.target.value as any})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-campus">On-campus</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={newPosition.duration}
                    onChange={(e) => setNewPosition({...newPosition, duration: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="4 months">4 months</option>
                    <option value="5 months">5 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stipend" className="block text-sm font-medium text-gray-300 mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    id="stipend"
                    value={newPosition.stipend}
                    onChange={(e) => setNewPosition({...newPosition, stipend: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., ₹20,000/month"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={newPosition.deadline}
                    onChange={(e) => setNewPosition({...newPosition, deadline: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-1">
                  Required Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  value={newPosition.skills}
                  onChange={(e) => setNewPosition({...newPosition, skills: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., React, TypeScript, Node.js (comma separated)"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPositionModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !userProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : "Post Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Loading state for entire dashboard
  if (isLoading && isProfileLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader className="h-12 w-12 text-indigo-500 animate-spin" />
        <span className="ml-3 text-xl text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Startup Dashboard</h1>
        <button
          onClick={() => setShowNewPositionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Position
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-900/30 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 text-sm underline hover:text-red-100"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-700 mb-8">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`py-3 px-4 border-b-2 font-medium text-sm ${
            selectedTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
          } transition-colors duration-200`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('applications')}
          className={`py-3 px-4 border-b-2 font-medium text-sm ${
            selectedTab === 'applications'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
          } transition-colors duration-200`}
        >
          Applications
        </button>
        <button
          onClick={() => setSelectedTab('positions')}
          className={`py-3 px-4 border-b-2 font-medium text-sm ${
            selectedTab === 'positions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
          } transition-colors duration-200`}
        >
          Positions
        </button>
      </div>
      
      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'applications' && renderApplicationsTab()}
      {selectedTab === 'positions' && renderPositionsTab()}
      
      {/* New Position Modal */}
      {renderNewPositionModal()}
    </div>
  );
};

export default StartupDashboard;