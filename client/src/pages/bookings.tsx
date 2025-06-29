import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookingManager } from '@/components/BookingManager';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { User } from '@shared/schema';

export default function BookingsPage() {
  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user']
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Travel Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage all your travel reservations in one place
          </p>
        </div>
        
        <BookingManager userId={user?.id} />
      </main>
      
      <AppFooter />
    </div>
  );
}