import React, { useState } from 'react';
import { PackingItem } from '@/types/index';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Search, Printer, CloudDownload, CheckSquare, X } from 'lucide-react';

interface PackingListProps {
  packingList: {
    destination: string;
    categories: Array<{
      name: string;
      items: PackingItem[];
    }>;
    essentials: PackingItem[];
    weatherSpecific: PackingItem[];
    activitySpecific: PackingItem[];
  };
  onSavePacking?: (packingList: any) => void;
  onPrintPacking?: () => void;
}

export function PackingList({ packingList, onSavePacking, onPrintPacking }: PackingListProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [filterText, setFilterText] = useState('');
  
  // Track completion progress
  const totalItems = packingList.categories.reduce(
    (total, category) => total + category.items.length, 
    0
  );
  
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  
  // Handle item checkbox toggle
  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Filter items based on search text
  const filterItems = (items: PackingItem[]) => {
    if (!filterText) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.category.toLowerCase().includes(filterText.toLowerCase())
    );
  };
  
  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'clothing':
        return '👕';
      case 'toiletries & personal care':
        return '🧴';
      case 'electronics & gadgets':
        return '📱';
      case 'travel documents & money':
        return '🛂';
      case 'accessories':
        return '👜';
      case 'health & medical':
        return '💊';
      case 'destination-specific items':
        return '🏖️';
      case 'activity-specific items':
        return '🏄‍♂️';
      case 'weather-specific items':
        return '☂️';
      case 'miscellaneous':
        return '🔠';
      default:
        return '📦';
    }
  };
  
  return (
    <div className="packing-list">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Packing List for {packingList.destination}</CardTitle>
              <CardDescription>
                {totalItems} items to pack • {checkedCount} packed ({progressPercentage}% complete)
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {onPrintPacking && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPrintPacking}
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              )}
              {onSavePacking && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onSavePacking({...packingList, checkedItems})}
                  className="flex items-center gap-1"
                >
                  <CloudDownload className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="pl-8"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setFilterText('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="progress-bar h-2 w-full bg-gray-100 rounded-full mb-4">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-primary" 
              style={{width: `${progressPercentage}%`}}
            ></div>
          </div>
          
          <Tabs defaultValue="categories">
            <TabsList className="mb-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="essentials">Essentials</TabsTrigger>
              <TabsTrigger value="weather">Weather Items</TabsTrigger>
              <TabsTrigger value="activities">Activity Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories">
              <Accordion type="multiple" className="w-full">
                {packingList.categories.map((category) => {
                  const filteredItems = filterItems(category.items);
                  if (filteredItems.length === 0) return null;
                  
                  return (
                    <AccordionItem key={category.name} value={category.name}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(category.name)}</span>
                          <span>{category.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {filteredItems.length} items
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {filteredItems.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                              <Checkbox 
                                id={`item-${item.id}`}
                                checked={!!checkedItems[item.id]} 
                                onCheckedChange={() => toggleItem(item.id)}
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={`item-${item.id}`}
                                  className={`flex items-center text-base font-medium ${checkedItems[item.id] ? 'line-through text-gray-500' : ''}`}
                                >
                                  {item.name}
                                  {item.essential && (
                                    <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                                      Essential
                                    </Badge>
                                  )}
                                  {item.weatherDependent && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                      Weather
                                    </Badge>
                                  )}
                                </Label>
                                <div className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="essentials">
              <Card>
                <CardHeader>
                  <CardTitle>Essential Items</CardTitle>
                  <CardDescription>Items you absolutely shouldn't forget</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filterItems(packingList.essentials).map((item) => (
                      <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                        <Checkbox 
                          id={`essential-${item.id}`}
                          checked={!!checkedItems[item.id]} 
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`essential-${item.id}`}
                            className={`flex items-center text-base font-medium ${checkedItems[item.id] ? 'line-through text-gray-500' : ''}`}
                          >
                            {item.name}
                          </Label>
                          <div className="text-sm text-gray-500">
                            {item.category} • Quantity: {item.quantity}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="weather">
              <Card>
                <CardHeader>
                  <CardTitle>Weather-Specific Items</CardTitle>
                  <CardDescription>Based on the forecast for {packingList.destination}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filterItems(packingList.weatherSpecific).map((item) => (
                      <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                        <Checkbox 
                          id={`weather-${item.id}`}
                          checked={!!checkedItems[item.id]} 
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`weather-${item.id}`}
                            className={`flex items-center text-base font-medium ${checkedItems[item.id] ? 'line-through text-gray-500' : ''}`}
                          >
                            {item.name}
                          </Label>
                          <div className="text-sm text-gray-500">
                            {item.category} • Quantity: {item.quantity}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Activity-Specific Items</CardTitle>
                  <CardDescription>Based on your planned activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filterItems(packingList.activitySpecific).map((item) => (
                      <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                        <Checkbox 
                          id={`activity-${item.id}`}
                          checked={!!checkedItems[item.id]} 
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`activity-${item.id}`}
                            className={`flex items-center text-base font-medium ${checkedItems[item.id] ? 'line-through text-gray-500' : ''}`}
                          >
                            {item.name}
                            {item.activityDependent && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                                {item.activityDependent}
                              </Badge>
                            )}
                          </Label>
                          <div className="text-sm text-gray-500">
                            {item.category} • Quantity: {item.quantity}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}