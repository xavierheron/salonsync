import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, loadingScreen }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data);
        } catch {
          removeToken();
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = (userData, token) => {
    setToken(token);
    const knownUsers = JSON.parse(localStorage.getItem('knownUsers') || '[]');
    const isFirst = !knownUsers.includes(userData.id);
    if (isFirst) knownUsers.push(userData.id);
    localStorage.setItem('knownUsers', JSON.stringify(knownUsers));
    setUser({ ...userData, isFirstLogin: isFirst });
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.hash = '#/login';
  };

  if (loading) return loadingScreen || null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);