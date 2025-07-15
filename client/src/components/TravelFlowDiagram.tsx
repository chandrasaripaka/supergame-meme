import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Plane, 
  Building, 
  Users, 
  DollarSign, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';

export function TravelFlowDiagram() {
  const flowSteps = [
    {
      id: 1,
      title: "Chat with AI Assistant",
      description: "Tell us about your travel preferences, budget, and dream destinations",
      icon: MessageCircle,
      color: "bg-blue-500",
      details: ["Natural conversation", "Preference learning", "Budget discussion"]
    },
    {
      id: 2,
      title: "AI Analysis & Planning",
      description: "Our AI analyzes your preferences and creates personalized recommendations",
      icon: Sparkles,
      color: "bg-purple-500",
      details: ["Smart recommendations", "Cultural insights", "Hidden gems"]
    },
    {
      id: 3,
      title: "Destination Selection",
      description: "Choose from curated destinations that match your travel style",
      icon: MapPin,
      color: "bg-green-500",
      details: ["Curated options", "Weather insights", "Safety information"]
    },
    {
      id: 4,
      title: "Itinerary Creation",
      description: "Generate detailed day-by-day plans with activities and experiences",
      icon: Calendar,
      color: "bg-orange-500",
      details: ["Day-by-day plans", "Activity suggestions", "Local experiences"]
    },
    {
      id: 5,
      title: "Flight & Accommodation",
      description: "Find and compare the best deals for flights and hotels",
      icon: Plane,
      color: "bg-red-500",
      details: ["Flight comparisons", "Hotel recommendations", "Best rates"]
    },
    {
      id: 6,
      title: "Companion Sharing",
      description: "Share plans with travel companions and manage group decisions",
      icon: Users,
      color: "bg-indigo-500",
      details: ["Group collaboration", "Shared planning", "Bill splitting"]
    },
    {
      id: 7,
      title: "Budget Management",
      description: "Track expenses and manage your travel budget effectively",
      icon: DollarSign,
      color: "bg-yellow-500",
      details: ["Budget tracking", "Expense splitting", "Cost optimization"]
    },
    {
      id: 8,
      title: "Final Report & Booking",
      description: "Get comprehensive travel reports and proceed with bookings",
      icon: FileText,
      color: "bg-teal-500",
      details: ["Detailed reports", "Booking assistance", "Travel documents"]
    }
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Bot className="w-8 h-8 text-blue-600" />
          <h3 className="text-3xl font-bold text-gray-900">
            How WanderNotes Works
          </h3>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience the future of travel planning with our AI-powered assistant that guides you through every step of your journey
        </p>
      </div>

      {/* Flow Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="relative">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium">
                    Step {step.id}
                  </Badge>
                </div>

                {/* Content */}
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Details */}
                <div className="space-y-1">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500">{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Arrow connector (hidden on last item and on mobile) */}
            {index < flowSteps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Demo CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Experience the Future of Travel Planning?
          </h4>
          <p className="text-gray-600 mb-6">
            Join thousands of travelers who have revolutionized their trip planning with WanderNotes
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Personalized
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Users className="w-3 h-3 mr-1" />
              Collaborative
            </Badge>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-green-100 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}