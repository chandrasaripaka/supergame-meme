import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/lib/auth';
import { Link } from 'wouter';

interface SaveTripButtonProps {
  messages: any[]; // Chat messages to save
  destination?: string;
}

export function SaveTripButton({ messages, destination }: SaveTripButtonProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tripDetails, setTripDetails] = useState({
    title: destination ? `Trip to ${destination}` : 'My Trip',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    budget: 0,
    notes: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTripDetails({
      ...tripDetails,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    });
  };
  
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setTripDetails({
        ...tripDetails,
        startDate: date,
      });
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setTripDetails({
        ...tripDetails,
        endDate: date,
      });
    }
  };
  
  const handleSaveTrip = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save your trip.',
        variant: 'destructive',
      });
      setIsDialogOpen(false);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Extract trip information from messages
      const activities = extractActivities(messages);
      const extractedBudget = extractBudget(messages) || tripDetails.budget;
      
      const tripData = {
        ...tripDetails,
        budget: extractedBudget,
        destination: destination || extractDestination(messages),
        activities,
        messages: messages,
        userId: user.id,
        status: 'planned',
      };
      
      // For simplicity, we'll use localStorage instead of API
      // In a real app, we would use:
      // await apiRequest('/api/trips', 'POST', tripData);
      
      const existingTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      const newTrip = {
        ...tripData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('savedTrips', JSON.stringify([...existingTrips, newTrip]));
      
      toast({
        title: 'Trip Saved',
        description: 'Your trip has been saved successfully.',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper function to extract destination from messages
  const extractDestination = (messages: any[]): string => {
    // Look for destination mentions in the conversation
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      // This is a very basic extraction - a real version would be more sophisticated
      if (content.includes('destination:') || content.includes('going to') || content.includes('traveling to')) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('destination:')) {
            return line.split('destination:')[1].trim();
          }
        }
      }
    }
    
    return 'Unknown Destination';
  };
  
  // Helper function to extract budget from messages
  const extractBudget = (messages: any[]): number | null => {
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      // Look for budget information
      if (content.includes('budget:') || content.includes('total cost:') || content.includes('estimated cost:')) {
        const budgetMatch = content.match(/budget:?\s*\$?(\d+,?\d*)/i) || 
                           content.match(/total cost:?\s*\$?(\d+,?\d*)/i) ||
                           content.match(/estimated cost:?\s*\$?(\d+,?\d*)/i);
                           
        if (budgetMatch && budgetMatch[1]) {
          return parseFloat(budgetMatch[1].replace(',', ''));
        }
      }
    }
    
    return null;
  };
  
  // Helper function to extract activities from messages
  const extractActivities = (messages: any[]): string[] => {
    const activities: string[] = [];
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      // This is a simplified activity extraction
      // A real implementation would use more sophisticated NLP
      if (content.includes('activities:') || content.includes('things to do:') || content.includes('itinerary:')) {
        const activityKeywords = [
          'visit', 'explore', 'tour', 'see', 'experience', 'hike', 'swim',
          'museum', 'park', 'restaurant', 'café', 'beach', 'mountain', 'shopping'
        ];
        
        const lines = content.split('\n');
        for (const line of lines) {
          const lowercaseLine = line.toLowerCase();
          for (const keyword of activityKeywords) {
            if (lowercaseLine.includes(keyword) && !activities.includes(line.trim())) {
              activities.push(line.trim());
              break;
            }
          }
        }
      }
    }
    
    return activities.slice(0, 10); // Limit to 10 activities
  };
  
  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center space-x-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        Save Trip
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save Your Trip</DialogTitle>
            <DialogDescription>
              Save this trip to access it later or share with friends.
              {!user && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
                  You're not logged in. <Link href="/login" className="underline">Log in</Link> to save trips to your account.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Trip Title
              </Label>
              <Input
                id="title"
                name="title"
                value={tripDetails.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Start Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={tripDetails.startDate}
                  setDate={handleStartDateChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                End Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={tripDetails.endDate}
                  setDate={handleEndDateChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget ($)
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={tripDetails.budget.toString()}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={tripDetails.notes}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrip} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}