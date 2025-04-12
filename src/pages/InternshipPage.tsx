import React from 'react';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';

const internships = [
  {
    id: 1,
    company: 'TechFlow AI',
    position: 'Machine Learning Intern',
    location: 'Remote',
    duration: '6 months',
    stipend: '₹25,000/month',
    type: 'Remote',
    skills: ['Python', 'TensorFlow', 'Data Analysis'],
    description: 'Join our AI team to develop cutting-edge machine learning solutions.'
  },
  {
    id: 2,
    company: 'EcoSmart',
    position: 'Frontend Developer Intern',
    location: 'On-campus',
    duration: '3 months',
    stipend: '₹20,000/month',
    type: 'On-campus',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    description: 'Help build sustainable technology solutions for smart cities.'
  },
  {
    id: 3,
    company: 'HealthBridge',
    position: 'Backend Developer Intern',
    location: 'Hybrid',
    duration: '4 months',
    stipend: '₹22,000/month',
    type: 'Hybrid',
    skills: ['Node.js', 'MongoDB', 'Express'],
    description: 'Work on our healthcare platform backend infrastructure.'
  },
  {
    id: 4,
    company: 'FinEdge',
    position: 'Blockchain Developer Intern',
    location: 'Remote',
    duration: '6 months',
    stipend: '₹30,000/month',
    type: 'Remote',
    skills: ['Solidity', 'Web3.js', 'Smart Contracts'],
    description: 'Develop blockchain solutions for financial services.'
  }
];

const InternshipPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Open Internship Positions</h1>
      
      <div className="space-y-4 sm:space-y-6">
        {internships.map((internship) => (
          <div
            key={internship.id}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{internship.position}</h2>
                <p className="text-indigo-400 mt-1">{internship.company}</p>
              </div>
              <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium ${
                internship.type === 'Remote' ? 'bg-green-900 text-green-200' :
                internship.type === 'On-campus' ? 'bg-blue-900 text-blue-200' :
                'bg-purple-900 text-purple-200'
              }`}>
                {internship.type}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{internship.location}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{internship.duration}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <DollarSign className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{internship.stipend}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Briefcase className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base truncate">{internship.skills.join(', ')}</span>
              </div>
            </div>

            <p className="mt-4 text-gray-400 text-sm sm:text-base">{internship.description}</p>

            <button className="mt-4 sm:mt-6 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300 text-sm sm:text-base">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InternshipPage;