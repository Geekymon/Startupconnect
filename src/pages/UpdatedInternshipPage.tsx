import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Search, Filter, X, Tag, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ApplicationModal from '../components/ApplicationModal';

interface Internship {
  id: string;
  startup_id: string;
  startup_name: string;
  logo_url?: string;
  title: string;
  location: 'Remote' | 'On-campus' | 'Hybrid';
  duration: string;
  stipend: string;
  skills: string[];
  description: string;
  created_at: string;
  deadline: string;
  domain?: string;
}

// Filter option types
type LocationFilter = 'Remote' | 'On-campus' | 'Hybrid';
type DurationFilter = '1-3 months' | '3-6 months' | '6+ months';
type CategoryFilter = string;

// Available filters
const locationFilters: LocationFilter[] = ['Remote', 'On-campus', 'Hybrid'];
const durationFilters: DurationFilter[] = ['1-3 months', '3-6 months', '6+ months'];
const categoryFilters: CategoryFilter[] = [
  'Artificial Intelligence',
  'FinTech',
  'HealthTech',
  'EdTech',
  'CleanTech',
  'Data Analytics',
  'SaaS',
  'E-commerce'
];

interface FilterState {
  locations: LocationFilter[];
  durations: DurationFilter[];
  categories: CategoryFilter[];
}

const InternshipPage: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    durations: [],
    categories: []
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    id: string;
    title: string;
    companyName: string;
  } | null>(null);

  // Fetch internships from Supabase
  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use the RPC function to get active positions with startup info
      const { data, error } = await supabase.rpc('get_active_positions');
      
      if (error) throw error;
      
      // Transform data to match our interface
      const formattedInternships: Internship[] = data.map((item: any) => ({
        id: item.id,
        startup_id: item.startup_id,
        startup_name: item.startup_name,
        logo_url: item.logo_url,
        title: item.title,
        location: item.location,
        duration: item.duration,
        stipend: item.stipend,
        skills: item.skills,
        description: item.description,
        created_at: item.created_at,
        deadline: item.deadline,
      }));
      
      setInternships(formattedInternships);
      setFilteredInternships(formattedInternships);
    } catch (error: any) {
      console.error('Error fetching internships:', error);
      setError('Failed to load internships. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply for an internship
  const handleApply = (internship: Internship) => {
    if (!user) {
      // User needs to be logged in
      alert('Please sign in to apply for internships');
      return;
    }
    
    // Set selected position and show modal
    setSelectedPosition({
      id: internship.id,
      title: internship.title,
      companyName: internship.startup_name
    });
    setShowApplicationModal(true);
  };

  // Close application modal
  const handleCloseModal = () => {
    setShowApplicationModal(false);
    setSelectedPosition(null);
  };

  // Apply filters and search
  useEffect(() => {
    let result = internships;
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        internship => 
          internship.title.toLowerCase().includes(searchLower) ||
          internship.startup_name.toLowerCase().includes(searchLower) ||
          internship.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          internship.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply location filters
    if (filters.locations.length > 0) {
      result = result.filter(internship => 
        filters.locations.includes(internship.location as LocationFilter)
      );
    }
    
    // Apply duration filters
    if (filters.durations.length > 0) {
      result = result.filter(internship => {
        const months = parseInt(internship.duration.split(' ')[0]);
        if (filters.durations.includes('1-3 months') && months >= 1 && months <= 3) return true;
        if (filters.durations.includes('3-6 months') && months > 3 && months <= 6) return true;
        if (filters.durations.includes('6+ months') && months > 6) return true;
        return false;
      });
    }
    
    // Apply category filters (using domain if available, otherwise skip)
    if (filters.categories.length > 0) {
      result = result.filter(internship => 
        internship.domain && filters.categories.includes(internship.domain)
      );
    }
    
    setFilteredInternships(result);
  }, [internships, searchTerm, filters]);

  // Toggle a filter
  const toggleFilter = (type: keyof FilterState, value: string): void => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [type]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentValues, value]
        };
      }
    });
  };

  // Clear all filters
  const clearFilters = (): void => {
    setFilters({
      locations: [],
      durations: [],
      categories: []
    });
    setSearchTerm('');
  };

  // Format date to relative time (e.g., "3 days ago")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Internship Opportunities</h1>
      
      {/* Search and Filter Bar */}
      <div className="bg-gray-800 rounded-xl p-4 mb-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search positions, companies, skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters {Object.values(filters).flat().length > 0 && `(${Object.values(filters).flat().length})`}
          </button>
          {(Object.values(filters).flat().length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-900/50 text-red-100 rounded-lg hover:bg-red-800/50 transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              Clear All
            </button>
          )}
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location Filters */}
            <div>
              <h3 className="font-medium text-white mb-3">Location</h3>
              <div className="space-y-2">
                {locationFilters.map(location => (
                  <label key={location} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={() => toggleFilter('locations', location)}
                      className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                    />
                    <span className="ml-2 text-gray-300">{location}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Duration Filters */}
            <div>
              <h3 className="font-medium text-white mb-3">Duration</h3>
              <div className="space-y-2">
                {durationFilters.map(duration => (
                  <label key={duration} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.durations.includes(duration)}
                      onChange={() => toggleFilter('durations', duration)}
                      className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                    />
                    <span className="ml-2 text-gray-300">{duration}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Category Filters */}
            <div>
              <h3 className="font-medium text-white mb-3">Category</h3>
              <div className="space-y-2">
                {categoryFilters.map(category => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleFilter('categories', category)}
                      className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                    />
                    <span className="ml-2 text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="ml-3 text-xl text-gray-400">Loading internships...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/30 text-red-200 p-6 rounded-lg text-center my-8">
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={fetchInternships}
            className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Results Counter */}
      {!isLoading && !error && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400">
            Showing <span className="font-semibold text-white">{filteredInternships.length}</span> opportunities
          </p>
          <div className="text-sm text-gray-400">
            <span className="font-medium">Sort:</span>
            <button className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              Newest first
            </button>
          </div>
        </div>
      )}
      
      {/* Internship Listings */}
      {!isLoading && !error && filteredInternships.length > 0 ? (
        <div className="space-y-6">
          {filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] group"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    {internship.logo_url && (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-white mr-3 flex-shrink-0">
                        <img 
                          src={internship.logo_url} 
                          alt={`${internship.startup_name} logo`} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{internship.title}</h2>
                      <p className="text-indigo-400">{internship.startup_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      internship.location === 'Remote' ? 'bg-green-900/50 text-green-200' :
                      internship.location === 'On-campus' ? 'bg-blue-900/50 text-blue-200' :
                      'bg-purple-900/50 text-purple-200'
                    }`}>
                      {internship.location}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Posted {formatRelativeTime(internship.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-300 mb-4">{internship.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center text-gray-400">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{internship.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{internship.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500" />
                      <span>{internship.stipend}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {internship.skills.map((skill, idx) => (
                      <span 
                        key={`${internship.id}-${idx}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-sm">
                      <span className="text-gray-400">Application deadline:</span>{' '}
                      <span className="text-white font-medium">
                        {new Date(internship.deadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </p>
                    
                    <button 
                      onClick={() => handleApply(internship)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-16 bg-gray-800 rounded-xl">
          <Tag className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No internships found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search filters</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <X className="mr-2 h-5 w-5" />
            Clear Filters
          </button>
        </div>
      ) : null}
      
      {/* Application Modal */}
      {selectedPosition && (
        <ApplicationModal 
          isOpen={showApplicationModal}
          onClose={handleCloseModal}
          positionId={selectedPosition.id}
          positionTitle={selectedPosition.title}
          companyName={selectedPosition.companyName}
        />
      )}
    </div>
  );
};

export default InternshipPage;