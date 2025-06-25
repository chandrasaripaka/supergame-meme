import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: 'free' | 'explorer' | 'wanderer' | 'travel_pro';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  isFree: boolean;
  icon: React.ReactNode;
  color: string;
}

interface SubscriptionSelectorProps {
  onPlanSelect: (planId: string) => void;
  currentPlan?: string;
  showTravelContext?: boolean;
}

export function SubscriptionSelector({ onPlanSelect, currentPlan, showTravelContext = false }: SubscriptionSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with basic travel planning',
      features: [
        '1 travel plan per month',
        'Basic AI chat',
        'Standard destinations',
        'Community support',
        'Basic itinerary export',
      ],
      popular: false,
      isFree: true,
      icon: <Zap size={24} className="text-blue-500" />,
      color: 'border-blue-200 bg-blue-50',
    },
    {
      id: 'explorer',
      name: 'Explorer',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for occasional travelers',
      features: [
        '5 travel plans per month',
        'Enhanced AI recommendations',
        'Email support',
        'Flight price alerts',
        'PDF export',
        'Weather integration',
      ],
      popular: false,
      isFree: false,
      icon: <Star size={24} className="text-green-500" />,
      color: 'border-green-200 bg-green-50',
    },
    {
      id: 'wanderer',
      name: 'Wanderer',
      price: '$19.99',
      period: '/month',
      description: 'Ideal for regular adventurers',
      features: [
        '15 travel plans per month',
        'Advanced AI insights',
        'Priority support',
        'Real-time notifications',
        'Expense tracking',
        'Group planning',
        'Travel scrapbook',
      ],
      popular: true,
      isFree: false,
      icon: <Crown size={24} className="text-purple-500" />,
      color: 'border-purple-200 bg-purple-50',
    },
    {
      id: 'travel_pro',
      name: 'Travel Pro',
      price: '$49.99',
      period: '/month',
      description: 'For travel professionals and enthusiasts',
      features: [
        'Unlimited travel plans',
        'Premium AI concierge',
        '24/7 dedicated support',
        'Advanced analytics',
        'White-label options',
        'API access',
        'Custom integrations',
        'Business travel tools',
      ],
      popular: false,
      isFree: false,
      icon: <Crown size={24} className="text-orange-500" />,
      color: 'border-orange-200 bg-orange-50',
    },
  ];

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (planId === 'free') {
        // Handle free plan selection
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planType: 'free' })
        });
        if (!response.ok) throw new Error('Failed to select free plan');
        return response.json();
      } else {
        // Handle paid plan - redirect to Stripe
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId })
        });
        if (!response.ok) throw new Error('Failed to create checkout session');
        const { url } = await response.json();
        window.location.href = url;
      }
    },
    onSuccess: (data, planId) => {
      if (planId === 'free') {
        toast({
          title: "Welcome to WanderNotes!",
          description: "You've successfully signed up for the free plan.",
        });
        onPlanSelect(planId);
      }
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (planId: string) => {
    if (!user) {
      // Redirect to auth with selected plan
      localStorage.setItem('selectedPlan', planId);
      window.location.href = '/auth';
      return;
    }

    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      {showTravelContext && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Choose Your Travel Planning Experience
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered travel planning with features designed for every type of traveler.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
            } ${currentPlan === plan.id ? plan.color : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {plan.icon}
              </div>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={subscribeMutation.isPending && selectedPlan === plan.id}
                className={`w-full mt-6 ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : plan.isFree
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
                variant={currentPlan === plan.id ? 'outline' : 'default'}
              >
                {subscribeMutation.isPending && selectedPlan === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : currentPlan === plan.id ? (
                  'Current Plan'
                ) : plan.isFree ? (
                  'Get Started Free'
                ) : (
                  'Upgrade Now'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showTravelContext && (
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      )}
    </div>
  );
}