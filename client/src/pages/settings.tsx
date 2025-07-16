import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Zap,
  CreditCard,
  LogOut,
  Save,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
      priceAlerts: true,
      tripUpdates: true,
      recommendations: true
    },
    privacy: {
      profileVisibility: 'public',
      shareTrips: true,
      dataCollection: true
    },
    travel: {
      currency: 'USD',
      language: 'en',
      timeZone: 'America/New_York',
      defaultTripLength: '7',
      budgetRange: 'medium'
    },
    ai: {
      studyMode: false,
      personalization: 'high',
      responseStyle: 'detailed'
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access your settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <a href="#profile" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </a>
              <a href="#notifications" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </a>
              <a href="#privacy" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Shield className="w-5 h-5" />
                <span>Privacy</span>
              </a>
              <a href="#travel" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Globe className="w-5 h-5" />
                <span>Travel Preferences</span>
              </a>
              <a href="#ai" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Zap className="w-5 h-5" />
                <span>AI Settings</span>
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Section */}
            <Card id="profile">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your account information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user.googleId ? 'Google Account' : 'Local Account'}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      defaultValue={user.username}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={user.email}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card id="notifications">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Price Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when prices drop</p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.priceAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, priceAlerts: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Trip Updates</Label>
                      <p className="text-sm text-gray-600">Updates about your planned trips</p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.tripUpdates}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, tripUpdates: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Recommendations</Label>
                      <p className="text-sm text-gray-600">New destination suggestions</p>
                    </div>
                    <Switch 
                      checked={preferences.notifications.recommendations}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, recommendations: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Section */}
            <Card id="privacy">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Profile Visibility</Label>
                    <Select 
                      value={preferences.privacy.profileVisibility}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisibility: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Share Trip Plans</Label>
                      <p className="text-sm text-gray-600">Allow others to see your trip plans</p>
                    </div>
                    <Switch 
                      checked={preferences.privacy.shareTrips}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, shareTrips: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Collection</Label>
                      <p className="text-sm text-gray-600">Help improve our AI recommendations</p>
                    </div>
                    <Switch 
                      checked={preferences.privacy.dataCollection}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, dataCollection: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Preferences Section */}
            <Card id="travel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Travel Preferences</span>
                </CardTitle>
                <CardDescription>
                  Set your default travel preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={preferences.travel.currency}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          travel: { ...prev.travel, currency: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={preferences.travel.language}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          travel: { ...prev.travel, language: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Trip Length</Label>
                    <Select 
                      value={preferences.travel.defaultTripLength}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          travel: { ...prev.travel, defaultTripLength: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="21">3 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Budget Range</Label>
                    <Select 
                      value={preferences.travel.budgetRange}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          travel: { ...prev.travel, budgetRange: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget ($)</SelectItem>
                        <SelectItem value="medium">Medium ($$)</SelectItem>
                        <SelectItem value="luxury">Luxury ($$$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Settings Section */}
            <Card id="ai">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>AI Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize your AI assistant behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Study Mode</Label>
                      <p className="text-sm text-gray-600">Enhanced learning and detailed explanations</p>
                    </div>
                    <Switch 
                      checked={preferences.ai.studyMode}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          ai: { ...prev.ai, studyMode: checked }
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Personalization Level</Label>
                    <Select 
                      value={preferences.ai.personalization}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          ai: { ...prev.ai, personalization: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Response Style</Label>
                    <Select 
                      value={preferences.ai.responseStyle}
                      onValueChange={(value) => 
                        setPreferences(prev => ({
                          ...prev,
                          ai: { ...prev.ai, responseStyle: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>

              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}