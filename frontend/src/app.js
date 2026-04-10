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
import Navbar from './components/Navbar';
import './index.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/editors" element={<BrowseEditors />} />
        <Route path="/editors/:id" element={<EditorProfile />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            {user?.role === 'editor' ? <EditorDashboard /> : <ClientDashboard />}
          </PrivateRoute>
        } />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/portfolio" element={
  <PrivateRoute role="editor">
    <EditorPortfolio />
  </PrivateRoute>
} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/editors'} />} />
      </Routes>
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
