import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FileText,
  Terminal,
  MessageSquare,
  Trophy,
  BarChart,
  ListTodo,
  Activity,
  Clock,
  Calendar,
} from "lucide-react";

// Types for the dashboard data
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalTerminals: number;
  totalPersonnel: number;
  totalMessages: number;
  totalAchievements: number;
  totalCredentials: number;
}

interface RecentActivity {
  id: number;
  type: "login" | "document" | "terminal" | "achievement";
  description: string;
  username: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      // Mock data for now
      return {
        totalUsers: 12,
        activeUsers: 8,
        totalDocuments: 25,
        totalTerminals: 5,
        totalPersonnel: 30,
        totalMessages: 45,
        totalAchievements: 8,
        totalCredentials: 5
      };
    }
  });
  
  // Recent activity
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<RecentActivity[]>({
    queryKey: ["/api/admin/activity"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          type: "login",
          description: "User logged in",
          username: "Testuser",
          timestamp: "2025-04-29T11:45:00"
        },
        {
          id: 2,
          type: "document",
          description: "Accessed document SCP-173",
          username: "User2",
          timestamp: "2025-04-29T11:30:00"
        },
        {
          id: 3,
          type: "terminal",
          description: "Connected to terminal SCP-NET-01",
          username: "Admin1",
          timestamp: "2025-04-29T11:15:00"
        },
        {
          id: 4,
          type: "achievement",
          description: "Unlocked achievement 'First Steps'",
          username: "NewUser",
          timestamp: "2025-04-29T10:45:00"
        },
        {
          id: 5,
          type: "login",
          description: "User logged in",
          username: "Admin1",
          timestamp: "2025-04-29T10:30:00"
        }
      ];
    }
  });
  
  // Get activity icon based on type
  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "login":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "terminal":
        return <Terminal className="h-4 w-4 text-yellow-500" />;
      case "achievement":
        return <Trophy className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Monitor system performance and user activity</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-primary border border-gray-800 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-secondary">
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-secondary">
            <ListTodo className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Users</CardTitle>
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>Total registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.activeUsers} active in last 24h
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Documents</CardTitle>
                      <FileText className="h-5 w-5 text-green-500" />
                    </div>
                    <CardDescription>Total documents in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Terminals</CardTitle>
                      <Terminal className="h-5 w-5 text-yellow-500" />
                    </div>
                    <CardDescription>Available terminals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTerminals}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Personnel</CardTitle>
                      <Users className="h-5 w-5 text-red-500" />
                    </div>
                    <CardDescription>Personnel records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPersonnel}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Messages</CardTitle>
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>In-game messages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Achievements</CardTitle>
                      <Trophy className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardDescription>Available achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-foreground">Credentials</CardTitle>
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <CardDescription>In-game credentials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCredentials}</div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {/* Server Status */}
          <Card className="bg-primary border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">System Status</CardTitle>
              <CardDescription>Current server performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <Activity className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Server Status</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-foreground">Online</span>
                  </div>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Uptime</span>
                  </div>
                  <div className="text-foreground">3 days, 7 hours</div>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Last Updated</span>
                  </div>
                  <div className="text-foreground">4/29/2025, 12:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-primary border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">Recent User Activity</CardTitle>
              <CardDescription>Latest actions performed by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="bg-secondary/50 p-4 rounded-lg border border-gray-700 flex items-start"
                  >
                    <div className="bg-background/50 rounded-full p-2 mr-4">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{activity.description}</span>
                        <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                      </div>
                      <span className="text-sm text-gray-400">User: {activity.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-primary border-gray-800">
            <CardHeader>
              <CardTitle className="text-foreground">Admin Tasks</CardTitle>
              <CardDescription>System maintenance and management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">Create Daily Backup</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-9">Ensure the system data is backed up in case of data loss.</p>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mr-3">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">Add New Content</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-9">Create new documents, messages, or personnel records to expand the game.</p>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mr-3">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">Monitor User Progress</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-9">Review user achievements and progress to identify gameplay bottlenecks.</p>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mr-3">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">Develop Story Branches</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-9">Create new narrative paths and interconnected content.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}