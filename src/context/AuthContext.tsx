import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PlayerProfile, UserRole } from '../types.ts';
import { api, setAuthToken, getAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  profile: PlayerProfile | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateLocalProfile: (updates: Partial<PlayerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      // Auto login as demo player initially if no session exists for zero-friction exploration
      try {
        await demoLogin('PLAYER');
      } catch (err) {
        console.warn('Initial demo login skipped:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.error('Session restoration failed:', err);
      setAuthToken(null);
      // Fallback to demo login
      try {
        await demoLogin('PLAYER');
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setAuthToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      setAuthToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const email = role === 'ADMIN' ? 'demo.admin@rallysphere.com' : 'demo.player@rallysphere.com';
      const res = await api.auth.login({
        email,
        password: 'password123',
      });
      setAuthToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    setAuthToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateLocalProfile = (updates: Partial<PlayerProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile,
        updateLocalProfile,
      }}
    >
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
