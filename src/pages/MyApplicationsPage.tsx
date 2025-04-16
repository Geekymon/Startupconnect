import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Calendar, Clock, Building2, ExternalLink, 
  Filter, Search, X, CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  cover_letter?: string;
  position: {
    id: string;
    title: string;
    location: string;
    duration: string;
    stipend: string;
    startup: {
      id: string;
      name: string;
      logo_url?: string;
    };
  };
}

const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          cover_letter,
          internship_positions (
            id,
            title,
            location,
            duration,
            stipend,
            startups (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('student_id', user.id)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our interface
      const formattedApplications: Application[] = data.map((item: any) => ({
        id: item.id,
        status: item.status,
        applied_at: item.applied_at,
        cover_letter: item.cover_letter,
        position: {
          id: item.internship_positions.id,
          title: item.internship_positions.title,
          location: item.internship_positions.location,
          duration: item.internship_positions.duration,
          stipend: item.internship_positions.stipend,
          startup: {
            id: item.internship_positions.startups.id,
            name: item.internship_positions.startups.name,
            logo_url: item.internship_positions.startups.logo_url
          }
        }
      }));
      
      setApplications(formattedApplications);
      setFilteredApplications(formattedApplications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError('Failed to load your applications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...applications];
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        app => 
          app.position.title.toLowerCase().includes(searchLower) ||
          app.position.startup.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(result);
  }, [applications, searchTerm, statusFilter]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-200';
      case 'accepted':
        return 'bg-green-900/50 text-green-200';
      case 'rejected':
        return 'bg-red-900/50 text-red-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedApplication(null);
  };

  const renderDetailModal = () => {
    if (!showDetails || !selectedApplication) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl max-w-md w-full shadow-xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Application Details</h2>
            <button
              onClick={closeDetails}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              {selectedApplication.position.startup.logo_url ? (
                <img 
                  src={selectedApplication.position.startup.logo_url}
                  alt={selectedApplication.position.startup.name}
                  className="h-16 w-16 rounded-lg object-cover mr-3"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                  {selectedApplication.position.startup.name.charAt(0)}
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedApplication.position.title}</h3>
                <p className="text-indigo-400">{selectedApplication.position.startup.name}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(selectedApplication.status)}`}>
                {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Applied on</p>
                <p className="text-white">{formatDate(selectedApplication.applied_at)}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white">{selectedApplication.position.location}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white">{selectedApplication.position.duration}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Stipend</p>
                <p className="text-white">{selectedApplication.position.stipend}</p>
              </div>
            </div>
            
            {selectedApplication.cover_letter && (
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <h4 className="text-white font-medium mb-2">Your Cover Letter</h4>
                <p className="text-gray-300 text-sm whitespace-pre-line">{selectedApplication.cover_letter}</p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <div className="text-sm text-gray-400">
                {selectedApplication.status === 'pending' ? (
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> 
                    Awaiting response
                  </span>
                ) : selectedApplication.status === 'accepted' ? (
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" /> 
                    Application accepted
                  </span>
                ) : (
                  <span className="flex items-center text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" /> 
                    Application rejected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="ml-3 text-xl text-gray-400">Loading your applications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <Briefcase className="h-8 w-8 mr-3 text-indigo-500" />
        My Applications
      </h1>
      
      {/* Search and Filter */}
      <div className="bg-gray-800 rounded-xl p-4 mb-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search positions, companies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-900/50 text-red-100 rounded-lg hover:bg-red-800/50 transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 text-red-200 p-6 rounded-lg text-center my-8">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={fetchApplications}
            className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Results Counter */}
      {!isLoading && !error && (
        <div className="mb-4">
          <p className="text-gray-400">
            Showing <span className="font-semibold text-white">{filteredApplications.length}</span> 
            {' '}of <span className="font-semibold text-white">{applications.length}</span> applications
          </p>
        </div>
      )}
      
      {/* Applications */}
      {!isLoading && !error && filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    {application.position.startup.logo_url ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-white mr-3 flex-shrink-0">
                        <img 
                          src={application.position.startup.logo_url} 
                          alt={`${application.position.startup.name} logo`} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                        {application.position.startup.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">{application.position.title}</h2>
                      <p className="text-indigo-400">{application.position.startup.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Applied on {formatDate(application.applied_at)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center text-gray-400">
                      <Building2 className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{application.position.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{application.position.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{application.position.stipend}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View Details
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl">
          <Briefcase className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
          {searchTerm || statusFilter !== 'all' ? (
            <p className="text-gray-400 mb-6">Try adjusting your search filters</p>
          ) : (
            <p className="text-gray-400 mb-6">You haven't applied to any positions yet</p>
          )}
          <button
            onClick={() => navigate('/internships')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Internships
          </button>
        </div>
      ) : null}
      
      {/* Application Details Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default MyApplicationsPage;