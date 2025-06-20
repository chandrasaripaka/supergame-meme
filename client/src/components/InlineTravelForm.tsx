import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface InlineTravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TravelFormData>;
}

export interface TravelFormData {
  source: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  budget: string;
  preferences: string[];
}

export function InlineTravelForm({ onSubmit, onCancel, initialData }: InlineTravelFormProps) {
  const [formData, setFormData] = useState<TravelFormData>({
    source: initialData?.source || '',
    destination: initialData?.destination || '',
    departureDate: initialData?.departureDate || '',
    returnDate: initialData?.returnDate || '',
    travelers: initialData?.travelers || 1,
    budget: initialData?.budget || '',
    preferences: initialData?.preferences || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TravelFormData, string>>>({});

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($500-1,500)', icon: '💰' },
    { value: 'mid-range', label: 'Mid-range ($1,500-3,000)', icon: '💳' },
    { value: 'luxury', label: 'Luxury ($3,000+)', icon: '💎' }
  ];

  const preferenceOptions = [
    { value: 'culture', label: 'Culture & History', icon: '🏛️' },
    { value: 'food', label: 'Food & Dining', icon: '🍴' },
    { value: 'adventure', label: 'Adventure & Sports', icon: '🏔️' },
    { value: 'relaxation', label: 'Relaxation & Spa', icon: '🧘' },
    { value: 'nightlife', label: 'Nightlife & Entertainment', icon: '🌃' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
    { value: 'art', label: 'Art & Museums', icon: '🎨' }
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TravelFormData, string>> = {};

    if (!formData.source.trim()) {
      newErrors.source = 'Source location is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    }
    if (!formData.returnDate) {
      newErrors.returnDate = 'Return date is required';
    }
    if (formData.departureDate && formData.returnDate && new Date(formData.departureDate) >= new Date(formData.returnDate)) {
      newErrors.returnDate = 'Return date must be after departure date';
    }
    if (!formData.budget) {
      newErrors.budget = 'Budget selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <MapPin className="h-5 w-5" />
            Travel Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Source and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                From (Source)
              </Label>
              <Input
                id="source"
                placeholder="Enter departure city"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className={errors.source ? 'border-red-300' : ''}
              />
              {errors.source && <span className="text-red-500 text-sm">{errors.source}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                To (Destination)
              </Label>
              <Input
                id="destination"
                placeholder="Enter destination city"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className={errors.destination ? 'border-red-300' : ''}
              />
              {errors.destination && <span className="text-red-500 text-sm">{errors.destination}</span>}
            </div>
          </div>

          {/* Departure and Return Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Departure Date
              </Label>
              <Input
                id="departureDate"
                type="date"
                min={today}
                value={formData.departureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                className={errors.departureDate ? 'border-red-300' : ''}
              />
              {errors.departureDate && <span className="text-red-500 text-sm">{errors.departureDate}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Return Date
              </Label>
              <Input
                id="returnDate"
                type="date"
                min={formData.departureDate || today}
                value={formData.returnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                className={errors.returnDate ? 'border-red-300' : ''}
              />
              {errors.returnDate && <span className="text-red-500 text-sm">{errors.returnDate}</span>}
            </div>
          </div>

          {/* Travelers and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travelers" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Number of Travelers
              </Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                max="10"
                value={formData.travelers}
                onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Budget Range
              </Label>
              <div className="space-y-2">
                {budgetOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="budget"
                      value={option.value}
                      checked={formData.budget === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.budget && <span className="text-red-500 text-sm">{errors.budget}</span>}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Travel Preferences (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {preferenceOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.preferences.includes(option.value)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.preferences.includes(option.value)}
                    onChange={() => handlePreferenceToggle(option.value)}
                    className="sr-only"
                  />
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs text-center">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Plan My Trip
            </Button>
            <Button onClick={onCancel} variant="outline" className="px-6">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}