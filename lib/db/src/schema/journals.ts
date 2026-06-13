import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const journalsTable = pgTable("journals", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull().unique(),
  wakeUpTime: text("wake_up_time").notNull().default(""),
  notes: text("notes").notNull().default(""),
  wins: text("wins").notNull().default(""),
  challenges: text("challenges").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertJournalSchema = createInsertSchema(journalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Journal = typeof journalsTable.$inferSelect;
