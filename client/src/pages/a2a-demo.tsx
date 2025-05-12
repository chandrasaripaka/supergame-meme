import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from "@/components/ui/calendar";
import { Separator } from '@/components/ui/separator';
import { 
  Laptop, 
  Users, 
  Plane, 
  Building, 
  Shield, 
  CalendarIcon,
  Clock, 
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { TravelSafetyAlert } from '@/components/TravelSafetyAlert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Define the form schema
const formSchema = z.object({
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  departureDate: z.date({
    required_error: 'Departure date is required',
  }),
  returnDate: z.date({
    required_error: 'Return date is required',
  }).refine(date => date > new Date(), {
    message: 'Return date must be in the future',
  }),
  budget: z.coerce.number().positive('Budget must be positive'),
});

// Define task status colors
const taskStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 border-gray-200 text-gray-500',
  in_progress: 'bg-blue-50 border-blue-200 text-blue-700',
  completed: 'bg-green-50 border-green-200 text-green-700',
  failed: 'bg-red-50 border-red-200 text-red-700',
};

// Helper to get task status icon
const TaskStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <Laptop className="h-4 w-4 animate-pulse" />;
    case 'completed':
      return <Check className="h-4 w-4" />;
    case 'failed':
      return <X className="h-4 w-4" />;
    default:
      return null;
  }
};

// Get agent icon based on type
const AgentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'user_interface':
      return <Users className="h-4 w-4" />;
    case 'flight_booking':
      return <Plane className="h-4 w-4" />;
    case 'accommodation':
      return <Building className="h-4 w-4" />;
    case 'travel_safety':
      return <Shield className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function A2ADemo() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      budget: 2000,
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/a2a/travel-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: values.destination,
          departureDate: format(values.departureDate, 'yyyy-MM-dd'),
          returnDate: format(values.returnDate, 'yyyy-MM-dd'),
          budget: values.budget,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing request');
      }
      
      const data = await response.json();
      setResults(data);
      
      toast({
        title: 'A2A Planning Complete',
        description: `Travel plan for ${values.destination} created successfully`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Agent-to-Agent Travel Planning Demo</h1>
      <p className="text-muted-foreground mb-8">
        This demo showcases the A2A framework where specialized agents collaborate to create 
        a comprehensive travel plan. Each agent focuses on its expertise domain while 
        communicating with other agents as needed.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Travel Parameters</CardTitle>
            <CardDescription>
              Provide details for your trip and our agent system will create a plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paris, Tokyo, New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Return Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const departureDate = form.getValues('departureDate');
                              return date < new Date() || (departureDate && date < departureDate);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" min="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Generate Travel Plan'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent Collaboration Results</CardTitle>
            <CardDescription>
              See how different specialized agents work together to create your travel plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary-50 p-2 rounded-lg mr-3">
                      <Laptop className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Workflow ID</h3>
                      <p className="text-sm text-muted-foreground">{results.workflowId}</p>
                    </div>
                  </div>
                </div>
                
                {results.safety && !results.safety.safe && (
                  <div className="mb-4">
                    <TravelSafetyAlert destination={form.getValues('destination')} />
                  </div>
                )}
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tasks">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        <span>Task Execution ({results.tasks.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        {results.tasks.map((task: any) => (
                          <div 
                            key={task.id} 
                            className={`p-3 border rounded-lg ${taskStatusColors[task.status as keyof typeof taskStatusColors] || 'bg-gray-100'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="mr-3 mt-1">
                                  <AgentIcon type={task.agentType} />
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm">{task.description}</p>
                                  <div className="flex items-center mt-1 text-xs">
                                    <TaskStatusIcon status={task.status} />
                                    <span className="ml-1 capitalize">{task.status}</span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            
                            {task.result && (
                              <div className="mt-2 text-sm">
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value="result">
                                    <AccordionTrigger className="py-1 text-xs">
                                      Task Result
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <pre className="text-xs bg-slate-50 p-2 rounded max-h-40 overflow-auto">
                                        {JSON.stringify(task.result, null, 2)}
                                      </pre>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {results.safety && (
                    <AccordionItem value="safety">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <Shield className="mr-2 h-5 w-5" />
                          <span>Safety Information</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 rounded-lg bg-slate-50">
                          {results.safety.safe ? (
                            <div className="flex items-center text-green-600">
                              <Check className="mr-2 h-5 w-5" />
                              <span>No safety concerns identified for this destination</span>
                            </div>
                          ) : results.safety.advisory ? (
                            <div className="space-y-3">
                              <div className="flex items-center text-amber-600">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                <span className="font-medium">
                                  Travel Advisory for {results.safety.advisory.country}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Level:</span> {results.safety.advisory.level.replace(/_/g, ' ')}
                              </div>
                              <div>
                                <span className="font-medium">Reasons:</span> {results.safety.advisory.reason.join(', ')}
                              </div>
                              <div>
                                <span className="font-medium">Details:</span> {results.safety.advisory.details}
                              </div>
                              {results.safety.advisory.sanctions && (
                                <div className="bg-red-50 p-2 rounded border border-red-200 text-red-700">
                                  Warning: This country has international sanctions that may affect travel
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>No safety information available</div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  {results.flights && (
                    <AccordionItem value="flights">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <Plane className="mr-2 h-5 w-5" />
                          <span>Flight Information</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {results.flights.safetyWarning ? (
                          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                            {results.flights.safetyWarning}
                          </div>
                        ) : results.flights.flights ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">
                              {results.flights.flights.length} flights found
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {results.flights.flights.slice(0, 4).map((flight: any, index: number) => (
                                <div key={index} className="border rounded-lg p-3 bg-slate-50">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">{flight.airline}</div>
                                    <div className="text-green-600 font-bold">
                                      ${flight.price}
                                    </div>
                                  </div>
                                  <div className="mt-2 flex justify-between text-sm">
                                    <div>
                                      <div className="font-medium">{flight.departureTime}</div>
                                      <div className="text-muted-foreground">{flight.departureAirport}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground">{flight.duration}</div>
                                      <div className="text-xs">
                                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{flight.arrivalTime}</div>
                                      <div className="text-muted-foreground">{flight.arrivalAirport}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>No flight information available</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                  {results.hotels && (
                    <AccordionItem value="hotels">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <Building className="mr-2 h-5 w-5" />
                          <span>Accommodation Information</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {results.hotels.safetyWarning ? (
                          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                            {results.hotels.safetyWarning}
                          </div>
                        ) : results.hotels.hotels ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">
                              {results.hotels.hotels.length} hotels found
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {results.hotels.hotels.slice(0, 3).map((hotel: any) => (
                                <div key={hotel.id} className="border rounded-lg p-4 bg-slate-50">
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="font-medium">{hotel.name}</h4>
                                      <p className="text-sm text-muted-foreground">{hotel.address}</p>
                                    </div>
                                    <div className="text-green-600 font-bold">
                                      ${hotel.pricePerNight}/night
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="flex items-center text-sm">
                                      <span className="font-medium">Rating:</span>
                                      <span className="ml-1">{hotel.rating}/5</span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {hotel.amenities.map((amenity: string, i: number) => (
                                        <span key={i} className="text-xs bg-slate-200 px-2 py-1 rounded">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                    {hotel.availableRooms !== undefined && (
                                      <div className="text-sm mt-2 font-medium text-amber-600">
                                        {hotel.availableRooms} rooms available
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>No hotel information available</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Enter trip details to see agent collaboration
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our agents will work together to provide safety information, 
                  flight options, and accommodations for your trip.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}