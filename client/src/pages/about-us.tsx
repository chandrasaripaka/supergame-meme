import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, MapPin, Globe, Award, Zap } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Wander Notes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing travel planning through AI-powered personalization and intelligent recommendations
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-blue-900">Our Company</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">
                <strong>Wander Notes by TabTapAI PTE LTD Singapore</strong> is an innovative travel technology company 
                focused on creating personalized, AI-powered travel experiences.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Singapore</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Global Travel Solutions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">© 2025 All rights reserved</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-green-600" />
                <CardTitle className="text-green-900">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 mb-4">
                To transform travel planning from a fragmented, overwhelming experience into a seamless, 
                personalized journey that connects travelers emotionally with their destinations.
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  AI-Powered Personalization
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  End-to-End Planning
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Emotional Connection
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">CS</span>
                </div>
                <CardTitle className="text-gray-900">Chandra Sekhar Saripaka</CardTitle>
                <CardDescription className="text-blue-600 font-medium">Co-Founder & CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Visionary leader driving the future of AI-powered travel experiences with deep expertise 
                  in technology innovation and user-centered design.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">SS</span>
                </div>
                <CardTitle className="text-gray-900">Sowjanya Saripaka</CardTitle>
                <CardDescription className="text-purple-600 font-medium">Co-Founder & Chief Analytics Officer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Analytics expert transforming travel data into actionable insights, specializing in 
                  user behavior analysis and predictive travel intelligence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Our Products
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-900">AI Travel Concierge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-800 text-sm">
                  Conversational AI assistant that understands your travel preferences and creates 
                  personalized itineraries with real-time recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-teal-50/50">
              <CardHeader>
                <CardTitle className="text-teal-900">Smart Itinerary Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-teal-800 text-sm">
                  Interactive planning tool with flight search, hotel recommendations, and 
                  day-by-day activity customization all in one interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-pink-200 bg-pink-50/50">
              <CardHeader>
                <CardTitle className="text-pink-900">Memory Scrapbook</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-pink-800 text-sm">
                  Beautiful travel memory creation and sharing platform that turns your trips 
                  into lasting visual stories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Product Roadmap
          </h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-600 text-white">Q1 2025</Badge>
                  <div>
                    <h4 className="font-semibold text-green-900">Enhanced AI Personalization</h4>
                    <p className="text-sm text-green-700">Advanced machine learning models for better travel recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-600 text-white">Q2 2025</Badge>
                  <div>
                    <h4 className="font-semibold text-blue-900">Mobile App Launch</h4>
                    <p className="text-sm text-blue-700">Native iOS and Android applications with offline capabilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-purple-600 text-white">Q3 2025</Badge>
                  <div>
                    <h4 className="font-semibold text-purple-900">Real-time Collaboration</h4>
                    <p className="text-sm text-purple-700">Enhanced group planning with live collaboration features</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-indigo-600 text-white">Q4 2025</Badge>
                  <div>
                    <h4 className="font-semibold text-indigo-900">Enterprise Solutions</h4>
                    <p className="text-sm text-indigo-700">Business travel management and corporate booking tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-6">
            Have questions about our platform or want to learn more about our technology?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@wandernotes.com" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Contact Support
            </a>
            <a 
              href="https://paypal.me/VSaripaka?country.x=SG&locale.x=en_GB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Support Our Mission
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}