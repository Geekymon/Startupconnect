import React, { useEffect, useState } from 'react';
import { ArrowRight, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Startup {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
}

const defaultStartups = [
  {
    id: 1,
    name: 'TechFlow AI',
    description: 'Building next-generation AI solutions for business automation',
    image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800',
    category: 'Artificial Intelligence'
  },
  {
    id: 2,
    name: 'EcoSmart',
    description: 'Sustainable solutions for smart cities and green living',
    image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=800',
    category: 'CleanTech'
  },
  {
    id: 3,
    name: 'HealthBridge',
    description: 'Revolutionary healthcare platform connecting patients with specialists',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800',
    category: 'HealthTech'
  },
  {
    id: 4,
    name: 'FinEdge',
    description: 'Modernizing financial services with blockchain technology',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800',
    category: 'FinTech'
  }
];

const HomePage = () => {
  const [startups, setStartups] = useState<Startup[]>(defaultStartups);
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const registeredStartups = JSON.parse(localStorage.getItem('registeredStartups') || '[]');
    setStartups([...defaultStartups, ...registeredStartups]);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
          BITS Pilani Startup Ecosystem
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 px-4">
          Exclusive internship opportunities for BITSians
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <button
            onClick={handleStartupRegistration}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-300 text-sm sm:text-base"
          >
            <Building className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Register Your Startup
          </button>
          <Link
            to={user ? '/internships' : '/auth'}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-300 text-sm sm:text-base"
          >
            View Open Positions
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {startups.map((startup) => (
          <div
            key={startup.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={startup.image}
                alt={startup.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 sm:p-5">
              <span className="inline-block text-sm text-indigo-400 font-semibold mb-2">
                {startup.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{startup.name}</h3>
              <p className="text-gray-400 text-sm sm:text-base line-clamp-2">
                {startup.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;