import React from 'react';
import { Link } from 'wouter';
import { Settings, Bookmark, Users, Shield, LayoutGrid, DollarSign, MessageCircle } from 'lucide-react';
import { UserProfile } from './UserProfile';

export function AppHeader() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 text-gray-800 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition">
            <img 
              src="/favicon.svg" 
              alt="Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">AI Travel Concierge</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/preferences" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Preferences</span>
          </Link>
          <Link href="/saved-trips" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Bookmark className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Saved Trips</span>
          </Link>
          <Link href="/travel-companions" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Companions</span>
          </Link>
          <Link href="/safety-test" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <Shield className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Safety Test</span>
          </Link>
          <Link href="/a2a-demo" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <LayoutGrid className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">A2A Demo</span>
          </Link>
          <Link href="/chat-history" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Chat History</span>
          </Link>
          <Link href="/price-comparison" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center">
            <DollarSign className="h-5 w-5" />
            <span className="hidden sm:inline-block ml-1">Price Compare</span>
          </Link>
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
