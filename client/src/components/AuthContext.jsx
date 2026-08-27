import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem('collabboard_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  // confirm the stored token is still valid on load
  useEffect(() => {
    const token = localStorage.getItem('collabboard_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('collabboard_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('collabboard_user', JSON.stringify(user));
    else localStorage.removeItem('collabboard_user');
  }, [user]);

  const save = ({ user: u, token }) => {
    localStorage.setItem('collabboard_token', token);
    setUser(u);
    return u;
  };

  const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return save(data);
  };

  const register = async (name, email, password) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    return save(data);
  };

  const forgotPassword = async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('collabboard_token');
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));
  const deleteAccount = () => logout();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        forgotPassword,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}