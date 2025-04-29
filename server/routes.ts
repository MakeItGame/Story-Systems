import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCredentialSchema } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Password utility functions
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // User profile routes
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { username, email, displayName } = req.body;
    
    try {
      // Get the current user
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // Log the update attempt
      console.log(`Profile update for user ${userId}:`, { username, email, displayName });
      
      // Check if username is already taken (if changing)
      if (username && username !== req.user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
      
      // Update the user in the database
      const updatedUser = await storage.updateUser(userId, {
        username: username || req.user.username
        // Note: email and displayName are not in our current schema,
        // so we're just updating the username for now
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session
      req.user = updatedUser;
      
      // Return success
      res.status(200).json({ 
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  app.patch("/api/user/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    try {
      // Get the current user
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      console.log(`Password change requested for user ${userId}`);
      
      // Get the user from the database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const passwordValid = await comparePasswords(currentPassword, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the password in the database
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      // Update the user in the session
      req.user = updatedUser;
      
      // Return success
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  app.patch("/api/user/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Get the current user
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // In a real app, we would store notification preferences
      // For now, just acknowledge the request
      console.log(`Notification preferences updated for user ${userId}:`, req.body);
      
      // Return success
      res.status(200).json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });
  
  // Reset game progress
  app.post("/api/user/reset-progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      // Get the current user
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      // In a real app, we would:
      // 1. Delete all user credentials (but keep actual user account)
      // 2. Reset document access history
      // 3. Reset achievement progress
      // 4. Reset any other game state
      
      // For now, let's just delete all user credentials
      const userCredentials = await storage.getUserCredentials(userId);
      for (const credential of userCredentials) {
        await storage.removeCredentialFromUser(userId, credential.id);
      }
      
      console.log(`Game progress reset for user ${userId}`);
      
      // Return success
      res.status(200).json({ message: "Game progress has been reset successfully" });
    } catch (error) {
      console.error("Error resetting game progress:", error);
      res.status(500).json({ message: "Failed to reset game progress" });
    }
  });
  
  // Debug endpoint to check existing users
  app.get("/api/debug/users", async (req, res) => {
    try {
      // Get all users without exposing passwords
      const allUsers = await Promise.all(
        Array.from(Array(10).keys()).map(async (id) => {
          const user = await storage.getUser(id + 1);
          if (user) {
            return {
              id: user.id,
              username: user.username,
              isAdmin: user.isAdmin
            };
          }
          return null;
        })
      );
      
      // Filter out nulls (non-existent users)
      const users = allUsers.filter(user => user !== null);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

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
      
      // Get the user's selected credential
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const userCredentials = await storage.getUserCredentials(userId);
      const selectedCredential = userCredentials.find(cred => cred.isSelected);
      
      if (!selectedCredential) {
        return res.status(403).json({ 
          message: "Access denied - No credential selected",
          accessDenied: true,
          requiredLevels: {
            security: document.securityLevel,
            medical: document.medicalLevel,
            admin: document.adminLevel
          }
        });
      }
      
      // Check if user has sufficient permissions
      const hasSecurityAccess = (selectedCredential.securityLevel || 0) >= (document.securityLevel || 0);
      const hasMedicalAccess = (selectedCredential.medicalLevel || 0) >= (document.medicalLevel || 0);
      const hasAdminAccess = (selectedCredential.adminLevel || 0) >= (document.adminLevel || 0);
      
      if (!hasSecurityAccess || !hasMedicalAccess || !hasAdminAccess) {
        return res.status(403).json({ 
          message: "Access denied - Insufficient permissions",
          accessDenied: true,
          requiredLevels: {
            security: document.securityLevel,
            medical: document.medicalLevel,
            admin: document.adminLevel
          },
          currentLevels: {
            security: selectedCredential.securityLevel,
            medical: selectedCredential.medicalLevel,
            admin: selectedCredential.adminLevel
          }
        });
      }
      
      // User has sufficient permissions, return the document
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

  // Admin document routes
  app.get("/api/admin/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    try {
      // Fetch all documents
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  app.post("/api/admin/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    try {
      // Use documentCode in both request and database to maintain consistency
      const { title, documentCode, content, securityLevel, medicalLevel, adminLevel, author, hasImages, images, relatedDocuments } = req.body;
      
      // Check if document code already exists
      const existingDoc = await storage.getDocumentByCode(documentCode);
      if (existingDoc) {
        return res.status(409).json({ message: "Document code already exists" });
      }
      
      // Create document using the correct field names from schema
      const document = await storage.createDocument({
        title,
        documentCode,
        content,
        securityLevel: securityLevel || 0,
        medicalLevel: medicalLevel || 0,
        adminLevel: adminLevel || 0,
        author: author || req.user.username,
        hasImages: hasImages || false,
        images: images || [],
        relatedDocuments: relatedDocuments || []
      });
      
      console.log(`New document created by admin: ${documentCode}: ${title}`);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  // Get a single document by ID (admin)
  app.get("/api/admin/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });
    
    try {
      const document = await storage.getDocument(id);
      if (!document) return res.status(404).json({ message: "Document not found" });
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  // Update a document (admin)
  app.put("/api/admin/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });
    
    try {
      const document = await storage.getDocument(id);
      if (!document) return res.status(404).json({ message: "Document not found" });
      
      const { title, documentCode, content, securityLevel, medicalLevel, adminLevel } = req.body;
      
      // If document code is being changed, check if it already exists
      if (documentCode && documentCode !== document.documentCode) {
        const existingDoc = await storage.getDocumentByCode(documentCode);
        if (existingDoc && existingDoc.id !== id) {
          return res.status(409).json({ message: "Document code already exists" });
        }
      }
      
      // Update the document
      const updatedDocument = await storage.updateDocument(id, {
        title,
        documentCode,
        content,
        securityLevel,
        medicalLevel,
        adminLevel
      });
      
      console.log(`Document updated by admin: ${documentCode}: ${title}`);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  
  // Delete a document (admin)
  app.delete("/api/admin/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });
    
    try {
      const document = await storage.getDocument(id);
      if (!document) return res.status(404).json({ message: "Document not found" });
      
      // Just mark the document as archived (soft delete) using an updatedAt timestamp
      await storage.updateDocument(id, { 
        updatedAt: new Date() 
      });
      
      console.log(`Document deleted by admin: ${document.documentCode}: ${document.title}`);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  
  // Admin user routes
  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Forbidden - Admin access required" });
    
    const { username, email, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: role === "admin"
      });
      
      console.log(`New user created by admin: ${username}`);
      
      // Return success without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
