import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Check, 
  Ban, 
  Shield, 
  User, 
  Lock,
  ArrowUpDown,
  Filter,
  Download,
  Loader2
} from "lucide-react";

// Types for users
interface UserData {
  id: number;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "suspended" | "inactive";
  lastLogin: string;
  registeredAt: string;
  gameProgress: number;
}

// Form schemas
const createUserSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters."
  }),
  role: z.enum(["user", "moderator", "admin"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  // Create user form
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user"
    }
  });
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          role: "admin",
          status: "active",
          lastLogin: "2025-04-29T12:00:00",
          registeredAt: "2025-01-01T00:00:00",
          gameProgress: 100
        },
        {
          id: 2,
          username: "testuser",
          email: "test@example.com",
          role: "user",
          status: "active",
          lastLogin: "2025-04-28T10:15:00",
          registeredAt: "2025-03-15T00:00:00",
          gameProgress: 42
        },
        {
          id: 3,
          username: "moderator1",
          email: "mod@example.com",
          role: "moderator",
          status: "active",
          lastLogin: "2025-04-27T09:30:00",
          registeredAt: "2025-02-10T00:00:00",
          gameProgress: 78
        },
        {
          id: 4,
          username: "inactiveuser",
          email: "inactive@example.com",
          role: "user",
          status: "inactive",
          lastLogin: "2025-03-15T14:20:00",
          registeredAt: "2025-01-20T00:00:00",
          gameProgress: 15
        },
        {
          id: 5,
          username: "suspendeduser",
          email: "suspended@example.com",
          role: "user",
          status: "suspended",
          lastLogin: "2025-04-10T11:45:00",
          registeredAt: "2025-02-05T00:00:00",
          gameProgress: 37
        }
      ];
    }
  });
  
  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || statusFilter === "all" || user.status === statusFilter;
    const matchesRole = !roleFilter || roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Handle user creation
  const onSubmit = (data: CreateUserFormValues) => {
    // In a real app, this would make an API call
    console.log("Creating user:", data);
    
    toast({
      title: "User created",
      description: `User ${data.username} has been created successfully.`,
    });
    
    form.reset();
    setIsAddUserOpen(false);
  };
  
  // User action handlers
  const handleSuspendUser = (userId: number) => {
    // In a real app, this would make an API call
    console.log("Suspending user:", userId);
    
    toast({
      title: "User suspended",
      description: "The user has been suspended.",
    });
  };
  
  const handleActivateUser = (userId: number) => {
    // In a real app, this would make an API call
    console.log("Activating user:", userId);
    
    toast({
      title: "User activated",
      description: "The user has been activated.",
    });
  };
  
  const handleDeleteUser = (userId: number) => {
    // In a real app, this would make an API call
    console.log("Deleting user:", userId);
    
    toast({
      title: "User deleted",
      description: "The user has been permanently deleted.",
      variant: "destructive",
    });
  };
  
  const handleEditUser = (userId: number) => {
    // In a real app, this would open an edit dialog
    console.log("Editing user:", userId);
  };
  
  // Role badge color
  const getRoleBadgeColor = (role: UserData["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 border-red-800 text-red-500";
      case "moderator":
        return "bg-yellow-500/20 border-yellow-800 text-yellow-500";
      case "user":
        return "bg-blue-500/20 border-blue-800 text-blue-500";
      default:
        return "bg-gray-500/20 border-gray-800 text-gray-500";
    }
  };
  
  // Status badge color
  const getStatusBadgeColor = (status: UserData["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 border-green-800 text-green-500";
      case "suspended":
        return "bg-red-500/20 border-red-800 text-red-500";
      case "inactive":
        return "bg-gray-500/20 border-gray-800 text-gray-500";
      default:
        return "bg-gray-500/20 border-gray-800 text-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-gray-400">Manage user accounts and permissions</p>
      </div>
      
      <Card className="bg-primary border-gray-800">
        <CardHeader>
          <CardTitle className="text-foreground">Users</CardTitle>
          <CardDescription>
            Manage registered users, their roles, and account status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary border-gray-700 pl-8"
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-secondary border-gray-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-secondary border-gray-700">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-gray-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="bg-secondary border-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/80">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-primary border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account. The user will receive an email with login instructions.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input className="bg-secondary border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input className="bg-secondary border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                className="bg-secondary border-gray-700" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-secondary border-gray-700">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-secondary border-gray-700">
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter className="gap-2 mt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="bg-secondary border-gray-700"
                          onClick={() => setIsAddUserOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create User
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="rounded-md border border-gray-800">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="text-gray-400">
                    <div className="flex items-center">
                      <span>Username</span>
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Role</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Last Login</TableHead>
                  <TableHead className="text-gray-400">Game Progress</TableHead>
                  <TableHead className="text-gray-400">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-accent" />
                        <span className="ml-2 text-gray-400">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-secondary/60">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} capitalize`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusBadgeColor(user.status)} capitalize`}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {formatDate(user.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${user.gameProgress}%` }} 
                            />
                          </div>
                          <span className="text-sm">{user.gameProgress}%</span>
                        </div>
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
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                className="flex items-center text-yellow-500 cursor-pointer"
                                onClick={() => handleSuspendUser(user.id)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="flex items-center text-green-500 cursor-pointer"
                                onClick={() => handleActivateUser(user.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="flex items-center text-red-500 cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
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
    </AdminLayout>
  );
}