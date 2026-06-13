import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

import { db, journalsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/journals/:date", async (req, res): Promise<void> => {
  const date = Array.isArray(req.params.date)
    ? req.params.date[0]
    : req.params.date;
  const [journal] = await db
    .select()
    .from(journalsTable)
    .where(eq(journalsTable.date, date));
  if (!journal) {
    res.status(404).json({ error: "Journal not found" });
    return;
  }
  res.json(journal);
});

router.put("/journals/:date", async (req, res): Promise<void> => {
  const date = Array.isArray(req.params.date)
    ? req.params.date[0]
    : req.params.date;
  const { wakeUpTime, notes, wins, challenges } = req.body;
  const values = {
    date,
    wakeUpTime: wakeUpTime != null ? String(wakeUpTime) : "",
    notes: notes != null ? String(notes) : "",
    wins: wins != null ? String(wins) : "",
    challenges: challenges != null ? String(challenges) : "",
  };
  const [journal] = await db
    .insert(journalsTable)
    .values(values)
    .onConflictDoUpdate({
      target: journalsTable.date,
      set: {
        wakeUpTime: values.wakeUpTime,
        notes: values.notes,
        wins: values.wins,
        challenges: values.challenges,
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json(journal);
});

export default router;
