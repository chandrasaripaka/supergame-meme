import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/auth";
import { motion } from "framer-motion";

export default function PreferencesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  
  // General preferences
  const [darkMode, setDarkMode] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [saveSearchHistory, setSaveSearchHistory] = useState(true);
  
  // Travel preferences
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [budgetLevel, setBudgetLevel] = useState(50);
  const [preferredAccommodation, setPreferredAccommodation] = useState("hotel");
  const [adventureLevel, setAdventureLevel] = useState(50);
  const [preferredActivities, setPreferredActivities] = useState(["sightseeing", "food"]);
  
  // Companion preferences
  const [companions, setCompanions] = useState([
    { id: 1, name: "Alex", relationship: "Partner", preferences: ["museums", "dining"] },
  ]);
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionRelationship, setNewCompanionRelationship] = useState("");
  
  const handleSavePreferences = () => {
    // In a real app, would save to backend here
    toast({
      title: "Preferences Saved",
      description: "Your travel preferences have been saved successfully."
    });
  };
  
  const addCompanion = () => {
    if (newCompanionName && newCompanionRelationship) {
      setCompanions([
        ...companions,
        {
          id: Date.now(),
          name: newCompanionName,
          relationship: newCompanionRelationship,
          preferences: []
        }
      ]);
      setNewCompanionName("");
      setNewCompanionRelationship("");
    }
  };
  
  const removeCompanion = (id: number) => {
    setCompanions(companions.filter(c => c.id !== id));
  };
  
  const toggleActivity = (activity: string) => {
    if (preferredActivities.includes(activity)) {
      setPreferredActivities(preferredActivities.filter(a => a !== activity));
    } else {
      setPreferredActivities([...preferredActivities, activity]);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Travel Preferences
        </h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="travel">Travel Style</TabsTrigger>
            <TabsTrigger value="companions">Travel Companions</TabsTrigger>
          </TabsList>
          
          {/* General Preferences */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure your general app preferences and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-gray-500">
                      Switch to a darker theme for comfortable viewing at night
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications about travel deals and offers
                    </p>
                  </div>
                  <Switch
                    checked={receiveNotifications}
                    onCheckedChange={setReceiveNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Save Search History</Label>
                    <p className="text-sm text-gray-500">
                      Save your travel searches for a more personalized experience
                    </p>
                  </div>
                  <Switch
                    checked={saveSearchHistory}
                    onCheckedChange={setSaveSearchHistory}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Connected Accounts</h3>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Google Account</p>
                        <p className="text-sm text-gray-500">{user ? user.email : 'Not connected'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {user ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Travel Preferences */}
          <TabsContent value="travel">
            <Card>
              <CardHeader>
                <CardTitle>Travel Style</CardTitle>
                <CardDescription>
                  Customize your travel experience by setting your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Budget Level</Label>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Budget</span>
                    <span>Moderate</span>
                    <span>Luxury</span>
                  </div>
                  <Slider
                    value={[budgetLevel]}
                    onValueChange={(value) => setBudgetLevel(value[0])}
                    max={100}
                    step={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Accommodation Type</Label>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['hostel', 'hotel', 'resort', 'apartment', 'villa', 'unique'].map((type) => (
                      <Button
                        key={type}
                        variant={preferredAccommodation === type ? "default" : "outline"}
                        onClick={() => setPreferredAccommodation(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Adventure Level</Label>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Relaxing</span>
                    <span>Balanced</span>
                    <span>Adventurous</span>
                  </div>
                  <Slider
                    value={[adventureLevel]}
                    onValueChange={(value) => setAdventureLevel(value[0])}
                    max={100}
                    step={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Travel Style Preference</Label>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['balanced', 'cultural', 'adventure', 'relaxation', 'foodie', 'shopping'].map((style) => (
                      <Button
                        key={style}
                        variant={travelStyle === style ? "default" : "outline"}
                        onClick={() => setTravelStyle(style)}
                        className="capitalize"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Activities</Label>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {['sightseeing', 'museums', 'food', 'nightlife', 'shopping', 'nature', 'beach', 'sports', 'relaxation'].map((activity) => (
                      <Button
                        key={activity}
                        variant={preferredActivities.includes(activity) ? "default" : "outline"}
                        onClick={() => toggleActivity(activity)}
                        className="capitalize"
                      >
                        {activity}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Travel Companions */}
          <TabsContent value="companions">
            <Card>
              <CardHeader>
                <CardTitle>Travel Companions</CardTitle>
                <CardDescription>
                  Manage your travel companions and their preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companions.map((companion) => (
                    <div key={companion.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{companion.name}</h3>
                        <p className="text-sm text-gray-500">{companion.relationship}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {companion.preferences.map((pref, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {pref}
                            </span>
                          ))}
                          {companion.preferences.length === 0 && (
                            <span className="text-xs text-gray-500">No preferences set</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeCompanion(companion.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium mb-3">Add New Companion</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companionName">Name</Label>
                        <Input
                          id="companionName"
                          value={newCompanionName}
                          onChange={(e) => setNewCompanionName(e.target.value)}
                          placeholder="Companion name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationship">Relationship</Label>
                        <Input
                          id="relationship"
                          value={newCompanionRelationship}
                          onChange={(e) => setNewCompanionRelationship(e.target.value)}
                          placeholder="e.g. Partner, Child, Friend"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={addCompanion}
                      className="mt-4"
                      disabled={!newCompanionName || !newCompanionRelationship}
                    >
                      Add Companion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSavePreferences} size="lg">
            Save All Preferences
          </Button>
        </div>
      </motion.div>
    </div>
  );
}