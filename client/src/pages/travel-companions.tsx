import React, { useState, useEffect } from 'react';
import { TravelCompanions } from '@/components/TravelCompanions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface Companion {
  id: string;
  name: string;
  relationship: string;
  preferences: string[];
  dietaryRestrictions?: string;
  notes?: string;
}

export default function TravelCompanionsPage() {
  const { toast } = useToast();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch companions from API (if we had one)
  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        // If we had an API endpoint, we would fetch here
        // const response = await apiRequest<Companion[]>('/api/companions');
        // setCompanions(response || []);
        
        // For demo, use local storage
        const savedCompanions = localStorage.getItem('travelCompanions');
        if (savedCompanions) {
          setCompanions(JSON.parse(savedCompanions));
        }
      } catch (error) {
        console.error('Error fetching companions:', error);
      }
    };
    
    fetchCompanions();
  }, []);
  
  const handleSaveCompanions = async (updatedCompanions: Companion[]) => {
    setIsSaving(true);
    
    try {
      // If we had an API endpoint, we would save here
      // await apiRequest('/api/companions', 'POST', updatedCompanions);
      
      // For demo, use local storage
      localStorage.setItem('travelCompanions', JSON.stringify(updatedCompanions));
      
      setCompanions(updatedCompanions);
      toast({
        title: 'Companions Saved',
        description: 'Your travel companions have been saved successfully.'
      });
    } catch (error) {
      console.error('Error saving companions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save companions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Travel Companions
            </h1>
            <p className="text-gray-500">
              Manage your travel companions to personalize your trip planning
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link href="/preferences">
              <Button variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Preferences
              </Button>
            </Link>
            <Link href="/saved-trips">
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
                Saved Trips
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TravelCompanions 
              initialCompanions={companions} 
              onSave={handleSaveCompanions} 
            />
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Benefits of Travel Companions</CardTitle>
                <CardDescription>
                  Why adding travel companions improves your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Recommendations</h3>
                    <p className="text-sm text-gray-500">
                      Get activity suggestions that match everyone's interests
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Dietary Awareness</h3>
                    <p className="text-sm text-gray-500">
                      Restaurant suggestions consider everyone's dietary needs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Balanced Itineraries</h3>
                    <p className="text-sm text-gray-500">
                      Create schedules that balance everyone's preferences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Special Needs Consideration</h3>
                    <p className="text-sm text-gray-500">
                      Accommodates mobility issues, allergies, and other special requirements
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-2">Did you know?</h3>
                  <p className="text-sm text-gray-600">
                    Our AI travel planner adjusts recommendations based on the makeup of your travel group, 
                    including suggesting family-friendly activities when traveling with children or finding 
                    accessible locations for those with mobility concerns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}