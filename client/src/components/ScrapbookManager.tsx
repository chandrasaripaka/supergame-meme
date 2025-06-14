import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  MapPin, 
  Star, 
  Calendar, 
  Camera, 
  Heart, 
  Tag, 
  Plane,
  Car,
  Train,
  Ship,
  Edit,
  Trash2,
  Share,
  Download
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Scrapbook {
  id: number;
  title: string;
  theme: string;
  backgroundColor: string;
  textColor: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface TravelMemory {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  images: string[];
  tags: string[];
  rating: number;
  transportMode: string;
  isFavorite: boolean;
  scrapbookId: number;
  createdAt: string;
  updatedAt: string;
}

export function ScrapbookManager() {
  const [selectedScrapbook, setSelectedScrapbook] = useState<number | null>(null);
  const [showCreateScrapbook, setShowCreateScrapbook] = useState(false);
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scrapbooks
  const { data: scrapbooks = [], isLoading: scrapbooksLoading } = useQuery<Scrapbook[]>({
    queryKey: ["/api/scrapbooks"],
  });

  // Fetch memories for selected scrapbook
  const { data: memories = [], isLoading: memoriesLoading } = useQuery<TravelMemory[]>({
    queryKey: ["/api/scrapbooks", selectedScrapbook, "memories"],
    enabled: !!selectedScrapbook,
  });

  // Create scrapbook mutation
  const createScrapbookMutation = useMutation({
    mutationFn: async (data: { title: string; theme: string; backgroundColor: string; textColor: string }) => {
      const response = await fetch("/api/scrapbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create scrapbook");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrapbooks"] });
      setShowCreateScrapbook(false);
      toast({ title: "Scrapbook created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create scrapbook", variant: "destructive" });
    },
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (data: Omit<TravelMemory, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create memory");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrapbooks", selectedScrapbook, "memories"] });
      setShowCreateMemory(false);
      toast({ title: "Memory added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add memory", variant: "destructive" });
    },
  });

  const transportIcons = {
    plane: Plane,
    car: Car,
    train: Train,
    ship: Ship,
  };

  const CreateScrapbookDialog = () => {
    const [formData, setFormData] = useState({
      title: "",
      theme: "modern",
      backgroundColor: "#F8FAFC",
      textColor: "#0F172A",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createScrapbookMutation.mutate(formData);
    };

    return (
      <Dialog open={showCreateScrapbook} onOpenChange={setShowCreateScrapbook}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Scrapbook</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Adventure in..."
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Theme</label>
              <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Background Color</label>
                <Input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Text Color</label>
                <Input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createScrapbookMutation.isPending}>
              {createScrapbookMutation.isPending ? "Creating..." : "Create Scrapbook"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateMemoryDialog = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      location: "",
      date: "",
      images: [] as string[],
      tags: [] as string[],
      rating: 5,
      transportMode: "plane",
      isFavorite: false,
      scrapbookId: selectedScrapbook || 0,
    });

    const [newTag, setNewTag] = useState("");
    const [newImage, setNewImage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createMemoryMutation.mutate(formData);
    };

    const addTag = () => {
      if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
        setNewTag("");
      }
    };

    const removeTag = (tag: string) => {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const addImage = () => {
      if (newImage.trim() && !formData.images.includes(newImage.trim())) {
        setFormData(prev => ({ ...prev, images: [...prev.images, newImage.trim()] }));
        setNewImage("");
      }
    };

    const removeImage = (image: string) => {
      setFormData(prev => ({ ...prev, images: prev.images.filter(i => i !== image) }));
    };

    return (
      <Dialog open={showCreateMemory} onOpenChange={setShowCreateMemory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Travel Memory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Amazing sunset at..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Paris, France"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your experience..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Transport Mode</label>
                <Select value={formData.transportMode} onValueChange={(value) => setFormData(prev => ({ ...prev, transportMode: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plane">Plane</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="ship">Ship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Images (URLs)</label>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Add image URL..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <Button type="button" onClick={addImage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Memory ${index + 1}`} 
                      className="w-full h-20 object-cover rounded cursor-pointer"
                      onClick={() => removeImage(image)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-white text-xs">Click to remove</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="rounded"
              />
              <label className="text-sm font-medium">Mark as favorite</label>
            </div>

            <Button type="submit" className="w-full" disabled={createMemoryMutation.isPending}>
              {createMemoryMutation.isPending ? "Adding..." : "Add Memory"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (scrapbooksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading scrapbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Travel Scrapbooks</h1>
        <Button onClick={() => setShowCreateScrapbook(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Scrapbook
        </Button>
      </div>

      {scrapbooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No scrapbooks yet</h2>
          <p className="text-gray-500 mb-4">Create your first travel scrapbook to start collecting memories</p>
          <Button onClick={() => setShowCreateScrapbook(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Scrapbook
          </Button>
        </div>
      ) : (
        <Tabs value={selectedScrapbook?.toString() || ""} onValueChange={(value) => setSelectedScrapbook(Number(value))}>
          <TabsList className="mb-6">
            {scrapbooks.map((scrapbook) => (
              <TabsTrigger key={scrapbook.id} value={scrapbook.id.toString()}>
                {scrapbook.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {scrapbooks.map((scrapbook) => (
            <TabsContent key={scrapbook.id} value={scrapbook.id.toString()}>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: scrapbook.textColor }}>
                    {scrapbook.title}
                  </h2>
                  <p className="text-gray-600">Theme: {scrapbook.theme}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowCreateMemory(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Memory
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div 
                className="min-h-[400px] rounded-lg p-6"
                style={{ backgroundColor: scrapbook.backgroundColor }}
              >
                {memoriesLoading ? (
                  <div className="text-center py-8">
                    <p>Loading memories...</p>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No memories yet</h3>
                    <p className="text-gray-500 mb-4">Add your first travel memory to this scrapbook</p>
                    <Button onClick={() => setShowCreateMemory(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Memory
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memories.map((memory) => {
                      const TransportIcon = transportIcons[memory.transportMode as keyof typeof transportIcons];
                      return (
                        <Card key={memory.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {memory.images.length > 0 && (
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={memory.images[0]} 
                                alt={memory.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg truncate">{memory.title}</h3>
                              {memory.isFavorite && (
                                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              )}
                            </div>
                            
                            {memory.location && (
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{memory.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm text-gray-600">{new Date(memory.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <TransportIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < memory.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {memory.description && (
                              <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                                {memory.description}
                              </p>
                            )}
                            
                            {memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {memory.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {memory.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{memory.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <CreateScrapbookDialog />
      <CreateMemoryDialog />
    </div>
  );
}