import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

import { db, entriesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const { date, habitId } = req.query;
  const conditions = [];
  if (date && typeof date === "string") {
    conditions.push(eq(entriesTable.date, date));
  }
  if (habitId) {
    const hid = parseInt(String(habitId), 10);
    if (!isNaN(hid)) conditions.push(eq(entriesTable.habitId, hid));
  }
  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(entriesTable)
          .where(and(...conditions))
      : await db.select().from(entriesTable);
  res.json(rows);
});

router.post("/entries", async (req, res): Promise<void> => {
  const { habitId, date, status, actual } = req.body;
  if (!habitId || !date) {
    res.status(400).json({ error: "habitId and date are required" });
    return;
  }
  const hid = parseInt(String(habitId), 10);
  if (isNaN(hid)) {
    res.status(400).json({ error: "Invalid habitId" });
    return;
  }
  const [entry] = await db
    .insert(entriesTable)
    .values({
      habitId: hid,
      date: String(date),
      status: String(status || "pending"),
      actual: String(actual || ""),
    })
    .onConflictDoUpdate({
      target: [entriesTable.habitId, entriesTable.date],
      set: {
        status: String(status || "pending"),
        actual: String(actual || ""),
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json(entry);
});

router.delete("/entries/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(entriesTable).where(eq(entriesTable.id, id));
  res.sendStatus(204);
});

export default router;
