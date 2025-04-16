import { useState, useEffect } from 'react';
import { ArrowRight, Building2, Rocket, Code, Database, SearchIcon, Zap, Coffee, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Startup {
  id: string;
  name: string;
  domain: string;
  summary: string;
  logo_url?: string;
  funding_stage?: string;
  team_size?: string;
}

const HomePage: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartups();
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch startups from Supabase
  const fetchStartups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_startups');
      
      if (error) {
        throw error;
      }
      
      setStartups(data || []);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartupRegistration = () => {
    if (!user) {
      // If not logged in, direct to auth page
      navigate('/auth');
      return;
    }
    
    console.log("Current user type:", userType);
    
    // Check user type
    if (userType === 'startup') {
      // User is a startup, navigate to registration
      navigate('/register-startup');
    } else if (userType === 'student') {
      // User is a student, show error
      alert('Only startup accounts can register a startup. Please create a startup account.');
    } else {
      // User type not yet determined
      alert('Your account type is being loaded. Please try again in a moment.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              BITS Pilani <span className="text-indigo-400">Startup</span> Ecosystem
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Exclusive internship opportunities connecting BITS Pilani students with innovative startups founded by BITS alumni
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button
                onClick={handleStartupRegistration}
                className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Register Your Startup
              </button>
              <Link
                to={user ? '/internships' : '/auth'}
                className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Browse Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-400">Startups</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-sm text-gray-400">Open Positions</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-sm text-gray-400">BITS Campuses</div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-3xl font-bold text-white">₹20K+</div>
                <div className="text-sm text-gray-400">Avg. Stipend</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Startups Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Startups</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Discover innovative startups founded by BITS Pilani alumni across various domains
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-12 w-12 border-t-2 border-indigo-500 rounded-full"></div>
            </div>
          ) : startups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {startups.slice(0, 6).map((startup) => (
                <div 
                  key={startup.id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
                >
                  <div className="h-48 bg-gray-700 overflow-hidden">
                    <img 
                      src={startup.logo_url || "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800"} 
                      alt={startup.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{startup.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-200">
                        {startup.domain}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 line-clamp-3">{startup.summary}</p>
                    <div className="flex items-center justify-between">
                      {startup.funding_stage && (
                        <span className="text-sm text-gray-400">
                          {startup.funding_stage}
                        </span>
                      )}
                      {startup.team_size && (
                        <span className="text-sm text-gray-400 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {startup.team_size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No startups found. Check back later for updates.</p>
            </div>
          )}
          
          {startups.length > 6 && (
            <div className="text-center mt-12">
              <Link
                to="/startups"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View All Startups
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Students & Founders Say</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Hear from our community of BITS students and startup founders
            </p>
          </div>
          
          <div className="relative overflow-hidden px-4 sm:px-0">
            <div className="relative max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-opacity duration-500 ${
                    index === activeTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-16 w-16 rounded-full object-cover mb-4"
                      />
                      <p className="text-lg text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                      <div>
                        <h4 className="text-white font-medium">{testimonial.name}</h4>
                        <p className="text-indigo-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === activeTestimonial ? 'bg-indigo-500 w-4' : 'bg-gray-600'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Simple process to connect BITS students with alumni startups
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-900/60 rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-indigo-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">1. Startups Register</h3>
              <p className="text-gray-300 text-center">
                BITS alumni register their startups and post internship opportunities
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-900/60 rounded-full flex items-center justify-center">
                  <SearchIcon className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">2. Students Browse</h3>
              <p className="text-gray-300 text-center">
                Students explore positions and apply to those matching their skills
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-900/60 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">3. Connect & Intern</h3>
              <p className="text-gray-300 text-center">
                Startups review applications and connect with students for internships
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Ready to get started?
                  <span className="block text-indigo-300">Join the BITS startup ecosystem today.</span>
                </h2>
                <p className="mt-4 max-w-xl text-lg text-indigo-100">
                  Connect with innovative startups founded by BITS alumni and kickstart your career.
                </p>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 space-x-4">
                <Link
                  to={user ? '/internships' : '/auth'}
                  className="px-6 py-3 bg-white text-indigo-700 hover:bg-gray-100 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Testimonial data
const testimonials = [
  {
    id: 1,
    quote: "BITS Nexus connected me with an incredible startup where I could apply my ML skills to real-world problems. The internship eventually turned into a full-time role!",
    name: "Riya Patel",
    role: "CS Student, BITS Pilani",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 2,
    quote: "As a founder, finding talented BITS students through this platform has been game-changing. They bring fresh perspectives and exceptional skills to our team.",
    name: "Aditya Sharma",
    role: "Founder, QuantumLeap AI",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: 3,
    quote: "The quality of startups on BITS Nexus is exceptional. My internship provided hands-on experience that no classroom could offer.",
    name: "Neha Singh",
    role: "Electronics Student, BITS Goa",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100"
  }
];

export default HomePage;