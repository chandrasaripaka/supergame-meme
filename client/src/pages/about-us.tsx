import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Building, Users, Package, MapPin } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/home" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About Us</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Learn more about WanderNotes and the team behind your AI Travel Concierge
          </p>
        </div>

        {/* Company Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Building className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Company Overview</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              WanderNotes by TabTapAI PTE LTD Singapore is revolutionizing the travel industry by combining artificial intelligence with personalized travel planning. Our platform serves as "The Notion + ChatGPT of travel," providing intelligent, conversational travel assistance that adapts to each user's unique preferences and needs.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We solve the complexity of modern travel planning by offering a unified platform that integrates flight search, accommodation booking, itinerary creation, and real-time travel assistance. Our AI-powered concierge eliminates the frustration of juggling multiple booking sites and fragmented travel information.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our target audience includes tech-savvy travelers, digital nomads, business professionals, and anyone seeking a more intelligent and personalized approach to travel planning. We cater to both leisure and business travelers who value efficiency, personalization, and seamless travel experiences.
            </p>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Team</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chandra Sekhar Saripaka
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">Co-Founder & CEO</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Visionary leader driving the strategic direction of WanderNotes. With extensive experience in AI and travel technology, Chandra leads product development and business strategy, ensuring our platform delivers exceptional value to travelers worldwide.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sowjanya Saripaka
              </h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Co-Founder & Chief Analytics Officer</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Analytics expert responsible for data-driven insights and machine learning implementations. Sowjanya ensures our AI algorithms continuously improve through advanced analytics and user behavior analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Our Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Package className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Products</h2>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                WanderNotes AI Travel Concierge
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our flagship product is a comprehensive travel planning platform that combines conversational AI with real-time travel data. Currently in active development, the platform features intelligent itinerary generation, flight search integration, accommodation recommendations, and personalized travel assistance.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Travel Memory Scrapbook
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                An innovative feature that allows travelers to create, curate, and share their travel memories through AI-assisted storytelling and visual documentation. Transform your travel experiences into beautiful, shareable narratives.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Enterprise Travel Solutions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Planned enterprise-grade travel management solutions for businesses, including corporate travel policy integration, expense management, and team travel coordination features.
              </p>
            </div>
          </div>
        </div>

        {/* Development Roadmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <MapPin className="w-8 h-8 text-orange-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Development Roadmap</h2>
          </div>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phase 1: Core Platform (Current)</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  AI-powered travel planning, flight integration, accommodation search, and basic itinerary generation. Multi-model AI support with OpenAI and Gemini integration.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phase 2: Enhanced Features (Q2 2025)</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Real-time booking capabilities, advanced travel analytics, social features for travel companions, and enhanced mobile experience with offline capabilities.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phase 3: Enterprise & Global Expansion (Q3-Q4 2025)</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Enterprise travel management solutions, global market expansion, advanced AI personalization, and integration with major travel booking platforms.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phase 4: Future Innovation (2026+)</h3>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  AR/VR travel previews, blockchain-based travel credentials, sustainable travel optimization, and advanced predictive travel planning using machine learning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mt-8">
          <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
          <p className="mb-6">
            Have questions about WanderNotes or interested in partnership opportunities? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="mailto:hello@wandernotes.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="https://paypal.me/VSaripaka?country.x=SG&locale.x=en_GB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Support Our Mission
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}