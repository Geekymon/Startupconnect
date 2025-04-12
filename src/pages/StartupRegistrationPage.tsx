import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StartupFormData {
  name: string;
  website: string;
  domain: string;
  summary: string;
  logo: string;
  founderName: string;
  founderEmail: string;
  founderLinkedIn: string;
}

const StartupRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    website: '',
    domain: '',
    summary: '',
    logo: '',
    founderName: '',
    founderEmail: '',
    founderLinkedIn: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would be an API call
    const existingStartups = JSON.parse(localStorage.getItem('registeredStartups') || '[]');
    const newStartup = {
      ...formData,
      id: Date.now(),
      category: formData.domain,
      description: formData.summary,
      image: formData.logo || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800',
    };
    localStorage.setItem('registeredStartups', JSON.stringify([...existingStartups, newStartup]));
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Register Your Startup</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Startup Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
            Website URL *
          </label>
          <input
            type="url"
            id="website"
            name="website"
            required
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
            Domain/Category *
          </label>
          <select
            id="domain"
            name="domain"
            required
            value={formData.domain}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Domain</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="EdTech">EdTech</option>
            <option value="CleanTech">CleanTech</option>
            <option value="E-commerce">E-commerce</option>
            <option value="SaaS">SaaS</option>
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">
            Startup Summary *
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4">Founder Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="founderName" className="block text-sm font-medium text-gray-300 mb-2">
                Founder Name *
              </label>
              <input
                type="text"
                id="founderName"
                name="founderName"
                required
                value={formData.founderName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="founderEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Founder Email *
              </label>
              <input
                type="email"
                id="founderEmail"
                name="founderEmail"
                required
                value={formData.founderEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="founderLinkedIn" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                id="founderLinkedIn"
                name="founderLinkedIn"
                value={formData.founderLinkedIn}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Register Startup
          </button>
        </div>
      </form>
    </div>
  );
};

export default StartupRegistrationPage;