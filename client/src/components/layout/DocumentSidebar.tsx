import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, Credential } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

type DocumentSidebarProps = {
  onSelectDocument: (doc: Document) => void;
  selectedDocumentId: number | null;
};

export default function DocumentSidebar({ onSelectDocument, selectedDocumentId }: DocumentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch credentials with proper typing
  const { data: credentials = [] } = useQuery<(Credential & { isSelected: boolean })[]>({
    queryKey: ["/api/credentials"],
  });
  
  // Find the selected credential
  const selectedCredential = credentials.find(cred => cred.isSelected);
  
  // Set clearance levels (default to 0 if no credential is selected)
  const securityLevel = selectedCredential?.securityLevel || 0;
  const medicalLevel = selectedCredential?.medicalLevel || 0;
  const adminLevel = selectedCredential?.adminLevel || 0;
  
  // Fetch accessible documents based on clearance
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/accessible", securityLevel, medicalLevel, adminLevel],
    queryFn: async () => {
      const response = await fetch(`/api/documents/accessible?securityLevel=${securityLevel}&medicalLevel=${medicalLevel}&adminLevel=${adminLevel}`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: true, // Always enabled, will just return empty if no credentials
    staleTime: 0, // Always refetch on component mount
  });
  
  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get recently viewed documents (this would normally be stored in state or fetched)
  const recentDocuments = documents?.slice(0, 2) || [];

  return (
    <aside className="w-64 border-r border-gray-800 bg-primary hidden md:block">
      <div className="h-full flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary text-foreground border border-gray-700 rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-gray-600"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Document List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Accessible Documents</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-2 rounded bg-secondary border border-gray-700">
                    <Skeleton className="h-4 w-3/4 bg-gray-700 mb-1" />
                    <div className="flex items-center mt-1">
                      <Skeleton className="h-3 w-1/4 bg-gray-700 mr-2" />
                      <div className="flex space-x-1">
                        <Skeleton className="h-3 w-6 bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredDocuments?.map(doc => (
                  <motion.li 
                    key={doc.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectDocument(doc);
                      }}
                      className={`block p-2 rounded bg-secondary ${selectedDocumentId === doc.id ? 'border-l-4 border-accent border-t border-r border-b border-gray-700' : 'border border-gray-700'} hover:border-accent transition-colors duration-200`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-2">{doc.documentCode}</span>
                            <div className="flex space-x-1">
                              {(doc.securityLevel || 0) > 0 && (
                                <span className="inline-block px-1 py-0.5 bg-blue-900 text-xs rounded-sm text-white">
                                  S:{doc.securityLevel}+
                                </span>
                              )}
                              {(doc.medicalLevel || 0) > 0 && (
                                <span className="inline-block px-1 py-0.5 bg-green-900 text-xs rounded-sm text-white">
                                  M:{doc.medicalLevel}+
                                </span>
                              )}
                              {(doc.adminLevel || 0) > 0 && (
                                <span className="inline-block px-1 py-0.5 bg-gray-700 text-xs rounded-sm text-white">
                                  A:{doc.adminLevel}+
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Recently Viewed</h3>
            <ul className="space-y-1">
              {recentDocuments.map(doc => (
                <li key={`recent-${doc.id}`}>
                  <a 
                    href="#" 
                    className="block p-2 text-sm text-gray-400 hover:text-foreground hover:bg-gray-800 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectDocument(doc);
                    }}
                  >
                    <div className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2 text-gray-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{doc.title}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
