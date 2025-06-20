import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Users, Camera, Utensils, Car } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  cost: number;
  category: string;
  location: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  groupSize: string;
  highlights: string[];
}

interface DayPlan {
  day: number;
  date: string;
  location: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

interface DayActivitySelectorProps {
  dayPlan: DayPlan;
  onActivitySelect: (day: number, timeSlot: string, activity: Activity) => void;
  selectedActivities: { [key: string]: string }; // timeSlot -> activityId
}

export function DayActivitySelector({ dayPlan, onActivitySelect, selectedActivities }: DayActivitySelectorProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sightseeing': return <Camera className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'transport': return <Car className="h-4 w-4" />;
      case 'culture': return <Users className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sightseeing': return 'bg-blue-100 text-blue-800';
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'adventure': return 'bg-green-100 text-green-800';
      case 'culture': return 'bg-purple-100 text-purple-800';
      case 'relaxation': return 'bg-pink-100 text-pink-800';
      case 'shopping': return 'bg-yellow-100 text-yellow-800';
      case 'transport': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTimeSlot = (timeSlot: 'morning' | 'afternoon' | 'evening', activities: Activity[]) => {
    const selectedActivityId = selectedActivities[`${dayPlan.day}-${timeSlot}`];
    const selectedActivity = activities.find(a => a.id === selectedActivityId);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 capitalize flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            {timeSlot}
          </h4>
          <Badge variant="outline" className="text-xs">
            {activities.length} options
          </Badge>
        </div>

        <Select
          value={selectedActivityId || ''}
          onValueChange={(value) => {
            const activity = activities.find(a => a.id === value);
            if (activity) {
              onActivitySelect(dayPlan.day, timeSlot, activity);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Choose ${timeSlot} activity`} />
          </SelectTrigger>
          <SelectContent>
            {activities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(activity.category)}
                    <span className="font-medium">{activity.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getCategoryColor(activity.category)} variant="secondary">
                      {activity.category}
                    </Badge>
                    <span className="text-sm text-gray-600">${activity.cost}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show selected activity details */}
        {selectedActivity && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-800">{selectedActivity.name}</h5>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(selectedActivity.category)}>
                      {selectedActivity.category}
                    </Badge>
                    <span className="text-lg font-bold text-green-600">${selectedActivity.cost}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedActivity.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedActivity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedActivity.groupSize}</span>
                  </div>
                </div>

                {selectedActivity.highlights.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Highlights:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedActivity.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const getTotalCost = () => {
    let total = 0;
    ['morning', 'afternoon', 'evening'].forEach(timeSlot => {
      const selectedActivityId = selectedActivities[`${dayPlan.day}-${timeSlot}`];
      if (selectedActivityId) {
        const activities = dayPlan[timeSlot as keyof typeof dayPlan] as Activity[];
        const selectedActivity = activities.find(a => a.id === selectedActivityId);
        if (selectedActivity) {
          total += selectedActivity.cost;
        }
      }
    });
    return total;
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Day {dayPlan.day}</h3>
            <p className="text-blue-100">{dayPlan.date} • {dayPlan.location}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${getTotalCost()}</div>
            <div className="text-sm text-blue-100">Daily Total</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {renderTimeSlot('morning', dayPlan.morning)}
        <div className="border-t border-gray-200 pt-6">
          {renderTimeSlot('afternoon', dayPlan.afternoon)}
        </div>
        <div className="border-t border-gray-200 pt-6">
          {renderTimeSlot('evening', dayPlan.evening)}
        </div>
      </CardContent>
    </Card>
  );
}