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
  const { user, isLoading, error } = useAuth();
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

  // Handle test login (development only)
  const handleTestLogin = async () => {
    try {
      const response = await fetch('/auth/test-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Force reload to pick up the new session
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen hero-gradient travel-bg-pattern p-4">
      <div className="relative z-10">
        <Card className="w-full max-w-md shadow-2xl card-glass border-0">
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
          <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Wander Notes Travel Concierge
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">
            AI-POWERED JOURNEY PLANNING
          </CardDescription>
          <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to save your travel plans and chat history
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
              Authentication error occurred
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
            <span className="text-sm text-gray-500 dark:text-gray-400">development only</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleTestLogin}
            disabled={isLoading || isRedirecting}
          >
            Test Login (Dev)
          </Button>
          
          <LocalLogin />
        </CardContent>
        
        <CardFooter className="flex justify-center text-center text-sm text-gray-500 dark:text-gray-400 pt-0">
          <p>
            Guest sessions will only be saved on this device and may be removed after a period of inactivity.
          </p>
        </CardFooter>
        </Card>
      </div>
      
      {/* Floating travel elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-animation absolute top-10 left-10 opacity-30">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M40 10L50 30H45V50H35V30H30L40 10Z" fill="white"/>
            <circle cx="40" cy="65" r="10" fill="white"/>
          </svg>
        </div>
        <div className="floating-animation absolute top-1/4 right-10 opacity-30" style={{animationDelay: '2s'}}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path d="M30 5L45 30L30 55L15 30L30 5Z" fill="white"/>
          </svg>
        </div>
        <div className="floating-animation absolute bottom-20 left-1/4 opacity-30" style={{animationDelay: '4s'}}>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <circle cx="45" cy="45" r="40" stroke="white" strokeWidth="3" fill="none"/>
            <path d="M25 45L45 25L65 45L45 65L25 45Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
}