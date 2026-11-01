import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const TOKEN_KEY = 'gramseva_token';
const EXPIRY_KEY = 'gramseva_token_expires_at';

// Helper to purge any legacy/stale auth items from localStorage
const purgeLocalStorageAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  } catch (e) {
    // ignore if localStorage is restricted
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // 1. Immediately wipe any lingering localStorage auth keys on mount
    purgeLocalStorageAuth();

    try {
      // 2. Enforce session-only: read STRICTLY from sessionStorage
      const storedToken =
        sessionStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem('token');

      const expiresAt = sessionStorage.getItem(EXPIRY_KEY);

      // Check if stored token has expired
      if (storedToken && expiresAt) {
        if (Date.now() > Number(expiresAt)) {
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem(EXPIRY_KEY);
          return null;
        }
      }
      return storedToken || null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  // Enforce session-only persistence in Firebase Auth & keep in sync
  useEffect(() => {
    // Purge localStorage again on mount
    purgeLocalStorageAuth();

    // Enforce Firebase session-only persistence
    setPersistence(auth, browserSessionPersistence).catch((err) => {
      console.warn('Firebase session persistence init notice:', err?.message);
    });

    // onAuthStateChanged listener: ensure Firebase session does not linger without active sessionStorage
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      purgeLocalStorageAuth();
      const sessionActive = sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem('token');
      // If Firebase thinks a user is logged in (e.g. from IndexedDB), but our sessionStorage has no token, sign out!
      if (user && !sessionActive) {
        signOut(auth).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem(EXPIRY_KEY);
      purgeLocalStorageAuth();
    }
  }, [token]);

  const login = (newToken, expiresInSeconds = 28800) => {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    try {
      // Store STRICTLY in sessionStorage for session-only persistence
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem(EXPIRY_KEY, expiresAt.toString());

      // Never write to localStorage for auth - proactively purge
      purgeLocalStorageAuth();
    } catch {
      // In case storage is blocked
    }
    setToken(newToken);
  };

  const logout = async () => {
    setToken(null);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem(EXPIRY_KEY);
      purgeLocalStorageAuth();
    } catch {
      // ignore
    }

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (fbErr) {
      console.warn('Firebase signOut error:', fbErr?.message);
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
