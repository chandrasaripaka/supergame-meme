import React, { useState } from 'react';
import { TravelSafetyAlert } from '@/components/TravelSafetyAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { checkDestinationSafety, getHighRiskDestinations } from '@/lib/apiClient';

export default function SafetyTestPage() {
  const [destination, setDestination] = useState('');
  const [searchedDestination, setSearchedDestination] = useState('');
  const [highRiskDestinations, setHighRiskDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (destination.trim()) {
      setSearchedDestination(destination);
    }
  };

  const fetchHighRiskDestinations = async () => {
    setLoading(true);
    try {
      const result = await getHighRiskDestinations();
      setHighRiskDestinations(result.destinations || []);
    } catch (error) {
      console.error('Error fetching high risk destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Travel Safety Feature Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Safety Alert for a Destination</CardTitle>
            <CardDescription>
              Enter a destination to check if there are any travel advisories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination (e.g., Ukraine)"
                className="flex-1"
              />
              <Button onClick={handleSearch}>Check</Button>
            </div>
            
            {searchedDestination && (
              <div className="mt-4 border p-4 rounded-lg">
                <p className="mb-2 font-medium">Results for: {searchedDestination}</p>
                <TravelSafetyAlert destination={searchedDestination} />
                <p className="text-sm text-gray-500 mt-4">
                  If nothing appears above, either the destination is safe or not recognized
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>High Risk Destinations</CardTitle>
            <CardDescription>
              View a list of all destinations with travel warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={fetchHighRiskDestinations} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Loading...' : 'Fetch High Risk Destinations'}
            </Button>
            
            {highRiskDestinations.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {highRiskDestinations.map((dest, i) => (
                  <div
                    key={i}
                    className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800"
                  >
                    {dest}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {loading ? 'Loading destinations...' : 'No destinations loaded yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}