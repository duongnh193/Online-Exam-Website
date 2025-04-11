import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import StudentDashboardPage from '../pages/StudentDashboardPage';
import ExamPage from '../pages/ExamPage';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

// Layout component for public routes with navbar and footer
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

// Protected route component that checks if user is authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Checking authentication');
  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('ProtectedRoute: isLoading =', isLoading);
  console.log('ProtectedRoute: user =', user);
  console.log('ProtectedRoute: location =', location);
  console.log('ProtectedRoute: localStorage =', {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
  });

  if (isLoading) {
    console.log('ProtectedRoute: Still loading auth state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: Authentication successful, rendering children');
  return children;
};

// Role-based route component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('RoleRoute check - user:', user);
  console.log('RoleRoute check - allowedRoles:', allowedRoles);
  console.log('RoleRoute check - user role:', user?.role);
  console.log('RoleRoute check - is allowed:', user?.role ? allowedRoles.includes(user.role) : false);

  if (isLoading) {
    console.log('RoleRoute - Still loading');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('RoleRoute - Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    console.log('RoleRoute - User role not allowed:', user?.role);
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'ROLE_STUDENT') {
      console.log('RoleRoute - Redirecting to student dashboard');
      return <Navigate to="/student-dashboard" replace />;
    } else if (user?.role === 'ROLE_LECTURER') {
      console.log('RoleRoute - Redirecting to lecturer dashboard');
      return <Navigate to="/dashboard" replace />;
    } else {
      console.log('RoleRoute - Unknown role, redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  console.log('RoleRoute - Role allowed, rendering children');
  return children;
};

// Role-based redirection component for login success
const LoginSuccessRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'ROLE_STUDENT') {
    console.log('LoginSuccessRoute - Redirecting to student dashboard');
    return <Navigate to="/student-dashboard" state={{ from: location }} replace />;
  } else if (user?.role === 'ROLE_LECTURER' || user?.role === 'ROLE_ADMIN') {
    console.log('LoginSuccessRoute - Redirecting to lecturer dashboard');
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  } else {
    console.log('LoginSuccessRoute - Unknown role, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        } 
      />

      {/* Protected lecturer routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}>
              <DashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Protected student routes */}
      <Route 
        path="/student-dashboard" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Exams route - available to all authenticated users but with role-specific views */}
      <Route 
        path="/exams" 
        element={
          <ProtectedRoute>
            <ExamPage />
          </ProtectedRoute>
        } 
      />

      {/* Results route - for students */}
      <Route 
        path="/results" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <PublicLayout>
                <div>Results Page</div>
              </PublicLayout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Redirect after login based on role */}
      <Route 
        path="/login/success" 
        element={
          <ProtectedRoute>
            <LoginSuccessRoute />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 