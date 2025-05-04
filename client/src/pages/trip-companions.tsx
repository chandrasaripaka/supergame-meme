import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllCompanions, 
  findCompanionMatches, 
  associateCompanionWithTrip, 
  updateTripCompanionStatus, 
  getTripCompanions 
} from '../lib/api/companions';
import { Companion } from '@shared/schema';
import { CompanionCard } from '../components/CompanionCard';
import { CompanionBrowser } from '../components/CompanionBrowser';
import { CompanionProfile } from '../components/CompanionProfile';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { 
  Search, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Check, 
  X
} from 'lucide-react';

interface TripCompanionsProps {
  // Typically these would come from params or context
  tripId?: number;
  destination?: string;
  activities?: string[];
}

export default function TripCompanions({
  tripId = 1, // Default for testing
  destination = "Paris",
  activities = ["museums", "food", "architecture"]
}: TripCompanionsProps) {
  const [viewingCompanion, setViewingCompanion] = useState<Companion | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("browse");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for trip companions
  const { 
    data: tripCompanions = [], 
    isLoading: isLoadingTripCompanions,
    isError: isErrorTripCompanions
  } = useQuery({
    queryKey: ['trip-companions', tripId],
    queryFn: () => getTripCompanions(tripId),
    enabled: !!tripId
  });
  
  // Group companions by status
  const pendingCompanions = tripCompanions.filter(tc => tc.status === 'pending').map(tc => tc.companion);
  const acceptedCompanions = tripCompanions.filter(tc => tc.status === 'accepted').map(tc => tc.companion);
  const rejectedCompanions = tripCompanions.filter(tc => tc.status === 'rejected').map(tc => tc.companion);
  
  // Mutation for adding companions
  const addCompanionMutation = useMutation({
    mutationFn: (companion: Companion) => 
      associateCompanionWithTrip(tripId, companion.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-companions', tripId] });
      toast({
        title: "Companion Added",
        description: "The companion has been added to your trip.",
      });
    }
  });
  
  // Mutation for updating companion status
  const updateStatusMutation = useMutation({
    mutationFn: ({ companionId, status }: { companionId: number, status: string }) => 
      updateTripCompanionStatus(tripId, companionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-companions', tripId] });
      toast({
        title: "Status Updated",
        description: "Companion status has been updated.",
      });
    }
  });
  
  const handleSelectCompanion = (companion: Companion) => {
    // Check if companion is already added
    const isAlreadyAdded = tripCompanions.some(tc => tc.companion.id === companion.id);
    
    if (!isAlreadyAdded) {
      addCompanionMutation.mutate(companion);
    } else {
      toast({
        title: "Already Added",
        description: "This companion is already part of your trip.",
        variant: "default"
      });
    }
  };
  
  const handleAcceptCompanion = (companion: Companion) => {
    updateStatusMutation.mutate({ companionId: companion.id, status: 'accepted' });
  };
  
  const handleRejectCompanion = (companion: Companion) => {
    updateStatusMutation.mutate({ companionId: companion.id, status: 'rejected' });
  };
  
  const handleViewProfile = (companion: Companion) => {
    setViewingCompanion(companion);
    setIsProfileOpen(true);
  };
  
  const getCompanionStatus = (companion: Companion): string | undefined => {
    const foundCompanion = tripCompanions.find(tc => tc.companion.id === companion.id);
    return foundCompanion?.status;
  };
  
  // Determine if we're showing a loading state
  const isLoading = isLoadingTripCompanions || addCompanionMutation.isPending || updateStatusMutation.isPending;
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Travel Companions</h1>
          <p className="text-muted-foreground">
            Find and manage travel companions for your trip to {destination}
          </p>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="browse" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Pending</span>
              {pendingCompanions.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCompanions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden md:inline">Confirmed</span>
              {acceptedCompanions.length > 0 && (
                <span className="ml-1 text-xs bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center">
                  {acceptedCompanions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-6">
            <CompanionBrowser
              tripId={tripId}
              destination={destination}
              activities={activities}
              onSelectCompanion={handleSelectCompanion}
              onViewCompanionProfile={handleViewProfile}
              selectedCompanions={tripCompanions.map(tc => tc.companion)}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingCompanions.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending companions</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  You don't have any pending companion requests for this trip.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => setSelectedTab("browse")}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Find Companions
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Pending Companions</h2>
                  <p className="text-sm text-muted-foreground">
                    {pendingCompanions.length} pending request{pendingCompanions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Pending Requests</AlertTitle>
                  <AlertDescription>
                    These companions are waiting for your confirmation. Review and accept or reject their requests.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingCompanions.map(companion => (
                    <CompanionCard
                      key={companion.id}
                      companion={companion}
                      onViewProfile={handleViewProfile}
                      status="pending"
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="confirmed" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : acceptedCompanions.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No confirmed companions</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  You haven't confirmed any companions for this trip yet.
                </p>
                <Button 
                  variant="default" 
                  onClick={() => setSelectedTab("browse")}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Find Companions
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Confirmed Companions</h2>
                  <p className="text-sm text-muted-foreground">
                    {acceptedCompanions.length} confirmed companion{acceptedCompanions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedCompanions.map(companion => (
                    <CompanionCard
                      key={companion.id}
                      companion={companion}
                      onViewProfile={handleViewProfile}
                      status="accepted"
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <CompanionProfile
        companion={viewingCompanion}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSelect={handleSelectCompanion}
        isSelected={viewingCompanion ? tripCompanions.some(tc => tc.companion.id === viewingCompanion.id) : false}
        status={viewingCompanion ? getCompanionStatus(viewingCompanion) : undefined}
        onAccept={handleAcceptCompanion}
        onReject={handleRejectCompanion}
      />
      
      <AppFooter />
    </div>
  );
}