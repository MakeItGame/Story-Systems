import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Lock, Check, Trophy, Star, Clock, Flame, Shield, User } from "lucide-react";

// Types for progress tracking
interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: "document" | "security" | "terminal" | "login" | "special";
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

interface Statistic {
  id: string;
  name: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
}

interface ProgressSummary {
  statistics: Statistic[];
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalDocumentsFound: number;
  totalDocuments: number;
  totalCredentialsFound: number;
  totalTerminalsAccessed: number;
  totalAchievementsUnlocked: number;
  totalAchievements: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simulate fetching achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      // Mock data
      const mockData: Achievement[] = [
        {
          id: 1,
          title: "First Steps",
          description: "Register an account and log in to the system.",
          icon: "login",
          isUnlocked: true,
          unlockedAt: "2025-04-29T11:30:00",
          rarity: "common"
        },
        {
          id: 2,
          title: "Document Delver",
          description: "Access your first classified document.",
          icon: "document",
          isUnlocked: true,
          unlockedAt: "2025-04-29T11:35:00",
          rarity: "common"
        },
        {
          id: 3,
          title: "Terminal Technician",
          description: "Successfully interact with a facility terminal.",
          icon: "terminal",
          isUnlocked: false,
          rarity: "common"
        },
        {
          id: 4,
          title: "Identity Theft",
          description: "Discover your first in-game login credential.",
          icon: "login",
          isUnlocked: false,
          rarity: "uncommon"
        },
        {
          id: 5,
          title: "Security Breach",
          description: "Access a Level 2 restricted document.",
          icon: "security",
          isUnlocked: false,
          rarity: "uncommon"
        },
        {
          id: 6,
          title: "Data Miner",
          description: "Access 10 different documents.",
          icon: "document",
          isUnlocked: false,
          rarity: "rare"
        },
        {
          id: 7,
          title: "Shadow Admin",
          description: "Obtain admin-level credentials.",
          icon: "security",
          isUnlocked: false,
          rarity: "rare"
        },
        {
          id: 8,
          title: "The Truth Is Out There",
          description: "Discover the facility's darkest secret.",
          icon: "special",
          isUnlocked: false,
          rarity: "legendary"
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return mockData;
    }
  });
  
  // Simulate fetching progress summary
  const { data: progressSummary } = useQuery<ProgressSummary>({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      // Mock data
      const mockData: ProgressSummary = {
        statistics: [
          {
            id: "time-played",
            name: "Time Played",
            value: 1.5,
            unit: "hours",
            icon: <Clock className="h-4 w-4" />
          },
          {
            id: "documents-viewed",
            name: "Documents Viewed",
            value: 3,
            icon: <FileText className="h-4 w-4" />
          },
          {
            id: "credentials-found",
            name: "Credentials Found",
            value: 0,
            icon: <User className="h-4 w-4" />
          },
          {
            id: "terminals-used",
            name: "Terminals Used",
            value: 0,
            icon: <Terminal className="h-4 w-4" />
          },
          {
            id: "login-attempts",
            name: "Login Attempts",
            value: 2,
            icon: <Key className="h-4 w-4" />
          },
          {
            id: "highest-security",
            name: "Highest Security Access",
            value: 1,
            icon: <Shield className="h-4 w-4" />
          }
        ],
        level: 1,
        experience: 250,
        experienceToNextLevel: 1000,
        totalDocumentsFound: 3,
        totalDocuments: 25,
        totalCredentialsFound: 0,
        totalTerminalsAccessed: 0,
        totalAchievementsUnlocked: 2,
        totalAchievements: 8
      };
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return mockData;
    }
  });
  
  const getAchievementIcon = (type: Achievement["icon"]) => {
    switch (type) {
      case "document": return <FileText className="h-5 w-5" />;
      case "security": return <Shield className="h-5 w-5" />;
      case "terminal": return <Terminal className="h-5 w-5" />;
      case "login": return <User className="h-5 w-5" />;
      case "special": return <Star className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };
  
  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common": return "text-gray-400 border-gray-700";
      case "uncommon": return "text-green-400 border-green-900";
      case "rare": return "text-blue-400 border-blue-900";
      case "legendary": return "text-yellow-400 border-yellow-900";
      default: return "text-gray-400 border-gray-700";
    }
  };
  
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // FileText and Terminal components for the icons
  const FileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );

  const Terminal = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  );

  const Key = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Game Progress</h1>
          <p className="text-gray-400">Track your achievements and game statistics</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-primary border border-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-secondary">Overview</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-secondary">Achievements</TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-secondary">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {progressSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-foreground">Player Progress</CardTitle>
                    <CardDescription>Your current level and experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-foreground">{progressSummary.level}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Current Level</p>
                          <p className="text-lg font-medium text-foreground">Clearance Level {progressSummary.level}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 text-right">Next Level</p>
                        <p className="text-lg font-medium text-foreground">Level {progressSummary.level + 1}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Experience</span>
                        <span className="text-sm text-gray-400">{progressSummary.experience} / {progressSummary.experienceToNextLevel}</span>
                      </div>
                      <Progress value={(progressSummary.experience / progressSummary.experienceToNextLevel) * 100} className="h-2 bg-secondary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-foreground">Completion Summary</CardTitle>
                    <CardDescription>Your overall game completion status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Documents Discovered</span>
                        <span className="text-sm text-gray-400">{progressSummary.totalDocumentsFound} / {progressSummary.totalDocuments}</span>
                      </div>
                      <Progress 
                        value={(progressSummary.totalDocumentsFound / progressSummary.totalDocuments) * 100} 
                        className="h-2 bg-secondary" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Credentials Found</span>
                        <span className="text-sm text-gray-400">{progressSummary.totalCredentialsFound} / 5</span>
                      </div>
                      <Progress 
                        value={(progressSummary.totalCredentialsFound / 5) * 100} 
                        className="h-2 bg-secondary" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Terminals Accessed</span>
                        <span className="text-sm text-gray-400">{progressSummary.totalTerminalsAccessed} / 5</span>
                      </div>
                      <Progress 
                        value={(progressSummary.totalTerminalsAccessed / 5) * 100} 
                        className="h-2 bg-secondary" 
                        indicatorClassName="bg-yellow-600" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Achievements Unlocked</span>
                        <span className="text-sm text-gray-400">{progressSummary.totalAchievementsUnlocked} / {progressSummary.totalAchievements}</span>
                      </div>
                      <Progress 
                        value={(progressSummary.totalAchievementsUnlocked / progressSummary.totalAchievements) * 100} 
                        className="h-2 bg-secondary" 
                        indicatorClassName="bg-purple-600" 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary border-gray-800 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-foreground">Recent Achievements</CardTitle>
                    <CardDescription>Latest milestones you've reached</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {achievements.filter(a => a.isUnlocked).slice(0, 4).map(achievement => (
                        <div key={achievement.id} className="bg-secondary rounded-lg p-4 border border-gray-800">
                          <div className="flex items-center mb-2">
                            <div className="mr-2 text-accent">
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <Badge variant="outline" className={`${getRarityColor(achievement.rarity)} capitalize`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{achievement.title}</h3>
                          <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDateTime(achievement.unlockedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Achievements</CardTitle>
                    <CardDescription>Milestones and discoveries</CardDescription>
                  </div>
                  {progressSummary && (
                    <Badge variant="outline" className="bg-secondary border-gray-700">
                      {progressSummary.totalAchievementsUnlocked} / {progressSummary.totalAchievements} Unlocked
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {achievements.map(achievement => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 rounded-lg border ${achievement.isUnlocked ? 'bg-secondary/80 border-gray-700' : 'bg-secondary/30 border-gray-800'}`}
                    >
                      <div className="flex items-start">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${achievement.isUnlocked ? 'bg-accent/20 text-accent' : 'bg-gray-800 text-gray-600'} mr-4`}>
                          {achievement.isUnlocked ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium ${achievement.isUnlocked ? 'text-foreground' : 'text-gray-500'}`}>
                              {achievement.title}
                            </h3>
                            <Badge variant="outline" className={`${getRarityColor(achievement.rarity)} capitalize`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm mb-2 ${achievement.isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                            {achievement.description}
                          </p>
                          
                          {achievement.isUnlocked && achievement.unlockedAt && (
                            <div className="flex items-center text-xs text-accent">
                              <Check className="h-3 w-3 mr-1" />
                              <span>Unlocked: {formatDateTime(achievement.unlockedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-foreground">Game Statistics</CardTitle>
                <CardDescription>Detailed metrics of your gameplay</CardDescription>
              </CardHeader>
              <CardContent>
                {progressSummary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {progressSummary.statistics.map(stat => (
                      <div key={stat.id} className="bg-secondary p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center mb-1 text-gray-400">
                          <div className="mr-2">
                            {stat.icon}
                          </div>
                          <span className="text-sm">{stat.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}