import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

import { db, habitsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/habits", async (req, res): Promise<void> => {
  const habits = await db
    .select()
    .from(habitsTable)
    .orderBy(habitsTable.createdAt);
  res.json(habits);
});

router.post("/habits", async (req, res): Promise<void> => {
  const { name, type, target, schedule, customDays, startDate, emoji, color } =
    req.body;
  if (!name || !startDate) {
    res.status(400).json({ error: "name and startDate are required" });
    return;
  }
  const [habit] = await db
    .insert(habitsTable)
    .values({
      name: String(name),
      type: String(type || "yesno"),
      target: String(target || ""),
      schedule: String(schedule || "daily"),
      customDays: customDays ? String(customDays) : null,
      startDate: String(startDate),
      emoji: String(emoji || "✅"),
      color: String(color || "#2B3A8C"),
    })
    .returning();
  res.status(201).json(habit);
});

router.put("/habits/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { name, type, target, schedule, customDays, emoji, color } = req.body;
  const updates: Record<string, unknown> = {};
  if (name != null) updates.name = String(name);
  if (type != null) updates.type = String(type);
  if (target != null) updates.target = String(target);
  if (schedule != null) updates.schedule = String(schedule);
  if (customDays !== undefined)
    updates.customDays = customDays ? String(customDays) : null;
  if (emoji != null) updates.emoji = String(emoji);
  if (color != null) updates.color = String(color);

  const [habit] = await db
    .update(habitsTable)
    .set(updates)
    .where(eq(habitsTable.id, id))
    .returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.json(habit);
});

router.delete("/habits/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(habitsTable).where(eq(habitsTable.id, id));
  res.sendStatus(204);
});

export default router;
