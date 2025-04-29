import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Eye, FileText, Lock, ShieldAlert } from "lucide-react";

// Define personnel data types
type PersonnelStatus = "Active" | "Deceased" | "MIA" | "Suspended" | "Reassigned";

interface PersonnelFile {
  id: number;
  name: string;
  title: string;
  department: string;
  clearanceLevel: number;
  status: PersonnelStatus;
  lastSeen: string;
  photo?: string | null;
  biography: string;
  notes: string;
  incidents: number[];
  securityLevel: number; // Required clearance to view this file
}

export default function PersonnelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelFile | null>(null);
  
  // Fetch current user's credentials
  const { data: credentials = [] } = useQuery<(any & { isSelected: boolean })[]>({
    queryKey: ["/api/credentials"],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 5000, // Poll periodically to ensure we have latest credentials
  });
  
  // Find selected credential and determine security level
  const selectedCredential = credentials.find(cred => cred.isSelected);
  const securityLevel = selectedCredential?.securityLevel || 0;
  console.log("Current security level for personnel:", securityLevel);
  
  // In a real application, this would be fetched from the server
  // Based on the user's credentials
  const { data: personnelFiles = [], isLoading } = useQuery<PersonnelFile[]>({
    queryKey: ["/api/personnel", securityLevel], // Add securityLevel to query key to trigger re-fetch when it changes
    // Simulate backend response for now
    queryFn: async () => {
      // Mock data
      const mockData: PersonnelFile[] = [
        {
          id: 1,
          name: "Dr. [REDACTED]",
          title: "Senior Researcher",
          department: "Research & Development",
          clearanceLevel: 3,
          status: "Active",
          lastSeen: "2025-04-29",
          photo: null,
          biography: "Dr. [REDACTED] joined the facility in 2018 after completing their doctorate in [DATA EXPUNGED]. Their work has primarily focused on the containment and study of [REDACTED].",
          notes: "Shows exceptional dedication to research protocols. Recommended for promotion to Level 4 clearance in the next review cycle.",
          incidents: [12, 47],
          securityLevel: 1
        },
        {
          id: 2,
          name: "Agent ███████",
          title: "Field Operative",
          department: "Security",
          clearanceLevel: 2,
          status: "MIA",
          lastSeen: "2025-03-15",
          photo: null,
          biography: "Agent ███████ was recruited from [REDACTED] in 2021. Specialized in recovery operations and threat assessment.",
          notes: "Last communication received during Operation ████████. Investigation ongoing. Status changed to MIA on 2025-03-20.",
          incidents: [31],
          securityLevel: 2
        },
        {
          id: 3,
          name: "Dr. █████ ██████",
          title: "Medical Officer",
          department: "Medical",
          clearanceLevel: 3,
          status: "Active",
          lastSeen: "2025-04-28",
          photo: null,
          biography: "Dr. █████ ██████ oversees the medical treatment and monitoring of facility staff and research subjects.",
          notes: "Exemplary record in emergency response scenarios. Has developed several innovative protocols for treating [REDACTED] exposure.",
          incidents: [],
          securityLevel: 2
        }
      ];
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter based on security level
      return mockData.filter(personnel => personnel.securityLevel <= securityLevel);
    }
  });
  
  // Filter personnel based on active tab
  const filteredPersonnel = personnelFiles.filter(person => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return person.status === "Active";
    if (activeTab === "inactive") return person.status !== "Active";
    return true;
  });
  
  const getStatusColor = (status: PersonnelStatus) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Deceased": return "bg-red-500";
      case "MIA": return "bg-yellow-500";
      case "Suspended": return "bg-blue-500";
      case "Reassigned": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Personnel Records</h1>
          <p className="text-gray-400">Access personnel files based on your clearance level</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Personnel list */}
          <div className="md:col-span-1 bg-primary rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-secondary grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="divide-y divide-gray-800 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : filteredPersonnel.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No personnel records found
                </div>
              ) : (
                filteredPersonnel.map(person => (
                  <div 
                    key={person.id}
                    className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${selectedPersonnel?.id === person.id ? 'bg-secondary' : ''}`}
                    onClick={() => setSelectedPersonnel(person)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{person.name}</h3>
                        <p className="text-sm text-gray-400">{person.title}</p>
                        <p className="text-xs text-gray-500">{person.department}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`w-3 h-3 ${getStatusColor(person.status)} rounded-full`}></div>
                        <span className="text-xs text-gray-500 mt-1">Level {person.clearanceLevel}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Right panel - Personnel details */}
          <div className="md:col-span-2">
            {!selectedPersonnel ? (
              <div className="bg-primary rounded-lg border border-gray-800 h-full flex flex-col items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">No Personnel Selected</h3>
                  <p className="text-gray-400 max-w-md">
                    Select a personnel record from the list to view detailed information.
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-primary rounded-lg border border-gray-800 h-full"
              >
                {/* Access denied overlay for insufficient clearance */}
                {selectedPersonnel.securityLevel > securityLevel && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center z-10 p-6">
                    <ShieldAlert className="h-20 w-20 text-accent mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">ACCESS DENIED</h2>
                    <p className="text-gray-400 text-center mb-4">
                      Your current security clearance (Level {securityLevel}) is insufficient to access this file.
                    </p>
                    <div className="bg-secondary/50 p-4 rounded border border-gray-700 font-mono text-sm mb-4 w-full max-w-md">
                      <p className="text-accent mb-1">{'>'} ERROR: SECURITY CLEARANCE MISMATCH</p>
                      <p className="text-yellow-500 mb-1">{'>'} REQUIRED: LEVEL {selectedPersonnel.securityLevel}</p>
                      <p className="text-green-500 mb-1">{'>'} CURRENT: LEVEL {securityLevel}</p>
                      <p className="text-foreground">{'>'} SYSTEM: ACCESS_LOG_UPDATED</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="bg-secondary hover:bg-gray-800 text-accent"
                      onClick={() => setSelectedPersonnel(null)}
                    >
                      Return to Personnel List
                    </Button>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedPersonnel.name}</h2>
                      <p className="text-gray-400">{selectedPersonnel.title} - {selectedPersonnel.department}</p>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(selectedPersonnel.status)} bg-opacity-20 border-0 text-white`}>
                      {selectedPersonnel.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-secondary border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Clearance Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-foreground">Level {selectedPersonnel.clearanceLevel}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-secondary border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Last Active</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium text-foreground">{selectedPersonnel.lastSeen}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-secondary border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Incidents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-foreground">{selectedPersonnel.incidents.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-foreground mb-2">Biography</h3>
                    <div className="bg-secondary p-4 rounded border border-gray-700">
                      <p className="text-gray-300">{selectedPersonnel.biography}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Notes</h3>
                    <div className="bg-secondary p-4 rounded border border-gray-700">
                      <p className="text-gray-300">{selectedPersonnel.notes}</p>
                    </div>
                  </div>
                  
                  {selectedPersonnel.incidents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-foreground mb-2">Related Incidents</h3>
                      <div className="bg-secondary rounded border border-gray-700">
                        <div className="divide-y divide-gray-700">
                          {selectedPersonnel.incidents.map(incidentId => (
                            <div key={incidentId} className="p-4 flex items-center justify-between">
                              <div>
                                <p className="text-foreground font-medium">Incident #{incidentId}</p>
                                <p className="text-sm text-gray-400">Details classified</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-accent">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}