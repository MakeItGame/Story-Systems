import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, MailOpen, AlertTriangle, User, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

// Message types
type MessagePriority = "low" | "medium" | "high" | "urgent";
type MessageStatus = "unread" | "read" | "archived";

interface Message {
  id: number;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  priority: MessagePriority;
  status: MessageStatus;
  hasAttachment: boolean;
  securityLevel: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Simulate fetching messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      // Mock data
      const mockData: Message[] = [
        {
          id: 1,
          sender: "Director [REDACTED]",
          subject: "Weekly Security Protocol Update",
          content: `All personnel,

As part of our ongoing security measures, we've updated several protocols effective immediately:

1. Access to Sector-7 now requires Level 3 clearance or higher
2. All personnel must update their biometric data by the end of the week
3. New containment procedures for SCP-███ are available in Document #4173

Please ensure compliance with these updates. Non-compliance may result in restricted access or disciplinary action.

Regards,
Site Director`,
          timestamp: "2025-04-29T09:15:00",
          priority: "high",
          status: "unread",
          hasAttachment: true,
          securityLevel: 1
        },
        {
          id: 2,
          sender: "Medical Department",
          subject: "Mandatory Health Screenings",
          content: `This is a reminder that all personnel assigned to Research Wing B must report for mandatory health screenings by Friday.

These screenings are critical following the incident on April 15th. Any personnel who worked in Lab 19 during the exposure period must report immediately.

Medical Staff`,
          timestamp: "2025-04-28T15:42:00",
          priority: "medium",
          status: "unread",
          hasAttachment: false,
          securityLevel: 1
        },
        {
          id: 3,
          sender: "Security Officer ████",
          subject: "[CLASSIFIED] Security Breach Report",
          content: `This message contains classified information.

Your current security clearance is insufficient to view this content.

Please contact your supervisor if you believe you should have access to this information.`,
          timestamp: "2025-04-27T22:17:00",
          priority: "urgent",
          status: "unread",
          hasAttachment: true,
          securityLevel: 3
        },
        {
          id: 4,
          sender: "Maintenance Department",
          subject: "Scheduled System Maintenance",
          content: `Notice of Scheduled Maintenance:

The following systems will be offline for maintenance on April 30th from 02:00 to 04:00:

- Door access control systems (emergency overrides will remain functional)
- Non-essential power in Administrative Wing
- Network services in Sectors 2 through 5

Essential containment systems will not be affected.

Maintenance Team`,
          timestamp: "2025-04-26T11:03:00",
          priority: "low",
          status: "read",
          hasAttachment: false,
          securityLevel: 1
        },
        {
          id: 5,
          sender: "HR Department",
          subject: "Updated Employee Handbook",
          content: `All Personnel,

The employee handbook has been updated to reflect changes in emergency procedures and facility protocols.

Key changes include:
- Revised evacuation routes for Containment Sectors
- Updated communication protocols during containment breaches
- New procedures for reporting anomalous incidents

The updated handbook is available on the intranet. All personnel must acknowledge receipt by May 5th.

Human Resources`,
          timestamp: "2025-04-25T14:30:00",
          priority: "medium",
          status: "read",
          hasAttachment: true,
          securityLevel: 1
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
      return mockData;
    }
  });
  
  // Update message status to read when selected
  useEffect(() => {
    if (selectedMessage && selectedMessage.status === "unread") {
      // In a real app, this would make an API call to update the message status
      // For now, we'll just simulate it client-side
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, status: "read" as const } : msg
      );
      // This won't actually work without proper invalidation/state management
      // It's just for demonstration
    }
  }, [selectedMessage]);
  
  // Filter messages based on active tab and search term
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === "" || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === "inbox") return message.status !== "archived" && matchesSearch;
    if (activeTab === "unread") return message.status === "unread" && matchesSearch;
    if (activeTab === "archived") return message.status === "archived" && matchesSearch;
    
    return matchesSearch;
  });
  
  const getPriorityColor = (priority: MessagePriority) => {
    switch (priority) {
      case "low": return "bg-green-500";
      case "medium": return "bg-blue-500";
      case "high": return "bg-yellow-500";
      case "urgent": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy HH:mm");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-gray-400">Internal communication system</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Message list */}
          <div className="md:col-span-1 bg-primary rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <Input 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-secondary border-gray-700"
              />
            </div>
            
            <div className="p-2 border-b border-gray-800">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-secondary grid grid-cols-3">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="divide-y divide-gray-800 max-h-[65vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No messages found
                </div>
              ) : (
                filteredMessages.map(message => (
                  <div 
                    key={message.id}
                    className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      selectedMessage?.id === message.id ? 'bg-secondary' : ''
                    } ${message.status === 'unread' ? 'border-l-4 border-l-accent' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center">
                        {message.status === "unread" ? (
                          <MailOpen className="h-4 w-4 text-gray-400 mr-2" />
                        ) : (
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${message.status === 'unread' ? 'text-foreground' : 'text-gray-400'}`}>
                          {message.sender}
                        </span>
                      </div>
                      <div className={`w-2 h-2 ${getPriorityColor(message.priority)} rounded-full mt-1`}></div>
                    </div>
                    <h3 className={`text-sm ${message.status === 'unread' ? 'font-medium text-foreground' : 'text-gray-400'}`}>
                      {message.subject}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                      {message.hasAttachment && (
                        <FileText className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Right panel - Message content */}
          <div className="md:col-span-2">
            {!selectedMessage ? (
              <div className="bg-primary rounded-lg border border-gray-800 h-full flex flex-col items-center justify-center p-8">
                <div className="text-center">
                  <Mail className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">No Message Selected</h3>
                  <p className="text-gray-400 max-w-md">
                    Select a message from the list to view its contents.
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-primary rounded-lg border border-gray-800 h-full relative"
              >
                {/* Access denied overlay for insufficient clearance */}
                {selectedMessage.securityLevel > 1 && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center z-10 p-6">
                    <AlertTriangle className="h-20 w-20 text-accent mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">CLASSIFIED CONTENT</h2>
                    <p className="text-gray-400 text-center mb-4">
                      Your current security clearance is insufficient to view this message.
                    </p>
                    <div className="bg-secondary/50 p-4 rounded border border-gray-700 font-mono text-sm mb-4 w-full max-w-md">
                      <p className="text-accent mb-1">{'>'} ERROR: CLEARANCE LEVEL MISMATCH</p>
                      <p className="text-yellow-500 mb-1">{'>'} REQUIRED: LEVEL {selectedMessage.securityLevel}</p>
                      <p className="text-foreground">{'>'} CONTACT SUPERVISOR FOR ACCESS</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="bg-secondary hover:bg-gray-800 text-accent"
                      onClick={() => setSelectedMessage(null)}
                    >
                      Return to Messages
                    </Button>
                  </div>
                )}
                
                <div className="border-b border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">{selectedMessage.subject}</h2>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        selectedMessage.priority === 'low' ? 'text-green-400 border-green-800' : 
                        selectedMessage.priority === 'medium' ? 'text-blue-400 border-blue-800' :
                        selectedMessage.priority === 'high' ? 'text-yellow-400 border-yellow-800' : 
                        'text-red-400 border-red-800'
                      }`}
                    >
                      {selectedMessage.priority} priority
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400 mb-1">
                    <User className="h-4 w-4 mr-2" />
                    <span>From: {selectedMessage.sender}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Received: {formatDate(selectedMessage.timestamp)}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-secondary p-6 rounded border border-gray-700 whitespace-pre-wrap text-gray-300">
                    {selectedMessage.content}
                  </div>
                  
                  {selectedMessage.hasAttachment && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-foreground mb-2">Attachments</h3>
                      <div className="bg-secondary rounded border border-gray-700 p-3 flex items-center">
                        <FileText className="h-5 w-5 text-accent mr-2" />
                        <div>
                          <span className="text-sm text-foreground block">document-{selectedMessage.id}.pdf</span>
                          <span className="text-xs text-gray-500">215 KB</span>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-800 p-4 flex justify-between">
                  <Button 
                    variant="outline"
                    className="bg-secondary hover:bg-gray-800"
                  >
                    Reply
                  </Button>
                  
                  <div>
                    <Button 
                      variant="outline"
                      className="bg-secondary hover:bg-gray-800 mr-2"
                    >
                      Archive
                    </Button>
                    <Button 
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}