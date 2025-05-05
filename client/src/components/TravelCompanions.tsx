import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Companion {
  id: string;
  name: string;
  relationship: string;
  preferences: string[];
  dietaryRestrictions?: string;
  notes?: string;
}

interface TravelCompanionsProps {
  onSave?: (companions: Companion[]) => void;
  initialCompanions?: Companion[];
}

export function TravelCompanions({ onSave, initialCompanions = [] }: TravelCompanionsProps) {
  const [companions, setCompanions] = useState<Companion[]>(initialCompanions);
  const [currentCompanion, setCurrentCompanion] = useState<Companion>({
    id: '',
    name: '',
    relationship: '',
    preferences: [],
    dietaryRestrictions: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  const relationshipOptions = [
    'Partner/Spouse', 'Friend', 'Family Member', 'Child', 'Parent', 'Colleague', 'Other'
  ];
  
  const preferenceOptions = [
    'Sightseeing', 'Museums', 'Food Tours', 'Shopping', 'Beaches', 'Hiking', 
    'Adventure Sports', 'Historical Sites', 'Nightlife', 'Relaxation'
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCompanion(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRelationshipChange = (value: string) => {
    setCurrentCompanion(prev => ({
      ...prev,
      relationship: value
    }));
  };
  
  const handlePreferenceToggle = (preference: string) => {
    setCurrentCompanion(prev => {
      const preferences = prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference];
      
      return {
        ...prev,
        preferences
      };
    });
  };
  
  const handleAddCompanion = () => {
    if (!currentCompanion.name || !currentCompanion.relationship) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least a name and relationship.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isEditing && editIndex !== null) {
      // Update existing companion
      const updatedCompanions = [...companions];
      updatedCompanions[editIndex] = {
        ...currentCompanion,
        id: companions[editIndex].id
      };
      setCompanions(updatedCompanions);
      toast({
        title: 'Companion Updated',
        description: `${currentCompanion.name}'s information has been updated.`
      });
    } else {
      // Add new companion
      const newCompanion = {
        ...currentCompanion,
        id: Date.now().toString()
      };
      setCompanions([...companions, newCompanion]);
      toast({
        title: 'Companion Added',
        description: `${newCompanion.name} has been added to your travel party.`
      });
    }
    
    // Reset form
    setCurrentCompanion({
      id: '',
      name: '',
      relationship: '',
      preferences: [],
      dietaryRestrictions: '',
      notes: ''
    });
    setIsEditing(false);
    setEditIndex(null);
    
    // Call the onSave prop if provided
    if (onSave) {
      onSave([...companions, currentCompanion]);
    }
  };
  
  const handleEditCompanion = (index: number) => {
    setCurrentCompanion(companions[index]);
    setIsEditing(true);
    setEditIndex(index);
  };
  
  const handleRemoveCompanion = (index: number) => {
    const updatedCompanions = companions.filter((_, i) => i !== index);
    setCompanions(updatedCompanions);
    toast({
      title: 'Companion Removed',
      description: `${companions[index].name} has been removed from your travel party.`
    });
    
    // Call the onSave prop if provided
    if (onSave) {
      onSave(updatedCompanions);
    }
  };
  
  const cancelEdit = () => {
    setCurrentCompanion({
      id: '',
      name: '',
      relationship: '',
      preferences: [],
      dietaryRestrictions: '',
      notes: ''
    });
    setIsEditing(false);
    setEditIndex(null);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Travel Companions
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({companions.length} {companions.length === 1 ? 'person' : 'people'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {companions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {companions.map((companion, index) => (
                  <motion.div
                    key={companion.id}
                    className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500"
                        onClick={() => handleEditCompanion(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => handleRemoveCompanion(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">{companion.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{companion.relationship}</p>
                    </div>
                    
                    {companion.preferences.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Preferences</h4>
                        <div className="flex flex-wrap gap-1">
                          {companion.preferences.map(pref => (
                            <span key={pref} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {companion.dietaryRestrictions && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Dietary Restrictions</h4>
                        <p className="text-sm">{companion.dietaryRestrictions}</p>
                      </div>
                    )}
                    
                    {companion.notes && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</h4>
                        <p className="text-sm">{companion.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg inline-block mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No companions yet</h3>
                <p className="text-gray-500 mb-4">
                  Add your travel companions to help personalize your trip
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="font-medium text-lg mb-4">
              {isEditing ? 'Edit Companion' : 'Add a Companion'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentCompanion.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={currentCompanion.relationship}
                  onValueChange={handleRelationshipChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="mb-2 block">Preferences & Interests</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {preferenceOptions.map(preference => (
                  <div key={preference} className="flex items-center space-x-2">
                    <Checkbox
                      id={`preference-${preference}`}
                      checked={currentCompanion.preferences.includes(preference)}
                      onCheckedChange={() => handlePreferenceToggle(preference)}
                    />
                    <Label htmlFor={`preference-${preference}`} className="text-sm">
                      {preference}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={currentCompanion.dietaryRestrictions || ''}
                onChange={handleInputChange}
                placeholder="E.g., Vegetarian, Gluten-free, Allergies"
                className="mt-1"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={currentCompanion.notes || ''}
                onChange={handleInputChange}
                placeholder="Any other important information"
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleAddCompanion}>
                {isEditing ? 'Update Companion' : 'Add Companion'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}