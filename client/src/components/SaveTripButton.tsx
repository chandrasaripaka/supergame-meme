import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "./ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { extractTravelIntent } from "@/lib/gemini";
import { Message } from "@/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SaveTripButtonProps {
  messages: Message[];
  destination: string;
}

export function SaveTripButton({ messages, destination }: SaveTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [companions, setCompanions] = useState<string[]>([]);
  const [newCompanion, setNewCompanion] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extract travel information from messages
  const travelIntent = extractTravelIntent(messages);

  // Pre-populate form when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitle(`Trip to ${destination}`);
      setBudget(travelIntent.budget || 0);
      
      // Extract activities from messages
      const extractedActivities: string[] = [];
      messages.forEach(msg => {
        const text = msg.content.toLowerCase();
        const activityKeywords = ['hiking', 'sightseeing', 'museums', 'beach', 'dining', 'shopping', 'relaxation', 'adventure'];
        
        activityKeywords.forEach(activity => {
          if (text.includes(activity) && !extractedActivities.includes(activity)) {
            extractedActivities.push(activity);
          }
        });
      });
      
      setActivities(extractedActivities);
    }
  }, [open, destination, messages, travelIntent]);

  const saveTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      return await apiRequest('/api/trips', { 
        method: 'POST', 
        data: tripData 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      toast({
        title: 'Trip Saved',
        description: 'Your trip has been saved successfully.',
      });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error saving trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your trip. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleSave = () => {
    if (!title || !dateRange.from || !dateRange.to) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the required fields (title and date range).',
        variant: 'destructive',
      });
      return;
    }

    const tripData = {
      title,
      destination,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      budget,
      notes,
      companions,
      activities,
      status: 'planned',
      userId: user?.id || null,
    };

    saveTripMutation.mutate(tripData);
  };

  const addCompanion = () => {
    if (newCompanion.trim() !== '' && !companions.includes(newCompanion.trim())) {
      setCompanions([...companions, newCompanion.trim()]);
      setNewCompanion('');
    }
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    if (newActivity.trim() !== '' && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    // If not authenticated, show a login prompt button
    return (
      <Button
        onClick={() => window.location.href = '/login'} 
        className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        Log in to Save Itinerary
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Save Your Travel Plan</DialogTitle>
          <DialogDescription>
            Save this itinerary to your account to access it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-medium">Trip Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a name for your trip"
              className="w-full"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dates" className="font-medium">Travel Dates</Label>
            <DateRangePicker 
              dateRange={dateRange}
              onSelect={(range) => {
                // Handle the DateRange | undefined type from the DateRangePicker
                if (range) {
                  setDateRange({
                    from: range.from,
                    to: range.to || range.from
                  });
                } else {
                  setDateRange({ from: undefined, to: undefined });
                }
              }}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="budget" className="font-medium">Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              value={budget || ''}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Enter your budget"
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="companions" className="font-medium">Travel Companions</Label>
            <div className="flex gap-2">
              <Input
                id="companions"
                value={newCompanion}
                onChange={(e) => setNewCompanion(e.target.value)}
                placeholder="Add travel companion"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addCompanion}
                variant="outline"
              >
                Add
              </Button>
            </div>
            
            {companions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {companions.map((companion, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="mr-1">{companion}</span>
                    <button
                      type="button"
                      onClick={() => removeCompanion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="activities" className="font-medium">Activities</Label>
            <div className="flex gap-2">
              <Input
                id="activities"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Add activity"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addActivity}
                variant="outline"
              >
                Add
              </Button>
            </div>
            
            {activities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                    <span className="mr-1">{activity}</span>
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes" className="font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about your trip"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-primary"
            disabled={saveTripMutation.isPending}
          >
            {saveTripMutation.isPending ? 'Saving...' : 'Save Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}