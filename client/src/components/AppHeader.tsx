import React from 'react';
import { Link } from 'wouter';
import { Settings, Bookmark } from 'lucide-react';
import { UserProfile } from './UserProfile';

export function AppHeader() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 text-gray-800 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-sky-600 dark:text-sky-400 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">AI Travel Concierge</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Preferences</span>
          </Link>
          <Link href="/saved-trips" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Bookmark className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Saved Trips</span>
          </Link>
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
