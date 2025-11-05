import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import LecturerDashboardPage from '../pages/LecturerDashboardPage';
import StudentDashboardPage from '../pages/StudentDashboardPage';
import ExamPage from '../pages/ExamPage';
import CreateExamPage from '../pages/CreateExamPage';
import SettingsPage from '../pages/SettingsPage';
import ClassPage from '../pages/ClassPage';
import StartExamPage from '../pages/StartExamPage';
import TakeExamPage from '../pages/TakeExamPage';
import ReportPage from '../pages/ReportPage';
import AIAssistantPage from '../pages/AIAssistantPage';
import ResultsPage from '../pages/ResultsPage';
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
    return null;
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
  
  // Get user's role and normalize it (ensure it's uppercase for comparison)
  const userRole = user?.role?.toUpperCase();
  console.log('RoleRoute check - normalized user role:', userRole);
  
  // Normalize allowed roles for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
  console.log('RoleRoute check - normalized allowed roles:', normalizedAllowedRoles);
  
  // Check if user role is allowed (case-insensitive)
  const isRoleAllowed = userRole ? normalizedAllowedRoles.includes(userRole) : false;
  console.log('RoleRoute check - is role allowed:', isRoleAllowed);

  if (isLoading) {
    console.log('RoleRoute - Still loading');
    return null;
  }

  if (!isAuthenticated) {
    console.log('RoleRoute - Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isRoleAllowed) {
    console.log('RoleRoute - User role not allowed:', userRole);
    // Redirect to appropriate dashboard based on role
    if (userRole === 'ROLE_STUDENT') {
      console.log('RoleRoute - Redirecting to student dashboard');
      return <Navigate to="/student-dashboard" replace />;
    } else if (userRole === 'ROLE_LECTURER' || userRole === 'ROLE_ADMIN') {
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
  } else if (user?.role === 'ROLE_LECTURER') {
    console.log('LoginSuccessRoute - Redirecting to lecturer dashboard');
    return <Navigate to="/lecturer-dashboard" state={{ from: location }} replace />;
  } else if (user?.role === 'ROLE_ADMIN') {
    console.log('LoginSuccessRoute - Redirecting to admin dashboard');
    return <Navigate to="/admin-dashboard" state={{ from: location }} replace />;
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

      {/* Protected admin route */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboardPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Protected lecturer route */}
      <Route 
        path="/lecturer-dashboard" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER']}>
              <LecturerDashboardPage />
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

      {/* Student-specific routes */}
      <Route 
        path="/my-classes" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <ClassPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/results" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <ResultsPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Legacy dashboard route - redirect based on role */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <LoginSuccessRoute />
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

      {/* Exams route - available to all authenticated users but with role-specific views */}
      <Route 
        path="/exams" 
        element={
          <ProtectedRoute>
            <ExamPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Create exam route - only for lecturers and admins */}
      <Route 
        path="/create-exam" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}>
              <CreateExamPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      {/* Edit exam route - only for lecturers and admins */}
      <Route 
        path="/edit-exam/:examId" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}>
              <CreateExamPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Class route - for managing examinees */}
      <Route 
        path="/class" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}>
              <ClassPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      {/* Reports route - only for lecturers and admins */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN']}>
              <ReportPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Settings route - for all users */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_ADMIN', 'ROLE_STUDENT']}>
              <SettingsPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* AI Assistant route - available for lecturers and students */}
      <Route 
        path="/ai-assistant" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_STUDENT']}>
              <AIAssistantPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Start Exam route - only for students */}
      <Route 
        path="/start-exam/:examId" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <StartExamPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      {/* Take Exam route - only for students */}
      <Route 
        path="/take-exam/:examId/questions" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_STUDENT']}>
              <TakeExamPage />
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
