import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('collabboard_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('collabboard_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('collabboard_user');
    }
  }, [user]);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));
  const deleteAccount = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}