import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCredentialSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Document routes
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/accessible", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const securityLevel = parseInt(req.query.securityLevel as string) || 0;
    const medicalLevel = parseInt(req.query.medicalLevel as string) || 0;
    const adminLevel = parseInt(req.query.adminLevel as string) || 0;
    
    try {
      const documents = await storage.getAccessibleDocuments(securityLevel, medicalLevel, adminLevel);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accessible documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });
    
    try {
      const document = await storage.getDocument(id);
      if (!document) return res.status(404).json({ message: "Document not found" });
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Credential routes
  app.get("/api/credentials", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const credentials = await storage.getUserCredentials(userId);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post("/api/credentials/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const credential = await storage.getCredentialByUsername(username);
      if (!credential || credential.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // Check if user already has this credential
      const userCredentials = await storage.getUserCredentials(userId);
      const existingCredential = userCredentials.find(c => c.id === credential.id);
      
      if (existingCredential) {
        return res.status(409).json({ 
          message: "Credential already exists in your profile",
          credential
        });
      }
      
      // Check if the new credential makes any existing credentials obsolete
      const obsoleteCredential = await storage.checkIfCredentialObsolete(userId, credential);
      
      // Add the credential to user
      await storage.addCredentialToUser({
        userId,
        credentialId: credential.id,
        isSelected: true
      });
      
      // Set it as selected
      await storage.setSelectedCredential(userId, credential.id);
      
      res.status(200).json({
        message: "Credential verified and added to your profile",
        credential,
        obsoleteCredential
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify credential" });
    }
  });

  app.post("/api/credentials/create", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const credentialData = insertCredentialSchema.parse(req.body);
      const newCredential = await storage.createCredential(credentialData);
      res.status(201).json(newCredential);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid credential data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credential" });
    }
  });

  app.post("/api/credentials/select/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const credentialId = parseInt(req.params.id);
    if (isNaN(credentialId)) return res.status(400).json({ message: "Invalid credential ID" });
    
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const result = await storage.setSelectedCredential(userId, credentialId);
      if (!result) return res.status(404).json({ message: "Credential not found or not owned by user" });
      
      res.status(200).json({ message: "Credential selected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to select credential" });
    }
  });

  app.delete("/api/credentials/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const credentialId = parseInt(req.params.id);
    if (isNaN(credentialId)) return res.status(400).json({ message: "Invalid credential ID" });
    
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const result = await storage.removeCredentialFromUser(userId, credentialId);
      if (!result) return res.status(404).json({ message: "Credential not found or not owned by user" });
      
      res.status(200).json({ message: "Credential removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove credential" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
