import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface TravelFormData {
  from: string;
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  travelers: string;
  duration: string;
}

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  onSkip?: () => void;
  initialData?: Partial<TravelFormData>;
}

export function TravelQuickForm({ onSubmit, onSkip, initialData }: TravelFormProps) {
  const [formData, setFormData] = useState<TravelFormData>({
    from: initialData?.from || '',
    destination: initialData?.destination || '',
    startDate: initialData?.startDate,
    endDate: initialData?.endDate,
    budget: initialData?.budget || '',
    travelers: initialData?.travelers || '1',
    duration: initialData?.duration || '',
  });

  // Listen for auto-fill destination events
  React.useEffect(() => {
    const handleAutoFill = (event: CustomEvent) => {
      setFormData(prev => ({ ...prev, destination: event.detail }));
    };

    window.addEventListener('autoFillDestination', handleAutoFill as EventListener);
    return () => window.removeEventListener('autoFillDestination', handleAutoFill as EventListener);
  }, []);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isFormComplete = formData.from && formData.destination && formData.budget && formData.travelers;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 my-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Travel Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Location */}
        <div className="space-y-2">
          <Label htmlFor="from" className="text-sm font-medium text-gray-700">
            Where are you traveling from?
          </Label>
          <Input
            id="from"
            placeholder="e.g., New York, London, Singapore"
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
            Where do you want to go?
          </Label>
          <Input
            id="destination"
            placeholder="e.g., Paris, Tokyo, New York"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
            Budget (USD)
          </Label>
          <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_500">Under $500</SelectItem>
              <SelectItem value="500_1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000_2500">$1,000 - $2,500</SelectItem>
              <SelectItem value="2500_5000">$2,500 - $5,000</SelectItem>
              <SelectItem value="5000_10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="over_10000">Over $10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Departure Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : "Pick departure date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Return Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.endDate ? format(formData.endDate, "PPP") : "Pick return date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => setFormData({ ...formData, endDate: date })}
                disabled={(date) => date < (formData.startDate || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Number of Travelers */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Number of Travelers
          </Label>
          <Select value={formData.travelers} onValueChange={(value) => setFormData({ ...formData, travelers: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How many people?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Solo Traveler</SelectItem>
              <SelectItem value="2">2 People</SelectItem>
              <SelectItem value="3">3 People</SelectItem>
              <SelectItem value="4">4 People</SelectItem>
              <SelectItem value="5">5 People</SelectItem>
              <SelectItem value="6_plus">6+ People</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Trip Duration
          </Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How long?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekend">Weekend (2-3 days)</SelectItem>
              <SelectItem value="short">Short Trip (4-7 days)</SelectItem>
              <SelectItem value="medium">1-2 Weeks</SelectItem>
              <SelectItem value="long">2-4 Weeks</SelectItem>
              <SelectItem value="extended">Over a Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        {onSkip && (
          <Button variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue Planning
        </Button>
      </div>
    </div>
  );
}

export function BudgetBreakdown({ budget }: { budget: string }) {
  const getBudgetInfo = (range: string) => {
    switch (range) {
      case 'under_500':
        return { min: 0, max: 500, suggestions: ['Hostels', 'Local transport', 'Street food', 'Free attractions'] };
      case '500_1000':
        return { min: 500, max: 1000, suggestions: ['Budget hotels', 'Economy flights', 'Local restaurants', 'Some paid tours'] };
      case '1000_2500':
        return { min: 1000, max: 2500, suggestions: ['3-star hotels', 'Standard flights', 'Mid-range dining', 'Popular attractions'] };
      case '2500_5000':
        return { min: 2500, max: 5000, suggestions: ['4-star hotels', 'Business class', 'Fine dining', 'Premium experiences'] };
      case '5000_10000':
        return { min: 5000, max: 10000, suggestions: ['Luxury hotels', 'First class', 'Michelin dining', 'VIP tours'] };
      case 'over_10000':
        return { min: 10000, max: null, suggestions: ['Ultra-luxury resorts', 'Private jets', 'Exclusive experiences', 'Personal guides'] };
      default:
        return null;
    }
  };

  const budgetInfo = getBudgetInfo(budget);

  if (!budgetInfo) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-emerald-600" />
        <h4 className="font-semibold text-emerald-800">Budget Breakdown</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {budgetInfo.suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-md p-2 text-center text-sm text-gray-700">
            {suggestion}
          </div>
        ))}
      </div>
      <p className="text-sm text-emerald-700 mt-2">
        Budget range: ${budgetInfo.min.toLocaleString()}{budgetInfo.max ? ` - $${budgetInfo.max.toLocaleString()}` : '+'}
      </p>
    </div>
  );
}

export function DestinationSuggestions({ onSelect }: { onSelect: (destination: string) => void }) {
  const popularDestinations = [
    { name: 'Paris, France', emoji: '🇫🇷', description: 'Romance, art, and cuisine' },
    { name: 'Tokyo, Japan', emoji: '🇯🇵', description: 'Culture, technology, and food' },
    { name: 'New York, USA', emoji: '🇺🇸', description: 'Museums, Broadway, shopping' },
    { name: 'London, UK', emoji: '🇬🇧', description: 'History, culture, and pubs' },
    { name: 'Bali, Indonesia', emoji: '🇮🇩', description: 'Beaches, temples, and nature' },
    { name: 'Barcelona, Spain', emoji: '🇪🇸', description: 'Architecture, beaches, and tapas' },
  ];

  return (
    <div className="bg-blue-50 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-blue-800 mb-3">Popular Destinations</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {popularDestinations.map((dest, index) => (
          <button
            key={index}
            onClick={() => onSelect(dest.name)}
            className="bg-white rounded-md p-3 text-left hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{dest.emoji}</span>
              <div>
                <div className="font-medium text-gray-800">{dest.name}</div>
                <div className="text-sm text-gray-600">{dest.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Full travel form for modal
export function TravelForm({ onSubmit, onClose }: { onSubmit: (data: TravelFormData) => void; onClose: () => void }) {
  const [formData, setFormData] = useState<TravelFormData>({
    from: '',
    destination: '',
    startDate: undefined,
    endDate: undefined,
    budget: '',
    travelers: '1',
    duration: '',
  });

  const handleSubmit = () => {
    if (formData.from && formData.destination && formData.budget && formData.travelers) {
      onSubmit(formData);
      onClose();
    }
  };

  const isFormComplete = formData.from && formData.destination && formData.budget && formData.travelers;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="destination"
              type="text"
              placeholder="Where would you like to go?"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelers">Number of Travelers</Label>
          <Select value={formData.travelers} onValueChange={(value) => setFormData({ ...formData, travelers: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select travelers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Solo Traveler</SelectItem>
              <SelectItem value="2">2 People</SelectItem>
              <SelectItem value="3">3 People</SelectItem>
              <SelectItem value="4">4 People</SelectItem>
              <SelectItem value="5">5 People</SelectItem>
              <SelectItem value="6_plus">6+ People</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => setFormData({ ...formData, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget Range</Label>
          <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_500">Under $500</SelectItem>
              <SelectItem value="500_1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000_2500">$1,000 - $2,500</SelectItem>
              <SelectItem value="2500_5000">$2,500 - $5,000</SelectItem>
              <SelectItem value="5000_10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="over_10000">Over $10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Trip Duration</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekend">Weekend (2-3 days)</SelectItem>
              <SelectItem value="short">Short Trip (4-7 days)</SelectItem>
              <SelectItem value="medium">1-2 Weeks</SelectItem>
              <SelectItem value="long">2-4 Weeks</SelectItem>
              <SelectItem value="extended">Over a Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Itinerary
        </Button>
      </div>
    </div>
  );
}