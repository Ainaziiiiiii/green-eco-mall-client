import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useGetMeQuery, useRefreshMutation, authApi } from '../api/authApi';
import { useDispatch } from 'react-redux';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthorized: boolean;
  login: (accessToken: string, refreshToken: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('accessToken'));
  const dispatch = useDispatch();

  const { data: user, isLoading: isUserLoading, isError } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });

  const [refreshMutation] = useRefreshMutation();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setHasToken(false);
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);

  const login = useCallback((accessToken: string, refreshToken: string, userId: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    setHasToken(true);
  }, []);

  // Auto-refresh: accessToken expires in 15 min → refresh at 14 min
  useEffect(() => {
    if (!hasToken) return;
    const id = setInterval(async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      try {
        const result = await refreshMutation(refreshToken).unwrap();
        if (result?.data?.accessToken) {
          localStorage.setItem('accessToken', result.data.accessToken);
          if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
        }
      } catch {
        logout();
      }
    }, 14 * 60 * 1000); // every 14 minutes
    return () => clearInterval(id);
  }, [hasToken, refreshMutation, logout]);

  // Auto-logout when server rejects the token (e.g. token invalid/expired)
  useEffect(() => {
    if (isError) logout();
  }, [isError, logout]);

  const value = useMemo(() => ({
    user: user?.data ?? null,
    isLoading: hasToken ? isUserLoading : false,
    isAuthorized: hasToken && !!user?.success,
    login,
    logout,
  }), [user, isUserLoading, hasToken, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
