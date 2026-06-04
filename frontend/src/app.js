import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseEditors from './pages/BrowseEditors';
import EditorProfile from './pages/EditorProfile';
import ClientDashboard from './pages/ClientDashboard';
import EditorDashboard from './pages/EditorDashboard';
import Messages from './pages/Messages';
import EditorPortfolio from './pages/EditorPortfolio';
import AIMatch from './pages/AIMatch';
import SmartPricing from './pages/SmartPricing';
import VideoScorer from './pages/VideoScorer';
import Collaboration from './pages/Collaboration';
import Wallet from './pages/Wallet';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Navbar from './components/Navbar';
import Cursor from './components/Cursor';
import './index.css';
import InstallPWA from './components/InstallPWA';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Cursor />
      <InstallPWA />
      <Navbar />
      <div className="page-wrap">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/editors" element={<BrowseEditors />} />
          <Route path="/editors/:id" element={<EditorProfile />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              {user?.role === 'editor'
                ? <EditorDashboard />
                : <ClientDashboard />}
            </PrivateRoute>
          } />

          {/* Client Only */}
          <Route path="/ai-match" element={
            <PrivateRoute role="client">
              <AIMatch />
            </PrivateRoute>
          } />

          {/* Editor Only */}
          <Route path="/portfolio" element={
            <PrivateRoute role="editor">
              <EditorPortfolio />
            </PrivateRoute>
          } />
          <Route path="/smart-pricing" element={
            <PrivateRoute role="editor">
              <SmartPricing />
            </PrivateRoute>
          } />
          <Route path="/video-scorer" element={
            <PrivateRoute role="editor">
              <VideoScorer />
            </PrivateRoute>
          } />

          {/* Shared Routes */}
          <Route path="/wallet" element={
            <PrivateRoute><Wallet /></PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute><Messages /></PrivateRoute>
          } />
          <Route path="/messages/:userId" element={
            <PrivateRoute><Messages /></PrivateRoute>
          } />
          <Route path="/collaboration" element={
            <PrivateRoute><Collaboration /></PrivateRoute>
          } />
          <Route path="/collaboration/:roomId" element={
            <PrivateRoute><Collaboration /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
