import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackingList as PackingListComponent } from '@/components/PackingList';
import { ActivityIcon, ClipboardCheck, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generatePackingList } from '@/lib/apiClient';

interface PackingListRequest {
  destination: string;
  duration: number;
  activities: string[];
  preferences?: {
    travelStyle?: string;
    hasChildren?: boolean;
    hasPets?: boolean;
    hasSpecialEquipment?: boolean;
    specialDietary?: boolean;
    medicalNeeds?: boolean;
    isBusinessTrip?: boolean;
  };
}
import { Separator } from '@/components/ui/separator';
import { PackingList as PackingListType } from '@/types/index';

// Form schema definition
const packingListFormSchema = z.object({
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  duration: z.coerce.number().min(1, {
    message: "Duration must be at least 1 day.",
  }).max(90, {
    message: "Duration must be less than 90 days.",
  }),
  activities: z.string().min(3, {
    message: "Please enter at least one activity.",
  }),
  travelStyle: z.string().optional(),
  hasChildren: z.boolean().default(false),
  hasPets: z.boolean().default(false),
  hasSpecialEquipment: z.boolean().default(false),
  specialDietary: z.boolean().default(false),
  medicalNeeds: z.boolean().default(false),
  isBusinessTrip: z.boolean().default(false),
});

type PackingListFormValues = z.infer<typeof packingListFormSchema>;

export default function PackingListPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [packingList, setPackingList] = useState<PackingListType | null>(null);
  const { toast } = useToast();

  const form = useForm<PackingListFormValues>({
    resolver: zodResolver(packingListFormSchema),
    defaultValues: {
      destination: "",
      duration: 7,
      activities: "",
      travelStyle: "moderate",
      hasChildren: false,
      hasPets: false,
      hasSpecialEquipment: false,
      specialDietary: false,
      medicalNeeds: false,
      isBusinessTrip: false,
    },
  });

  const onSubmit = async (data: PackingListFormValues) => {
    setIsLoading(true);
    
    try {
      // Process activities as array
      const activitiesArray = data.activities.split(',').map(activity => activity.trim());
      
      // Prepare request object
      const request: PackingListRequest = {
        destination: data.destination,
        duration: data.duration,
        activities: activitiesArray,
        preferences: {
          travelStyle: data.travelStyle,
          hasChildren: data.hasChildren,
          hasPets: data.hasPets,
          hasSpecialEquipment: data.hasSpecialEquipment,
          specialDietary: data.specialDietary,
          medicalNeeds: data.medicalNeeds,
          isBusinessTrip: data.isBusinessTrip
        }
      };
      
      // Call API to generate packing list
      const generatedPackingList = await generatePackingList(request);
      setPackingList(generatedPackingList);
      
      toast({
        title: "Packing list generated!",
        description: `Your packing list for ${data.destination} is ready.`,
      });
    } catch (error) {
      console.error('Error generating packing list:', error);
      toast({
        title: "Error generating packing list",
        description: "There was a problem creating your packing list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePackingList = (savedPackingList: any) => {
    toast({
      title: "Packing list saved!",
      description: "Your packing list has been saved successfully.",
    });
  };

  const handlePrintPackingList = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Smart Packing List Generator
      </h1>
      
      <div className="flex mb-6 gap-2">
        <Button variant="outline" onClick={() => setLocation('/')}>
          ← Back to Travel Planner
        </Button>
      </div>
      
      <Tabs defaultValue={packingList ? "result" : "form"}>
        <TabsList className="mb-4">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Create Packing List</span>
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            disabled={!packingList}
            className="flex items-center gap-2"
          >
            <ActivityIcon className="h-4 w-4" />
            <span>Your Packing List</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Generate a Personalized Packing List</CardTitle>
              <CardDescription>
                Tell us about your trip and we'll create a customized packing list for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris, France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={90} 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === "" ? "0" : e.target.value;
                                field.onChange(parseInt(value, 10));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="activities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Hiking, swimming, sightseeing, dining out"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter activities separated by commas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="travelStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a travel style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light (minimal packing)</SelectItem>
                            <SelectItem value="moderate">Moderate (essential items)</SelectItem>
                            <SelectItem value="prepared">Prepared (pack for all scenarios)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hasChildren"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Traveling with children</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasPets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Traveling with pets</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasSpecialEquipment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Special equipment needed</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialDietary"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Special dietary needs</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicalNeeds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Medical needs</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isBusinessTrip"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0">
                          <FormLabel>Business trip</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating your packing list...
                      </>
                    ) : (
                      "Generate Packing List"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="result">
          {packingList && (
            <PackingListComponent 
              packingList={packingList}
              onSavePacking={handleSavePackingList}
              onPrintPacking={handlePrintPackingList}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}