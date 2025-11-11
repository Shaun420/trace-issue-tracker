import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/mockData';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// ⚠️ DEVELOPMENT ONLY - Set to true to bypass auth
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    BYPASS_AUTH 
      ? { 
          id: 1,
          username: 'demo_user',
          email: 'demo@trace.com',
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin'
        }
      : null
  );
  const [loading, setLoading] = useState(!BYPASS_AUTH);
  const navigate = useNavigate();

  useEffect(() => {
    if (BYPASS_AUTH) {
      setLoading(false);
      return;
    }

    // Normal auth logic
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (BYPASS_AUTH) {
      toast.success('Auth bypassed - Development mode');
      navigate('/');
      return { success: true };
    }

    // Normal login logic
    try {
      const response = await api.post('/users/login/', { email, password });
      const { user, tokens } = response.data;
      
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      setUser(user);
      
      toast.success('Welcome back!');
      navigate('/');
      
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = () => {
    if (BYPASS_AUTH) {
      toast.info('Logout bypassed - Development mode');
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: BYPASS_AUTH || !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}