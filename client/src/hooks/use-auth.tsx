import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  login: (username: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: authData,
    error,
    isLoading,
  } = useQuery<{isAuthenticated: boolean, user: User | null}, Error>({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { 
        method: "POST" 
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/status"], { isAuthenticated: false, user: null });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation<{success: boolean, user: User, isAuthenticated: boolean}, Error, string>({
    mutationFn: async (username: string) => {
      return await apiRequest('/api/local-auth/login', {
        method: 'POST',
        data: { username }
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/status"], { 
        isAuthenticated: true, 
        user: data.user 
      });
      toast({
        title: "Login successful",
        description: `Welcome, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const login = async (username: string) => {
    await loginMutation.mutateAsync(username);
  };

  const user = authData?.user || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        logout,
        login
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}