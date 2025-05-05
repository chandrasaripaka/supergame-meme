import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { FaGoogle } from 'react-icons/fa';
import { LocalLogin } from '@/components/LocalLogin';

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { isLoading, error } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle Google login
  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    window.location.href = '/auth/google';
  };

  // Handle continue as guest
  const handleContinueAsGuest = () => {
    setLocation('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-2 text-center">
          <div className="flex justify-center py-4">
            <img 
              src="/logo.svg" 
              alt="AI Travel Concierge" 
              className="h-20 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/favicon.svg';
              }}  
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
            Welcome to AI Travel Concierge
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Sign in to save your travel plans and chat history
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button
            variant="default"
            size="lg"
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
            onClick={handleGoogleLogin}
            disabled={isLoading || isRedirecting}
          >
            <FaGoogle className="text-red-500" />
            {isRedirecting ? 'Redirecting...' : 'Sign in with Google'}
          </Button>
          
          <div className="flex items-center gap-2 py-2">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleContinueAsGuest}
            disabled={isLoading || isRedirecting}
          >
            Continue as Guest
          </Button>
          
          <div className="flex items-center gap-2 py-2">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500 dark:text-gray-400">testing only</span>
            <Separator className="flex-1" />
          </div>
          
          <LocalLogin />
        </CardContent>
        
        <CardFooter className="flex justify-center text-center text-sm text-gray-500 dark:text-gray-400 pt-0">
          <p>
            Guest sessions will only be saved on this device and may be removed after a period of inactivity.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}