import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CredentialFoundModalProps {
  credential: {
    username: string;
    password: string;
    displayName: string;
    securityLevel: number;
    medicalLevel: number;
    adminLevel: number;
  };
  onClose: () => void;
  onCredentialAdded: () => void;
}

export function CredentialFoundModal({ credential, onClose, onCredentialAdded }: CredentialFoundModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [replacedCredential, setReplacedCredential] = useState<string | null>(null);

  const handleAddCredential = async () => {
    setIsLoading(true);
    try {
      // First create the credential if it doesn't exist
      await apiRequest("POST", "/api/credentials/create", credential);
      
      // Then verify/add it to the user
      const response = await apiRequest("POST", "/api/credentials/verify", {
        username: credential.username,
        password: credential.password,
      });
      
      const result = await response.json();
      
      if (result.obsoleteCredential) {
        setReplacedCredential(result.obsoleteCredential.displayName);
      }
      
      // Refresh credentials
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      
      toast({
        title: "New credential found",
        description: "The credential has been added to your profile.",
      });
      
      onCredentialAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding credential",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-primary w-full max-w-md p-6 rounded-lg border border-accent shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">NEW CREDENTIALS DISCOVERED</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="mb-6 bg-secondary p-4 rounded border border-gray-700 font-mono text-sm">
          <p className="text-green-500 mb-2">CREDENTIALS FOUND:</p>
          <div className="mb-3 p-2 bg-background rounded">
            <p className="text-sm text-foreground mb-1">
              <span className="text-gray-400">USERNAME:</span> {credential.displayName}
            </p>
            <p className="text-sm text-foreground mb-1">
              <span className="text-gray-400">PASSWORD:</span> ••••••••••
            </p>
            <div className="flex gap-2 mt-2">
              <span className="inline-block px-2 py-1 bg-blue-900 text-xs rounded text-white">
                SECURITY: LVL {credential.securityLevel}
              </span>
              <span className="inline-block px-2 py-1 bg-green-900 text-xs rounded text-white">
                MEDICAL: LVL {credential.medicalLevel}
              </span>
              <span className="inline-block px-2 py-1 bg-gray-700 text-xs rounded text-white">
                ADMIN: LVL {credential.adminLevel}
              </span>
            </div>
          </div>
          {replacedCredential && (
            <p className="text-yellow-500 text-sm">This credential replaces: {replacedCredential}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleAddCredential}
            disabled={isLoading}
            className="bg-accent hover:bg-red-900 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            ADD TO PROFILE
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
