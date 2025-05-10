import React, { useState, useEffect } from "react";
import { AlertTriangle, Info, Shield, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TravelSafetyAlertProps {
  destination: string;
}

interface SafetyLevel {
  SAFE: 'safe';
  CAUTION: 'caution';
  RECONSIDER_TRAVEL: 'reconsider';
  DO_NOT_TRAVEL: 'do_not_travel';
}

interface SafetyAdvisory {
  country: string;
  level: string;
  lastUpdated: string;
  reason: string[];
  details: string;
  regions?: Array<{
    name: string;
    level: string;
    reason: string[];
  }>;
  sanctions?: boolean;
}

interface SafetyResponse {
  safe: boolean;
  advisory?: SafetyAdvisory;
}

export function TravelSafetyAlert({ destination }: TravelSafetyAlertProps) {
  const [safetyInfo, setSafetyInfo] = useState<SafetyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!destination) return;

    const fetchSafetyInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/travel-safety/${encodeURIComponent(destination)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch safety information');
        }
        
        const data = await response.json();
        setSafetyInfo(data);
      } catch (err) {
        console.error('Error fetching safety info:', err);
        setError('Unable to retrieve safety information at this time');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSafetyInfo();
  }, [destination]);

  if (isLoading) {
    return (
      <Alert className="bg-gray-100 border-gray-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Safety Information</AlertTitle>
        <AlertDescription>
          Checking travel advisories for {destination}...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (!safetyInfo || safetyInfo.safe) {
    return null; // Don't show anything if destination is safe or we have no info
  }

  const advisory = safetyInfo.advisory!;
  
  // Determine alert styling based on safety level
  let alertStyle = "";
  let alertIcon = Info;
  
  switch (advisory.level) {
    case 'caution':
      alertStyle = "bg-yellow-50 border-yellow-200 text-yellow-800";
      alertIcon = AlertTriangle;
      break;
    case 'reconsider':
      alertStyle = "bg-orange-50 border-orange-200 text-orange-800";
      alertIcon = AlertTriangle;
      break;
    case 'do_not_travel':
      alertStyle = "bg-red-50 border-red-200 text-red-800";
      alertIcon = XCircle;
      break;
    default:
      alertStyle = "bg-blue-50 border-blue-200 text-blue-800";
      alertIcon = Info;
  }

  const AlertIcon = alertIcon;

  return (
    <>
      <Alert className={`mb-4 ${alertStyle}`}>
        <AlertIcon className="h-4 w-4" />
        <AlertTitle className="font-medium">
          Travel Advisory for {advisory.country}
        </AlertTitle>
        <AlertDescription className="mt-1">
          <p className="mb-2">{advisory.level === 'do_not_travel' ? 'Do not travel' : 'Exercise caution'} due to: {advisory.reason.join(', ')}.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-1"
            onClick={() => setShowDialog(true)}
          >
            View Details
          </Button>
        </AlertDescription>
      </Alert>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertIcon className="h-5 w-5 mr-2 text-red-500" />
              Travel Advisory: {advisory.country}
            </DialogTitle>
            <DialogDescription>
              Last updated: {advisory.lastUpdated}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-700 mb-1">Advisory Level</h4>
              <p className="text-sm capitalize">{advisory.level.replace(/_/g, ' ')}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Reason for Advisory</h4>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {advisory.reason.map((r, i) => (
                  <li key={i} className="capitalize">{r}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Details</h4>
              <p className="text-sm">{advisory.details}</p>
            </div>
            
            {advisory.sanctions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="font-semibold text-amber-700 mb-1 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Sanctions Warning
                </h4>
                <p className="text-sm">
                  This country is under international sanctions which may affect travel, financial transactions, and other activities.
                </p>
              </div>
            )}
            
            {advisory.regions && advisory.regions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Regional Advisories</h4>
                <ul className="list-none space-y-2 text-sm">
                  {advisory.regions.map((region, i) => (
                    <li key={i} className="border-l-2 border-red-300 pl-3">
                      <span className="font-medium">{region.name}</span>: {region.level.replace(/_/g, ' ')} - {region.reason.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}