import { 
  users, User, InsertUser, 
  documents, Document, InsertDocument,
  credentials, Credential, InsertCredential,
  userCredentials, UserCredential, InsertUserCredential
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByCode(code: string): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  getAccessibleDocuments(secLevel: number, medLevel: number, adminLevel: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  
  // Credential operations
  getCredential(id: number): Promise<Credential | undefined>;
  getCredentialByUsername(username: string): Promise<Credential | undefined>;
  getCredentials(): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  
  // User-Credential operations
  getUserCredentials(userId: number): Promise<(Credential & { isSelected: boolean })[]>;
  addCredentialToUser(userCredential: InsertUserCredential): Promise<UserCredential>;
  setSelectedCredential(userId: number, credentialId: number): Promise<UserCredential | undefined>;
  checkIfCredentialObsolete(userId: number, newCredential: Credential): Promise<Credential | undefined>;
  removeCredentialFromUser(userId: number, credentialId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

import connectPg from 'connect-pg-simple';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  private initializeData() {
    // Add initial documents
    this.createDocument({
      documentCode: "DOC-2301",
      title: "SCP-███ Containment Protocol",
      content: "SCP-███ is to be contained in a standard humanoid containment cell with reinforced walls...",
      securityLevel: 1,
      medicalLevel: 0,
      adminLevel: 0,
      author: "Dr. [REDACTED]",
      hasImages: false,
      images: [],
      relatedDocuments: [],
    });
    
    this.createDocument({
      documentCode: "DOC-4382",
      title: "Medical Report: Incident #4382",
      content: "On █████, a research assistant assigned to Lab-19 reported symptoms consistent with [DATA EXPUNGED]...",
      securityLevel: 0,
      medicalLevel: 2,
      adminLevel: 0,
      author: "Dr. [REDACTED]",
      hasImages: true,
      images: ["neural_scan.jpg"],
      relatedDocuments: [1, 3],
    });
    
    this.createDocument({
      documentCode: "DOC-9173",
      title: "Site Director's Memo",
      content: "All personnel are reminded that access to SCP-███ is restricted to those with proper clearance...",
      securityLevel: 0,
      medicalLevel: 0,
      adminLevel: 2,
      author: "Site Director",
      hasImages: false,
      images: [],
      relatedDocuments: [],
    });
    
    // Add initial credentials
    this.createCredential({
      username: "visitor_temporary",
      password: "guest123",
      displayName: "visitor_temporary",
      securityLevel: 0,
      medicalLevel: 0,
      adminLevel: 0,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isAdmin: insertUser.isAdmin || false,
        createdAt: new Date(),
        lastLogin: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentByCode(code: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.documentCode, code));
    return document;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getAccessibleDocuments(secLevel: number, medLevel: number, adminLevel: number): Promise<Document[]> {
    const allDocs = await db.select().from(documents);
    
    // Filter manually since SQL comparison with nullable fields can be tricky
    return allDocs.filter(doc => 
      (doc.securityLevel === null || doc.securityLevel <= secLevel) &&
      (doc.medicalLevel === null || doc.medicalLevel <= medLevel) &&
      (doc.adminLevel === null || doc.adminLevel <= adminLevel)
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    try {
      // Using the same field names as defined in the schema
      const [document] = await db
        .insert(documents)
        .values({
          title: insertDocument.title,
          documentCode: insertDocument.documentCode,
          content: insertDocument.content,
          securityLevel: insertDocument.securityLevel ?? 0,
          medicalLevel: insertDocument.medicalLevel ?? 0,
          adminLevel: insertDocument.adminLevel ?? 0,
          author: insertDocument.author,
          hasImages: insertDocument.hasImages ?? false,
          images: insertDocument.images ?? [],
          relatedDocuments: insertDocument.relatedDocuments ?? []
        })
        .returning();
      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = await this.getDocument(id);
    if (!existingDocument) return undefined;
    
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...documentData,
        revisionNumber: (existingDocument.revisionNumber || 0) + 1
      })
      .where(eq(documents.id, id))
      .returning();
    
    return updatedDocument;
  }

  // Credential operations
  async getCredential(id: number): Promise<Credential | undefined> {
    const [credential] = await db.select().from(credentials).where(eq(credentials.id, id));
    return credential;
  }

  async getCredentialByUsername(username: string): Promise<Credential | undefined> {
    const [credential] = await db.select().from(credentials).where(eq(credentials.username, username));
    return credential;
  }

  async getCredentials(): Promise<Credential[]> {
    return await db.select().from(credentials);
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const [credential] = await db
      .insert(credentials)
      .values({
        username: insertCredential.username,
        password: insertCredential.password,
        displayName: insertCredential.displayName,
        securityLevel: insertCredential.securityLevel ?? 0,
        medicalLevel: insertCredential.medicalLevel ?? 0,
        adminLevel: insertCredential.adminLevel ?? 0,
        isActive: true,
        discoveredAt: new Date()
      })
      .returning();
    return credential;
  }

  // User-Credential operations
  async getUserCredentials(userId: number): Promise<(Credential & { isSelected: boolean })[]> {
    const userCreds = await db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, userId));
    
    const result: (Credential & { isSelected: boolean })[] = [];
    
    for (const uc of userCreds) {
      const credential = await this.getCredential(uc.credentialId);
      if (credential) {
        result.push({ 
          ...credential, 
          isSelected: uc.isSelected === true // Convert null to false
        });
      }
    }
    
    return result;
  }

  async addCredentialToUser(insertUserCredential: InsertUserCredential): Promise<UserCredential> {
    const [userCredential] = await db
      .insert(userCredentials)
      .values({
        userId: insertUserCredential.userId,
        credentialId: insertUserCredential.credentialId,
        isSelected: insertUserCredential.isSelected || false
      })
      .returning();
    
    return userCredential;
  }

  async setSelectedCredential(userId: number, credentialId: number): Promise<UserCredential | undefined> {
    // First, unselect all credentials for this user
    await db
      .update(userCredentials)
      .set({ isSelected: false })
      .where(eq(userCredentials.userId, userId));
    
    // Then, select the specified credential
    const [updatedUserCredential] = await db
      .update(userCredentials)
      .set({ isSelected: true })
      .where(
        and(
          eq(userCredentials.userId, userId),
          eq(userCredentials.credentialId, credentialId)
        )
      )
      .returning();
    
    return updatedUserCredential;
  }

  async checkIfCredentialObsolete(userId: number, newCredential: Credential): Promise<Credential | undefined> {
    const userCredentials = await this.getUserCredentials(userId);
    
    // Ensure we have values and not null for comparison
    const newSecLevel = newCredential.securityLevel || 0;
    const newMedLevel = newCredential.medicalLevel || 0;
    const newAdminLevel = newCredential.adminLevel || 0;
    
    // Check if there's an existing credential that is made obsolete by the new one
    return userCredentials.find(existingCred => {
      const existSecLevel = existingCred.securityLevel || 0;
      const existMedLevel = existingCred.medicalLevel || 0;
      const existAdminLevel = existingCred.adminLevel || 0;
      
      return existSecLevel <= newSecLevel &&
             existMedLevel <= newMedLevel &&
             existAdminLevel <= newAdminLevel &&
             (existSecLevel < newSecLevel ||
              existMedLevel < newMedLevel ||
              existAdminLevel < newAdminLevel);
    });
  }

  async removeCredentialFromUser(userId: number, credentialId: number): Promise<boolean> {
    // Check if the credential exists for this user
    const userCreds = await db
      .select()
      .from(userCredentials)
      .where(
        and(
          eq(userCredentials.userId, userId),
          eq(userCredentials.credentialId, credentialId)
        )
      );
    
    if (userCreds.length === 0) {
      return false;
    }
    
    // Delete the credential
    await db
      .delete(userCredentials)
      .where(
        and(
          eq(userCredentials.userId, userId),
          eq(userCredentials.credentialId, credentialId)
        )
      );
    
    return true;
  }
}

export const storage = new DatabaseStorage();
