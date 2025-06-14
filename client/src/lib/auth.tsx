import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

// Define User type locally since importing from schema has path issues
interface User {
  id: number;
  username: string;
  email: string | null;
  googleId?: string | null;
  profilePicture?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount and handle URL error parameters
  useEffect(() => {
    // Check for error params in URL (e.g., from failed OAuth)
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Remove the error parameter from URL to prevent showing it again on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    checkAuthStatus();
    
    // Check for authentication state changes via cookies
    const checkAuthStateChange = () => {
      const oauthSuccess = document.cookie.includes('oauth_success=true');
      const authState = document.cookie.includes('auth_state=authenticated');
      
      if (oauthSuccess || authState) {
        console.log('Authentication state change detected, refreshing auth status');
        checkAuthStatus();
        
        // Clean up temporary cookies
        if (oauthSuccess) {
          document.cookie = 'oauth_success=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    };
    
    // Check immediately and set up polling for auth state changes
    checkAuthStateChange();
    const authCheckInterval = setInterval(checkAuthStateChange, 2000);
    
    // Listen for storage events to handle auth state changes from other tabs/OAuth callbacks
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkAuthStatus);
    
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, []);

  // Function to check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Checking auth status...");
      const response = await apiRequest('/auth/status');
      console.log("Auth status response:", response);
      
      if (response.isAuthenticated) {
        console.log("User is authenticated:", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log("User is not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking authentication status:', err);
      setError('Failed to check authentication status');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await apiRequest('/auth/logout', { method: 'POST' });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    checkAuthStatus,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook to access only the user information
export function useUser() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { user, isAuthenticated, isLoading };
}