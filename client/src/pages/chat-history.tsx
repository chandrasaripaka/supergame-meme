import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2, MessageCircle, Trash2, Search, Filter, Calendar, ArrowUpDown, Grid, List, Clock, Star } from 'lucide-react';
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
import { useAuth } from '@/lib/auth';
import { ChatSession } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function ChatHistoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch chat history for the logged-in user
  const { 
    data: chatSessions, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/chat-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/chat-sessions', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Return empty array for unauthorized users instead of throwing
          return [];
        }
        throw new Error('Failed to fetch chat history');
      }
      return response.json() as Promise<ChatSession[]>;
    },
    enabled: !!user, // Only fetch if user is logged in
    retry: false, // Don't retry on authentication errors
  });

  // Helper function to open a chat session
  const handleOpenChat = async (sessionId: number) => {
    try {
      // Store the session ID in localStorage to restore the conversation
      localStorage.setItem('restoreChatSession', sessionId.toString());
      
      // Navigate to home page where the chat will be restored
      window.location.href = '/';
    } catch (error) {
      console.error('Error opening chat:', error);
      toast({
        title: "Error",
        description: "Failed to open chat session",
        variant: "destructive",
      });
    }
  };

  // Helper function to delete a chat session
  const deleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
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
  
  // Enhanced filtering and sorting logic
  const filteredAndSortedSessions = chatSessions?.filter(session => {
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'temporary') return matchesSearch && session.isTemporary;
    if (filterType === 'permanent') return matchesSearch && !session.isTemporary;
    
    return matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        break;
      case 'type':
        comparison = a.isTemporary === b.isTemporary ? 0 : a.isTemporary ? 1 : -1;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Statistics for better UX
  const totalSessions = chatSessions?.length || 0;
  const filteredCount = filteredAndSortedSessions?.length || 0;
  const temporaryCount = chatSessions?.filter(s => s.isTemporary).length || 0;
  const permanentCount = chatSessions?.filter(s => !s.isTemporary).length || 0;

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
      {/* Header with statistics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chat History</h1>
          <p className="text-muted-foreground mt-1">
            {totalSessions > 0 ? (
              <>
                {filteredCount} of {totalSessions} chats
                {searchTerm && ` matching "${searchTerm}"`}
              </>
            ) : (
              "No chat sessions yet"
            )}
          </p>
        </div>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            <MessageCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Chats</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{totalSessions}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Permanent</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{permanentCount}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Temporary</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{temporaryCount}</div>
            </CardHeader>
          </Card>
        </div>
      )}
      
      {/* Enhanced Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="filter" className="text-sm font-medium">
                  Type Filter
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter" className="mt-1">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chats</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort" className="text-sm font-medium">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="mt-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="order" className="text-sm font-medium">
                  Sort Order
                </Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="order" className="mt-1">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Mode Toggle and Results */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {filteredCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            Sorted by {sortBy} ({sortOrder === 'desc' ? 'newest' : 'oldest'} first)
          </div>
        )}
      </div>

      {/* Results Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error && user ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Error loading chat history. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : filteredAndSortedSessions?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? `No chat sessions found matching "${searchTerm}"` : "No chat sessions found"}
            </p>
            <Link href="/">
              <Button>Start Your First Chat</Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
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
              {filteredAndSortedSessions?.map((session) => (
                <TableRow key={session.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      {session.title || 'Untitled Chat'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(session.createdAt), 'PPP')}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      session.isTemporary 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {session.isTemporary ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Temporary
                        </>
                      ) : (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Permanent
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenChat(session.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedSessions?.map((session) => (
            <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg truncate">{session.title || 'Untitled Chat'}</CardTitle>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    session.isTemporary 
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {session.isTemporary ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Temp
                      </>
                    ) : (
                      <>
                        <Star className="h-3 w-3 mr-1" />
                        Perm
                      </>
                    )}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(session.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs mt-1">
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {session.title || 'No preview available'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full mr-2"
                  onClick={() => handleOpenChat(session.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Open Chat
                </Button>
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