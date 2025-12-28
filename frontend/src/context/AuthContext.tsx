/**
 * Authentication context for EVG Ultimate Team.
 *
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser } from '@types/auth';
import * as authService from '@services/authService';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, isAdmin?: boolean, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, isAdminLogin = false, password?: string) => {
    try {
      let authToken;

      if (isAdminLogin && password) {
        // Admin login
        authToken = await authService.loginAdmin(username, password);
      } else {
        // Participant login
        authToken = await authService.loginParticipant(username);
      }

      // Update user state
      setUser({
        id: authToken.user_id || 0,
        username: authToken.username,
        is_admin: authToken.is_admin,
        is_groom: authToken.is_groom,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context.
 *
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
