import React from 'react';
import { Companion } from '@shared/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Calendar, User, Globe, Bookmark, Heart } from "lucide-react";

interface CompanionCardProps {
  companion: Companion;
  onSelect?: (companion: Companion) => void;
  onViewProfile?: (companion: Companion) => void;
  isSelected?: boolean;
  showActions?: boolean;
  actionLabel?: string;
  status?: string;
}

export function CompanionCard({
  companion,
  onSelect,
  onViewProfile,
  isSelected = false,
  showActions = true,
  actionLabel = "Select Companion",
  status
}: CompanionCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = () => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'accepted': 'bg-green-100 text-green-800 hover:bg-green-200',
      'rejected': 'bg-red-100 text-red-800 hover:bg-red-200'
    };
    
    const color = statusColors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    
    return (
      <Badge className={`${color} absolute top-3 right-3`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className={`w-full max-w-sm mx-auto overflow-hidden transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary shadow-md scale-[1.02]' : 'hover:shadow-md'
    }`}>
      {status && getStatusBadge()}
      
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-14 w-14 border-2 border-primary/10">
          <AvatarImage src={companion.avatarUrl || ''} alt={companion.name} />
          <AvatarFallback>{getInitials(companion.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl">{companion.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-medium">{companion.rating}</span>
            </span>
            <span className="text-muted-foreground text-xs">({companion.reviewCount} reviews)</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <User className="h-3 w-3" /> {companion.age}, {companion.gender}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Globe className="h-3 w-3" /> {companion.languages?.slice(0, 2).join(', ')}
            {companion.languages && companion.languages.length > 2 && '...'}
          </Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
            {companion.travelStyle}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 h-[4.5rem]">
          {companion.bio}
        </p>
        
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1">
            {companion.interests?.slice(0, 3).map((interest, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {companion.interests && companion.interests.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{companion.interests.length - 3} more
              </Badge>
            )}
          </div>
          
          {companion.availabilityStart && companion.availabilityEnd && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Available: {new Date(companion.availabilityStart).toLocaleDateString()} - {new Date(companion.availabilityEnd).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-0 flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewProfile?.(companion)}
          >
            View Profile
          </Button>
          <Button 
            variant={isSelected ? "default" : "outline"}
            size="sm" 
            className={`flex-1 ${isSelected ? 'bg-primary' : ''}`}
            onClick={() => onSelect?.(companion)}
          >
            {isSelected ? (
              <>
                <Heart className="h-4 w-4 mr-1 fill-current" />
                Selected
              </>
            ) : actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}