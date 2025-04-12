import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import InternshipPage from './pages/InternshipPage';
import StartupRegistrationPage from './pages/StartupRegistrationPage';
import AuthPage from './pages/AuthPage';
import StartupDashboard from './pages/StartupDashboard';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredType?: 'startup' | 'student';
}> = ({ children, requiredType }) => {
  const { user, userType } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (requiredType && userType !== requiredType) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
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
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;