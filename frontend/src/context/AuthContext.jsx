import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'gramseva_token';
const EXPIRY_KEY = 'gramseva_token_expires_at';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
      const expiresAt = localStorage.getItem(EXPIRY_KEY);

      // Check if stored token has expired (short expiration safe storage)
      if (storedToken && expiresAt) {
        if (Date.now() > Number(expiresAt)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('token');
          localStorage.removeItem(EXPIRY_KEY);
          return null;
        }
      }
      return storedToken || null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem(EXPIRY_KEY);
    }
  }, [token]);

  const login = (newToken, expiresInSeconds = 28800) => {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
    } catch {
      // In case localStorage is blocked
    }
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem(EXPIRY_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
