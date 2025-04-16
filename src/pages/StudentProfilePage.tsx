import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Award, FileText, Briefcase, Code, BookOpen,
  Github, Calendar, ArrowRight, ArrowLeft, 
  Upload, AlertCircle, CheckCircle, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface StudentProfileData {
  full_name: string;
  email: string;
  bio: string;
  profile_photo_url: string;
  resume_url: string;
  github_url: string;
  linkedin_url: string;
  bits_id: string;
  graduation_year: string;
  degree: string;
  major: string;
  campus: 'goa' | 'hyderabad' | 'pilani' | '';
  cgpa: string;
  skills: string[];
  phone_number: string;
  projects: Project[];
  experience: Experience[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  url: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
  is_current: boolean;
}

const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [skillInput, setSkillInput] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const defaultProject: Project = {
    id: Date.now().toString(),
    title: '',
    description: '',
    tech_stack: [],
    url: ''
  };
  
  const defaultExperience: Experience = {
    id: Date.now().toString(),
    role: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  };
  
  const [formData, setFormData] = useState<StudentProfileData>({
    full_name: '',
    email: user?.email || '',
    bio: '',
    profile_photo_url: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    bits_id: '',
    graduation_year: '',
    degree: 'B.Tech',
    major: '',
    campus: '',
    cgpa: '',
    skills: [],
    phone_number: '',
    projects: [defaultProject],
    experience: [defaultExperience]
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user already has a profile and load it
    loadStudentProfile();
  }, [user, navigate]);

  const loadStudentProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, creating new profile
          setIsProfileLoaded(true);
          return;
        }
        throw error;
      }
      
      if (data) {
        // Convert data to proper format
        const profileData: StudentProfileData = {
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          profile_photo_url: data.profile_photo_url || '',
          resume_url: data.resume_url || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          bits_id: data.bits_id || '',
          graduation_year: data.graduation_year || '',
          degree: data.degree || 'B.Tech',
          major: data.major || '',
          campus: data.campus || '',
          cgpa: data.cgpa || '',
          skills: data.skills || [],
          phone_number: data.phone_number || '',
          projects: data.projects || [defaultProject],
          experience: data.experience || [defaultExperience]
        };
        
        setFormData(profileData);
        setIsEditMode(true);
        
        // Check if profile is complete
        const isComplete = checkProfileCompletion(profileData);
        setIsProfileComplete(isComplete);
      }
      
      setIsProfileLoaded(true);
    } catch (error) {
      console.error('Error loading student profile:', error);
      setIsProfileLoaded(true);
    }
  };

  // Check if the minimum required fields are filled
  const checkProfileCompletion = (profile: StudentProfileData): boolean => {
    return !!(
      profile.full_name &&
      profile.bio &&
      profile.bits_id &&
      profile.graduation_year &&
      profile.major &&
      profile.campus &&
      profile.skills.length > 0
    );
  };

  // Define form steps
  const formSteps = [
    {
      title: "Personal Information",
      icon: <User className="h-6 w-6" />,
      fields: ["full_name", "email", "bio", "profile_photo_url", "phone_number"]
    },
    {
      title: "Education",
      icon: <BookOpen className="h-6 w-6" />,
      fields: ["bits_id", "campus", "degree", "major", "graduation_year", "cgpa"]
    },
    {
      title: "Skills & Links",
      icon: <Code className="h-6 w-6" />,
      fields: ["skills", "resume_url", "github_url", "linkedin_url"]
    },
    {
      title: "Projects",
      icon: <Award className="h-6 w-6" />,
      fields: ["projects"]
    },
    {
      title: "Experience",
      icon: <Briefcase className="h-6 w-6" />,
      fields: ["experience"]
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string | string[]) => {
    setFormData({
      ...formData,
      projects: formData.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    });
  };

  const handleAddProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { ...defaultProject, id: Date.now().toString() }]
    });
  };

  const handleRemoveProject = (id: string) => {
    if (formData.projects.length <= 1) return;
    
    setFormData({
      ...formData,
      projects: formData.projects.filter(project => project.id !== id)
    });
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string | boolean) => {
    setFormData({
      ...formData,
      experience: formData.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { ...defaultExperience, id: Date.now().toString() }]
    });
  };

  const handleRemoveExperience = (id: string) => {
    if (formData.experience.length <= 1) return;
    
    setFormData({
      ...formData,
      experience: formData.experience.filter(exp => exp.id !== id)
    });
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const requiredFields = formSteps[stepIndex].fields.filter(field => {
      // Fields that are not required
      if (field === 'profile_photo_url' || field === 'resume_url' || 
          field === 'github_url' || field === 'linkedin_url' || 
          field === 'phone_number' || field === 'cgpa' ||
          field === 'projects' || field === 'experience') {
        return false;
      }
      return true;
    });
    
    if (stepIndex === 2 && formData.skills.length === 0) {
      return false;
    }
    
    return requiredFields.every(field => {
      const value = formData[field as keyof StudentProfileData];
      return value !== undefined && value !== '';
    });
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
    setSuccess('');
    setIsSubmitting(true);
    
    // Set a timeout to handle long processing time
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setError('Submission is taking longer than expected. Please try again.');
        setIsSubmitting(false);
      }
    }, 10000);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to create a student profile');
      }
      
      // Save profile to Supabase
      const { error: supabaseError } = await supabase
        .from('student_profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          bio: formData.bio,
          profile_photo_url: formData.profile_photo_url,
          resume_url: formData.resume_url,
          github_url: formData.github_url,
          linkedin_url: formData.linkedin_url,
          bits_id: formData.bits_id,
          graduation_year: formData.graduation_year,
          degree: formData.degree,
          major: formData.major,
          campus: formData.campus,
          cgpa: formData.cgpa,
          skills: formData.skills,
          phone_number: formData.phone_number,
          projects: formData.projects,
          experience: formData.experience,
          updated_at: new Date().toISOString()
        });
      
      clearTimeout(timeoutId);
      
      if (supabaseError) throw supabaseError;
      
      // Update profile completion state
      const isComplete = checkProfileCompletion(formData);
      setIsProfileComplete(isComplete);
      
      // Show success message
      setSuccess(isEditMode ? 
        "Profile updated successfully!" : 
        "Profile created successfully!");
      
      // Set edit mode for future updates
      setIsEditMode(true);
      
      // Refresh profile if needed
      await refreshProfile();
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/internships');
      }, 2000);
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error saving student profile:', error);
      setError(error.message || 'An error occurred while saving your profile');
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
        
        {success && (
          <div className="bg-green-900/50 text-green-200 p-4 rounded-lg text-sm font-medium flex items-start gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        
        {step.fields.map(field => {
          switch (field) {
            case 'skills':
              return renderSkillsField();
            case 'projects':
              return renderProjectsField();
            case 'experience':
              return renderExperienceField();
            default:
              return renderField(field as keyof StudentProfileData);
          }
        })}
      </div>
    );
  };

  // Render individual form fields based on field name
  const renderField = (fieldName: keyof StudentProfileData) => {
    // Common props for all inputs
    const commonProps = {
      id: fieldName,
      name: fieldName,
      value: formData[fieldName] as string,
      onChange: handleChange,
      className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
    };

    // Field labels and placeholders
    const fieldConfig: Record<keyof StudentProfileData, { label: string, placeholder: string, required: boolean, type?: string }> = {
      full_name: { label: "Full Name", placeholder: "e.g., Rahul Sharma", required: true },
      email: { label: "Email", placeholder: "e.g., example@gmail.com", required: true, type: "email" },
      bio: { label: "Bio", placeholder: "Tell us about yourself, your interests and aspirations...", required: true },
      profile_photo_url: { label: "Profile Photo URL", placeholder: "e.g., https://example.com/photo.jpg", required: false, type: "url" },
      resume_url: { label: "Resume/CV URL", placeholder: "e.g., https://drive.google.com/your-resume-link", required: false, type: "url" },
      github_url: { label: "GitHub URL", placeholder: "e.g., https://github.com/username", required: false, type: "url" },
      linkedin_url: { label: "LinkedIn URL", placeholder: "e.g., https://linkedin.com/in/username", required: false, type: "url" },
      bits_id: { label: "BITS ID", placeholder: "e.g., 2020A7PS0123P", required: true },
      graduation_year: { label: "Expected Graduation Year", placeholder: "e.g., 2024", required: true },
      degree: { label: "Degree", placeholder: "Select degree", required: true },
      major: { label: "Major/Branch", placeholder: "e.g., Computer Science", required: true },
      campus: { label: "BITS Campus", placeholder: "Select campus", required: true },
      cgpa: { label: "CGPA", placeholder: "e.g., 9.5", required: false, type: "number" },
      skills: { label: "Skills", placeholder: "", required: true },
      phone_number: { label: "Phone Number", placeholder: "e.g., +91 9876543210", required: false, type: "tel" },
      projects: { label: "Projects", placeholder: "", required: false },
      experience: { label: "Experience", placeholder: "", required: false }
    };
    
    const config = fieldConfig[fieldName];
    
    // Return different input types based on field name
    switch (fieldName) {
      case 'bio':
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
      
      case 'campus':
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
      
      case 'degree':
        return (
          <div key={fieldName} className="space-y-2">
            <label htmlFor={fieldName} className="block text-base font-medium text-gray-300">
              {config.label} {config.required && <span className="text-indigo-400">*</span>}
            </label>
            <select
              {...commonProps}
              required={config.required}
            >
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MSc">MSc</option>
              <option value="MBA">MBA</option>
              <option value="PhD">PhD</option>
              <option value="Dual Degree">Dual Degree</option>
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
              min={fieldName === 'cgpa' ? "0" : undefined}
              max={fieldName === 'cgpa' ? "10" : undefined}
              step={fieldName === 'cgpa' ? "0.01" : undefined}
            />
          </div>
        );
    }
  };

  // Render skills input field
  const renderSkillsField = () => {
    return (
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-300">
          Skills <span className="text-indigo-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g., JavaScript, Python, React"
            className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSkillAdd();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSkillAdd}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.skills.map((skill, index) => (
            <div 
              key={index}
              className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full flex items-center text-sm"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          
          {formData.skills.length === 0 && (
            <div className="text-gray-500 text-sm italic">No skills added yet</div>
          )}
        </div>
      </div>
    );
  };

  // Render projects fields
  const renderProjectsField = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <label className="block text-base font-medium text-gray-300">
            Projects
          </label>
          <button
            type="button"
            onClick={handleAddProject}
            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Project
          </button>
        </div>
        
        {formData.projects.map((project, index) => (
          <div key={project.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-white">Project {index + 1}</h3>
              {formData.projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProject(project.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => handleProjectChange(project.id, 'title', e.target.value)}
                  placeholder="e.g., E-commerce Website"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={project.tech_stack.join(', ')}
                  onChange={(e) => handleProjectChange(
                    project.id, 
                    'tech_stack', 
                    e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
                  )}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  value={project.url}
                  onChange={(e) => handleProjectChange(project.id, 'url', e.target.value)}
                  placeholder="e.g., https://github.com/username/project"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render experience fields
  const renderExperienceField = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <label className="block text-base font-medium text-gray-300">
            Work Experience
          </label>
          <button
            type="button"
            onClick={handleAddExperience}
            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add Experience
          </button>
        </div>
        
        {formData.experience.map((exp, index) => (
          <div key={exp.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-white">Experience {index + 1}</h3>
              {formData.experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Role/Position
                </label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                  placeholder="e.g., Software Engineering Intern"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exp.start_date}
                    onChange={(e) => handleExperienceChange(exp.id, 'start_date', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exp.end_date}
                    onChange={(e) => handleExperienceChange(exp.id, 'end_date', e.target.value)}
                    disabled={exp.is_current}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.is_current}
                  onChange={(e) => handleExperienceChange(exp.id, 'is_current', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                />
                <label htmlFor={`current-${exp.id}`} className="ml-2 text-sm text-gray-300">
                  I currently work here
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isEditMode ? (
              <>
                Update Profile
                <Upload className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Complete Profile
                <Upload className="ml-2 h-5 w-5" />
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

  // Loading state
  if (!isProfileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <User className="h-8 w-8 mr-3 text-indigo-500" />
        {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
      </h1>
      
      {isProfileComplete && isEditMode && (
        <div className="bg-green-900/30 text-green-200 p-4 rounded-lg mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p>Your profile is complete! You can now apply for internships with a single click.</p>
        </div>
      )}
      
      {renderProgressBar()}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl">
        {renderCurrentStep()}
        {renderNavButtons()}
      </form>
    </div>
  );
};

export default StudentProfilePage;