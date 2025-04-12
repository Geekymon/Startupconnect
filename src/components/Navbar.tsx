import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold">BITS Nexus</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userType === 'startup' ? (
                  <Link
                    to="/startup-dashboard"
                    className="text-gray-300 hover:text-white px-3 py-2"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/internships"
                    className="text-gray-300 hover:text-white px-3 py-2"
                  >
                    Internships
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-300 hover:text-white px-3 py-2"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;