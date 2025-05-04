import React from 'react';
import { Companion } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Calendar, 
  Globe, 
  Map, 
  Heart, 
  Check, 
  X, 
  User,
  MessageCircle
} from 'lucide-react';

interface CompanionProfileProps {
  companion: Companion | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (companion: Companion) => void;
  isSelected?: boolean;
  actionLabel?: string;
  showActions?: boolean;
  status?: string;
  onAccept?: (companion: Companion) => void;
  onReject?: (companion: Companion) => void;
}

export function CompanionProfile({
  companion,
  isOpen,
  onClose,
  onSelect,
  isSelected = false,
  actionLabel = "Select Companion",
  showActions = true,
  status,
  onAccept,
  onReject
}: CompanionProfileProps) {
  if (!companion) return null;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const availabilityStartDate = companion.availabilityStart ? new Date(companion.availabilityStart) : null;
  const availabilityEndDate = companion.availabilityEnd ? new Date(companion.availabilityEnd) : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold">{companion.name}</DialogTitle>
          <DialogDescription className="flex items-center mt-2">
            <span className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-current mr-1" />
              <span className="font-medium">{companion.rating}</span>
            </span>
            <span className="text-muted-foreground text-sm ml-1">
              ({companion.reviewCount} reviews)
            </span>
            <Badge 
              variant="outline"
              className="ml-3 text-xs flex items-center gap-1"
            >
              <User className="h-3 w-3" /> {companion.age}, {companion.gender}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="col-span-1">
            <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-muted/30 flex items-center justify-center">
              {companion.avatarUrl ? (
                <img 
                  src={companion.avatarUrl} 
                  alt={companion.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-4xl">{getInitials(companion.name)}</AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Travel Style</h3>
                <Badge className="capitalize bg-primary/10 text-primary hover:bg-primary/20">
                  {companion.travelStyle}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Languages</h3>
                <div className="flex flex-wrap gap-1">
                  {companion.languages?.map((language, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {language}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {availabilityStartDate && availabilityEndDate && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Availability</h3>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {availabilityStartDate.toLocaleDateString()} - {availabilityEndDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              {companion.preferredDestinations && companion.preferredDestinations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Preferred Destinations</h3>
                  <div className="flex flex-wrap gap-1">
                    {companion.preferredDestinations.map((destination, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        <Map className="h-3 w-3" /> {destination}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About Me</h3>
              <p className="text-muted-foreground whitespace-pre-line">{companion.bio}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {companion.interests?.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between mt-6">
          {status && (
            <div className="flex items-center gap-2">
              <Badge variant={
                status === 'accepted' ? 'success' : 
                status === 'rejected' ? 'destructive' : 
                'default'
              }>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              
              {status === 'pending' && onAccept && onReject && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={() => onAccept(companion)}
                  >
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={() => onReject(companion)}
                  >
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Close
            </Button>
            
            {showActions && onSelect && (
              <Button 
                onClick={() => onSelect(companion)}
                variant={isSelected ? "default" : "secondary"}
                className="flex-1 sm:flex-none"
              >
                {isSelected ? (
                  <>
                    <Heart className="h-4 w-4 mr-1 fill-current" /> Selected
                  </>
                ) : (
                  actionLabel
                )}
              </Button>
            )}
            
            <Button variant="default" className="flex-1 sm:flex-none">
              <MessageCircle className="h-4 w-4 mr-1" /> Message
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}