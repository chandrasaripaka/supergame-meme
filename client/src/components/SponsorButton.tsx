import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';

interface SponsorButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SponsorButton({ variant = 'default', size = 'default', className = '' }: SponsorButtonProps) {
  const handleSponsorClick = () => {
    // Open Google form for sponsorship - you'll need to create this form
    // For now, opening GitHub Sponsors as an alternative
    window.open('https://github.com/sponsors/wandernotes-ai', '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-0`}
      onClick={handleSponsorClick}
    >
      <Heart className="h-4 w-4" />
      <span>Sponsor Us</span>
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
}

export function SponsorCard() {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-red-50 border border-pink-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Support WanderNotes Development
          </h3>
          <p className="text-gray-600 mb-4">
            Help us build the future of AI-powered travel planning. Your sponsorship enables us to add new features, 
            improve AI capabilities, and keep the platform accessible for travelers worldwide.
          </p>
          <div className="flex items-center space-x-3">
            <SponsorButton size="sm" />
            <span className="text-sm text-gray-500">
              Support starts from $5/month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}