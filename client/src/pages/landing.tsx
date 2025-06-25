import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Globe, Brain, Heart, Map, Users, BookOpen, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'enterprise'>('premium');

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description: "Smart recommendations tailored to your travel style, budget, and preferences"
    },
    {
      icon: Heart,
      title: "Emotional Connection",
      description: "Rich, editorial-style content that connects you emotionally with destinations"
    },
    {
      icon: Map,
      title: "End-to-End Planning",
      description: "Complete travel planning from inspiration to booking in one seamless interface"
    },
    {
      icon: BookOpen,
      title: "Editorial Content",
      description: "Inspiring narratives and cultural insights that transform trip planning"
    },
    {
      icon: Zap,
      title: "Dynamic Responses",
      description: "Real-time, interactive planning that adapts to your needs"
    },
    {
      icon: Users,
      title: "Bill Sharing",
      description: "Easy expense splitting with your travel companions"
    }
  ];

  const pricingPlans = {
    basic: {
      name: "Explorer",
      price: "$9.99",
      period: "per month",
      description: "Perfect for occasional travelers",
      features: [
        "Up to 3 trips per month",
        "Basic AI recommendations",
        "Standard itinerary templates",
        "Email support",
        "Mobile app access"
      ],
      highlight: false
    },
    premium: {
      name: "Wanderer",
      price: "$19.99",
      period: "per month",
      description: "Ideal for frequent travelers",
      features: [
        "Unlimited trips",
        "Advanced AI personalization",
        "Premium editorial content",
        "Real-time booking assistance",
        "Priority support",
        "Bill sharing with companions",
        "Custom itinerary export",
        "Weather & safety alerts"
      ],
      highlight: true
    },
    enterprise: {
      name: "Travel Pro",
      price: "$49.99",
      period: "per month",
      description: "For travel professionals & agencies",
      features: [
        "Everything in Wanderer",
        "Team collaboration tools",
        "White-label options",
        "API access",
        "Dedicated account manager",
        "Advanced analytics",
        "Custom integrations",
        "SLA guarantee"
      ],
      highlight: false
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              The Future of Travel Planning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              WanderNotes: Your AI Travel{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Concierge
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The Notion + ChatGPT of travel — a planning space that's dynamic, intelligent, and deeply human. 
              We don't just get you from A to B — we help you dream, plan, and experience travel with meaning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Link href="/home" className="flex items-center">
                  Start Planning Your Journey
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              The Problem: Fragmented Travel Planning
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Travelers today face a fragmented and overwhelming experience when planning trips. 
              They must juggle between multiple apps and websites — from destination research to 
              booking accommodations and transportation, to finding local experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800">Fragmented Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">
                  No end-to-end planning under one personalized interface
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800">Impersonal Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">
                  Generic suggestions not tailored to your style, budget, or intent
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-800">Lack of Inspiration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">
                  Minimal storytelling or editorial content that inspires and informs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              The WanderNotes Solution
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              WanderNotes fills the gap in the travel planning market by offering a smart, 
              AI-powered planning tool that feels more like a concierge than a static app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Your Intelligent Travel Co-Pilot
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dynamic Responses</h4>
                      <p className="text-gray-600">The system responds in real-time, providing tailored recommendations and insights.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Reports</h4>
                      <p className="text-gray-600">Once you settle on the itinerary, ask the assistant to create a detailed report for verification.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Best Rate Booking</h4>
                      <p className="text-gray-600">Place bookings with the best rates for hotels, airlines, and experiences in your itinerary.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-2xl">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">AI Travel Assistant</h5>
                      <p className="text-sm text-gray-600">Just now</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Based on your love for cultural experiences and $2,000 budget, I've crafted a 7-day Japan itinerary featuring traditional ryokans, temple visits, and authentic local experiences."
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Cultural</Badge>
                    <Badge variant="secondary">Budget-Friendly</Badge>
                    <Badge variant="secondary">Authentic</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Choose Your Adventure Plan
            </h2>
            <p className="text-lg text-gray-600">
              Select the perfect plan for your travel planning needs
            </p>
          </div>

          <Tabs defaultValue="premium" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic">Explorer</TabsTrigger>
              <TabsTrigger value="premium">Wanderer</TabsTrigger>
              <TabsTrigger value="enterprise">Travel Pro</TabsTrigger>
            </TabsList>

            {Object.entries(pricingPlans).map(([key, plan]) => (
              <TabsContent key={key} value={key}>
                <Card className={`max-w-md mx-auto ${plan.highlight ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>
                  <CardHeader className="text-center">
                    {plan.highlight && (
                      <Badge className="mx-auto mb-4 bg-blue-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      Get Started with {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Loved by Travelers Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "WanderNotes transformed how I plan trips. The AI suggestions were spot-on, and I discovered places I never would have found otherwise."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-sm text-gray-600">Digital Nomad</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The editorial content made me fall in love with destinations before I even visited. Planning became part of the adventure!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Marcus Rodriguez</p>
                    <p className="text-sm text-gray-600">Travel Blogger</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Finally, one platform that handles everything! From inspiration to booking, WanderNotes made our family vacation planning effortless."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Emma Thompson</p>
                    <p className="text-sm text-gray-600">Family Traveler</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Travel Planning?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of travelers who've discovered the joy of intelligent, personalized trip planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                <Link href="/home">
                  Start Your Journey Today
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:reach@wander-notes.com" className="text-blue-400 hover:text-blue-300">
              reach@wander-notes.com
            </a>
            <span className="hidden sm:inline text-gray-600">•</span>
            <a href="tel:+6589505706" className="text-blue-400 hover:text-blue-300">
              +65 8950 5706
            </a>
          </div>
          <p className="text-gray-400 mt-8">
            © 2025 WanderNotes. Empowering travelers to explore the world with confidence and creativity.
          </p>
        </div>
      </footer>
    </div>
  );
}