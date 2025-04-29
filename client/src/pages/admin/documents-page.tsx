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
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  
  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<AdminDocument[]>({
    queryKey: ["/api/admin/documents"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          title: "SCP-173: The Sculpture",
          code: "SCP-173",
          content: `**Item #:** SCP-173

**Object Class:** Euclid

**Special Containment Procedures:** Item SCP-173 is to be kept in a locked container at all times. When personnel must enter SCP-173's container, no fewer than 3 may enter at any time and the door is to be relocked behind them. At all times, two persons must maintain direct eye contact with SCP-173 until all personnel have vacated and relocked the container.

**Description:** Moved to Site-19 in 1993. Origin is as yet unknown. It is constructed from concrete and rebar with traces of Krylon brand spray paint. SCP-173 is animate and extremely hostile. The object cannot move while within a direct line of sight. Line of sight must not be broken at any time with SCP-173. Personnel assigned to enter container are instructed to alert one another before blinking. Object is reported to attack by snapping the neck at the base of the skull, or by strangulation. In case of attack, personnel are to observe Class 4 hazardous object containment procedures.

Personnel report sounds of scraping stone originating from within the container when no one is present inside. This is considered normal, and any change in this behaviour should be reported to the acting HMCL supervisor on duty.

The reddish brown substance on the floor is a combination of feces and blood. Origin of these materials is unknown. The enclosure must be cleaned on a bi-weekly basis.`,
          securityLevel: 1,
          medicalLevel: 0,
          adminLevel: 0,
          createdAt: "2025-01-15T10:00:00",
          updatedAt: "2025-03-22T14:30:00",
          createdBy: "admin",
          status: "published",
          views: 345
        },
        {
          id: 2,
          title: "SCP-682: Hard-to-Destroy Reptile",
          code: "SCP-682",
          content: `**Item #:** SCP-682

**Object Class:** Keter

**Special Containment Procedures:** SCP-682 must be destroyed as soon as possible. At this time, no means available to SCP teams are capable of destroying SCP-682, only able to cause damage to its physical form. SCP-682 should be contained within a 5 m x 5 m x 5 m chamber with 25 cm reinforced acid-resistant steel plate lining all inside surfaces. The containment chamber should be filled with hydrochloric acid until SCP-682 is submerged and incapacitated. Any attempts of SCP-682 to move, speak, or breach containment should be reacted to quickly and with full force as called for by the circumstances.

**Description:** SCP-682 is a large, vaguely reptilian creature of unknown origin. It appears to be extremely intelligent, and was observed to engage in complex communication with SCP-079 during their limited time of exposure. SCP-682 appears to have a hatred of all life, which has been expressed in several interviews during containment.

SCP-682 has always been observed to have extremely high strength, speed, and reflexes, though exact levels vary with its form. SCP-682's physical body grows and changes very quickly, growing or decreasing in size as it consumes or sheds material. SCP-682 gains energy from anything it ingests, organic or inorganic. Digestion seems to be aided by a set of filtering gills inside of SCP-682's nostrils, which are able to remove usable matter from any liquid solution, enabling it to constantly regenerate from the acid it is contained in. SCP-682's regenerative capabilities and resilience are staggering, and SCP-682 has been seen moving and speaking with its body 87% destroyed or rotted.`,
          securityLevel: 4,
          medicalLevel: 3,
          adminLevel: 3,
          createdAt: "2025-02-10T11:23:00",
          updatedAt: "2025-04-15T09:45:00",
          createdBy: "admin",
          status: "published",
          views: 278
        },
        {
          id: 3,
          title: "Internal Memo: Security Protocols Update",
          code: "MEM-042",
          content: `**INTERNAL MEMORANDUM**

**DATE:** April 25, 2025
**TO:** All Site Personnel
**FROM:** Security Director
**SUBJECT:** Updated Security Protocols

Effective immediately, all personnel must adhere to the following revised security protocols:

1. Biometric verification is now required for access to all Level 3 and above areas
2. Key cards must be visible at all times while on premises
3. Random security checks will increase in frequency
4. New emergency response drills will be conducted bi-weekly
5. All digital communications will be subject to enhanced encryption

These measures are being implemented in response to recent containment breaches. Compliance is mandatory.

**Remember:** Security is everyone's responsibility.`,
          securityLevel: 1,
          medicalLevel: 0,
          adminLevel: 0,
          createdAt: "2025-04-25T16:00:00",
          updatedAt: "2025-04-25T16:00:00",
          createdBy: "security_director",
          status: "published",
          views: 124
        },
        {
          id: 4,
          title: "Project Lazarus: Initial Findings",
          code: "RES-2301",
          content: `**PROJECT LAZARUS: INITIAL FINDINGS**
**CLASSIFIED - LEVEL 4**

Research Team: Dr. ███████, Dr. ██████, Dr. █████

Preliminary testing of SCP-███ on deceased organic matter has yielded unexpected results. The anomalous properties appear to function on a cellular level, with complete reanimation of tissue samples occurring within [REDACTED] minutes of exposure.

Ethical concerns have been raised regarding extended testing. Request for expanded research parameters is pending O5 approval.

**WARNING:** All personnel involved in Project Lazarus must undergo daily psychological evaluation. Report any unusual thoughts or behaviors to medical staff immediately.

**Addendum:** Three research assistants have been removed from the project due to [DATA EXPUNGED]. Investigation ongoing.`,
          securityLevel: 4,
          medicalLevel: 3,
          adminLevel: 2,
          createdAt: "2025-03-10T09:15:00",
          updatedAt: "2025-04-20T14:22:00",
          createdBy: "dr_smith",
          status: "draft",
          views: 42
        },
        {
          id: 5,
          title: "Facility Maintenance Schedule",
          code: "MAINT-2025-Q2",
          content: `**FACILITY MAINTENANCE SCHEDULE: Q2 2025**

**APRIL**
- 04/01: HVAC System Inspection (Sectors A-D)
- 04/08: Electrical Grid Maintenance (All Sectors)
- 04/15: Backup Generator Testing
- 04/22: Water Filtration System Servicing
- 04/29: Security Camera Network Maintenance

**MAY**
- 05/06: Containment Cell Integrity Checks (Low Risk)
- 05/13: Containment Cell Integrity Checks (Medium Risk)
- 05/20: Containment Cell Integrity Checks (High Risk)
- 05/27: Emergency System Testing

**JUNE**
- 06/03: Infrastructure Resilience Assessment
- 06/10: Decontamination Chamber Servicing
- 06/17: Hazardous Material Storage Inspection
- 06/24: Quarterly Full Facility Assessment

All maintenance activities will be performed during designated low-activity periods. Contact Facility Manager with questions or scheduling conflicts.`,
          securityLevel: 1,
          medicalLevel: 0,
          adminLevel: 1,
          createdAt: "2025-03-28T10:30:00",
          updatedAt: "2025-03-28T10:30:00",
          createdBy: "facility_manager",
          status: "archived",
          views: 89
        }
      ];
    }
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
  
  // Handle document creation
  const onCreateSubmit = (data: DocumentFormValues) => {
    // In a real app, this would make an API call
    console.log("Creating document:", data);
    
    toast({
      title: "Document created",
      description: `Document ${data.code}: ${data.title} has been created.`,
    });
    
    createForm.reset();
    setIsAddDocumentOpen(false);
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