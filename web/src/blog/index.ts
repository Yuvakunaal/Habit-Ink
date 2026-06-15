import type { BlogPost } from "./types";
import { howToBuildAHabit } from "./posts/how-to-build-a-habit";
import { sixtyDayHabitChallenge } from "./posts/66-day-habit-challenge";
import { habitJournalVsTracker } from "./posts/habit-journal-vs-tracker";
import { habitStreakPsychology } from "./posts/habit-streak-psychology";
import { morningRoutineHabits } from "./posts/morning-routine-habits";
import { freeHabitTracker2026 } from "./posts/free-habit-tracker-2026";

export const ALL_POSTS: BlogPost[] = [
  freeHabitTracker2026,
  morningRoutineHabits,
  habitStreakPsychology,
  habitJournalVsTracker,
  sixtyDayHabitChallenge,
  howToBuildAHabit,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find(p => p.slug === slug);
}

export function getRelatedPosts(current: BlogPost, count = 3): BlogPost[] {
  const sameCategory = ALL_POSTS.filter(
    p => p.slug !== current.slug && p.category === current.category,
  );
  const others = ALL_POSTS.filter(
    p => p.slug !== current.slug && p.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}

export const ALL_CATEGORIES = Array.from(new Set(ALL_POSTS.map(p => p.category)));

export type { BlogPost };
