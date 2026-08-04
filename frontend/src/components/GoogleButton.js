import { useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// role: pass 'client' or 'editor' when used on Signup page (creates account if new)
// role: leave undefined when used on Login page (only logs in existing accounts)
export default function GoogleButton({ role, onError }) {
  const { setUserDirectly } = useAuth();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await api.post('/google-auth', { credential: response.credential, role });
          setUserDirectly(res.data.token, res.data.user);
          window.location.href = res.data.user.role === 'client' ? '/dashboard/client' : '/dashboard/editor';
        } catch (err) {
          onError?.(err.response?.data?.message || 'Google sign-in failed');
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 360,
      shape: 'pill',
      text: role ? 'signup_with' : 'signin_with',
    });
  }, [role]);

  return <div ref={btnRef} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }} />;
}