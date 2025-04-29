import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, Save, User, Lock, Eye, EyeOff, Bell, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  displayName: z.string().optional(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  gameUpdates: z.boolean().default(true),
  achievementNotifications: z.boolean().default(true),
  newDocumentAlerts: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: "user@example.com", // In a real app, this would come from the user's data
      displayName: "",
    },
  });
  
  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      gameUpdates: true,
      achievementNotifications: true,
      newDocumentAlerts: true,
      securityAlerts: true,
      emailNotifications: false,
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      securityForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reset game progress mutation
  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/reset-progress");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress reset",
        description: "Your game progress has been reset successfully.",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      setIsResetDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
      setIsResetDialogOpen(false);
    },
  });
  
  // Submit handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const onSecuritySubmit = (data: SecurityFormValues) => {
    updatePasswordMutation.mutate(data);
  };
  
  const onNotificationSubmit = (data: NotificationFormValues) => {
    updateNotificationsMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-primary border border-gray-800 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-secondary">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-secondary">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-secondary">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-secondary">
              <Shield className="h-4 w-4 mr-2" />
              Game Progress
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} className="bg-secondary border-gray-700" />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" {...field} className="bg-secondary border-gray-700" />
                          </FormControl>
                          <FormDescription>
                            Used for account recovery and notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your preferred name" {...field} className="bg-secondary border-gray-700" />
                          </FormControl>
                          <FormDescription>
                            How you want to be addressed in the game.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter current password" 
                                {...field} 
                                className="bg-secondary border-gray-700 pr-10" 
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter new password" 
                                {...field} 
                                className="bg-secondary border-gray-700 pr-10" 
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Confirm new password" 
                                {...field} 
                                className="bg-secondary border-gray-700 pr-10" 
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={updatePasswordMutation.isPending}>
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                <CardDescription>Manage your notification settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="gameUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-secondary/50">
                            <div className="space-y-0.5">
                              <FormLabel>Game Updates</FormLabel>
                              <FormDescription>
                                Receive notifications about game updates and new features.
                              </FormDescription>
                            </div>
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
                        control={notificationForm.control}
                        name="achievementNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-secondary/50">
                            <div className="space-y-0.5">
                              <FormLabel>Achievement Notifications</FormLabel>
                              <FormDescription>
                                Receive in-game popups when you unlock achievements.
                              </FormDescription>
                            </div>
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
                        control={notificationForm.control}
                        name="newDocumentAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-secondary/50">
                            <div className="space-y-0.5">
                              <FormLabel>New Document Alerts</FormLabel>
                              <FormDescription>
                                Get notified when new documents are available to your access level.
                              </FormDescription>
                            </div>
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
                        control={notificationForm.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-secondary/50">
                            <div className="space-y-0.5">
                              <FormLabel>Security Alerts</FormLabel>
                              <FormDescription>
                                Receive notifications about security breaches and containment issues.
                              </FormDescription>
                            </div>
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
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-3 bg-secondary/50">
                            <div className="space-y-0.5">
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>
                                Receive important updates via email.
                              </FormDescription>
                            </div>
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
                    
                    <Button type="submit" className="w-full" disabled={updateNotificationsMutation.isPending}>
                      {updateNotificationsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Game Progress Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Game Progress Overview</CardTitle>
                <CardDescription>Your current in-game status and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-700 p-4 bg-secondary/50">
                    <h3 className="text-sm font-medium text-foreground mb-2">Security Clearance</h3>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                        <Shield className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">Level 1</p>
                        <p className="text-sm text-gray-400">Basic access to non-classified documents</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-700 p-4 bg-secondary/50">
                    <h3 className="text-sm font-medium text-foreground mb-2">Game Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Documents Discovered</p>
                        <p className="text-lg font-semibold text-foreground">3 / 25</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Credentials Found</p>
                        <p className="text-lg font-semibold text-foreground">0 / 5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Terminals Accessed</p>
                        <p className="text-lg font-semibold text-foreground">0 / 5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Achievements Unlocked</p>
                        <p className="text-lg font-semibold text-foreground">2 / 8</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-700 p-4 bg-secondary/50">
                    <h3 className="text-sm font-medium text-foreground mb-2">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Document accessed: SCP-173</p>
                        <p className="text-xs text-gray-500">2025-04-29</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Achievement unlocked: First Steps</p>
                        <p className="text-xs text-gray-500">2025-04-29</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Achievement unlocked: Document Delver</p>
                        <p className="text-xs text-gray-500">2025-04-29</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reset Game Progress
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-primary border border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Reset Game Progress</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All your in-game credentials, document access history, 
                          and achievement progress will be reset. Your account will remain intact.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          onClick={() => resetProgressMutation.mutate()}
                          disabled={resetProgressMutation.isPending}
                        >
                          {resetProgressMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            "Reset Progress"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Warning: This action cannot be undone. All progress will be lost.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}