import {
  users,
  eloEntries,
  dailyGoals,
  courses,
  goals,
  gameAnalyses,
  type User,
  type InsertUser,
  type EloEntry,
  type InsertEloEntry,
  type DailyGoal,
  type InsertDailyGoal,
  type Course,
  type InsertCourse,
  type Goal,
  type InsertGoal,
  type GameAnalysis,
  type InsertGameAnalysis,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // ELO methods
  getEloEntries(userId: number): Promise<EloEntry[]>;
  createEloEntry(entry: InsertEloEntry): Promise<EloEntry>;
  getEloStats(userId: number, period: "week" | "month" | "year"): Promise<{
    change: number;
    entries: EloEntry[];
  }>;

  // Daily Goals methods
  getDailyGoals(userId: number): Promise<DailyGoal[]>;
  createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal>;
  updateDailyGoal(id: number, updates: Partial<DailyGoal>): Promise<DailyGoal | undefined>;
  deleteDailyGoal(id: number): Promise<boolean>;

  // Courses methods
  getCourses(userId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Goals methods
  getGoals(userId: number, type?: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Game Analysis methods
  getGameAnalyses(userId: number): Promise<GameAnalysis[]>;
  createGameAnalysis(analysis: InsertGameAnalysis): Promise<GameAnalysis>;
  getGameAnalysis(id: number): Promise<GameAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private eloEntries: Map<number, EloEntry>;
  private dailyGoals: Map<number, DailyGoal>;
  private courses: Map<number, Course>;
  private goals: Map<number, Goal>;
  private gameAnalyses: Map<number, GameAnalysis>;
  private currentUserId: number;
  private currentEloId: number;
  private currentDailyGoalId: number;
  private currentCourseId: number;
  private currentGoalId: number;
  private currentGameAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.eloEntries = new Map();
    this.dailyGoals = new Map();
    this.courses = new Map();
    this.goals = new Map();
    this.gameAnalyses = new Map();
    this.currentUserId = 1;
    this.currentEloId = 1;
    this.currentDailyGoalId = 1;
    this.currentCourseId = 1;
    this.currentGoalId = 1;
    this.currentGameAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEloEntries(userId: number): Promise<EloEntry[]> {
    return Array.from(this.eloEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createEloEntry(insertEntry: InsertEloEntry): Promise<EloEntry> {
    const entry: EloEntry = {
      ...insertEntry,
      id: this.currentEloId++,
    };
    this.eloEntries.set(entry.id, entry);
    
    // Update user's current ELO
    const user = this.users.get(entry.userId);
    if (user) {
      const newElo = user.currentElo + entry.eloChange;
      await this.updateUser(entry.userId, {
        currentElo: newElo,
        peakElo: Math.max(user.peakElo, newElo),
      });
    }
    
    return entry;
  }

  async getEloStats(userId: number, period: "week" | "month" | "year"): Promise<{
    change: number;
    entries: EloEntry[];
  }> {
    const now = new Date();
    const cutoff = new Date();
    
    switch (period) {
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const entries = Array.from(this.eloEntries.values())
      .filter(entry => entry.userId === userId && entry.date >= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const change = entries.reduce((sum, entry) => sum + entry.eloChange, 0);
    
    return { change, entries };
  }

  async getDailyGoals(userId: number): Promise<DailyGoal[]> {
    return Array.from(this.dailyGoals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createDailyGoal(insertGoal: InsertDailyGoal): Promise<DailyGoal> {
    const goal: DailyGoal = {
      ...insertGoal,
      id: this.currentDailyGoalId++,
      createdAt: new Date(),
    };
    this.dailyGoals.set(goal.id, goal);
    return goal;
  }

  async updateDailyGoal(id: number, updates: Partial<DailyGoal>): Promise<DailyGoal | undefined> {
    const goal = this.dailyGoals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.dailyGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteDailyGoal(id: number): Promise<boolean> {
    return this.dailyGoals.delete(id);
  }

  async getCourses(userId: number): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const course: Course = {
      ...insertCourse,
      id: this.currentCourseId++,
      createdAt: new Date(),
    };
    this.courses.set(course.id, course);
    return course;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getGoals(userId: number, type?: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && (!type || goal.type === type))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const goal: Goal = {
      ...insertGoal,
      id: this.currentGoalId++,
      createdAt: new Date(),
    };
    this.goals.set(goal.id, goal);
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async getGameAnalyses(userId: number): Promise<GameAnalysis[]> {
    return Array.from(this.gameAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createGameAnalysis(insertAnalysis: InsertGameAnalysis): Promise<GameAnalysis> {
    const analysis: GameAnalysis = {
      ...insertAnalysis,
      id: this.currentGameAnalysisId++,
      createdAt: new Date(),
    };
    this.gameAnalyses.set(analysis.id, analysis);
    return analysis;
  }

  async getGameAnalysis(id: number): Promise<GameAnalysis | undefined> {
    return this.gameAnalyses.get(id);
  }
}

export const storage = new MemStorage();
