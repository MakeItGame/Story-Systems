import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AuthForm />
        </motion.div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-primary border-t md:border-t-0 md:border-l border-gray-800 flex flex-col justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">[REDACTED] Facility Access</h2>
              <p className="text-gray-400">Secure document management system</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-foreground mb-4">Document-Based Gameplay</h3>
            <p className="text-gray-400 mb-4">
              Explore a vast collection of classified documents with SCP-like aesthetics. Uncover secrets, discover new credentials, and gain access to increasingly sensitive information.
            </p>
            <div className="bg-secondary p-4 rounded border border-gray-700 text-sm">
              <p className="text-yellow-500 mb-2">{'>'} WARNING: UNAUTHORIZED ACCESS WILL BE PROSECUTED</p>
              <p className="text-foreground mb-2">{'>'} All activities are logged and monitored</p>
              <p className="text-foreground">{'>'} Clearance levels are strictly enforced</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-3">Multi-Level Permission System</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-900/30 p-3 rounded border border-blue-800">
                <h4 className="font-medium text-blue-400 mb-1">Security</h4>
                <p className="text-xs text-gray-400">Access to containment protocols and security measures</p>
              </div>
              <div className="bg-green-900/30 p-3 rounded border border-green-800">
                <h4 className="font-medium text-green-400 mb-1">Medical</h4>
                <p className="text-xs text-gray-400">Access to patient records and medical research</p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <h4 className="font-medium text-gray-300 mb-1">Admin</h4>
                <p className="text-xs text-gray-400">Access to facility management and personnel files</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
