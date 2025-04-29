import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
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
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Please enter a valid email").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="bg-primary p-6 rounded-lg border border-accent shadow-lg w-full max-w-md">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">
          {isLogin ? "SECURE ACCESS" : "NEW PERSONNEL REGISTRATION"}
        </h3>
      </div>

      <div className="mb-8 bg-secondary p-4 rounded border border-gray-700 font-mono text-xs">
        <p className="text-green-500 mb-2">
          {isLogin 
            ? "{'>'} INITIALIZING CONNECTION..." 
            : "{'>'} INITIATING REGISTRATION PROTOCOL"}
        </p>
        <p className="text-green-500 mb-2">{'>'} SECURE CHANNEL ESTABLISHED</p>
        <p className="text-yellow-500 mb-2">
          {isLogin 
            ? "{'>'} AUTHORIZATION REQUIRED" 
            : "{'>'} CONFIDENTIALITY AGREEMENT REQUIRED"}
        </p>
        <p className="terminal-text text-foreground"> 
          {isLogin ? "ENTER CREDENTIALS" : "ENTER NEW CREDENTIALS"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">USERNAME</FormLabel>
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
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">PASSWORD</FormLabel>
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
                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="text-gray-400 hover:text-accent text-sm p-0"
                    onClick={() => setIsLogin(false)}
                  >
                    Register Access
                  </Button>
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="bg-accent hover:bg-red-900 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    AUTHENTICATE
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">USERNAME</FormLabel>
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
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">EMAIL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="w-full px-3 py-2 bg-secondary text-foreground border border-gray-700 rounded focus:outline-none focus:border-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">PASSWORD</FormLabel>
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
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-400">CONFIRM PASSWORD</FormLabel>
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
                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="text-gray-400 hover:text-accent text-sm p-0"
                    onClick={() => setIsLogin(true)}
                  >
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="bg-accent hover:bg-red-900 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    REGISTER
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
