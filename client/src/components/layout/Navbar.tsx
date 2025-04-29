import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { InGameLoginModal } from "@/components/modal/InGameLoginModal";
import { Credential } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showInGameLoginModal, setShowInGameLoginModal] = useState(false);
  const [showCredentialChangedNotice, setShowCredentialChangedNotice] = useState(false);
  
  // Fetch user credentials
  const { data: credentials = [], refetch: refetchCredentials } = useQuery<(Credential & { isSelected: boolean })[]>({
    queryKey: ["/api/credentials"],
    enabled: !!user
  });

  // Get the currently selected credential
  const selectedCredential = credentials.find(cred => cred.isSelected);

  // Handle credential selection
  const handleSelectCredential = async (credentialId: number) => {
    try {
      // Get the current credential info before switching
      const targetCredential = credentials.find(cred => cred.id === credentialId);
      if (!targetCredential) return;
      
      await apiRequest("POST", `/api/credentials/select/${credentialId}`);
      refetchCredentials();
      
      // Show the credential changed notice
      setShowCredentialChangedNotice(true);
      
      // Hide notice after 3 seconds
      setTimeout(() => {
        setShowCredentialChangedNotice(false);
      }, 3000);
      
      toast({
        title: "Credential switched",
        description: `You are now logged in as ${targetCredential.displayName}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to switch credential",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-primary border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-accent font-bold text-xl mr-1">[</span>
                <span className="text-foreground font-bold text-xl">REDACTED</span>
                <span className="text-accent font-bold text-xl ml-1">]</span>
                <span className="text-gray-500 text-xs ml-2">v0.9.3</span>
              </div>
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              {/* Current Login Display */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center px-3 py-2 bg-secondary hover:bg-gray-800 rounded border border-gray-700 transition-colors duration-200 h-auto">
                      <div className="mr-2">
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-sm font-medium">
                            {selectedCredential?.displayName || "visitor_temporary"}
                          </span>
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <span className="inline-block px-1.5 py-0.5 bg-blue-900 text-xs rounded text-white">
                            S:{selectedCredential?.securityLevel || 0}
                          </span>
                          <span className="inline-block px-1.5 py-0.5 bg-green-900 text-xs rounded text-white">
                            M:{selectedCredential?.medicalLevel || 0}
                          </span>
                          <span className="inline-block px-1.5 py-0.5 bg-gray-700 text-xs rounded text-white">
                            A:{selectedCredential?.adminLevel || 0}
                          </span>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-secondary rounded border border-gray-700 shadow-lg animate-slide-in-top">
                    <div className="py-2 px-3 border-b border-gray-700">
                      <p className="text-xs text-gray-400">AVAILABLE CREDENTIALS</p>
                    </div>
                    <div className="py-2 max-h-60 overflow-y-auto">
                      {credentials.map(cred => (
                        <DropdownMenuItem 
                          key={cred.id}
                          onClick={() => handleSelectCredential(cred.id)}
                          className="block px-4 py-2 hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 ${cred.isSelected ? 'bg-green-500' : 'bg-gray-500'} rounded-full mr-2`}></span>
                            <span className="text-sm font-medium">{cred.displayName}</span>
                          </div>
                          <div className="flex space-x-1 mt-1">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-900 text-xs rounded text-white">
                              S:{cred.securityLevel || 0}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 bg-green-900 text-xs rounded text-white">
                              M:{cred.medicalLevel || 0}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 bg-gray-700 text-xs rounded text-white">
                              A:{cred.adminLevel || 0}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="border-t border-gray-700" />
                    <div className="py-2 px-3">
                      <Button 
                        variant="link" 
                        onClick={() => setShowInGameLoginModal(true)}
                        className="w-full text-center text-xs text-accent hover:text-red-400 transition-colors duration-150"
                      >
                        + ADD NEW CREDENTIAL
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="h-8 border-l border-gray-700"></div>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-3 py-2 hover:bg-gray-800 rounded transition-colors duration-200">
                    <span className="text-sm font-medium mr-2">{user.username}</span>
                    <i className="ri-user-line"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-secondary rounded border border-gray-700 shadow-lg animate-slide-in-top">
                  <Link to="/profile">
                    <DropdownMenuItem className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/admin">
                    <DropdownMenuItem className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">
                      Admin Panel
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">
                    Help
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-gray-700" />
                  <DropdownMenuItem 
                    className="block px-4 py-2 text-sm text-accent hover:bg-gray-700 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        {user && (
          <nav className="py-2">
            <ul className="flex space-x-6 text-sm">
              <li>
                <Link 
                  to="/documents" 
                  className={`${location === '/documents' ? 'text-foreground border-accent' : 'text-gray-400 border-transparent hover:border-gray-700'} hover:text-foreground pb-2 border-b-2 transition-colors duration-200 font-medium block`}
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link 
                  to="/personnel" 
                  className={`${location === '/personnel' ? 'text-foreground border-accent' : 'text-gray-400 border-transparent hover:border-gray-700'} hover:text-foreground pb-2 border-b-2 transition-colors duration-200 block`}
                >
                  Personnel
                </Link>
              </li>
              <li>
                <Link 
                  to="/terminals" 
                  className={`${location === '/terminals' ? 'text-foreground border-accent' : 'text-gray-400 border-transparent hover:border-gray-700'} hover:text-foreground pb-2 border-b-2 transition-colors duration-200 block`}
                >
                  Terminals
                </Link>
              </li>
              <li>
                <Link 
                  to="/messages" 
                  className={`${location === '/messages' ? 'text-foreground border-accent' : 'text-gray-400 border-transparent hover:border-gray-700'} hover:text-foreground pb-2 border-b-2 transition-colors duration-200 block`}
                >
                  Messages
                </Link>
              </li>
              <li>
                <Link 
                  to="/progress" 
                  className={`${location === '/progress' ? 'text-foreground border-accent' : 'text-gray-400 border-transparent hover:border-gray-700'} hover:text-foreground pb-2 border-b-2 transition-colors duration-200 block`}
                >
                  Progress
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <AnimatePresence>
        {showInGameLoginModal && (
          <InGameLoginModal 
            onClose={() => setShowInGameLoginModal(false)} 
            onCredentialAdded={() => {
              refetchCredentials();
              setShowInGameLoginModal(false);
              setShowCredentialChangedNotice(true);
              setTimeout(() => setShowCredentialChangedNotice(false), 3000);
            }}
          />
        )}
        
        {/* Credential Change Notification */}
        {showCredentialChangedNotice && selectedCredential && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm border border-accent rounded-lg shadow-lg px-6 py-4 z-50 min-w-[300px]"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-accent/20 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Access Level Changed</p>
                <p className="text-gray-300 text-sm">Now using: {selectedCredential.displayName}</p>
                <div className="flex space-x-2 mt-1">
                  <span className="inline-block px-1.5 py-0.5 bg-blue-900 text-xs rounded text-white">
                    S:{selectedCredential.securityLevel || 0}
                  </span>
                  <span className="inline-block px-1.5 py-0.5 bg-green-900 text-xs rounded text-white">
                    M:{selectedCredential.medicalLevel || 0}
                  </span>
                  <span className="inline-block px-1.5 py-0.5 bg-gray-700 text-xs rounded text-white">
                    A:{selectedCredential.adminLevel || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
