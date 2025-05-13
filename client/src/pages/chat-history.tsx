import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { ChatSession } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function ChatHistoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  
  // Fetch chat history for the logged-in user
  const { 
    data: chatSessions, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/chat-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/chat-sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      return response.json() as Promise<ChatSession[]>;
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  // Helper function to delete a chat session
  const deleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({queryKey: ['/api/chat-sessions']});
      
      toast({
        title: "Success",
        description: "Chat session deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle opening the delete dialog
  const handleDeleteClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter chat sessions based on search term and filter type
  const filteredSessions = chatSessions?.filter(session => {
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'temporary') return matchesSearch && session.isTemporary;
    if (filterType === 'permanent') return matchesSearch && !session.isTemporary;
    
    return matchesSearch;
  });

  if (!user) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your chat history
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat History</h1>
        <Link href="/">
          <Button>New Chat</Button>
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-2/3">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Chats
          </Label>
          <Input
            id="search"
            placeholder="Search by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <Label htmlFor="filter" className="text-sm font-medium">
            Filter By
          </Label>
          <Select 
            value={filterType} 
            onValueChange={setFilterType}
          >
            <SelectTrigger id="filter" className="mt-1">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chats</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-destructive">
                  Error loading chat history. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : filteredSessions?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No chat sessions found. Start a new conversation from the home page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableCaption>Your chat history</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title || 'Untitled Chat'}</TableCell>
                    <TableCell>{format(new Date(session.createdAt), 'PPP')}</TableCell>
                    <TableCell>{session.isTemporary ? 'Temporary' : 'Permanent'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/chat/${session.id}`}>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-destructive">
                  Error loading chat history. Please try again later.
                </p>
              </CardContent>
            </Card>
          ) : filteredSessions?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No chat sessions found. Start a new conversation from the home page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions?.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{session.title || 'Untitled Chat'}</CardTitle>
                    <CardDescription>
                      {format(new Date(session.createdAt), 'PPP')}
                      <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                        {session.isTemporary ? 'Temporary' : 'Permanent'}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {session.title || 'No title available'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/chat/${session.id}`}>
                      <Button variant="default" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteClick(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat session and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedSessionId && deleteSession(selectedSessionId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}