import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseEditors from './pages/BrowseEditors';
import EditorProfile from './pages/EditorProfile';
import ClientDashboard from './pages/ClientDashboard';
import EditorDashboard from './pages/EditorDashboard';
import Messages from './pages/Messages';
import AIMatch from './pages/AIMatch';
import Collaboration from './pages/Collaboration';
import EditorPortfolio from './pages/EditorPortfolio';
import Pricing from './pages/Pricing';
import SmartPricing from './pages/SmartPricing';
import VideoScorer from './pages/VideoScorer';
import Wallet from './pages/Wallet';
import './index.css';
import VerifyEmail from './pages/VerifyEmail';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(124,58,237,0.2)',
          borderTop: '3px solid #7C3AED',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px'
        }} />
        <p style={{ color: '#9B9AB8', fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'client' ? '/dashboard/client' : '/dashboard/editor'} replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'client' ? '/dashboard/client' : '/dashboard/editor'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<BrowseEditors />} />
        <Route path="/editor/:userId" element={<EditorProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> 

        {/* Guest only */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        {/* Protected - Client */}
        <Route path="/dashboard/client" element={
          <ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>
        } />
        <Route path="/ai-match" element={
          <ProtectedRoute role="client"><AIMatch /></ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute><Wallet /></ProtectedRoute>
        } />

        {/* Protected - Editor */}
        <Route path="/dashboard/editor" element={
          <ProtectedRoute role="editor"><EditorDashboard /></ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute role="editor"><EditorPortfolio /></ProtectedRoute>
        } />
        <Route path="/smart-pricing" element={
          <ProtectedRoute role="editor"><SmartPricing /></ProtectedRoute>
        } />

        {/* Protected - Both */}
        <Route path="/messages" element={
          <ProtectedRoute><Messages /></ProtectedRoute>
        } />
        <Route path="/collab" element={
          <ProtectedRoute><Collaboration /></ProtectedRoute>
        } />
        <Route path="/video-scorer" element={
          <ProtectedRoute><VideoScorer /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: '#7C3AED' }}>404</div>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Page not found</h2>
      <p style={{ color: '#9B9AB8' }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ marginTop: 8 }}>Go Home →</button>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
