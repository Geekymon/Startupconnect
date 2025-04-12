import { useState, useEffect } from 'react';
import { ArrowRight, Building2, Rocket, Code, Database, SearchIcon, Zap, Coffee, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Other imports and type definitions remain the same...

const HomePage: React.FC = () => {
  // State definitions remain the same...
  const [startups, setStartups] = useState<any[]>([]);
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

  // fetchStartups function remains the same...
  const fetchStartups = async () => {
    // Implementation remains the same...
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

  // Here's the fixed handleStartupRegistration function
  const handleStartupRegistration = () => {
    if (!user) {
      // If not logged in, direct to auth page
      navigate('/auth');
      return;
    }
    
    console.log("Current user type:", userType);
    
    // Check user type - this is the important part
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

  // Rest of the component remains the same...
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero content remains the same... */}
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
            
            {/* Stats and other sections remain the same... */}
          </div>
        </div>
      </section>
      
      {/* Other sections remain the same... */}
    </div>
  );
};

// Testimonials and other constants remain the same...
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