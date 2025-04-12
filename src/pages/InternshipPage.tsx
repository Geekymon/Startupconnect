import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Briefcase, Search, Filter, X, Tag } from 'lucide-react';

interface Internship {
  id: number;
  company: string;
  companyLogo?: string;
  position: string;
  location: 'Remote' | 'On-campus' | 'Hybrid';
  duration: string;
  stipend: string;
  type: 'Remote' | 'On-campus' | 'Hybrid';
  skills: string[];
  description: string;
  postedAt: string;
  deadline?: string;
  category: string;
}

const internships: Internship[] = [
  {
    id: 1,
    company: 'TechFlow AI',
    companyLogo: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=64',
    position: 'Machine Learning Engineer Intern',
    location: 'Remote',
    duration: '6 months',
    stipend: '₹25,000/month',
    type: 'Remote',
    skills: ['Python', 'TensorFlow', 'Data Analysis', 'Neural Networks'],
    description: 'Join our AI team to develop cutting-edge machine learning solutions for real-world business problems. You\'ll work directly with our senior ML engineers on production models.',
    postedAt: '2025-04-01',
    deadline: '2025-04-30',
    category: 'Artificial Intelligence'
  },
  {
    id: 2,
    company: 'EcoSmart',
    companyLogo: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=64',
    position: 'Frontend Developer Intern',
    location: 'On-campus',
    duration: '3 months',
    stipend: '₹20,000/month',
    type: 'On-campus',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
    description: 'Help build sustainable technology solutions for smart cities. You\'ll be responsible for implementing responsive UI components for our IoT dashboard.',
    postedAt: '2025-04-05',
    deadline: '2025-04-25',
    category: 'CleanTech'
  },
  {
    id: 3,
    company: 'HealthBridge',
    companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=64',
    position: 'Backend Developer Intern',
    location: 'Hybrid',
    duration: '4 months',
    stipend: '₹22,000/month',
    type: 'Hybrid',
    skills: ['Node.js', 'MongoDB', 'Express', 'GraphQL', 'AWS'],
    description: 'Work on our healthcare platform backend infrastructure. You\'ll develop APIs and integrate with healthcare systems while ensuring HIPAA compliance.',
    postedAt: '2025-04-08',
    deadline: '2025-05-05',
    category: 'HealthTech'
  },
  {
    id: 4,
    company: 'FinEdge',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=64',
    position: 'Blockchain Developer Intern',
    location: 'Remote',
    duration: '6 months',
    stipend: '₹30,000/month',
    type: 'Remote',
    skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'Ethereum'],
    description: 'Develop blockchain solutions for financial services. You\'ll be implementing smart contracts and building dApps for our decentralized finance platform.',
    postedAt: '2025-04-10',
    deadline: '2025-05-10',
    category: 'FinTech'
  },
  {
    id: 5,
    company: 'CodeCraft',
    companyLogo: 'https://images.unsplash.com/photo-1550305080-4e029753abcf?auto=format&fit=crop&w=64',
    position: 'Mobile App Developer Intern',
    location: 'Remote',
    duration: '3 months',
    stipend: '₹18,000/month',
    type: 'Remote',
    skills: ['React Native', 'Firebase', 'Redux', 'TypeScript'],
    description: 'Join our mobile development team to create cross-platform apps. You\'ll work on feature development and UI implementation for our flagship educational app.',
    postedAt: '2025-04-11',
    category: 'EdTech'
  },
  {
    id: 6,
    company: 'DataSphere',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=64',
    position: 'Data Science Intern',
    location: 'Hybrid',
    duration: '5 months',
    stipend: '₹26,000/month',
    type: 'Hybrid',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL', 'Data Visualization'],
    description: 'Help our team analyze large datasets and build predictive models. You\'ll work on real client projects to extract insights from complex data.',
    postedAt: '2025-04-03',
    deadline: '2025-04-28',
    category: 'Data Analytics'
  }
];

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
  'Data Analytics'
];

interface FilterState {
  locations: LocationFilter[];
  durations: DurationFilter[];
  categories: CategoryFilter[];
}

const InternshipPage: React.FC = () => {
  const [allInternships, setAllInternships] = useState<Internship[]>(internships);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>(internships);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    locations: [],
    durations: [],
    categories: []
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Apply filters and search
  useEffect(() => {
    let result = allInternships;
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        internship => 
          internship.position.toLowerCase().includes(searchLower) ||
          internship.company.toLowerCase().includes(searchLower) ||
          internship.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          internship.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply location filters
    if (filters.locations.length > 0) {
      result = result.filter(internship => 
        filters.locations.includes(internship.location)
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
    
    // Apply category filters
    if (filters.categories.length > 0) {
      result = result.filter(internship => 
        filters.categories.includes(internship.category)
      );
    }
    
    setFilteredInternships(result);
  }, [allInternships, searchTerm, filters]);

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
      
      {/* Results Counter */}
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
      
      {/* Internship Listings */}
      {filteredInternships.length > 0 ? (
        <div className="space-y-6">
          {filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] group"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    {internship.companyLogo && (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-white mr-3 flex-shrink-0">
                        <img 
                          src={internship.companyLogo} 
                          alt={`${internship.company} logo`} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{internship.position}</h2>
                      <p className="text-indigo-400">{internship.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      internship.type === 'Remote' ? 'bg-green-900/50 text-green-200' :
                      internship.type === 'On-campus' ? 'bg-blue-900/50 text-blue-200' :
                      'bg-purple-900/50 text-purple-200'
                    }`}>
                      {internship.type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Posted {formatRelativeTime(internship.postedAt)}
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
                    {internship.deadline && (
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
                    )}
                    
                    <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default InternshipPage;