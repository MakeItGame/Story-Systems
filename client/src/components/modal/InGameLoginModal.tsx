import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface InGameLoginModalProps {
  onClose: () => void;
  onCredentialAdded: () => void;
  prefillUsername?: string;
  prefillPassword?: string;
}

const credentialSchema = z.object({
  username: z.string().min(1, "System ID is required"),
  password: z.string().min(1, "Access code is required"),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;

export function InGameLoginModal({ onClose, onCredentialAdded, prefillUsername = "", prefillPassword = "" }: InGameLoginModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      username: prefillUsername,
      password: prefillPassword,
    },
  });

  const onSubmit = async (data: CredentialFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/credentials/verify", data);
      const result = await response.json();
      
      // Refresh credentials after adding
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      
      toast({
        title: "Access granted",
        description: "Credential has been added to your profile.",
      });
      
      if (result.obsoleteCredential) {
        toast({
          title: "Credential replaced",
          description: `${result.obsoleteCredential.displayName} has been replaced with higher permissions.`,
        });
      }
      
      onCredentialAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
        className="bg-primary w-full max-w-md p-6 rounded-lg border border-gray-700 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">INTERNAL SYSTEM ACCESS</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="mb-6 bg-secondary p-4 rounded border border-gray-700 font-mono text-xs">
          <p className="text-blue-400 mb-2">&gt; RESTRICTED TERMINAL</p>
          <p className="text-yellow-500 mb-2">&gt; CLEARANCE VERIFICATION REQUIRED</p>
          <p className="terminal-text text-foreground"> ENTER ACCESS CODE</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-400">SYSTEM ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full px-3 py-2 bg-secondary text-foreground border border-gray-700 rounded focus:outline-none focus:border-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-400">ACCESS CODE</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="w-full px-3 py-2 bg-secondary text-foreground border border-gray-700 rounded focus:outline-none focus:border-accent"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                VERIFY
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  );
}
