import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Subscription, InsertSubscription } from '@shared/schema';

export function useSubscriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscriptionsQuery = useQuery({
    queryKey: ['/api/subscriptions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscriptions');
      return response.json() as Promise<Subscription[]>;
    }
  });

  const subscriptionPlansQuery = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscription-plans');
      return response.json();
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planType: string) => {
      const response = await apiRequest('POST', '/api/subscriptions', { planType });
      return response.json() as Promise<Subscription>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Subscription Created",
        description: "Your subscription has been successfully activated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/subscriptions/${id}`, { status });
      return response.json() as Promise<Subscription>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    }
  });

  return {
    subscriptions: subscriptionsQuery.data || [],
    subscriptionPlans: subscriptionPlansQuery.data || {},
    isLoading: subscriptionsQuery.isLoading || subscriptionPlansQuery.isLoading,
    error: subscriptionsQuery.error || subscriptionPlansQuery.error,
    createSubscription: createSubscriptionMutation,
    updateSubscription: updateSubscriptionMutation
  };
}