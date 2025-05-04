import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Companion } from '@shared/schema';
import { getAllCompanions, findCompanionMatches } from '../lib/api/companions';
import { CompanionCard } from './CompanionCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Filter, 
  Search, 
  User,
  Languages,
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  Loader2,
  X
} from 'lucide-react';

interface CompanionBrowserProps {
  tripId?: number;
  destination?: string;
  activities?: string[];
  onSelectCompanion?: (companion: Companion) => void;
  onViewCompanionProfile?: (companion: Companion) => void;
  selectedCompanions?: Companion[];
}

// Travel style options
const TRAVEL_STYLES = [
  'adventurous',
  'luxury',
  'budget',
  'cultural',
  'eco-friendly',
  'urban',
  'culinary',
  'adventure'
];

// Language options
const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Mandarin',
  'Japanese',
  'Portuguese',
  'Russian',
  'Arabic',
  'Hindi',
  'Thai'
];

// Interest options
const INTERESTS = [
  'hiking',
  'photography',
  'food',
  'museums',
  'history',
  'architecture',
  'nightlife',
  'shopping',
  'beaches',
  'music',
  'art',
  'wildlife',
  'local culture',
  'sports',
  'relaxation'
];

export function CompanionBrowser({
  tripId,
  destination,
  activities = [],
  onSelectCompanion,
  onViewCompanionProfile,
  selectedCompanions = []
}: CompanionBrowserProps) {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [useDestinationMatch, setUseDestinationMatch] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  
  // Query for fetching all companions or filtered companions
  const {
    data: companions,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['companions', tripId, isFilteringActive, selectedTravelStyles, selectedLanguages, selectedInterests, ageRange, selectedGender, useDestinationMatch, useAI],
    queryFn: async () => {
      if (tripId && isFilteringActive) {
        // Use filter-based matching
        return findCompanionMatches(tripId, {
          travelStyles: selectedTravelStyles.length > 0 ? selectedTravelStyles : undefined,
          languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
          ageRange: { min: ageRange[0], max: ageRange[1] },
          gender: selectedGender || undefined,
          interests: selectedInterests.length > 0 ? selectedInterests : undefined,
          destinationMatch: useDestinationMatch,
          useAi: useAI,
          activities: activities.length > 0 ? activities : undefined,
          destination: destination
        });
      } else {
        // Just get all companions
        return getAllCompanions();
      }
    }
  });

  // Filter companions based on search query
  const filteredCompanions = companions 
    ? companions.filter(companion => 
        searchQuery === '' || 
        companion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companion.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companion.interests?.some(interest => 
          interest.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        companion.travelStyle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Apply filters and search
  const applyFilters = () => {
    setIsFilteringActive(true);
    refetch();
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTravelStyles([]);
    setSelectedLanguages([]);
    setSelectedInterests([]);
    setAgeRange([18, 65]);
    setSelectedGender('');
    setIsFilteringActive(false);
    refetch();
  };

  const handleTravelStyleToggle = (style: string) => {
    setSelectedTravelStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Check if a companion is already selected
  const isCompanionSelected = (companion: Companion) => {
    return selectedCompanions.some(selected => selected.id === companion.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Filter sidebar */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Find Companions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
                disabled={!isFilteringActive}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </div>
            <CardDescription>Filter companions for your trip</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Search box */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, bio, interests..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {/* Travel style filter */}
              <AccordionItem value="travel-style">
                <AccordionTrigger className="text-sm font-medium">Travel Style</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {TRAVEL_STYLES.map((style) => (
                      <div key={style} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`style-${style}`} 
                          checked={selectedTravelStyles.includes(style)}
                          onCheckedChange={() => handleTravelStyleToggle(style)}
                        />
                        <label
                          htmlFor={`style-${style}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {style}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Languages filter */}
              <AccordionItem value="languages">
                <AccordionTrigger className="text-sm font-medium">Languages</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`lang-${language}`} 
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={() => handleLanguageToggle(language)}
                        />
                        <label
                          htmlFor={`lang-${language}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {language}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Age range filter */}
              <AccordionItem value="age">
                <AccordionTrigger className="text-sm font-medium">Age Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">{ageRange[0]} years</span>
                      <span className="text-sm">{ageRange[1]} years</span>
                    </div>
                    <Slider
                      min={18}
                      max={80}
                      step={1}
                      value={[ageRange[0], ageRange[1]]}
                      onValueChange={(value) => setAgeRange([value[0], value[1]])}
                      className="my-4"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Gender filter */}
              <AccordionItem value="gender">
                <AccordionTrigger className="text-sm font-medium">Gender</AccordionTrigger>
                <AccordionContent>
                  <Select
                    value={selectedGender}
                    onValueChange={setSelectedGender}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
              
              {/* Interests filter */}
              <AccordionItem value="interests">
                <AccordionTrigger className="text-sm font-medium">Interests</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERESTS.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`interest-${interest}`} 
                          checked={selectedInterests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <label
                          htmlFor={`interest-${interest}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {interest}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Destination matching */}
              {destination && (
                <AccordionItem value="destination">
                  <AccordionTrigger className="text-sm font-medium">Destination Match</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox 
                        id="destination-match" 
                        checked={useDestinationMatch}
                        onCheckedChange={(checked) => setUseDestinationMatch(!!checked)}
                      />
                      <label
                        htmlFor="destination-match"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Match with companions who prefer {destination}
                      </label>
                    </div>
                    
                    {activities.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="ai-match" 
                          checked={useAI}
                          onCheckedChange={(checked) => setUseAI(!!checked)}
                        />
                        <label
                          htmlFor="ai-match"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Use AI to find best matches for your activities
                        </label>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
            
            <Button 
              onClick={applyFilters} 
              className="w-full mt-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>
      </div>
            
      {/* Companion grid */}
      <div className="md:col-span-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Finding the perfect travel companions...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-2">Error loading companions</p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : filteredCompanions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-muted/50 rounded-full p-3 mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No companions found</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              We couldn't find any travel companions matching your criteria. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isFilteringActive ? 'Matching Companions' : 'Available Companions'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredCompanions.length} companions found
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCompanions.map((companion) => (
                <CompanionCard
                  key={companion.id}
                  companion={companion}
                  onSelect={onSelectCompanion}
                  onViewProfile={onViewCompanionProfile}
                  isSelected={isCompanionSelected(companion)}
                  actionLabel={isCompanionSelected(companion) ? "Selected" : "Select"}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}