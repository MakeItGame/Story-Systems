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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private credentials: Map<number, Credential>;
  private userCredentials: Map<number, UserCredential>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentCredentialId: number;
  private currentUserCredentialId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.credentials = new Map();
    this.userCredentials = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentCredentialId = 1;
    this.currentUserCredentialId = 1;
    
    // Initialize with sample data
    this.initializeData();
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
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: insertUser.isAdmin || false, // Make sure isAdmin is set
      createdAt: new Date(), 
      lastLogin: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByCode(code: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.documentCode === code
    );
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getAccessibleDocuments(secLevel: number, medLevel: number, adminLevel: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => 
        doc.securityLevel <= secLevel &&
        doc.medicalLevel <= medLevel &&
        doc.adminLevel <= adminLevel
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      revisionNumber: 1
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = await this.getDocument(id);
    if (existingDocument) {
      const updatedDocument = { 
        ...existingDocument, 
        ...document, 
        updatedAt: new Date(),
        revisionNumber: existingDocument.revisionNumber + 1
      };
      this.documents.set(id, updatedDocument);
      return updatedDocument;
    }
    return undefined;
  }

  // Credential operations
  async getCredential(id: number): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }

  async getCredentialByUsername(username: string): Promise<Credential | undefined> {
    return Array.from(this.credentials.values()).find(
      (cred) => cred.username === username
    );
  }

  async getCredentials(): Promise<Credential[]> {
    return Array.from(this.credentials.values());
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const id = this.currentCredentialId++;
    const credential: Credential = { 
      ...insertCredential, 
      id, 
      isActive: true,
      discoveredAt: new Date()
    };
    this.credentials.set(id, credential);
    return credential;
  }

  // User-Credential operations
  async getUserCredentials(userId: number): Promise<(Credential & { isSelected: boolean })[]> {
    const userCredentialEntries = Array.from(this.userCredentials.values()).filter(
      (uc) => uc.userId === userId
    );
    
    return Promise.all(
      userCredentialEntries.map(async (uc) => {
        const credential = await this.getCredential(uc.credentialId);
        if (credential) {
          return { ...credential, isSelected: uc.isSelected };
        }
        throw new Error(`Credential with id ${uc.credentialId} not found`);
      })
    );
  }

  async addCredentialToUser(insertUserCredential: InsertUserCredential): Promise<UserCredential> {
    const id = this.currentUserCredentialId++;
    const userCredential: UserCredential = { ...insertUserCredential, id };
    this.userCredentials.set(id, userCredential);
    return userCredential;
  }

  async setSelectedCredential(userId: number, credentialId: number): Promise<UserCredential | undefined> {
    // First, unselect all credentials for this user
    const userCredentialEntries = Array.from(this.userCredentials.values())
      .filter((uc) => uc.userId === userId);
    
    for (const uc of userCredentialEntries) {
      this.userCredentials.set(uc.id, { ...uc, isSelected: false });
    }
    
    // Then, select the specified credential
    const targetUserCredential = userCredentialEntries.find(
      (uc) => uc.credentialId === credentialId
    );
    
    if (targetUserCredential) {
      const updatedUserCredential = { ...targetUserCredential, isSelected: true };
      this.userCredentials.set(targetUserCredential.id, updatedUserCredential);
      return updatedUserCredential;
    }
    
    return undefined;
  }

  async checkIfCredentialObsolete(userId: number, newCredential: Credential): Promise<Credential | undefined> {
    const userCredentials = await this.getUserCredentials(userId);
    
    // Check if there's an existing credential that is made obsolete by the new one
    return userCredentials.find(existingCred => 
      existingCred.securityLevel <= newCredential.securityLevel &&
      existingCred.medicalLevel <= newCredential.medicalLevel &&
      existingCred.adminLevel <= newCredential.adminLevel &&
      (
        existingCred.securityLevel < newCredential.securityLevel ||
        existingCred.medicalLevel < newCredential.medicalLevel ||
        existingCred.adminLevel < newCredential.adminLevel
      )
    );
  }

  async removeCredentialFromUser(userId: number, credentialId: number): Promise<boolean> {
    const userCredentialEntries = Array.from(this.userCredentials.entries())
      .filter(([_, uc]) => uc.userId === userId && uc.credentialId === credentialId);
    
    if (userCredentialEntries.length > 0) {
      for (const [id, _] of userCredentialEntries) {
        this.userCredentials.delete(id);
      }
      return true;
    }
    
    return false;
  }
}

export const storage = new MemStorage();
