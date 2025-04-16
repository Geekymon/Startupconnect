import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import InternshipPage from './pages/UpdatedInternshipPage';
import StartupRegistrationPage from './pages/StartupRegistrationPage';
import AuthPage from './pages/AuthPage';
import StartupDashboard from './pages/StartupDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import ProfileSettings from './pages/ProfileSettings';
import MyApplicationsPage from './pages/MyApplicationsPage';
import { Rocket } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'startup' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredType }) => {
  const { user, userType, isLoading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-indigo-500 animate-bounce mx-auto mb-4" />
          <p className="text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredType && userType !== requiredType) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        
        {/* Main content with proper padding for fixed navbar */}
        <main className="pt-16 sm:pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/internships"
              element={
                <ProtectedRoute>
                  <InternshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-startup"
              element={
                <ProtectedRoute requiredType="startup">
                  <StartupRegistrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/startup-dashboard"
              element={
                <ProtectedRoute requiredType="startup">
                  <StartupDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute requiredType="student">
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/student"
              element={
                <ProtectedRoute requiredType="student">
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-positions"
              element={
                <ProtectedRoute requiredType="startup">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold">My Positions</h1>
                    <p className="mt-4">Coming soon</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute requiredType="startup">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="mt-4">Coming soon</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/startups"
              element={
                <ProtectedRoute requiredType="student">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold">Startups</h1>
                    <p className="mt-4">Coming soon</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;