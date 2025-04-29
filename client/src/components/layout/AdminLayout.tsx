import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, FileText, Terminal, MessageSquare, Trophy, 
  Settings, LogOut, Menu, X, Database, Home, FileCode
} from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigationItems = [
    { 
      label: "General", 
      items: [
        { name: "Dashboard", path: "/admin", icon: <Home className="h-4 w-4 mr-2" /> },
        { name: "Back to App", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
      ] 
    },
    { 
      label: "User Management", 
      items: [
        { name: "Users", path: "/admin/users", icon: <Users className="h-4 w-4 mr-2" /> }
      ] 
    },
    { 
      label: "Content Management", 
      items: [
        { name: "Documents", path: "/admin/documents", icon: <FileText className="h-4 w-4 mr-2" /> },
        { name: "Personnel", path: "/admin/personnel", icon: <Users className="h-4 w-4 mr-2" /> },
        { name: "Messages", path: "/admin/messages", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
        { name: "Terminals", path: "/admin/terminals", icon: <Terminal className="h-4 w-4 mr-2" /> },
      ] 
    },
    { 
      label: "Game Configuration", 
      items: [
        { name: "Achievements", path: "/admin/achievements", icon: <Trophy className="h-4 w-4 mr-2" /> },
        { name: "Credentials", path: "/admin/credentials", icon: <Database className="h-4 w-4 mr-2" /> },
        { name: "Story Editor", path: "/admin/story", icon: <FileCode className="h-4 w-4 mr-2" /> }
      ] 
    },
    { 
      label: "System", 
      items: [
        { name: "Settings", path: "/admin/settings", icon: <Settings className="h-4 w-4 mr-2" /> }
      ] 
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-primary border-b border-gray-800 p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center">
            <span className="text-accent font-bold text-xl mr-1">[</span>
            <span className="text-foreground font-bold text-xl">ADMIN</span>
            <span className="text-accent font-bold text-xl ml-1">]</span>
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block bg-primary border-r border-gray-800 w-full md:w-64 
        flex-shrink-0 ${sidebarOpen ? 'h-[calc(100vh-4rem)]' : 'h-0'} md:h-screen 
        fixed md:sticky top-16 md:top-0 z-30 overflow-y-auto
      `}>
        {/* Sidebar Header (Desktop) */}
        <div className="hidden md:flex items-center h-16 px-6 border-b border-gray-800">
          <Link to="/admin">
            <div className="flex items-center">
              <span className="text-accent font-bold text-xl mr-1">[</span>
              <span className="text-foreground font-bold text-xl">ADMIN</span>
              <span className="text-accent font-bold text-xl ml-1">]</span>
            </div>
          </Link>
        </div>
        
        {/* Sidebar Content */}
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-4">
            {navigationItems.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="text-xs uppercase text-gray-500 font-medium mb-2 px-2">{section.label}</h3>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <Link key={j} to={item.path}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          location === item.path 
                            ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                            : 'text-gray-400 hover:text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
                {i < navigationItems.length - 1 && <Separator className="my-4 bg-gray-800" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 sticky bottom-0 bg-primary">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}