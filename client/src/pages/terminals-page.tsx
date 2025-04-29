import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Layers, Lock, AlertCircle, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InGameLoginModal } from "@/components/modal/InGameLoginModal";
import { useQuery } from "@tanstack/react-query";

// Terminal data types
interface TerminalCommand {
  command: string;
  response: string;
  timestamp: Date;
  isError?: boolean;
}

interface Terminal {
  id: number;
  name: string;
  location: string;
  type: "mainframe" | "research" | "security" | "medical" | "maintenance";
  status: "online" | "offline" | "locked" | "restricted";
  securityLevel: number;
  description: string;
}

export default function TerminalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTerminal, setActiveTerminal] = useState<Terminal | null>(null);
  const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [showInGameLoginModal, setShowInGameLoginModal] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Simulate fetching terminal data
  const { data: terminals = [] } = useQuery<Terminal[]>({
    queryKey: ["/api/terminals"],
    queryFn: async () => {
      // Mock data
      const mockData: Terminal[] = [
        {
          id: 1,
          name: "SCP-NET-01",
          location: "Central Command",
          type: "mainframe",
          status: "online",
          securityLevel: 1,
          description: "Primary access terminal for general facility information."
        },
        {
          id: 2,
          name: "RES-TERM-42",
          location: "Research Wing B",
          type: "research",
          status: "restricted",
          securityLevel: 2,
          description: "Terminal connected to the research database for Sector B."
        },
        {
          id: 3,
          name: "SEC-TERM-15",
          location: "Security Office",
          type: "security",
          status: "locked",
          securityLevel: 3,
          description: "Security operations terminal with access to surveillance systems."
        },
        {
          id: 4,
          name: "MED-TERM-08",
          location: "Medical Bay",
          type: "medical",
          status: "online",
          securityLevel: 2,
          description: "Terminal for accessing patient records and medical research data."
        },
        {
          id: 5,
          name: "MAINT-03",
          location: "Maintenance Level",
          type: "maintenance",
          status: "offline",
          securityLevel: 1,
          description: "Facility maintenance and diagnostics terminal. Currently undergoing repairs."
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return mockData;
    }
  });
  
  // Focus on input when terminal changes
  useEffect(() => {
    if (activeTerminal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTerminal]);
  
  // Scroll to bottom of terminal output when command history updates
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  // Initialize terminal with welcome message
  useEffect(() => {
    if (activeTerminal && commandHistory.length === 0) {
      const welcomeMessage: TerminalCommand = {
        command: "system",
        response: `Connection established to ${activeTerminal.name}\nType 'help' for available commands.`,
        timestamp: new Date()
      };
      setCommandHistory([welcomeMessage]);
    }
  }, [activeTerminal, commandHistory.length]);
  
  // Process terminal commands
  const handleCommand = () => {
    if (!currentCommand.trim() || !activeTerminal) return;
    
    const newCommand: TerminalCommand = {
      command: currentCommand,
      response: "",
      timestamp: new Date()
    };
    
    // Process command
    const cmd = currentCommand.toLowerCase().trim();
    
    if (cmd === "help") {
      newCommand.response = "Available commands:\n" +
        "- help: Display this help message\n" +
        "- info: Display terminal information\n" +
        "- status: Check system status\n" +
        "- ls: List available files\n" +
        "- cat [filename]: View file content\n" +
        "- clear: Clear terminal screen\n" +
        "- exit: Close terminal session";
    } 
    else if (cmd === "info") {
      newCommand.response = `Terminal: ${activeTerminal.name}\n` +
        `Location: ${activeTerminal.location}\n` +
        `Type: ${activeTerminal.type}\n` +
        `Status: ${activeTerminal.status}\n` +
        `Security Level: ${activeTerminal.securityLevel}`;
    }
    else if (cmd === "status") {
      newCommand.response = "SYSTEM STATUS\n" +
        "================\n" +
        `Power: ONLINE\n` +
        `Network: CONNECTED\n` +
        `Security Protocols: ACTIVE\n` +
        `Backup Systems: STANDBY\n` +
        `Last Maintenance: 2025-04-15`;
    }
    else if (cmd === "ls") {
      if (activeTerminal.securityLevel > 1) {
        newCommand.response = "ACCESS DENIED: Insufficient security clearance.";
        newCommand.isError = true;
      } else {
        newCommand.response = "Available files:\n" +
          "- readme.txt\n" +
          "- facility_map.dat\n" +
          "- maintenance_logs.txt\n" +
          "- security_protocol.pdf [LOCKED]";
      }
    }
    else if (cmd.startsWith("cat ")) {
      const file = cmd.substring(4).trim();
      
      if (file === "readme.txt") {
        newCommand.response = "WELCOME TO SCP FACILITY TERMINAL SYSTEM\n\n" +
          "This terminal provides access to facility resources based on your security clearance level.\n" +
          "Unauthorized access attempts will be logged and reported.\n\n" +
          "For assistance, please contact your supervisor or the IT department.";
      }
      else if (file === "facility_map.dat") {
        newCommand.response = "ERROR: Binary file cannot be displayed. Use the MAP command to visualize.";
        newCommand.isError = true;
      }
      else if (file === "maintenance_logs.txt") {
        newCommand.response = "Maintenance Log - Recent Entries\n\n" +
          "2025-04-15: Routine system diagnostics performed.\n" +
          "2025-04-10: Network connectivity issues in Sector C resolved.\n" +
          "2025-04-03: Replaced faulty power supply in Server Room B.\n" +
          "2025-03-28: Security camera #47 repaired.\n" +
          "2025-03-25: [REDACTED] containment protocols updated.";
      }
      else {
        newCommand.response = `File not found: ${file}`;
        newCommand.isError = true;
      }
    }
    else if (cmd === "clear") {
      setCommandHistory([]);
      setCurrentCommand("");
      return;
    }
    else if (cmd === "exit") {
      setActiveTerminal(null);
      setCommandHistory([]);
      setCurrentCommand("");
      return;
    }
    else {
      newCommand.response = `Command not recognized: ${currentCommand}`;
      newCommand.isError = true;
    }
    
    setCommandHistory(prev => [...prev, newCommand]);
    setCurrentCommand("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand();
    }
  };
  
  const getStatusColor = (status: Terminal["status"]) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-red-500";
      case "locked": return "bg-yellow-500";
      case "restricted": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };
  
  const getTypeIcon = (type: Terminal["type"]) => {
    switch (type) {
      case "mainframe": return <Server className="h-5 w-5" />;
      case "research": return <Layers className="h-5 w-5" />;
      case "security": return <Lock className="h-5 w-5" />;
      case "medical": return <AlertCircle className="h-5 w-5" />;
      case "maintenance": return <TerminalIcon className="h-5 w-5" />;
      default: return <TerminalIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Terminal Network</h1>
          <p className="text-gray-400">Access facility terminals and retrieve information</p>
        </div>
        
        {!activeTerminal ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {terminals.map(terminal => (
              <Card 
                key={terminal.id} 
                className="bg-primary border-gray-800 hover:bg-primary/70 transition-colors cursor-pointer"
                onClick={() => {
                  if (terminal.securityLevel > 1) {
                    toast({
                      title: "Access Denied",
                      description: "Insufficient security clearance. Try finding a higher level credential.",
                      variant: "destructive",
                    });
                    setShowInGameLoginModal(true);
                  } else {
                    setActiveTerminal(terminal);
                  }
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-foreground">{terminal.name}</CardTitle>
                    <div className={`w-3 h-3 ${getStatusColor(terminal.status)} rounded-full`}></div>
                  </div>
                  <CardDescription>{terminal.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2 text-sm text-gray-400">
                    <div className="mr-2 text-gray-500">
                      {getTypeIcon(terminal.type)}
                    </div>
                    <span className="capitalize">{terminal.type}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      Level {terminal.securityLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{terminal.description}</p>
                </CardContent>
                <CardFooter className="pt-1">
                  <div className="w-full flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        terminal.status === 'online' ? 'text-green-400 border-green-800' : 
                        terminal.status === 'offline' ? 'text-red-400 border-red-800' :
                        terminal.status === 'locked' ? 'text-yellow-400 border-yellow-800' : 
                        'text-blue-400 border-blue-800'
                      }`}
                    >
                      {terminal.status}
                    </Badge>
                    <Button size="sm" variant="secondary">
                      Connect
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary rounded-lg border border-gray-800 p-4"
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${getStatusColor(activeTerminal.status)} rounded-full mr-3`}></div>
                <h2 className="text-lg font-semibold text-foreground">{activeTerminal.name}</h2>
                <Badge variant="outline" className="ml-3 text-xs">
                  {activeTerminal.location}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setActiveTerminal(null);
                  setCommandHistory([]);
                }}
              >
                Disconnect
              </Button>
            </div>
            
            <div 
              ref={terminalRef}
              className="font-mono text-sm text-green-400 bg-gray-900 rounded p-4 h-[60vh] overflow-y-auto mb-4"
            >
              {commandHistory.map((cmd, index) => (
                <div key={index} className="mb-3">
                  {cmd.command !== "system" && (
                    <div className="flex items-center mb-1">
                      <span className="text-blue-400 mr-1">guest@{activeTerminal.name.toLowerCase()}:~$</span>
                      <span className="text-gray-300">{cmd.command}</span>
                    </div>
                  )}
                  <div className={`whitespace-pre-wrap ${cmd.isError ? 'text-red-400' : 'text-gray-300'}`}>
                    {cmd.response}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center bg-gray-900 rounded p-2">
              <span className="text-blue-400 mr-2 select-none">guest@{activeTerminal.name.toLowerCase()}:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none font-mono text-sm"
                placeholder="Type command..."
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </div>
      
      {showInGameLoginModal && (
        <InGameLoginModal
          onClose={() => setShowInGameLoginModal(false)}
          onCredentialAdded={() => {
            toast({
              title: "New Credential Added",
              description: "You've discovered a new login credential!",
            });
            setShowInGameLoginModal(false);
          }}
        />
      )}
    </div>
  );
}