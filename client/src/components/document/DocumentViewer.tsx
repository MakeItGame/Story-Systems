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

type DocumentViewerProps = {
  documentId: number | null;
  onCredentialAdded: () => void;
};

export default function DocumentViewer({ documentId, onCredentialAdded }: DocumentViewerProps) {
  const [showInGameLoginModal, setShowInGameLoginModal] = useState(false);
  const [showCredentialFoundModal, setShowCredentialFoundModal] = useState(false);
  const [foundCredential, setFoundCredential] = useState<any>(null);

  // Fetch the selected document
  const { data: document, isLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId,
  });

  // Fetch related documents
  const { data: relatedDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    select: (docs) => 
      docs.filter(doc => document?.relatedDocuments?.includes(doc.id)),
    enabled: !!document?.relatedDocuments?.length,
  });

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
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">No Document Selected</h3>
          <p className="text-muted-foreground text-sm">Select a document from the sidebar to view its contents.</p>
        </div>
      </div>
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
                {document.medicalLevel > 0 && (
                  <span className="text-xs bg-green-900 text-white px-2 py-0.5 rounded-sm mr-2">MEDICAL</span>
                )}
                {document.securityLevel > 0 && (
                  <span className="text-xs bg-blue-900 text-white px-2 py-0.5 rounded-sm mr-2">SECURITY</span>
                )}
                {document.adminLevel > 0 && (
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
                {document.securityLevel > 0 && (
                  <span className="permission-badge inline-block px-2 py-1 bg-blue-900 text-xs rounded text-white">
                    SECURITY: LVL {document.securityLevel}+
                  </span>
                )}
                {document.medicalLevel > 0 && (
                  <span className="permission-badge inline-block px-2 py-1 bg-green-900 text-xs rounded text-white">
                    MEDICAL: LVL {document.medicalLevel}+
                  </span>
                )}
                {document.adminLevel > 0 && (
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
        
        {/* Related Documents */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 mb-3">RELATED DOCUMENTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedDocuments?.map(doc => (
              <a 
                key={doc.id}
                href="#" 
                className="block p-3 bg-primary border border-gray-800 rounded-lg hover:border-gray-700 transition-colors duration-200"
              >
                <p className="text-sm font-medium mb-1">{doc.title}</p>
                <p className="text-xs text-gray-500">
                  {doc.documentCode} • 
                  {doc.securityLevel > 0 && ` SECURITY LVL ${doc.securityLevel}`}
                  {doc.medicalLevel > 0 && ` MEDICAL LVL ${doc.medicalLevel}`}
                  {doc.adminLevel > 0 && ` ADMIN LVL ${doc.adminLevel}`}
                </p>
              </a>
            ))}
            
            {/* Credential discovery opportunity */}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleDiscoverCredential();
              }}
              className="block p-3 bg-primary border border-gray-800 rounded-lg hover:border-accent transition-colors duration-200"
            >
              <p className="text-sm font-medium mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Patient Recovery Analysis</span>
              </p>
              <p className="text-xs text-gray-500">DOC-5382 • MEDICAL LVL 3</p>
            </a>
          </div>
        </div>
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
