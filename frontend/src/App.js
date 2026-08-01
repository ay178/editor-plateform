import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SubscriptionPage from './pages/SubscriptionPage';
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
import SmartPricing from './pages/SmartPricing';
import VideoScorer from './pages/VideoScorer';
import Wallet from './pages/Wallet';
import './index.css';
import VerifyEmail from './pages/VerifyEmail';

// Replace the existing ProtectedRoute loading block in frontend/src/App.js with this.
// Find the function ProtectedRoute({ children, role }) { ... } block and swap in
// this "if (loading) return (...)" section.

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0F0F1A'
    }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="72" height="72" viewBox="0 0 512 512" style={{ animation: 'edithireLoaderPulse 1.4s ease-in-out infinite' }}>
          <defs>
            <linearGradient id="loaderTriGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="55%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
          </defs>
          <rect x="180" y="140" width="150" height="55" fill="#F1F0FF" />
          <rect x="180" y="317" width="150" height="55" fill="#F1F0FF" />
          <path d="M 180 140 L 180 372 L 370 256 Z" fill="url(#loaderTriGrad)" />
        </svg>
        <p style={{ color: '#9B9AB8', fontSize: 14, marginTop: 16 }}>Loading...</p>
      </div>
      <style>{`
        @keyframes edithireLoaderPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
      `}</style>
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
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
<Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<BrowseEditors />} />
        <Route path="/editor/:id" element={<EditorProfile />} />
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
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

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
