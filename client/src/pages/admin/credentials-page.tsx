import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Credential, insertCredentialSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AdminLayout from "@/components/layout/AdminLayout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, PlusCircle, Trash2, FileEdit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const credentialFormSchema = insertCredentialSchema.extend({
  password: z.string().min(1, "Password is required"),
  displayName: z.string().min(1, "Display name is required"),
});

type CredentialFormValues = z.infer<typeof credentialFormSchema>;

export default function AdminCredentialsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<Credential | null>(null);
  const { toast } = useToast();

  // Fetch all credentials
  const {
    data: credentials = [],
    isLoading,
    refetch,
  } = useQuery<Credential[]>({
    queryKey: ["/api/admin/credentials"],
    queryFn: async () => {
      const response = await fetch("/api/admin/credentials");
      if (!response.ok) throw new Error("Failed to fetch credentials");
      return response.json();
    },
  });

  // Create credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: async (data: CredentialFormValues) => {
      const response = await apiRequest("POST", "/api/admin/credentials", data);
      return response.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      toast({
        title: "Credential created",
        description: "The credential has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create credential",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/credentials/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setCredentialToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credentials"] });
      toast({
        title: "Credential deleted",
        description: "The credential has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete credential",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for creating credentials
  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      securityLevel: 0,
      medicalLevel: 0,
      adminLevel: 0,
      notes: "",
    },
  });

  const onSubmit = (data: CredentialFormValues) => {
    createCredentialMutation.mutate(data);
  };

  const confirmDelete = (credential: Credential) => {
    setCredentialToDelete(credential);
    setIsDeleteDialogOpen(true);
  };

  // Add functionality to add a test credential to the current user
  const addTestCredentialToUser = useMutation({
    mutationFn: async (credential: Credential) => {
      const response = await apiRequest("POST", "/api/test/assign-credential", { credentialId: credential.id });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test credential added",
        description: "The credential has been added to your user account and set as selected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add test credential",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Game Credentials Management</h1>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Credential</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-primary border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-lg font-medium mb-2">No credentials found</p>
            <p className="text-gray-400 mb-4">Create in-game credentials for players to discover.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create Credential</Button>
          </div>
        ) : (
          <div className="bg-primary border border-gray-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Security Level</TableHead>
                  <TableHead>Medical Level</TableHead>
                  <TableHead>Admin Level</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell className="font-mono">{credential.username}</TableCell>
                    <TableCell>{credential.displayName}</TableCell>
                    <TableCell>
                      {credential.securityLevel > 0 ? (
                        <span className="inline-block px-2 py-1 bg-blue-900 text-xs rounded text-white">
                          {credential.securityLevel}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {credential.medicalLevel > 0 ? (
                        <span className="inline-block px-2 py-1 bg-green-900 text-xs rounded text-white">
                          {credential.medicalLevel}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {credential.adminLevel > 0 ? (
                        <span className="inline-block px-2 py-1 bg-gray-700 text-xs rounded text-white">
                          {credential.adminLevel}
                        </span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {credential.notes ? (
                        <span className="text-sm text-gray-400">{credential.notes.substring(0, 40)}{credential.notes.length > 40 ? '...' : ''}</span>
                      ) : (
                        <span className="text-gray-500 italic text-sm">No notes</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addTestCredentialToUser.mutate(credential)}
                        className="inline-flex items-center"
                      >
                        <span>Use</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(credential)}
                        className="text-red-500 hover:text-red-300 hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Credential Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-secondary border border-gray-800 shadow-lg">
          <DialogHeader>
            <DialogTitle>Create New Credential</DialogTitle>
            <DialogDescription>
              Create a new in-game credential that players can discover and use.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="terminal_user_01" 
                          className="bg-background"
                          {...field} 
                        />
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
                          placeholder="Password" 
                          className="bg-background"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Terminal User 01" 
                        className="bg-background"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="securityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          max={5}
                          placeholder="0" 
                          className="bg-background"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          max={5}
                          placeholder="0" 
                          className="bg-background"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          max={5}
                          placeholder="0" 
                          className="bg-background"
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this credential" 
                        className="bg-background resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCredentialMutation.isPending}
                  className="ml-2"
                >
                  {createCredentialMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Credential
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-secondary border border-gray-800 shadow-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this credential? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-background border border-gray-800 rounded p-4 mb-4">
            <p><span className="font-medium">Username:</span> {credentialToDelete?.username}</p>
            <p><span className="font-medium">Display Name:</span> {credentialToDelete?.displayName}</p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={() => credentialToDelete && deleteCredentialMutation.mutate(credentialToDelete.id)}
              disabled={deleteCredentialMutation.isPending}
              className="ml-2"
            >
              {deleteCredentialMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}