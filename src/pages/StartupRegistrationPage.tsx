import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Rocket, Building2, 
  Globe as GlobeIcon, Users, Briefcase, Award as AwardIcon, 
  Linkedin as LinkedinIcon, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface StartupFormData {
  name: string;
  website: string;
  domain: string;
  summary: string;
  logo_url: string;
  founder_name: string;
  founder_email: string;
  founder_linkedin: string;
  founder_bits_campus: 'goa' | 'hyderabad' | 'pilani' | '';
  phone_number: string;
  company_linkedin: string;
  funding_stage: string;
  team_size: string;
}

const StartupRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    website: '',
    domain: '',
    summary: '',
    logo_url: '',
    founder_name: '',
    founder_email: user?.email || '',
    founder_linkedin: '',
    founder_bits_campus: '',
    phone_number: '',
    company_linkedin: '',
    funding_stage: '',
    team_size: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user already has a startup
    const checkStartup = async () => {
      try {
        const { data, error } = await supabase
          .from('startups')
          .select('id')
          .eq('owner_id', user.id)
          .single();
          
        if (data) {
          // User already has a startup, redirect to dashboard
          navigate('/startup-dashboard');
        }
      } catch (error) {
        // No startup found, continue with registration
      }
    };
    
    checkStartup();
    
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        founder_email: user.email || ''
      }));
      
      // Extract BITS campus from email if possible
      const email = user.email.toLowerCase();
      if (email.includes('@goa.bits-pilani.ac.in')) {
        setFormData(prev => ({ ...prev, founder_bits_campus: 'goa' }));
      } else if (email.includes('@hyderabad.bits-pilani.ac.in') || email.includes('@hyd.bits-pilani.ac.in')) {
        setFormData(prev => ({ ...prev, founder_bits_campus: 'hyderabad' }));
      } else if (email.includes('@pilani.bits-pilani.ac.in')) {
        setFormData(prev => ({ ...prev, founder_bits_campus: 'pilani' }));
      }
    }
  }, [user, navigate]);

  // Define form steps
  const formSteps = [
    {
      title: "Company Basics",
      icon: <Building2 className="h-6 w-6" />,
      fields: ["name", "website", "domain"]
    },
    {
      title: "Company Details",
      icon: <Briefcase className="h-6 w-6" />,
      fields: ["summary", "logo_url", "company_linkedin", "funding_stage", "team_size"]
    },
    {
      title: "Founder Information",
      icon: <Users className="h-6 w-6" />,
      fields: ["founder_name", "founder_email", "founder_linkedin", "founder_bits_campus", "phone_number"]
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const requiredFields = formSteps[stepIndex].fields.filter(field => {
      // Fields that are required
      if (field === 'founder_bits_campus' || field === 'phone_number' || field === 'logo_url' || 
          field === 'company_linkedin' || field === 'funding_stage' || field === 'team_size') {
        return false; // These fields are optional
      }
      return true;
    });
    
    return requiredFields.every(field => formData[field as keyof StartupFormData]);
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Set a timeout to handle long processing time
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setError('Registration is taking longer than expected. Please try again.');
        setIsSubmitting(false);
      }
    }, 10000);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to register a startup');
      }
      
      // Insert startup into Supabase
      const { data, error: supabaseError } = await supabase
        .from('startups')
        .insert({
          owner_id: user.id,
          name: formData.name,
          website: formData.website,
          domain: formData.domain,
          summary: formData.summary,
          logo_url: formData.logo_url || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800',
          founder_name: formData.founder_name,
          founder_email: formData.founder_email,
          founder_linkedin: formData.founder_linkedin,
          founder_bits_campus: formData.founder_bits_campus,
          phone_number: formData.phone_number,
          company_linkedin: formData.company_linkedin,
          funding_stage: formData.funding_stage,
          team_size: formData.team_size
        })
        .select();
      
      clearTimeout(timeoutId);
      
      if (supabaseError) throw supabaseError;
      
      // Show success message
      alert("Startup registered successfully!");
      
      // Navigate to dashboard (refreshProfile will happen in dashboard)
      navigate('/startup-dashboard');
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error registering startup:', error);
      setError(error.message || 'An error occurred while registering your startup');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the progress bar
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {formSteps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index <= currentStep ? 'text-indigo-400' : 'text-gray-500'}`}
              style={{ width: `${100 / formSteps.length}%` }}
            >
              <div className="flex items-center justify-center mb-2">
                <div className={`rounded-full flex items-center justify-center w-10 h-10 ${
                  index < currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : index === currentStep 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {index < currentStep ? 
                    <span>✓</span> : 
                    step.icon}
                </div>
              </div>
              <span className="text-sm text-center hidden md:block">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep) / (formSteps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render the current step's form fields
  const renderCurrentStep = () => {
    const step = formSteps[currentStep];
    
    return (
      <div className="space-y-6 py-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          {step.icon}
          <span className="ml-2">{step.title}</span>
        </h2>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-sm font-medium flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {step.fields.map(field => renderField(field as keyof StartupFormData))}
      </div>
    );
  };

  // Render individual form fields based on field name
  const renderField = (fieldName: keyof StartupFormData) => {
    // Common props for all inputs
    const commonProps = {
      id: fieldName,
      name: fieldName,
      value: formData[fieldName],
      onChange: handleChange,
      className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
    };

    // Field labels and placeholders
    const fieldConfig: Record<keyof StartupFormData, { label: string, placeholder: string, required: boolean, type?: string }> = {
      name: { label: "Startup Name", placeholder: "e.g., TechFlow AI", required: true },
      website: { label: "Website URL", placeholder: "e.g., https://techflow.ai", required: true, type: "url" },
      domain: { label: "Industry/Category", placeholder: "Select industry", required: true },
      summary: { label: "Startup Summary", placeholder: "Tell us about your startup mission and vision...", required: true },
      logo_url: { label: "Logo URL", placeholder: "e.g., https://example.com/logo.png", required: false, type: "url" },
      founder_name: { label: "Founder Name", placeholder: "e.g., Rahul Sharma", required: true },
      founder_email: { label: "Founder BITS Email", placeholder: "e.g., f20230123@goa.bits-pilani.ac.in", required: true, type: "email" },
      founder_linkedin: { label: "Founder LinkedIn", placeholder: "e.g., https://linkedin.com/in/founder", required: true, type: "url" },
      founder_bits_campus: { label: "BITS Campus", placeholder: "Select campus", required: false },
      phone_number: { label: "Contact Number", placeholder: "e.g., +91 9876543210", required: false, type: "tel" },
      company_linkedin: { label: "Company LinkedIn", placeholder: "e.g., https://linkedin.com/company/techflow", required: false, type: "url" },
      funding_stage: { label: "Funding Stage", placeholder: "Select funding stage", required: false },
      team_size: { label: "Team Size", placeholder: "Select team size", required: false }
    };
    
    const config = fieldConfig[fieldName];
    
    // Return different input types based on field name
    switch (fieldName) {
      case 'summary':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <textarea
              {...commonProps}
              placeholder={config.placeholder}
              rows={4}
              required={config.required}
            />
          </div>
        );
      
      case 'domain':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <select
              {...commonProps}
              required={config.required}
            >
              <option value="">Select Industry</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="EdTech">EdTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="DeepTech">DeepTech</option>
              <option value="AgriTech">AgriTech</option>
              <option value="SpaceTech">SpaceTech</option>
              <option value="Other">Other</option>
            </select>
          </div>
        );
      
      case 'founder_bits_campus':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <select
              {...commonProps}
              required={config.required}
            >
              <option value="">Select Campus</option>
              <option value="goa">Goa</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="pilani">Pilani</option>
            </select>
          </div>
        );
      
      case 'funding_stage':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <select
              {...commonProps}
              required={config.required}
            >
              <option value="">Select Funding Stage</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B+">Series B+</option>
              <option value="Bootstrapped">Bootstrapped</option>
              <option value="Revenue Funded">Revenue Funded</option>
            </select>
          </div>
        );
      
      case 'team_size':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <select
              {...commonProps}
              required={config.required}
            >
              <option value="">Select Team Size</option>
              <option value="1-5">1-5</option>
              <option value="6-10">6-10</option>
              <option value="11-25">11-25</option>
              <option value="26-50">26-50</option>
              <option value="51+">51+</option>
            </select>
          </div>
        );
      
      default:
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <input
              {...commonProps}
              type={config.type || "text"}
              placeholder={config.placeholder}
              required={config.required}
            />
            {fieldName === 'founder_email' && (
              <p className="text-sm text-gray-400 mt-1">
                Must be a valid BITS Pilani email (e.g., f20230233@goa.bits-pilani.ac.in)
              </p>
            )}
          </div>
        );
    }
  };

  // Render the navigation buttons
  const renderNavButtons = () => {
    const isLastStep = currentStep === formSteps.length - 1;
    
    return (
      <div className="flex justify-between mt-10">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain layout
        )}
        
        {isLastStep ? (
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isStepComplete(currentStep) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Register Startup
                <Rocket className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isStepComplete(currentStep)}
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {renderProgressBar()}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl">
        {renderCurrentStep()}
        {renderNavButtons()}
      </form>
    </div>
  );
};

export default StartupRegistrationPage;