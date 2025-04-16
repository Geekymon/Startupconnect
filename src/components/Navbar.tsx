import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Rocket, LogOut, Menu, X, ChevronDown, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, userType, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Navigation links based on user type
  const getNavLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];
    }

    if (userType === 'startup') {
      return [
        { name: 'Dashboard', path: '/startup-dashboard' },
        { name: 'My Positions', path: '/my-positions' },
        { name: 'Applications', path: '/applications' },
      ];
    }

    return [
      { name: 'Internships', path: '/internships' },
      { name: 'My Applications', path: '/my-applications' },
      { name: 'Startups', path: '/startups' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isMenuOpen ? 'bg-gray-900 shadow-lg' : 'bg-gradient-to-b from-gray-900 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 z-10">
            <Rocket className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-white">BITS Nexus</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* IMPORTANT: Completely removed the loading spinner that was causing issues */}
            
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {userType === 'startup' ? (
                      <Building2 className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-700 focus:outline-none"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-xs text-indigo-400 capitalize">{userType} Account</p>
                      </div>
                      
                      <Link
                        to={userType === 'startup' ? '/startup-dashboard' : '/my-applications'}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {userType === 'startup' ? 'Dashboard' : 'My Applications'}
                      </Link>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Profile Settings
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              aria-label="Main menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-4 pt-2 pb-3 space-y-1 sm:px-5 border-t border-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center px-3 py-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {userType === 'startup' ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white truncate max-w-[200px]">{user.email}</div>
                  <div className="text-sm text-indigo-400 capitalize">{userType} Account</div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="block w-full text-center mt-3 px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-base font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;