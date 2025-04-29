import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import DocumentSidebar from "@/components/layout/DocumentSidebar";
import DocumentViewer from "@/components/document/DocumentViewer";
import { Document } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function DocumentsPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  
  // Refresh credentials when needed
  const { refetch: refetchCredentials } = useQuery({
    queryKey: ["/api/credentials"],
  });
  
  // Handle document selection
  const handleSelectDocument = (doc: Document) => {
    setSelectedDocumentId(doc.id);
  };
  
  // Handle credential added (e.g., from modals)
  const handleCredentialAdded = () => {
    refetchCredentials();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <DocumentSidebar 
          onSelectDocument={handleSelectDocument}
          selectedDocumentId={selectedDocumentId}
        />
        
        <DocumentViewer 
          documentId={selectedDocumentId}
          onCredentialAdded={handleCredentialAdded}
        />
      </div>
    </div>
  );
}
