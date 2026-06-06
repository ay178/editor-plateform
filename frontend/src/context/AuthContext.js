import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/me')
        .then(res => {
          const u = res.data.user;
          // Normalize _id
          setUser({ ...u, _id: u._id || u.id });
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const u = res.data.user;
    const userData = { ...u, _id: u._id || u.id };
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/signup', { name, email, password, role });
    localStorage.setItem('token', res.data.token);
    const u = res.data.user;
    const userData = { ...u, _id: u._id || u.id };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
