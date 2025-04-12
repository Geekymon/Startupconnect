import React, { useEffect, useState } from 'react';
import { 
  Plus, Users, Briefcase, Clock, UserCheck, UserX, BarChart, 
  Calendar, Eye, PenLine, MessageSquare, BarChart3, TrendingUp, FileText, Radio,
  MapPin, X, ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Application {
  id: number;
  student_name: string;
  student_email: string;
  position: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  student_image?: string;
  skills?: string[];
  rating?: number;
}

interface InternshipPosition {
  id: number;
  title: string;
  applications_count: number;
  status: 'active' | 'closed';
  location: 'Remote' | 'On-campus' | 'Hybrid';
  deadline: string;
  created_at: string;
}

interface Insight {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

const demoApplications: Application[] = [
  {
    id: 1,
    student_name: "Aditya Sharma",
    student_email: "f20230123@goa.bits-pilani.ac.in",
    position: "Machine Learning Engineer",
    status: "pending",
    applied_at: "2025-04-10T14:30:00Z",
    student_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64",
    skills: ["Python", "TensorFlow", "Data Science"],
    rating: 4.8
  },
  {
    id: 2,
    student_name: "Priya Patel",
    student_email: "f20220456@pilani.bits-pilani.ac.in",
    position: "Frontend Developer",
    status: "accepted",
    applied_at: "2025-04-08T09:15:00Z",
    student_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64",
    skills: ["React", "TypeScript", "UI/UX"],
    rating: 4.5
  },
  {
    id: 3,
    student_name: "Rahul Singh",
    student_email: "f20210789@hyderabad.bits-pilani.ac.in",
    position: "Backend Developer",
    status: "rejected",
    applied_at: "2025-04-05T11:45:00Z",
    student_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64",
    skills: ["Node.js", "Express", "MongoDB"],
    rating: 3.9
  },
  {
    id: 4,
    student_name: "Sneha Gupta",
    student_email: "f20230567@goa.bits-pilani.ac.in",
    position: "Data Analyst",
    status: "pending",
    applied_at: "2025-04-11T16:20:00Z",
    student_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64",
    skills: ["SQL", "Python", "Tableau"],
    rating: 4.2
  }
];

const demoPositions: InternshipPosition[] = [
  {
    id: 1,
    title: "Machine Learning Engineer",
    applications_count: 12,
    status: "active",
    location: "Remote",
    deadline: "2025-04-30T23:59:59Z",
    created_at: "2025-04-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Frontend Developer",
    applications_count: 8,
    status: "active",
    location: "Hybrid",
    deadline: "2025-05-15T23:59:59Z",
    created_at: "2025-04-05T09:30:00Z"
  },
  {
    id: 3,
    title: "Backend Developer",
    applications_count: 5,
    status: "closed",
    location: "On-campus",
    deadline: "2025-04-20T23:59:59Z",
    created_at: "2025-03-20T14:45:00Z"
  },
  {
    id: 4,
    title: "Data Analyst",
    applications_count: 7,
    status: "active",
    location: "Remote",
    deadline: "2025-05-10T23:59:59Z",
    created_at: "2025-04-08T11:15:00Z"
  }
];

const insights: Insight[] = [
  {
    label: "Total Applications",
    value: 32,
    change: 12,
    icon: <Users className="h-5 w-5 text-indigo-400" />
  },
  {
    label: "Open Positions",
    value: 4,
    change: 1,
    icon: <Briefcase className="h-5 w-5 text-green-400" />
  },
  {
    label: "Hired Interns",
    value: 8,
    change: 3,
    icon: <UserCheck className="h-5 w-5 text-blue-400" />
  },
  {
    label: "Profile Views",
    value: 245,
    change: 28,
    icon: <Eye className="h-5 w-5 text-purple-400" />
  }
];

const StartupDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>(demoApplications);
  const [positions, setPositions] = useState<InternshipPosition[]>(demoPositions);
  const [showNewPositionModal, setShowNewPositionModal] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'positions'>('overview');

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchPositions();
    }
  }, [user]);

  const fetchApplications = async (): Promise<void> => {
    // In a real app, this would fetch from Supabase
    // For now, we're using the demo data
    setApplications(demoApplications);
  };

  const fetchPositions = async (): Promise<void> => {
    // In a real app, this would fetch from Supabase
    // For now, we're using the demo data
    setPositions(demoPositions);
  };

  const updateApplicationStatus = (id: number, status: 'pending' | 'accepted' | 'rejected'): void => {
    setApplications(prev => 
      prev.map(app => app.id === id ? { ...app, status } : app)
    );
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
    return diffDays;
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
      <div className="mt-4 flex items-center">
        <span className={`flex items-center ${insight.change >= 0 ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
          {insight.change >= 0 ? 
            <TrendingUp className="h-3 w-3 mr-1" /> : 
            <ChevronUp className="h-3 w-3 mr-1 transform rotate-180" />}
          {insight.change >= 0 ? '+' : ''}{insight.change}
        </span>
        <span className="text-gray-500 text-sm ml-1">vs last month</span>
      </div>
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
            <Link to="#" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {applications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {application.student_image && (
                    <img 
                      src={application.student_image} 
                      alt={application.student_name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
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
                    <p className="text-sm text-gray-400 mb-2">{application.position}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">{formatDate(application.applied_at)}</span>
                      </div>
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                    <button className="p-1.5 text-gray-400 hover:text-indigo-400 rounded-md hover:bg-gray-700 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-green-400 rounded-md hover:bg-gray-700 transition-colors">
                      <PenLine className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Activity Timeline */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Radio className="h-5 w-5 mr-2 text-purple-400" />
          Recent Activity
        </h2>
        
        <div className="relative">
          <div className="absolute h-full w-0.5 bg-gray-700 left-2 top-0"></div>
          <div className="space-y-6 ml-8">
            <div className="relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-indigo-500"></div>
              <div>
                <div className="flex justify-between">
                  <p className="text-white font-medium">New application received</p>
                  <span className="text-gray-400 text-sm">2 hours ago</span>
                </div>
                <p className="text-gray-400 text-sm">Aditya Sharma applied for Machine Learning Engineer position</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-green-500"></div>
              <div>
                <div className="flex justify-between">
                  <p className="text-white font-medium">Internship position created</p>
                  <span className="text-gray-400 text-sm">1 day ago</span>
                </div>
                <p className="text-gray-400 text-sm">You created a new Data Analyst position</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
              <div>
                <div className="flex justify-between">
                  <p className="text-white font-medium">Application status updated</p>
                  <span className="text-gray-400 text-sm">2 days ago</span>
                </div>
                <p className="text-gray-400 text-sm">You accepted Priya Patel's application for Frontend Developer</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-yellow-500"></div>
              <div>
                <div className="flex justify-between">
                  <p className="text-white font-medium">Interview scheduled</p>
                  <span className="text-gray-400 text-sm">3 days ago</span>
                </div>
                <p className="text-gray-400 text-sm">Interview scheduled with Rahul Singh for Backend Developer position</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                <option key={pos.id} value={pos.id.toString()}>{pos.title}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {application.student_image && (
                        <img 
                          src={application.student_image} 
                          alt={application.student_name}
                          className="h-10 w-10 rounded-full object-cover mr-3" 
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{application.student_name}</div>
                        <div className="text-sm text-gray-400">{application.student_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {application.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(application.applied_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {application.skills?.map((skill, idx) => (
                        <span 
                          key={`${application.id}-${idx}`}
                          className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
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
                      <button 
                        className="text-indigo-400 hover:text-indigo-300"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  View Applicants
                </button>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-400 rounded-md hover:bg-gray-700 transition-colors">
                    <PenLine className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 transition-colors">
                    <BarChart3 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Form Modal for New Position
  const renderNewPositionModal = (): JSX.Element | null => {
    if (!showNewPositionModal) return null;
    
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
            
            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                // Submit logic would go here
                setShowNewPositionModal(false);
              }}
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Frontend Developer"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <select
                    id="location"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., ₹20,000/month"
                  />
                </div>
                
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., React, TypeScript, Node.js (comma separated)"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Post Position
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

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