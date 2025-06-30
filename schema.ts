import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  currentElo: integer("current_elo").notNull().default(1200),
  peakElo: integer("peak_elo").notNull().default(1200),
  profileComplete: boolean("profile_complete").notNull().default(false),
  settings: json("settings").$type<{
    showEngineArrows: boolean;
    engineDepth: number;
    preferredEngine: string;
    sidebarCollapsed: boolean;
  }>().default({
    showEngineArrows: true,
    engineDepth: 15,
    preferredEngine: "stockfish17",
    sidebarCollapsed: false,
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eloEntries = pgTable("elo_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eloChange: integer("elo_change").notNull(),
  newElo: integer("new_elo").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
});

export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  repeatDays: json("repeat_days").$type<string[]>().default([]), // ["monday", "tuesday", etc.]
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  totalLessons: integer("total_lessons").notNull().default(0),
  completedLessons: integer("completed_lessons").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "weekly", "monthly", "yearly"
  completed: boolean("completed").notNull().default(false),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameAnalyses = pgTable("game_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pgnData: text("pgn_data").notNull(),
  whitePlayer: text("white_player"),
  blackPlayer: text("black_player"),
  result: text("result"),
  date: timestamp("date"),
  analysis: json("analysis").$type<{
    moves: Array<{
      move: string;
      evaluation: number;
      classification: string;
      bestMove?: string;
    }>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEloEntrySchema = createInsertSchema(eloEntries).omit({
  id: true,
});

export const insertDailyGoalSchema = createInsertSchema(dailyGoals).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertGameAnalysisSchema = createInsertSchema(gameAnalyses).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EloEntry = typeof eloEntries.$inferSelect;
export type InsertEloEntry = z.infer<typeof insertEloEntrySchema>;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type GameAnalysis = typeof gameAnalyses.$inferSelect;
export type InsertGameAnalysis = z.infer<typeof insertGameAnalysisSchema>;
