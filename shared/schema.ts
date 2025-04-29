import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentCode: text("document_code").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  securityLevel: integer("security_level").default(0),
  medicalLevel: integer("medical_level").default(0),
  adminLevel: integer("admin_level").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  author: text("author"),
  revisionNumber: integer("revision_number").default(1),
  hasImages: boolean("has_images").default(false),
  images: json("images").$type<string[]>(),
  relatedDocuments: json("related_documents").$type<number[]>(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  documentCode: true,
  title: true,
  content: true,
  securityLevel: true,
  medicalLevel: true,
  adminLevel: true,
  author: true,
  hasImages: true,
  images: true,
  relatedDocuments: true,
});

// In-Game Credentials schema
export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  securityLevel: integer("security_level").default(0),
  medicalLevel: integer("medical_level").default(0),
  adminLevel: integer("admin_level").default(0),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  discoveredAt: timestamp("discovered_at").defaultNow().notNull(),
});

export const insertCredentialSchema = createInsertSchema(credentials).pick({
  username: true,
  password: true,
  displayName: true,
  securityLevel: true,
  medicalLevel: true,
  adminLevel: true,
  notes: true,
});

// User-Credentials relation schema
export const userCredentials = pgTable("user_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  credentialId: integer("credential_id").notNull(),
  isSelected: boolean("is_selected").default(false),
});

export const insertUserCredentialSchema = createInsertSchema(userCredentials).pick({
  userId: true,
  credentialId: true,
  isSelected: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;

export type InsertUserCredential = z.infer<typeof insertUserCredentialSchema>;
export type UserCredential = typeof userCredentials.$inferSelect;
