import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { CredentialFoundModal } from "@/components/modal/CredentialFoundModal";
import { InGameLoginModal } from "@/components/modal/InGameLoginModal";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type DocumentViewerProps = {
  documentId: number | null;
  onCredentialAdded: () => void;
};

interface AccessDeniedError {
  message: string;
  accessDenied: boolean;
  requiredLevels: {
    security: number | null;
    medical: number | null;
    admin: number | null;
  };
  currentLevels?: {
    security: number;
    medical: number;
    admin: number;
  };
}

export default function DocumentViewer({ documentId, onCredentialAdded }: DocumentViewerProps) {
  const [showInGameLoginModal, setShowInGameLoginModal] = useState(false);
  const [showCredentialFoundModal, setShowCredentialFoundModal] = useState(false);
  const [foundCredential, setFoundCredential] = useState<any>(null);
  const { user } = useAuth();

  // Fetch the selected document
  const { 
    data: document, 
    isLoading, 
    error 
  } = useQuery<Document, { status: number; data: AccessDeniedError }>({
    queryKey: ['/api/documents', documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("No document ID provided");
      
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw { 
          status: response.status, 
          data: errorData 
        };
      }
      return response.json();
    },
    enabled: !!documentId,
    retry: false, // Don't retry on permission errors
  });

  // Check if there's a permission error
  const accessError = error?.status === 403 ? error.data : null;

  // Removed related documents functionality as requested

  // Simulate finding a credential when clicking on certain document elements
  const handleDiscoverCredential = () => {
    setFoundCredential({
      username: "medical_assistant_03",
      displayName: "medical_assistant_03",
      securityLevel: 1,
      medicalLevel: 3,
      adminLevel: 0,
      password: "secure_med_03",
    });
    setShowCredentialFoundModal(true);
  };

  if (!documentId) {
    return (
      <motion.div
        className="flex-1 flex items-center justify-center bg-background p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center max-w-md">
          <div className="border-2 border-dashed border-gray-800 rounded-lg p-10 bg-secondary/30">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-gray-600 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">[DOCUMENT VIEWER]</h3>
            <p className="text-gray-500 text-sm mb-6">Select a document from the sidebar to view its contents.</p>
            <div className="text-xs text-left bg-gray-900/60 font-mono p-3 rounded text-gray-400 mb-6">
              <p>// System Note</p>
              <p>// Some documents require higher security clearance</p>
              <p>// Access terminals to find additional credentials</p>
            </div>
            <div className="flex space-x-1 justify-center">
              <span className="inline-block px-1.5 py-0.5 bg-blue-900 text-xs rounded text-white">
                Security Level
              </span>
              <span className="inline-block px-1.5 py-0.5 bg-green-900 text-xs rounded text-white">
                Medical Level
              </span>
              <span className="inline-block px-1.5 py-0.5 bg-gray-700 text-xs rounded text-white">
                Admin Level
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show access denied errors
  if (accessError) {
    return (
      <motion.div 
        className="flex-1 overflow-auto document-fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-8 text-center flex flex-col items-center justify-center">
            <Lock className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-6 max-w-md">{accessError.message}</p>
            
            <div className="bg-background/50 border border-gray-800 rounded-lg p-6 mb-4 w-full max-w-md">
              <h3 className="text-sm font-medium text-foreground mb-4 border-b border-gray-800 pb-2">REQUIRED CLEARANCE</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {accessError.requiredLevels.security && accessError.requiredLevels.security > 0 && (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Security: Level {accessError.requiredLevels.security}</span>
                  </div>
                )}
                
                {accessError.requiredLevels.medical && accessError.requiredLevels.medical > 0 && (
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h-1V6c0-2.21-1.79-4-4-4h-2C8.79 2 7 3.79 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H8.9V6z"/>
                      <path d="M13 15.5V17m-2-4.5v4" />
                    </svg>
                    <span className="text-sm">Medical: Level {accessError.requiredLevels.medical}</span>
                  </div>
                )}
                
                {accessError.requiredLevels.admin && accessError.requiredLevels.admin > 0 && (
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-sm">Admin: Level {accessError.requiredLevels.admin}</span>
                  </div>
                )}
              </div>
              
              {accessError.currentLevels && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-foreground mb-4 border-b border-gray-800 pb-2">YOUR CURRENT CLEARANCE</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Shield className={`h-4 w-4 ${(accessError.currentLevels.security || 0) >= (accessError.requiredLevels.security || 0) ? 'text-blue-500' : 'text-gray-600'}`} />
                      <span className="text-sm">Security: Level {accessError.currentLevels.security || 0}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${(accessError.currentLevels.medical || 0) >= (accessError.requiredLevels.medical || 0) ? 'text-green-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h-1V6c0-2.21-1.79-4-4-4h-2C8.79 2 7 3.79 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H8.9V6z"/>
                        <path d="M13 15.5V17m-2-4.5v4" />
                      </svg>
                      <span className="text-sm">Medical: Level {accessError.currentLevels.medical || 0}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${(accessError.currentLevels.admin || 0) >= (accessError.requiredLevels.admin || 0) ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="text-sm">Admin: Level {accessError.currentLevels.admin || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mb-6">
              You need higher clearance to access this document. <br />
              Search for additional credentials throughout the system to gain access.
            </p>
            
            <Button
              onClick={() => setShowInGameLoginModal(true)}
              variant="outline"
              className="border-red-900/50 hover:bg-red-900/20 hover:border-red-900"
            >
              Try Another Credential
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Skeleton className="h-5 w-20 bg-gray-700 mr-2" />
                  <Skeleton className="h-5 w-20 bg-gray-700" />
                </div>
                <Skeleton className="h-8 w-64 bg-gray-700 mb-2" />
                <Skeleton className="h-4 w-48 bg-gray-700" />
              </div>
            </div>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-6 mb-6">
            <Skeleton className="h-6 w-full bg-gray-700 mb-4" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-3/4 bg-gray-700 mb-6" />
            
            <Skeleton className="h-6 w-48 bg-gray-700 mb-4" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
          </div>
        </div>
      </div>
    );
  }

  // Make sure document exists
  if (!document) {
    return (
      <motion.div
        className="flex-1 flex items-center justify-center bg-background p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center max-w-md">
          <div className="border border-red-900/50 rounded-lg p-10 bg-red-950/20">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-red-700 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-500 mb-2">[ERROR: DOCUMENT NOT FOUND]</h3>
            <p className="text-gray-400 text-sm mb-6">This document appears to be missing from the database.</p>
            <div className="text-xs text-left bg-gray-900/70 font-mono p-3 rounded text-red-400 mb-4">
              <p>// System Error: 0x7D94</p>
              <p>// Document reference invalid or deleted</p>
              <p>// Contact system administrator for assistance</p>
            </div>
            <Button
              variant="outline"
              className="border-red-900/50 hover:bg-red-900/20 hover:border-red-900 text-sm"
              onClick={() => window.history.back()}
            >
              Return to previous page
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex-1 overflow-auto document-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Document Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                {(document.medicalLevel || 0) > 0 && (
                  <span className="text-xs bg-green-900 text-white px-2 py-0.5 rounded-sm mr-2">MEDICAL</span>
                )}
                {(document.securityLevel || 0) > 0 && (
                  <span className="text-xs bg-blue-900 text-white px-2 py-0.5 rounded-sm mr-2">SECURITY</span>
                )}
                {(document.adminLevel || 0) > 0 && (
                  <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-sm mr-2">ADMIN</span>
                )}
                <span className="text-xs bg-yellow-800 text-white px-2 py-0.5 rounded-sm">SENSITIVE</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{document.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {document.documentCode} • Updated {new Date(document.updatedAt || document.createdAt).toLocaleDateString()} • Rev. {document.revisionNumber}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-foreground hover:bg-gray-800 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-foreground hover:bg-gray-800 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-foreground hover:bg-gray-800 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-secondary rounded border border-gray-700 shadow-lg z-10">
                  <DropdownMenuItem className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Download</DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Share</DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Revisions</DropdownMenuItem>
                  <DropdownMenuSeparator className="border-gray-700" />
                  <DropdownMenuItem className="px-4 py-2 text-red-400 hover:bg-gray-700 cursor-pointer">Report Issue</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">ACCESS LEVEL:</span>
              <div className="flex space-x-1">
                {document.securityLevel && document.securityLevel > 0 && (
                  <span className="permission-badge inline-block px-2 py-1 bg-blue-900 text-xs rounded text-white">
                    SECURITY: LVL {document.securityLevel}+
                  </span>
                )}
                {document.medicalLevel && document.medicalLevel > 0 && (
                  <span className="permission-badge inline-block px-2 py-1 bg-green-900 text-xs rounded text-white">
                    MEDICAL: LVL {document.medicalLevel}+
                  </span>
                )}
                {document.adminLevel && document.adminLevel > 0 && (
                  <span className="permission-badge inline-block px-2 py-1 bg-gray-700 text-xs rounded text-white">
                    ADMIN: LVL {document.adminLevel}+
                  </span>
                )}
              </div>
            </div>
            <div className="h-4 border-l border-gray-700"></div>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">AUTHOR:</span>
              <span className="text-sm">{document.author || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        {/* Document Content */}
        <div className="bg-primary border border-gray-800 rounded-lg p-6 mb-6 font-sans">
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
            <div className="mb-6 pb-4 border-b border-gray-800">
              <p className="text-sm text-yellow-500 mb-2">NOTICE: This document contains sensitive information. Unauthorized access or distribution is strictly prohibited.</p>
            </div>
            
            {/* Render document content - in a real application, this would be processed markdown/html */}
            <div dangerouslySetInnerHTML={{ __html: document.content.replace(
              /\[DATA EXPUNGED\]/g, 
              '<span class="bg-gray-800 px-1">[DATA EXPUNGED]</span>'
            ).replace(
              /\[(REDACTED)\]/g, 
              '<span class="bg-gray-800 px-1">[REDACTED]</span>'
            ) }} />
            
            {/* Interactive elements that could trigger credential discovery */}
            {document.documentCode === "DOC-4382" && (
              <div className="bg-secondary border-l-4 border-yellow-600 border-t border-r border-b border-gray-700 rounded-lg p-4 mb-6 mt-6">
                <h4 className="text-sm font-bold mb-2 text-yellow-500">Additional Notes</h4>
                <p className="text-sm">This is the third incident of this nature in the past ██ months. Request for revised safety protocols has been submitted. All personnel working with SCP-███ should review updated handling procedures document DOC-████.</p>
                <p className="text-sm mt-2">
                  A terminal has been found in Lab-19 with potential access to additional information regarding SCP-███. Credentials required. {" "}
                  <Button 
                    variant="link" 
                    onClick={() => setShowInGameLoginModal(true)}
                    className="text-yellow-500 cursor-pointer underline p-0 h-auto"
                  >
                    Attempt access
                  </Button>
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Documents section removed as requested */}
      </div>

      {/* Modals */}
      {showInGameLoginModal && (
        <InGameLoginModal 
          onClose={() => setShowInGameLoginModal(false)} 
          onCredentialAdded={() => {
            onCredentialAdded();
            setShowInGameLoginModal(false);
          }}
        />
      )}
      
      {showCredentialFoundModal && foundCredential && (
        <CredentialFoundModal 
          credential={foundCredential}
          onClose={() => setShowCredentialFoundModal(false)}
          onCredentialAdded={() => {
            onCredentialAdded();
            setShowCredentialFoundModal(false);
          }}
        />
      )}
    </motion.div>
  );
}
