import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Camera, 
  MapPin, 
  Calendar, 
  Heart, 
  Star, 
  Edit, 
  Trash2, 
  Download,
  Share2,
  Image as ImageIcon,
  Sparkles,
  Book,
  Plane,
  Car,
  Train,
  Ship,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Scrapbook, TravelMemory, InsertScrapbook, InsertTravelMemory } from '@shared/schema';

interface ScrapbookWithMemories extends Scrapbook {
  memories: TravelMemory[];
}

type ThemeKey = 'vintage' | 'modern' | 'nature' | 'city' | 'adventure';

const THEMES: Record<ThemeKey, { bg: string; text: string; accent: string; border: string }> = {
  vintage: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
    text: 'text-amber-900',
    accent: 'text-amber-600',
    border: 'border-amber-200'
  },
  modern: {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-100',
    text: 'text-slate-900',
    accent: 'text-blue-600',
    border: 'border-slate-200'
  },
  nature: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
    text: 'text-green-900',
    accent: 'text-green-600',
    border: 'border-green-200'
  },
  city: {
    bg: 'bg-gradient-to-br from-purple-50 to-indigo-100',
    text: 'text-purple-900',
    accent: 'text-purple-600',
    border: 'border-purple-200'
  },
  adventure: {
    bg: 'bg-gradient-to-br from-red-50 to-orange-100',
    text: 'text-red-900',
    accent: 'text-red-600',
    border: 'border-red-200'
  }
};

const TRANSPORT_ICONS: Record<string, React.ComponentType<any>> = {
  plane: Plane,
  car: Car,
  train: Train,
  ship: Ship,
  walking: MapPin
};

export default function ScrapbookPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [selectedScrapbook, setSelectedScrapbook] = useState<ScrapbookWithMemories | null>(null);
  const [isCreatingScrapbook, setIsCreatingScrapbook] = useState(false);
  const [isCreatingMemory, setIsCreatingMemory] = useState(false);
  
  // New scrapbook form state
  const [newScrapbookTitle, setNewScrapbookTitle] = useState('');
  const [newScrapbookTheme, setNewScrapbookTheme] = useState<ThemeKey>('modern');
  
  // New memory form state
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    images: [] as string[],
    tags: [] as string[],
    rating: 5,
    transportMode: 'plane',
    isFavorite: false
  });
  const [newTag, setNewTag] = useState('');

  // Fetch scrapbooks from API
  const { data: scrapbooks = [], isLoading: isLoadingScrapbooks } = useQuery<ScrapbookWithMemories[]>({
    queryKey: ['/api/scrapbooks'],
    queryFn: async () => {
      const response = await fetch('/api/scrapbooks', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error('Failed to fetch scrapbooks');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false
  });

  // Create scrapbook mutation
  const createScrapbookMutation = useMutation({
    mutationFn: async (data: InsertScrapbook) => {
      const response = await apiRequest('/api/scrapbooks', {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scrapbooks'] });
      setNewScrapbookTitle('');
      setIsCreatingScrapbook(false);
      toast({
        title: "Scrapbook Created",
        description: "Your new scrapbook has been created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scrapbook",
        variant: "destructive"
      });
    }
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async ({ scrapbookId, data }: { scrapbookId: number; data: InsertTravelMemory }) => {
      const response = await apiRequest(`/api/scrapbooks/${scrapbookId}/memories`, {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scrapbooks'] });
      setNewMemory({
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        images: [],
        tags: [],
        rating: 5,
        transportMode: 'plane',
        isFavorite: false
      });
      setIsCreatingMemory(false);
      toast({
        title: "Memory Added",
        description: "Your travel memory has been added to the scrapbook!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add memory",
        variant: "destructive"
      });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Book className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Travel Memory Scrapbook</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to create and manage your travel memories
          </p>
        </motion.div>
      </div>
    );
  }

  const createScrapbook = () => {
    if (!newScrapbookTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your scrapbook",
        variant: "destructive"
      });
      return;
    }

    const themeConfig = THEMES[newScrapbookTheme];
    createScrapbookMutation.mutate({
      title: newScrapbookTitle,
      theme: newScrapbookTheme,
      backgroundColor: themeConfig.bg,
      textColor: themeConfig.text,
      userId: user?.id || 0
    });
  };

  const addMemory = () => {
    if (!selectedScrapbook || !newMemory.title?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the memory title",
        variant: "destructive"
      });
      return;
    }

    createMemoryMutation.mutate({
      scrapbookId: selectedScrapbook.id,
      data: {
        ...newMemory,
        scrapbookId: selectedScrapbook.id
      } as InsertTravelMemory
    });
  };

  const addTag = () => {
    if (newTag.trim() && !newMemory.tags.includes(newTag.trim())) {
      setNewMemory(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you would upload these to a server
      // For now, we'll create object URLs for preview
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setNewMemory(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const TransportIcon = ({ mode }: { mode: string }) => {
    const Icon = TRANSPORT_ICONS[mode] || TRANSPORT_ICONS.plane;
    return <Icon className="h-4 w-4" />;
  };

  if (selectedScrapbook) {
    const theme = THEMES[selectedScrapbook.theme as ThemeKey] || THEMES.modern;
    
    return (
      <div className={`min-h-screen ${theme.bg}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedScrapbook(null)}
                className={theme.text}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scrapbooks
              </Button>
              <div>
                <h1 className={`text-3xl font-bold ${theme.text}`}>
                  {selectedScrapbook.title}
                </h1>
                <p className={`${theme.accent} flex items-center gap-2`}>
                  <Calendar className="h-4 w-4" />
                  Created {new Date(selectedScrapbook.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <Dialog open={isCreatingMemory} onOpenChange={setIsCreatingMemory}>
              <DialogTrigger asChild>
                <Button className={`${theme.accent} hover:${theme.accent}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Memory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Travel Memory</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={newMemory.title}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Memory title..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        value={newMemory.location}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Where was this?"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newMemory.description}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us about this memory..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={newMemory.date}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer ${
                              star <= newMemory.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => setNewMemory(prev => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {newMemory.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Transport Mode</label>
                    <div className="flex gap-2 mt-2">
                      {Object.keys(TRANSPORT_ICONS).map((mode) => {
                        const Icon = TRANSPORT_ICONS[mode];
                        return (
                          <Button
                            key={mode}
                            type="button"
                            variant={newMemory.transportMode === mode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewMemory(prev => ({ ...prev, transportMode: mode }))}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Images</label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Images
                      </Button>
                      {newMemory.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {newMemory.images.map((image, idx) => (
                            <div key={idx} className="relative aspect-square">
                              <img
                                src={image}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatingMemory(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addMemory} disabled={createMemoryMutation.isPending}>
                    {createMemoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Memory
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Memories Grid */}
          <AnimatePresence>
            {selectedScrapbook.memories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <ImageIcon className={`mx-auto h-16 w-16 ${theme.accent} mb-4`} />
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>No memories yet</h3>
                <p className={`${theme.accent} mb-6`}>Start adding your travel memories to this scrapbook</p>
                <Button onClick={() => setIsCreatingMemory(true)} className={theme.accent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Memory
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedScrapbook.memories.map((memory) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <Card className={`${theme.bg} ${theme.border} border-2 overflow-hidden hover:shadow-lg transition-all duration-300`}>
                      <div className="relative h-48 overflow-hidden">
                        {memory.images && memory.images.length > 0 ? (
                          <div className="relative h-full">
                            <img
                              src={memory.images[0]}
                              alt={memory.title}
                              className="w-full h-full object-cover"
                            />
                            {memory.images.length > 1 && (
                              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                                +{memory.images.length - 1}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`absolute top-2 left-2 ${memory.isFavorite ? 'text-red-500' : 'text-white'}`}
                        >
                          <Heart className={`h-4 w-4 ${memory.isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className={`${theme.text} text-lg`}>
                            {memory.title}
                          </CardTitle>
                          <div className="flex gap-1">
                            {Array.from({ length: memory.rating || 5 }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        
                        {memory.location && (
                          <div className={`flex items-center gap-1 text-sm ${theme.accent}`}>
                            <MapPin className="h-3 w-3" />
                            {memory.location}
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent>
                        {memory.description && (
                          <p className={`text-sm ${theme.text} mb-3 line-clamp-2`}>
                            {memory.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(memory.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TransportIcon mode={memory.transportMode || 'plane'} />
                            {memory.transportMode}
                          </div>
                        </div>
                        
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {memory.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{memory.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Main scrapbooks view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Travel Memory Scrapbook</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Capture and cherish your travel memories in beautiful, personalized scrapbooks
          </p>
        </motion.div>

        {/* Create New Scrapbook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Dialog open={isCreatingScrapbook} onOpenChange={setIsCreatingScrapbook}>
            <DialogTrigger asChild>
              <Button size="lg" className="mx-auto block">
                <Plus className="h-5 w-5 mr-2" />
                Create New Scrapbook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Scrapbook</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newScrapbookTitle}
                    onChange={(e) => setNewScrapbookTitle(e.target.value)}
                    placeholder="My Amazing Trip to..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewScrapbookTheme(key as ThemeKey)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newScrapbookTheme === key
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${theme.bg}`}
                      >
                        <div className="w-full h-8 rounded mb-1"></div>
                        <span className={`text-xs font-medium ${theme.text}`}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreatingScrapbook(false)}>
                  Cancel
                </Button>
                <Button onClick={createScrapbook} disabled={createScrapbookMutation.isPending}>
                  {createScrapbookMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Scrapbook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Loading State */}
        {isLoadingScrapbooks && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your scrapbooks...</p>
          </div>
        )}

        {/* Scrapbooks Grid */}
        {!isLoadingScrapbooks && (
          <AnimatePresence>
            {scrapbooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Sparkles className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No scrapbooks yet</h3>
                <p className="text-gray-600 mb-6">Create your first scrapbook to start collecting memories</p>
                <Button onClick={() => setIsCreatingScrapbook(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Scrapbook
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scrapbooks.map((scrapbook) => {
                  const theme = THEMES[scrapbook.theme as ThemeKey] || THEMES.modern;
                  return (
                    <motion.div
                      key={scrapbook.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedScrapbook(scrapbook)}
                    >
                      <Card className={`${theme.bg} ${theme.border} border-2 overflow-hidden hover:shadow-lg transition-all duration-300`}>
                        <div className="h-32 relative overflow-hidden">
                          <div className={`absolute inset-0 ${theme.bg} opacity-90`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Book className={`h-12 w-12 ${theme.accent}`} />
                          </div>
                          {scrapbook.memories.some((m: TravelMemory) => m.isFavorite) && (
                            <Heart className="absolute top-2 right-2 h-5 w-5 text-red-500 fill-current" />
                          )}
                        </div>
                        
                        <CardHeader>
                          <CardTitle className={`${theme.text} text-xl`}>
                            {scrapbook.title}
                          </CardTitle>
                          <div className="flex items-center justify-between text-sm">
                            <span className={theme.accent}>
                              {scrapbook.memories.length} memories
                            </span>
                            <Badge variant="outline" className={`${theme.accent} ${theme.border}`}>
                              {scrapbook.theme}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(scrapbook.createdAt).toLocaleDateString()}
                          </div>
                          
                          {scrapbook.memories.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-xs text-muted-foreground">Recent memories:</div>
                              <div className="flex flex-wrap gap-1">
                                {scrapbook.memories.slice(0, 3).map((memory: TravelMemory) => (
                                  <Badge key={memory.id} variant="secondary" className="text-xs">
                                    {memory.title.substring(0, 15)}...
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}