import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Check if user has any credentials
  const { data: credentials = [] } = useQuery<any[]>({
    queryKey: ["/api/credentials"],
  });
  
  // Redirect to documents page after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/documents");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center mb-6">
              <span className="text-accent font-bold text-4xl mr-2">[</span>
              <span className="text-foreground font-bold text-4xl">REDACTED</span>
              <span className="text-accent font-bold text-4xl ml-2">]</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Welcome back, {user?.username}
            </h1>
            <p className="text-lg text-gray-400">
              Accessing secure document management system...
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-primary border border-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-foreground">System Status</h2>
              </div>
              
              <div className="bg-secondary p-4 rounded border border-gray-700 font-mono text-sm mb-6">
                <p className="text-green-500 mb-1">{'>'} CONNECTION SECURE</p>
                <p className="text-foreground mb-1">{'>'} USER AUTHENTICATED: {user?.username}</p>
                <p className="text-foreground mb-1">{'>'} CREDENTIALS AVAILABLE: {credentials.length}</p>
                <p className="text-yellow-500 mb-1">{'>'} REDIRECTING TO DOCUMENT SYSTEM...</p>
                <div className="w-full bg-gray-700 h-1 mt-3 overflow-hidden rounded-full">
                  <motion.div 
                    className="h-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5 }}
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setLocation("/documents")}
                  className="bg-accent hover:bg-red-900 text-white px-6 py-2 rounded transition-colors duration-200"
                >
                  Access Documents Now
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Security Notice</h3>
                <p className="text-sm text-gray-400">
                  All activities within this system are logged and monitored. Unauthorized access to 
                  restricted documents is a violation of facility protocols and may result in 
                  termination of access privileges.
                </p>
              </div>
              <div className="bg-primary border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Need Help?</h3>
                <p className="text-sm text-gray-400">
                  If you encounter any issues or require assistance accessing documents, please
                  contact your supervisor or the facility's information security department.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
