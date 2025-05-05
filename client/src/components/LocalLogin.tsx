import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export function LocalLogin() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuthStatus } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our special local auth endpoint
      const response = await apiRequest('/api/local-auth/login', {
        method: 'POST',
        data: { username }
      });
      
      console.log('Local login successful:', response);
      
      // Check auth status to update the UI
      await checkAuthStatus();
    } catch (err: any) {
      console.error('Local login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Quick Login</CardTitle>
        <CardDescription>
          Use this form to quickly log in without Google OAuth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="username"
                placeholder="Enter any username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          This is a testing-only login that bypasses OAuth.
        </p>
      </CardFooter>
    </Card>
  );
}