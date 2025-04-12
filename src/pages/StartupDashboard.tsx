import React, { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Application {
  id: number;
  student_name: string;
  student_email: string;
  position: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

interface InternshipPosition {
  id: number;
  title: string;
  applications_count: number;
}

const StartupDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [positions, setPositions] = useState<InternshipPosition[]>([]);
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchPositions();
    }
  }, [user]);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('startup_id', user?.id)
      .order('applied_at', { ascending: false });

    if (data) setApplications(data);
  };

  const fetchPositions = async () => {
    const { data } = await supabase
      .from('internship_positions')
      .select('*')
      .eq('startup_id', user?.id);

    if (data) setPositions(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Startup Dashboard</h1>
        <button
          onClick={() => setShowNewPositionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Position
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Positions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold">Active Positions</h2>
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-sm">
              {positions.length}
            </span>
          </div>
          
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.id}
                className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{position.title}</h3>
                  <p className="text-sm text-gray-400">
                    {position.applications_count} applications
                  </p>
                </div>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Users className="ml-2 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{application.student_name}</h3>
                    <p className="text-sm text-gray-400">{application.position}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'pending'
                      ? 'bg-yellow-900/50 text-yellow-200'
                      : application.status === 'accepted'
                      ? 'bg-green-900/50 text-green-200'
                      : 'bg-red-900/50 text-red-200'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-400">
                    Applied {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;