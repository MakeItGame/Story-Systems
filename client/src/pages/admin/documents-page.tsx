import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  Copy, 
  MoreHorizontal, 
  Filter,
  FileText,
  Lock,
  Save,
  Loader2,
  ArrowUpDown
} from "lucide-react";

// Extended document type for admin view
interface AdminDocument {
  id: number;
  title: string;
  code: string;
  content: string;
  securityLevel: number;
  medicalLevel: number;
  adminLevel: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: "published" | "draft" | "archived";
  views: number;
}

// Form schema
const documentSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters."
  }),
  code: z.string().min(3, {
    message: "Document code must be at least 3 characters."
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters."
  }),
  securityLevel: z.number().min(0).max(5),
  medicalLevel: z.number().min(0).max(5),
  adminLevel: z.number().min(0).max(5),
  status: z.enum(["published", "draft", "archived"])
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function AdminDocumentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedDocument, setSelectedDocument] = useState<AdminDocument | null>(null);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isEditDocumentOpen, setIsEditDocumentOpen] = useState(false);
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Create form
  const createForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      code: "",
      content: "",
      securityLevel: 1,
      medicalLevel: 0,
      adminLevel: 0,
      status: "draft"
    }
  });
  
  // Edit form
  const editForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      code: "",
      content: "",
      securityLevel: 1,
      medicalLevel: 0,
      adminLevel: 0,
      status: "published"
    }
  });
  
  // Setup queryClient for mutations
  const queryClient = useQueryClient();
  
  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      return response.json();
    },
    staleTime: 0, // Always refetch on component mount
  });
  
  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      // Filter by search query
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = !statusFilter || doc.status === statusFilter;
      
      // Filter by tab
      if (activeTab === "all") return matchesSearch && matchesStatus;
      if (activeTab === "published") return doc.status === "published" && matchesSearch && matchesStatus;
      if (activeTab === "draft") return doc.status === "draft" && matchesSearch && matchesStatus;
      if (activeTab === "archived") return doc.status === "archived" && matchesSearch && matchesStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: DocumentFormValues) => {
      const res = await apiRequest("POST", "/api/admin/documents", documentData);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      
      toast({
        title: "Document created",
        description: `Document ${createForm.getValues().code}: ${createForm.getValues().title} has been created successfully.`,
      });
      
      createForm.reset();
      setIsAddDocumentOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating document",
        description: error.message || "Failed to create document. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle document creation
  const onCreateSubmit = (data: DocumentFormValues) => {
    createDocumentMutation.mutate(data);
  };
  
  // Handle document edit
  const onEditSubmit = (data: DocumentFormValues) => {
    // In a real app, this would make an API call
    console.log("Updating document:", data);
    
    toast({
      title: "Document updated",
      description: `Document ${data.code}: ${data.title} has been updated.`,
    });
    
    setIsEditDocumentOpen(false);
  };
  
  // Handle edit button click
  const handleEditDocument = (document: AdminDocument) => {
    setSelectedDocument(document);
    editForm.reset({
      title: document.title,
      code: document.code,
      content: document.content,
      securityLevel: document.securityLevel,
      medicalLevel: document.medicalLevel,
      adminLevel: document.adminLevel,
      status: document.status as "published" | "draft" | "archived"
    });
    setIsEditDocumentOpen(true);
  };
  
  // Handle view button click
  const handleViewDocument = (document: AdminDocument) => {
    setSelectedDocument(document);
    setIsViewDocumentOpen(true);
  };
  
  // Handle document deletion
  const handleDeleteDocument = (id: number) => {
    // In a real app, this would make an API call
    console.log("Deleting document:", id);
    
    toast({
      title: "Document deleted",
      description: "The document has been permanently deleted.",
      variant: "destructive",
    });
  };
  
  // Handle document status change
  const handleChangeStatus = (id: number, newStatus: "published" | "draft" | "archived") => {
    // In a real app, this would make an API call
    console.log("Changing document status:", id, newStatus);
    
    toast({
      title: "Status updated",
      description: `Document status changed to ${newStatus}.`,
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: AdminDocument["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 border-green-800 text-green-500";
      case "draft":
        return "bg-yellow-500/20 border-yellow-800 text-yellow-500";
      case "archived":
        return "bg-gray-500/20 border-gray-800 text-gray-500";
      default:
        return "bg-gray-500/20 border-gray-800 text-gray-500";
    }
  };

  // Access level representation
  const renderAccessLevel = (level: number) => {
    return (
      <div className="flex items-center justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full mx-0.5 ${i < level ? 'bg-accent' : 'bg-gray-700'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
        <p className="text-gray-400">Create, edit, and manage documents in the system</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-primary border border-gray-800 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-secondary">
              All
            </TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-secondary">
              Published
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-secondary">
              Drafts
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-secondary">
              Archived
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary border-gray-700 pl-8"
              />
            </div>
            
            <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-primary border-gray-800 max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to the system. Preview your content as you type.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={createForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Title</FormLabel>
                              <FormControl>
                                <Input className="bg-secondary border-gray-700" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Code</FormLabel>
                              <FormControl>
                                <Input className="bg-secondary border-gray-700" {...field} />
                              </FormControl>
                              <FormDescription>
                                Unique identifier for this document (e.g., SCP-173)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-3 gap-3">
                          <FormField
                            control={createForm.control}
                            name="securityLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Security</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-secondary border-gray-700">
                                      <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-secondary border-gray-700">
                                    {[0, 1, 2, 3, 4, 5].map((level) => (
                                      <SelectItem key={level} value={level.toString()}>
                                        Level {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="medicalLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medical</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-secondary border-gray-700">
                                      <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-secondary border-gray-700">
                                    {[0, 1, 2, 3, 4, 5].map((level) => (
                                      <SelectItem key={level} value={level.toString()}>
                                        Level {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="adminLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-secondary border-gray-700">
                                      <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-secondary border-gray-700">
                                    {[0, 1, 2, 3, 4, 5].map((level) => (
                                      <SelectItem key={level} value={level.toString()}>
                                        Level {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={createForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-secondary border-gray-700">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-secondary border-gray-700">
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={createForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content (Markdown)</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="bg-secondary border-gray-700 h-64 font-mono" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Use Markdown for formatting. Supports **bold**, *italic*, [links](url), etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter className="gap-2 mt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-secondary border-gray-700"
                        onClick={() => setIsAddDocumentOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Document
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value={activeTab} className="space-y-6 mt-0">
          <Card className="bg-primary border-gray-800">
            <CardContent className="p-0">
              <div className="rounded-md border border-gray-800">
                <Table>
                  <TableHeader className="bg-secondary">
                    <TableRow>
                      <TableHead className="text-gray-400">
                        <div className="flex items-center">
                          <span>Document</span>
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-400">Access Levels (S/M/A)</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Last Updated</TableHead>
                      <TableHead className="text-gray-400">Views</TableHead>
                      <TableHead className="text-gray-400">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-accent" />
                            <span className="ml-2 text-gray-400">Loading documents...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                          No documents found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((document) => (
                        <TableRow key={document.id} className="hover:bg-secondary/60">
                          <TableCell>
                            <div className="flex items-start space-y-1 flex-col">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-accent" />
                                <span className="font-medium">{document.title}</span>
                              </div>
                              <span className="text-xs text-gray-400">{document.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-blue-400 mb-1">S</span>
                                {renderAccessLevel(document.securityLevel)}
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-green-400 mb-1">M</span>
                                {renderAccessLevel(document.medicalLevel)}
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-purple-400 mb-1">A</span>
                                {renderAccessLevel(document.adminLevel)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusBadgeColor(document.status)} capitalize`}>
                              {document.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-400">
                            {formatDate(document.updatedAt)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {document.views.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-secondary border-gray-700">
                                <DropdownMenuItem 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => handleViewDocument(document)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => handleEditDocument(document)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem className="flex items-center cursor-pointer">
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="bg-gray-700" />
                                
                                {document.status !== "published" && (
                                  <DropdownMenuItem 
                                    className="flex items-center text-green-500 cursor-pointer"
                                    onClick={() => handleChangeStatus(document.id, "published")}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                
                                {document.status !== "draft" && (
                                  <DropdownMenuItem 
                                    className="flex items-center text-yellow-500 cursor-pointer"
                                    onClick={() => handleChangeStatus(document.id, "draft")}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Move to Drafts
                                  </DropdownMenuItem>
                                )}
                                
                                {document.status !== "archived" && (
                                  <DropdownMenuItem 
                                    className="flex items-center text-gray-500 cursor-pointer"
                                    onClick={() => handleChangeStatus(document.id, "archived")}
                                  >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator className="bg-gray-700" />
                                
                                <DropdownMenuItem 
                                  className="flex items-center text-red-500 cursor-pointer"
                                  onClick={() => handleDeleteDocument(document.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Document Dialog */}
      <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
        <DialogContent className="bg-primary border-gray-800 max-w-4xl max-h-[90vh] overflow-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl text-foreground">{selectedDocument.title}</DialogTitle>
                  <Badge variant="outline" className={`${getStatusBadgeColor(selectedDocument.status)} capitalize`}>
                    {selectedDocument.status}
                  </Badge>
                </div>
                <DialogDescription className="flex items-center justify-between">
                  <span>{selectedDocument.code}</span>
                  <span className="text-xs text-gray-400">Updated: {formatDate(selectedDocument.updatedAt)}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="border-t border-b border-gray-800 py-4 my-2">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center bg-secondary/50 p-2 rounded-lg border border-gray-700">
                    <span className="text-xs text-blue-400 mb-1">Security Level</span>
                    <div className="flex items-center">
                      {renderAccessLevel(selectedDocument.securityLevel)}
                      <span className="ml-2">{selectedDocument.securityLevel}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center bg-secondary/50 p-2 rounded-lg border border-gray-700">
                    <span className="text-xs text-green-400 mb-1">Medical Level</span>
                    <div className="flex items-center">
                      {renderAccessLevel(selectedDocument.medicalLevel)}
                      <span className="ml-2">{selectedDocument.medicalLevel}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center bg-secondary/50 p-2 rounded-lg border border-gray-700">
                    <span className="text-xs text-purple-400 mb-1">Admin Level</span>
                    <div className="flex items-center">
                      {renderAccessLevel(selectedDocument.adminLevel)}
                      <span className="ml-2">{selectedDocument.adminLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="whitespace-pre-wrap font-mono text-gray-300 bg-secondary p-4 rounded-lg border border-gray-700 max-h-[400px] overflow-y-auto">
                {selectedDocument.content}
              </div>
              
              <DialogFooter className="gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="bg-secondary border-gray-700"
                  onClick={() => setIsViewDocumentOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDocumentOpen(false);
                    handleEditDocument(selectedDocument);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Document Dialog */}
      <Dialog open={isEditDocumentOpen} onOpenChange={setIsEditDocumentOpen}>
        <DialogContent className="bg-primary border-gray-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Document</DialogTitle>
            <DialogDescription>
              Make changes to the document. Preview your content as you type.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Title</FormLabel>
                          <FormControl>
                            <Input className="bg-secondary border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Code</FormLabel>
                          <FormControl>
                            <Input className="bg-secondary border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={editForm.control}
                        name="securityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-secondary border-gray-700">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-secondary border-gray-700">
                                {[0, 1, 2, 3, 4, 5].map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    Level {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="medicalLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-secondary border-gray-700">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-secondary border-gray-700">
                                {[0, 1, 2, 3, 4, 5].map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    Level {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="adminLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-secondary border-gray-700">
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-secondary border-gray-700">
                                {[0, 1, 2, 3, 4, 5].map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    Level {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-secondary border-gray-700">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-secondary border-gray-700">
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (Markdown)</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-secondary border-gray-700 h-64 font-mono" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use Markdown for formatting. Supports **bold**, *italic*, [links](url), etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="gap-2 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-secondary border-gray-700"
                    onClick={() => setIsEditDocumentOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Update Document
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}