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

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

// Role-based route component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  
  // Get user's role and normalize it (ensure it's uppercase for comparison)
  const rawUserRole = user?.role?.toUpperCase();
  const userRole = rawUserRole
    ? rawUserRole.startsWith('ROLE_')
      ? rawUserRole
      : `ROLE_${rawUserRole}`
    : null;
  
  // Normalize allowed roles for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
  
  // Check if user role is allowed (case-insensitive)
  const isRoleAllowed = userRole ? normalizedAllowedRoles.includes(userRole) : false;

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isRoleAllowed) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'ROLE_STUDENT') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (userRole === 'ROLE_LECTURER' || userRole === 'ROLE_ADMIN') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Role-based redirection component for login success
const LoginSuccessRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === 'ROLE_STUDENT') {
    return <Navigate to="/student-dashboard" state={{ from: location }} replace />;
  } else if (user?.role === 'ROLE_LECTURER') {
    return <Navigate to="/lecturer-dashboard" state={{ from: location }} replace />;
  } else if (user?.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin-dashboard" state={{ from: location }} replace />;
  } else {
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

      {/* AI Assistant route - available for lecturers, students, and admins */}
      <Route 
        path="/ai-assistant" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ROLE_LECTURER', 'ROLE_STUDENT', 'ROLE_ADMIN']}>
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
