import { useState, useEffect } from 'react';
import { ArrowRight, Building2, Rocket, Code, Database, SearchIcon, Zap, Coffee, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Startup {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  logo?: string;
}

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const defaultStartups: Startup[] = [
  {
    id: 1,
    name: 'TechFlow AI',
    description: 'Building next-generation AI solutions for business automation and process optimization.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=2070',
    logo: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800',
    category: 'Artificial Intelligence'
  },
  {
    id: 2,
    name: 'EcoSmart',
    description: 'Sustainable solutions for smart cities and green living with IoT integration.',
    image: 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&q=80&w=2070',
    logo: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=800',
    category: 'CleanTech'
  },
  {
    id: 3,
    name: 'HealthBridge',
    description: 'Revolutionary healthcare platform connecting patients with specialists through AI-powered diagnostics.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800',
    category: 'HealthTech'
  },
  {
    id: 4,
    name: 'FinEdge',
    description: 'Modernizing financial services with blockchain technology and decentralized finance solutions.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800',
    category: 'FinTech'
  }
];

const testimonials: Testimonial[] = [
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

const HomePage: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(defaultStartups);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const registeredStartups = JSON.parse(localStorage.getItem('registeredStartups') || '[]');
    setStartups([...defaultStartups, ...registeredStartups]);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStartupRegistration = () => {
    if (!user) {
      navigate('/auth');
    } else if (userType === 'startup') {
      navigate('/register-startup');
    } else {
      // Show error or redirect to appropriate page for students
      alert('Only startup accounts can register a startup');
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 mix-blend-multiply"></div>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071"
            alt="BITS Students"
            className="w-full h-full object-cover opacity-20"
          />
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
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-3xl sm:text-4xl font-bold text-white">50+</p>
                <p className="text-gray-400 mt-1">Active Startups</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-3xl sm:text-4xl font-bold text-white">200+</p>
                <p className="text-gray-400 mt-1">Internships</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-3xl sm:text-4xl font-bold text-white">1000+</p>
                <p className="text-gray-400 mt-1">BITS Students</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-3xl sm:text-4xl font-bold text-white">₹25K</p>
                <p className="text-gray-400 mt-1">Avg. Stipend</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Startups Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Featured Startups</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover innovative companies founded by BITS Pilani alumni that are shaping the future
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
            {startups.slice(0, 4).map((startup) => (
              <div
                key={startup.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group hover:translate-y-[-5px]"
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
                  <img
                    src={startup.image}
                    alt={startup.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex items-center">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-white mr-3 flex-shrink-0">
                      <img 
                        src={startup.logo || startup.image} 
                        alt={`${startup.name} logo`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="inline-block text-sm text-indigo-400 font-semibold">
                        {startup.category}
                      </span>
                      <h3 className="text-xl font-bold text-white">{startup.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {startup.description}
                  </p>
                  <div className="flex justify-end">
                    <button className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium flex items-center">
                      View Opportunities
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              to="/internships"
              className="inline-flex items-center justify-center px-6 py-3 border border-indigo-500 text-indigo-400 rounded-lg hover:bg-indigo-900/30 transition-colors duration-300"
            >
              View All Startups
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why BITS Nexus?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We connect the BITS Pilani community with exclusive opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">BITS-Exclusive Network</h3>
              <p className="text-gray-400">
                Access internships and job opportunities available only to BITS Pilani students and alumni.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">High-Growth Startups</h3>
              <p className="text-gray-400">
                Work with innovative startups founded by BITS alumni who understand your academic background.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-World Projects</h3>
              <p className="text-gray-400">
                Gain practical experience working on cutting-edge technologies and meaningful problems.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verified Opportunities</h3>
              <p className="text-gray-400">
                All startups are verified to ensure they have at least one BITS Pilani founder.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">BITS Alumni Network</h3>
              <p className="text-gray-400">
                Connect with successful BITS alumni and expand your professional network.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Remote Opportunities</h3>
              <p className="text-gray-400">
                Find flexible internships that fit with your academic schedule, including remote options.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Success Stories</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from students and startups who connected through BITS Nexus
            </p>
          </div>
          
          <div className="relative">
            <div className="h-full w-full overflow-hidden relative">
              {testimonials.map((testimonial, idx) => (
                <div
                  key={testimonial.id}
                  className={`bg-gray-800 rounded-xl p-8 shadow-xl transition-opacity duration-500 ${
                    idx === activeTestimonial ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xl text-gray-300 italic leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-14 w-14 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-indigo-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    idx === activeTestimonial ? 'bg-indigo-500' : 'bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/5 opacity-25"></div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">Ready to Get Started?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto relative z-10">
              Whether you're a BITS student looking for opportunities or a startup founder seeking talent, join the BITS Nexus community today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link
                to="/auth"
                className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300 text-lg"
              >
                Join BITS Nexus
              </Link>
              <Link
                to="/internships"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-300 text-lg"
              >
                Browse Internships
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;