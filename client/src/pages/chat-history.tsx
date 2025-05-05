import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';

// Define ChatSession type locally
interface ChatSession {
  id: number;
  userId?: number | null;
  title: string;
  isTemporary: boolean;
  createdAt: string;
  updatedAt: string;
}
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, MessageCircle, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatHistoryPage() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Query for chat sessions
  const {
    data: chatSessionsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/auth/chat-sessions'],
    enabled: isAuthenticated,
  });
  
  // Ensure we have an array of chat sessions
  const chatSessions: ChatSession[] = Array.isArray(chatSessionsData) ? chatSessionsData : [];

  // Mutation for deleting a chat session
  const deleteMutation = useMutation({
    mutationFn: (sessionId: number) =>
      apiRequest(`/auth/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/auth/chat-sessions'] });
    },
  });

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login via useEffect
  }

  const handleContinueChat = (sessionId: number) => {
    navigate(`/chat/${sessionId}`);
  };

  const handleDeleteChat = async (sessionId: number) => {
    try {
      await deleteMutation.mutateAsync(sessionId);
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          Your Chat History
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md">
            Error loading chat history: {(error as Error)?.message || 'Unknown error'}
          </div>
        ) : !chatSessions || chatSessions.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">No chat history found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Start a new conversation to create chat history.
            </p>
            <Button onClick={() => navigate('/')}>
              Start New Chat <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatSessions.map((session: ChatSession) => (
              <Card key={session.id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 
                    {formatDate(session.createdAt)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="py-2">
                  {session.isTemporary && (
                    <div className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-md mb-2">
                      Temporary Chat
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2">
                  <Button 
                    variant="default" 
                    onClick={() => handleContinueChat(session.id)}
                  >
                    Continue Chat
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this chat session and all its messages.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteChat(session.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
            
            {/* New Chat Button Card */}
            <Card className="flex flex-col justify-center items-center p-6 border-dashed">
              <MessageCircle className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-4">Start a New Conversation</h3>
              <Button onClick={() => navigate('/')}>
                New Chat
              </Button>
            </Card>
          </div>
        )}
      </main>
      
      <AppFooter />
    </div>
  );
}