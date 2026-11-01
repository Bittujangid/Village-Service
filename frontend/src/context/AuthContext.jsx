import React, { createContext, useContext, useState, useEffect } from 'react';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const TOKEN_KEY = 'gramseva_token';
const EXPIRY_KEY = 'gramseva_token_expires_at';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      // Prioritize session-only storage, falling back to localStorage
      const storedToken =
        sessionStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      const expiresAt =
        sessionStorage.getItem(EXPIRY_KEY) ||
        localStorage.getItem(EXPIRY_KEY);

      // Check if stored token has expired (short expiration safe storage)
      if (storedToken && expiresAt) {
        if (Date.now() > Number(expiresAt)) {
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem(EXPIRY_KEY);
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

  // Enforce session-only persistence in Firebase Auth
  useEffect(() => {
    try {
      setPersistence(auth, browserSessionPersistence).catch((err) => {
        console.warn('Firebase session persistence init notice:', err?.message);
      });
    } catch (err) {
      console.warn('Firebase setPersistence err:', err?.message);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem(EXPIRY_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem(EXPIRY_KEY);
    }
  }, [token]);

  const login = (newToken, expiresInSeconds = 28800) => {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    try {
      // Store in sessionStorage for session-only persistence
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem(EXPIRY_KEY, expiresAt.toString());

      // Mirror to localStorage for compatibility
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
    } catch {
      // In case storage is blocked
    }
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem(EXPIRY_KEY);
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
