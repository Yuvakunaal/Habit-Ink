# Habit Ink — 30-Day Launch Plan

## My Understanding of the Product

**What it is:** A free web app that combines a daily habit tracker and a personal journal in one place. No download. Sign in with Google. Works on all devices.

**The core insight that makes it different:** Every other habit app separates the check (what you did) from the why (how it felt, what got in the way). Habit Ink puts them on the same screen, on the same day. After 30 days, you don't just have a streak — you have a record of the patterns behind it.

**Strongest features:**
- 5 habit types (yes/no, number, decimal, time, custom) with schedule flexibility
- Built-in daily journal with 4 rotating fields (intention, notes, wins, challenges)
- Streak milestones at 7/14/30/60/100/200/365 days with confetti
- Groups: realtime chat, shared challenges, leaderboards, nudges, cheers
- Calendar heatmap + weekly bar charts + per-habit analytics
- 5 complete themes, 2 font styles, PWA-installable
- CSV export, keyboard shortcuts, offline banner
- 100% free forever. No ads. No paywalls. No upsells.

**Target audience (primary):** People who already journal and want their habit tracking connected to it. People who've failed at habit apps and want to understand why. Students and professionals building routines. People frustrated by freemium habit apps.

**Target audience (secondary):** Friend groups who want shared accountability (Groups feature). Productivity and self-improvement communities.

**What makes it different from competitors:**
1. Habit tracker + journal fused — not two separate apps
2. Truly free forever (not "free plan with limits")
3. Web-first, no download required
4. Groups with realtime chat + challenges (rare combo)
5. Design-first: 5 hand-crafted themes, feels personal

**Weaknesses to be aware of:**
- No mobile push notifications (web PWA limitation)
- No health app integrations (Apple Health, Fitbit)
- Only 18 habit templates
- No per-week frequency goals (e.g., "3x per week")

---

## Constraints

- Solo founder
- Very little budget
- Reddit karma: ~30 (can't post in most large subreddits yet)
- Can spend time on content
- Will follow instructions directly

## Strategy Overview

- **Week 1:** Launch blast across LinkedIn, Hacker News, Twitter, Reddit (low-karma safe)
- **Week 2:** Content marketing — share blog posts, build Reddit karma through comments, Discord communities
- **Week 3:** Community infiltration — Reddit (karma built up), Facebook groups, journaling communities
- **Week 4:** Product Hunt launch (biggest single-day spike) + consolidation

---

## Day-by-Day Plan

---

### DAY 1 — Launch Day

**Goal:** First 50 signups. Hit warm network first, then cold tech audience.

---

#### POST 1 — LinkedIn (publish at 8:30am your time)

**Type:** Text-only post (no image — LinkedIn gives text posts 40% more reach than image posts)

**Exact post:**
```
I just launched something I've been building for myself — now it's free for everyone.

I kept two separate apps for years: one to track habits, one to journal. But the check (what I did) and the note (why I did or didn't) belong together. Separating them meant I could see my streaks but never understand the patterns behind them.

So I built Habit Ink.

One web app. No download. Sign in with Google. Done.

Here's what it does:
→ Track any habit: yes/no, steps, km, pages, hours, or any custom text
→ Log your daily intention, wins, challenges, and notes alongside your habits
→ Watch your streak build with milestone celebrations at 7, 14, 30, 60, 100, 365 days
→ See everything in a calendar heatmap and weekly charts
→ Create groups with friends — shared challenges, realtime chat, daily nudges, leaderboards

It's completely free. Forever. No subscription. No ads. No paywall. I mean it.

After 30 days of using it myself, the journal entries revealed exactly why I kept breaking the same habits. Not willpower. Patterns. Always the same day of the week. Always the same circumstance.

Try it here → https://habitink.vercel.app

What habit are you trying to build right now? Drop it in the comments 👇
```

**Engagement tactic:** Reply to every single comment within 1 hour. Ask a follow-up question to each person. This tells LinkedIn the post is performing and boosts reach.

---

#### POST 2 — Hacker News (publish at 9:00am your time)

**Type:** Show HN post

**Title:**
```
Show HN: Habit Ink – Free habit tracker with built-in daily journal (no download)
```

**URL:** https://habitink.vercel.app

**Post your own first comment immediately after submitting:**
```
Hey HN! I built Habit Ink because I was tired of switching between a habit tracker and a separate journal app.

The insight: checking a box tells you what happened. Writing about it tells you why. Put them together on the same screen, on the same day, and after a month you can see the patterns behind your habits — not just the numbers.

Tech stack: Vite + React + TypeScript on the frontend, Supabase for auth and database (PostgreSQL + Realtime), deployed on Vercel. No native app — fully PWA-installable.

What it does:
- 5 habit types: yes/no, number (integer), decimal, time, custom text
- Flexible schedules: daily, weekdays, weekends, alternate, or custom days
- Daily journal: 4 fields (intention, notes, wins/reflections, challenges) with rotating daily prompts
- Streak milestones at 7/14/30/60/100/200/365 days
- Calendar heatmap, 15-week GitHub-style heatmap, weekly bar charts, per-habit analytics
- Groups: realtime chat, shared challenges with leaderboards, nudges, emoji reactions
- 5 complete themes, 2 font styles, 3 text sizes, CSV data export
- Keyboard shortcuts on desktop

It's free forever. Passion project, no plans to monetize. Would genuinely love feedback on what's confusing or what's missing.
```

**HN tip:** Don't re-submit if it doesn't hit the front page. Comment on other Show HN posts that day to get noticed and build goodwill.

---

#### POST 3 — Twitter / X (publish at 10:00am your time)

**Type:** Single launch tweet

**Exact tweet:**
```
Just launched Habit Ink 🖊

A free habit tracker + daily journal in one web app.
No download. Sign in with Google in one click.

After 30 days of journaling alongside my habits, I could see exactly WHY I kept failing the same ones.

Free forever → habitink.vercel.app

#buildinpublic #indiehacker #productivityapp
```

**Then reply to your own tweet:**
```
Key features:
→ 5 habit types (yes/no, steps, km, pages, time, custom)
→ 4-field daily journal (intention, notes, wins, challenges)
→ Groups with realtime chat + shared challenges
→ Calendar heatmap, streaks, milestones
→ 5 themes, PWA-installable
→ 100% free forever
```

---

### DAY 2

**Goal:** Reach the builder community. Get first outside-network feedback.

---

#### POST 1 — Reddit r/SideProject (safe with 30 karma)

**Type:** Text post

**Title:**
```
I built a free habit tracker with built-in daily journaling — would love honest feedback
```

**Exact post:**
```
Hey r/SideProject!

Just launched Habit Ink (habitink.vercel.app) — a web app that combines habit tracking and daily journaling in one view.

The problem I was solving: I had a habit tracker and a separate journal. But the check (what I did) and the note (why I did or didn't) belong together. Separating them meant I tracked streaks but never understood the patterns behind them.

What it does:
- Track any habit: yes/no, numeric, decimal, time, or custom text
- Daily journal with 4 fields (intention, notes, wins, challenges) + rotating daily prompts
- Streaks with milestones at 7, 14, 30, 60, 100, 365 days
- Calendar heatmap + weekly charts + per-habit analytics
- Groups with realtime chat, shared challenges, member leaderboards, nudges
- 5 themes, PWA-installable, CSV export

Tech: Vite + React + TypeScript + Supabase + Vercel

Completely free. No paywalls, no subscription, no ads. I have no plans to monetize it.

Honest feedback welcome — especially anything that's confusing on first use, or features you'd expect that aren't there.
```

---

#### POST 2 — Twitter (engage the build-in-public community)

**Type:** Reply tweet + tagging

Search Twitter for #buildinpublic and #indiehacker posts from today. Leave genuine comments on 5-10 other builders' posts. Then post:

```
Day 2 of launching Habit Ink.

Yesterday: posted on LinkedIn, HN, and Twitter.
Today: first people from outside my network signed up.

The feedback so far: "I didn't know I wanted a habit tracker and journal in one app until I saw it."

That's the validation I needed.

habitink.vercel.app
```

---

### DAY 3

**Goal:** Show product depth. Convert curious visitors into users.

---

#### POST 1 — Twitter Thread (publish at 9am)

**Type:** 8-tweet feature walkthrough thread

**Exact thread:**

Tweet 1:
```
I've been using Habit Ink every single day. Here's everything it actually does (🧵 thread):
```

Tweet 2:
```
The Today screen is the whole product.

Top half: your habits with one-tap toggles and actual value logging.
Bottom half: your daily journal with 4 fields.

Everything on one scroll. No tab switching between tracker and journal.
```

Tweet 3:
```
5 habit types so you can track anything:

• Yes/No → meditate, cold shower, no phone before 9am
• Number → 10,000 steps, 8 glasses of water, 20 pages
• Decimal → 5.2 km run, 7.5 hours sleep
• Time → wake up at 7:00am, 45 min deep work
• Custom → which chapter, which workout, what you ate

Every type logs actual vs target.
```

Tweet 4:
```
The journal has 4 fields every day:

1. Intention — one sentence to anchor your morning
2. Notes — open reflection
3. Wins — what went well
4. Challenges — what held you back

7 rotating prompt sets (one per day of week) so it never feels stale after a month.
```

Tweet 5:
```
Streaks with milestone celebrations.

7 days. 14. 30. 60. 100. 200. 365.

Each one gets a toast notification.
Hit 100% on all your habits for the day → confetti.

15-week GitHub-style heatmap shows momentum at a glance.
```

Tweet 6:
```
Groups is where it gets interesting.

Create a group → set a shared challenge → compete with friends on a live leaderboard.

Real-time chat. Nudge friends who haven't checked in. Cheer those who have.
Emoji reactions on messages. Full challenge history.
```

Tweet 7:
```
5 complete themes: Cream, Midnight, Forest, Rose, Slate.
2 font styles: Handwritten (Caveat) or Clean (Inter).
3 text sizes.

Works on every device. PWA-installable. CSV export. Keyboard shortcuts on desktop.
```

Tweet 8:
```
It's completely free.

No subscription. No paywalls. No ads. No "upgrade for streaks."

Sign in with Google in one click → habitink.vercel.app

What habit are you tracking right now? 👇
```

---

### DAY 4

**Goal:** Hit the productivity/self-improvement audience on LinkedIn with a story, not a product pitch.

---

#### POST 1 — LinkedIn (publish at 8:30am)

**Type:** Insight post. Don't mention the product until the very end.

**Exact post:**
```
I used 6 different habit apps over 3 years. None of them worked.

Not because the apps were bad. Because I never understood WHY I kept breaking the same habits.

Every app showed me what I did.
None showed me why.

The checkboxes said: "missed Monday. Missed again Thursday. Missed twice last week."

But the pattern said something different: "always breaking at 9pm when you're exhausted. Always breaking on high-stress Mondays. Always breaking when you skipped lunch."

I couldn't see the second part because my journal was in a different app, disconnected from the tracking. The insight that would have saved me was sitting 2 taps away, invisible.

So I changed the question.

Instead of "did I do it?" I started asking "what was happening when I didn't?"

That changed everything. Within 30 days I had the real picture — not a streak counter, but a record of the exact conditions that made each habit stick or break.

If you're struggling with the same habits on repeat, the data is already there. You just need to connect the dots.

(I built an app that does this, if you're curious: habitink.vercel.app — it's free)
```

---

### DAY 5

**Goal:** Build Reddit karma. This is unglamorous but essential. Do NOT post anything. Only comment.

---

#### KARMA BUILDING — Reddit Comment Strategy

Go to these subreddits and find posts where people are asking for help, advice, or recommendations. Leave genuinely helpful comments — 2 to 4 paragraphs of real value. Do not mention Habit Ink unless directly asked.

**Subreddits to comment in:**
- r/productivity (find posts like "struggling to build habits", "what habit tracker do you use")
- r/selfimprovement (find posts about habit struggles, morning routines)
- r/getdisciplined (find posts asking "how do I stay consistent")
- r/NoSurf (find posts about digital habits)
- r/bulletjournal (find posts about habit tracking in bujo)

**Example helpful comment (in a thread like "I can't stick to my habits, what am I doing wrong?"):**
```
The most underrated thing: track WHY you missed, not just that you missed. 

Most habit apps only show you what happened (the check or the X). They don't help you record what was going on when you failed — were you tired? stressed? skipped lunch? The pattern that's breaking your habit is almost always there in the context, but if you're not capturing it you'll just see "I missed again" with no signal about what to fix.

The two-minute rule from Atomic Habits is also worth trying — scale your habit down until it's almost impossible to fail. "Read 20 pages" becomes "read 1 page." Once you're in the chair with the book, you'll usually go further anyway. The goal is to make starting trivially easy.

Also: never miss twice. Missing once is an accident. Missing twice is the start of a new (bad) habit. The no-miss-twice rule removes the shame spiral that kills most streaks.
```

**Target:** Leave 10 genuine comments across these subreddits today. Your karma will increase by 20-50 points depending on upvotes.

---

### DAY 6

**Goal:** Visual content for Instagram and the journaling community.

---

#### POST 1 — Instagram (publish at 11am)

**Type:** Screenshot or screen recording of the Today screen

**Caption:**
```
Most habit apps show you what you did. 🗂

Habit Ink shows you why. 📓

→ Track any habit (steps, pages, km, hours, yes/no)
→ Log your intention, wins, challenges, and notes on the same screen
→ Build streaks with milestone celebrations
→ Do challenges with friends in realtime

All free. No download. Sign in with Google.

Link in bio → habitink.vercel.app

#habittracker #dailyjournal #selfimprovement #habitbuilding #productivityapp #streaks #morningroutine #journaling #freeapp #habitink #productivity #selfcare #mindfulness #goalsetting #dailyroutine
```

---

#### POST 2 — Reddit r/webdev (safe with low karma — builders post here)

**Type:** Text post

**Title:**
```
Built a PWA habit tracker + journal with Vite + Supabase — sharing what I learned
```

**Exact post:**
```
Hey r/webdev, just launched Habit Ink (habitink.vercel.app) and wanted to share some things I learned building it.

Stack: Vite + React + TypeScript, Supabase (Postgres + Auth + Realtime), Vercel. No native app — fully PWA with a manifest and service worker.

A few things that were trickier than I expected:

1. Supabase Realtime with a 100-message sliding window — I had to write logic that deletes the oldest message when the 101st is inserted, and handle the optimistic UI case where the message appears instantly but gets rolled back silently if the write fails.

2. Making a debounced auto-save feel instant — I settled on 800ms debounce for journal fields. Below 500ms it spammed writes, above 1000ms it felt laggy. Had to handle the case where the user navigates away mid-debounce and flush the save.

3. Drag to reorder on desktop with persistent ordering — used a ref to track order, wrote it to Supabase on drop, but had to be careful about optimistic updates clashing with Realtime subscriptions on the same table.

4. Calendar heatmap on mobile — the 15-week horizontal scroll had to handle touch events and avoid conflicting with page scroll. Did this with CSS overflow-x: auto and touch-action: pan-x.

Happy to go deeper on any of these if anyone's curious. And if you want to poke at the app itself, it's at habitink.vercel.app — free, sign in with Google.
```

---

### DAY 7

**Goal:** Weekly reflection post. Keep momentum. Show you're building in public.

---

#### POST 1 — LinkedIn (publish 8:30am)

**Type:** "One week in" honest reflection

**Exact post:**
```
One week since I launched Habit Ink. Here's what actually happened.

The good:
→ People signed up from 3 different countries (I only expected my LinkedIn network)
→ The most common reaction: "I didn't know I wanted a habit tracker and journal in one app until I saw it"
→ Hacker News and Reddit gave me the most honest feedback I've ever received

The surprising:
→ The groups feature resonated way more than I expected. Multiple people asked if they could start a group with their friends immediately after signing up
→ People care about "free forever" more than I thought. It came up in almost every positive comment

The feedback I need to think about:
→ People want reminders. Push notifications on a web app are limited — this is a real gap
→ "Can I import my data from [other app]?" was asked a lot

Still free. Still building. Still learning.

habitink.vercel.app
```

---

#### POST 2 — Twitter

**Type:** Week-in-numbers post

```
Week 1 of Habit Ink in numbers:

📊 [X] people signed up
🌍 [X] countries
💬 [X] pieces of feedback
🔧 [X] things I'm fixing based on feedback

The thing that surprised me most: the journaling angle. Half the people who signed up said they'd kept a habit tracker and a separate journal for years and never thought to combine them.

That's the product right there.

habitink.vercel.app
```

---

### DAY 8

**Goal:** Start sharing blog content. These posts bring SEO traffic AND provide shareable content that doesn't feel promotional.

---

#### POST 1 — LinkedIn (share blog post)

**Type:** Article teaser with a link to your blog

**Exact post:**
```
21 days is not enough to build a habit.

The most cited habit research — "it takes 21 days" — was misquoted from a 1960 plastic surgeon's observations about patients adjusting to nose jobs.

The actual research (UCL, 2009, 96 participants) found the average was 66 days. Range: 18 to 254 days depending on the person and the habit.

Here's what this means for you:
→ If you quit at day 21, you've just started
→ Harder habits (exercise) take longer than simpler ones (drinking water with lunch)
→ Missing one day doesn't reset the clock — the study confirmed this explicitly

Full breakdown of the 66-day research and what it means week-by-week on the Habit Ink blog:
habitink.vercel.app/blog/66-day-habit-challenge

What habit are you on day [X] of right now?
```

---

#### POST 2 — Discord communities

**Type:** Personal introduction + share

Find and join these Discord servers:
- **Productivity & Self-Improvement Discord** (search for "productivity" on disboard.org)
- **Indie Hackers Discord** 
- **makers.so**
- **r/SideProject Discord**

In the #introductions or #share-your-project channel, post:
```
Hey everyone! I'm Kunaal, just launched Habit Ink (habitink.vercel.app) — a free web app that combines habit tracking and daily journaling in one place.

The idea: most habit apps show you what you did, not why. By logging your habits and your daily reflection (intention, wins, challenges) in the same view, patterns emerge after 30 days that you'd never see from checkboxes alone.

Free forever, no download, Google sign-in. Would love feedback from this community — what's missing, what's confusing, what would make you actually use it daily?
```

---

### DAY 9

**Goal:** Hit the journaling community. This is an underserved angle.

---

#### POST 1 — Reddit r/Journaling (check if karma is enough — usually needs ~50, you should be there by now)

**Title:**
```
I combined my habit tracker and journal into one app — sharing it free
```

**Exact post:**
```
Hey r/Journaling!

I built Habit Ink because I kept switching between a habit tracker app and a separate journal app, and the two were never connected.

The thing that bothered me: the most useful insight about why a habit sticks or breaks is in the journal entry from that day. But if the tracker and the journal are separate, that connection never forms.

Habit Ink puts them on the same screen, the same day. You check your habits at the top, and immediately below is your daily journal with four fields — intention, notes, wins and reflections, and challenges. The prompts rotate daily so it doesn't feel repetitive.

After 30 days of entries, you have both a habit history and a written record of what was happening on every day you succeeded or failed. The patterns become obvious.

It's free, no download, sign in with Google: habitink.vercel.app

For those of you who already journal daily — curious how you currently handle habit tracking alongside it? Do you do it in the same journal or separately?
```

---

#### POST 2 — Twitter

**Type:** Journaling angle tweet

```
The most useful thing about a habit journal isn't the habit tracking.

It's the sentence you write on the day you broke the streak.

That sentence — "I was exhausted from the meeting" or "I forgot because I worked late" — is the real data.

Habit Ink captures both. habitink.vercel.app
```

---

### DAY 10

**Goal:** Facebook groups — large untapped audience of self-improvement seekers.

---

#### Facebook Group Strategy

Join these groups (request to join if needed, takes 1-2 days for approval):
- "Habit Building and Tracking" groups (search Facebook)
- "Self Improvement" groups with 10k+ members
- "Morning Routine" groups
- "Bullet Journal" communities
- "Productivity Tips" groups

**Post to share (adapt tone for each group):**
```
I built something I wish had existed when I started trying to build habits — sharing it free because I think some of you will find it useful.

It's called Habit Ink. It's a web app (no download) that combines a habit tracker and a daily journal in one screen.

The idea is simple: most habit apps tell you what you did. The journal tells you why. Put them together and after 30 days you can see exactly which circumstances make your habits succeed or fail.

Features:
✅ Track any habit (yes/no, numeric, time, custom)
📓 4-field daily journal with rotating prompts
🔥 Streaks with milestone celebrations
📊 Calendar heatmap + weekly progress charts
👥 Groups for shared challenges and accountability
🎨 5 themes, works on all devices

100% free. Forever. No subscription. Sign in with Google.

habitink.vercel.app

Has anyone else found that writing about your habits is more useful than just tracking them?
```

---

### DAY 11

**Goal:** LinkedIn carousel — highest-engagement format on LinkedIn right now.

---

#### POST 1 — LinkedIn (publish 8:30am)

**Type:** Text post formatted as a "carousel" with numbered points — no actual image needed

**Exact post:**
```
5 things I learned after tracking habits daily for 6 months:

1/ Missing once is fine. Missing twice is a new habit.
The streak doesn't define you — your response to breaking it does. Every person who built a lasting habit has a "I missed twice" story. The ones who kept going just didn't let two become three.

2/ The journal entry on a missed day is worth more than 10 check marks.
"I skipped because I was traveling and didn't plan" tells you more about your system than a month of green checks.

3/ Hard habits break on soft days.
Stressed? Tired? Skipped lunch? These are the moments that reveal your habit's real strength. You won't know this unless you're writing it down.

4/ The 9pm habit always loses.
Any habit you set for the end of the day will eventually lose to exhaustion. Morning habits outlast evening habits by a wide margin.

5/ The habit you track and write about is the habit you keep.
Tracking creates accountability. Writing creates understanding. Both together create the pattern recognition you need to actually change.

I built Habit Ink around these five insights. Free at habitink.vercel.app.

Which of these hit closest to home for you?
```

---

### DAY 12

**Goal:** Build Reddit karma with one more comment day. You should be approaching 100 karma.

---

#### KARMA BUILDING — Reddit Day 2

Same as Day 5. Target these subreddits with helpful, detailed comments:
- r/productivity
- r/getdisciplined  
- r/selfimprovement
- r/habittracking (small but perfect audience)
- r/bulletjournal

Your goal: reach 100 karma by Day 14 so you can post in r/productivity and r/selfimprovement.

Today's angle for comments — look for posts about:
- "Best habit tracking app?" 
- "How do you stay consistent?"
- "Failed at my habit again"

Leave real advice. You can mention Habit Ink briefly at the end with "full disclosure, I built this" if it's relevant.

---

### DAY 13

**Goal:** Show the Groups feature. This is an underplayed differentiator.

---

#### POST 1 — LinkedIn (publish 8:30am)

**Type:** Feature spotlight

**Exact post:**
```
The feature I underestimated when I built it: Groups.

I built Groups for Habit Ink as an afterthought. "Accountability partners would be cool," I thought. So I added it.

What I didn't expect: it became the feature people talked about most.

Here's what Groups actually does:
→ Create a group with friends, colleagues, or anyone
→ Set a shared challenge (e.g., "Walk 8,000 steps daily for 30 days")
→ See a live leaderboard of who's completing each day
→ Real-time group chat with emoji reactions
→ Nudge friends who haven't checked in yet
→ Cheer people who have
→ See everyone's "Today's Pulse" — who's on track and who isn't

The thing I keep hearing: "I didn't stick to habits alone, but when my friends can see my streak, I do."

The accountability mechanic is the oldest habit trick in the book. I just put it where your daily tracking already is.

Free, no download: habitink.vercel.app
```

---

#### POST 2 — Twitter

```
Hot take: the best habit accountability partner isn't an app notification.

It's a friend who can see your streak.

That's why I built Groups into Habit Ink — realtime challenges, leaderboards, nudges, and chat. All in the same app where you track.

habitink.vercel.app
```

---

### DAY 14

**Goal:** Two weeks in — set up Product Hunt for launch in one week.

---

#### PRODUCT HUNT PREPARATION (not launching yet — preparing)

**Step 1:** Create an account at producthunt.com if you don't have one.

**Step 2:** Spend 20 minutes upvoting and commenting on 5-10 products that launched today. Build goodwill and familiarity with the platform.

**Step 3:** DM or email 20-30 people you know personally and ask them to upvote on Day 21 (your launch day). Send this message:
```
Hey [name], I'm launching Habit Ink on Product Hunt on [date]. It's a free habit tracker + journal web app I built. Would mean a lot if you could upvote it on launch day — I'll send you a reminder. Here's the app: habitink.vercel.app
```

**Step 4:** Prepare your Product Hunt listing:

**Tagline (60 chars max):**
```
Free habit tracker + daily journal. No download, forever free.
```

**Description:**
```
Habit Ink combines daily habit tracking and journaling in one place — because the check (what you did) and the note (why you did it) belong together.

Track any habit: yes/no, numeric, decimal, time, or custom text. Log your intention, wins, challenges, and notes in a 4-field daily journal with rotating prompts. Build streaks with milestone celebrations at 7, 14, 30, 60, 100, and 365 days.

Groups lets you create shared challenges with friends, compete on leaderboards, and chat in real-time.

100% free forever. No subscription. No ads. No paywall. Sign in with Google in one click.
```

**First comment (post this the moment you go live on PH):**
```
Hey Product Hunt 👋

I built Habit Ink because I kept two separate apps — a habit tracker and a journal — and they were never connected. The insight I was missing: the journal entry from a missed habit day is worth more than 10 check marks. Combining them reveals patterns that neither app alone can show.

Key things I'm most proud of:
- The journaling + tracking fusion (4 fields, rotating daily prompts)
- Groups: real-time challenges, chat, nudges, leaderboards
- 5 complete themes, PWA-installable, works on every device
- Genuinely free forever — no "free plan with limits"

Would love feedback on what's confusing on first use or what's missing. Happy to answer any questions here all day!
```

---

#### POST 1 — LinkedIn (two-week reflection)

**Exact post:**
```
Two weeks since launching Habit Ink.

What I know now that I didn't know two weeks ago:

1. "Free forever" resonates more than any feature. People are exhausted by apps that bait-and-switch with paywalls.

2. The journaling angle is the hook. People who already journal lit up immediately. People who just tracked habits took longer to see it.

3. Groups is the stickiest feature. Every person who joined a group came back the next day.

4. The hardest thing isn't building the product. It's finding the people who need it.

Still building. Still free.

habitink.vercel.app
```

---

### DAY 15

**Goal:** Hit r/productivity now that karma should be 100+. This is a top-5 subreddit for the audience.

---

#### POST 1 — Reddit r/productivity

**Title:**
```
After 6 months of using a habit tracker, I realized the data I actually needed was in my journal
```

**Exact post:**
```
I tracked habits for 6 months with a dedicated app. Green days, red days, current streak, best streak. All there.

But I kept breaking the same three habits over and over and I genuinely didn't know why.

Then I started writing one sentence on each day I missed. Just one sentence — what was happening when I didn't do the habit.

After 30 days of that, the pattern was obvious. It was always the same situation: late nights, high-stress Mondays, days I skipped lunch. Same habit, same failure mode, every time.

The tracker showed me what. The journal showed me why. But I had to manually connect dots across two separate apps to get there.

I ended up building a free app that puts both on the same screen — habit tracking at the top, 4-field daily journal directly below. After a month of entries you have the full picture without any dot-connecting. It's called Habit Ink (habitink.vercel.app), and it's completely free.

But even if you don't use it: the one-sentence note on missed days is the most valuable data you can capture. What was happening? What was different that day? That's where the real pattern is.

What's the habit you keep breaking and can never figure out why?
```

---

### DAY 16

**Goal:** Morning routine angle — one of the highest-traffic search topics in the space.

---

#### POST 1 — LinkedIn

**Exact post:**
```
The most effective morning routine has nothing to do with waking up at 5am.

The research on morning routines points to one thing: a small set of consistent behaviors that happen before the day pulls your attention away.

What those behaviors are matters less than when they happen and how reliably you track them.

The five that have the strongest research backing:
→ No phone for the first 30 minutes (cortisol and attention management)
→ Water before coffee (rehydration after 7-8 hours)
→ 10 minutes of movement (mood, focus, and energy)
→ Set one clear intention for the day (not a to-do list, one priority)
→ Log one win from the previous day before you start the new one

The last one is underrated. Looking backward for 60 seconds before looking forward creates continuity — and that continuity is what makes routines feel worth repeating.

I wrote a longer piece on this on the Habit Ink blog if you want the science behind each one:
habitink.vercel.app/blog/morning-routine-habits
```

---

### DAY 17

**Goal:** Reddit r/selfimprovement — high karma requirement but now reachable.

---

#### POST 1 — Reddit r/selfimprovement

**Title:**
```
What actually changed when I started writing one sentence about every habit I missed
```

**Exact post:**
```
I used habit trackers for years. I had green squares and red squares and streaks and badges. What I didn't have: any real understanding of why I kept failing the same habits.

The thing that changed everything was adding one sentence on every day I didn't complete a habit. Not a paragraph. One sentence. "Didn't meditate because I had back-to-back calls until 7pm." "Skipped the run because I was already tired before lunch." "Forgot water because I worked from a different room."

After 30 days I could see the pattern immediately. Every failure had the same 2-3 circumstances behind it. It wasn't motivation or discipline — it was environment and timing.

Once I saw the pattern, fixing it was simple. I moved the habit to a different time. I set a single environmental trigger. I stopped having a rule for the days when the failure condition always occurred.

The journal-on-missed-days practice is now built into my daily tracking. I use Habit Ink for it (I built it, full disclosure) but you can do this in any journal. The key is keeping the note next to the tracking — not in a separate app where you'll never connect the dots.

What habit have you been failing to fix despite tracking it? Happy to think through the pattern with you.
```

---

### DAY 18

**Goal:** Share the most SEO-targeted blog post — "free habit tracker 2026" — this is the big search volume one.

---

#### POST 1 — LinkedIn

**Exact post:**
```
I looked at every major free habit tracker available in 2026.

Here's the honest breakdown of what "free" actually means for each one:

Most are free for 3-7 habits, then hit a paywall.
Some are free but show ads in your daily tracking view.
Some are free to download but charge for streaks or reminders.

I built Habit Ink specifically to not do any of those things.

No habit limit. No locked features. No subscription. No ads. The streak counter doesn't cost extra. The journal doesn't cost extra. The groups don't cost extra.

I know "free forever" sounds like a gimmick. But the business model for Habit Ink is: I built it for myself, I use it every day, and I want other people to have it.

Full breakdown of what to look for in a free habit tracker (and why web apps beat native apps for this use case) on the blog:
habitink.vercel.app/blog/free-habit-tracker-2026
```

---

### DAY 19

**Goal:** Community engagement. Respond to everyone, ask for testimonials.

---

#### DM CAMPAIGN

Message every person who has commented positively on your LinkedIn, Twitter, or Reddit posts:

```
Hey [name], thanks so much for the kind words about Habit Ink. I noticed you've been using it — would you be willing to share a quick sentence about what you like most? I'm putting together testimonials for the Product Hunt launch next week. No pressure at all!
```

Collect 5-10 quotes. You'll use these on Product Hunt launch day.

---

#### POST 1 — Twitter

```
Preparing for a Product Hunt launch next week.

Been building Habit Ink for months, launched publicly 2.5 weeks ago.

The feedback that's stuck with me most: "I kept a journal and a habit tracker for 3 years in separate apps. This is the first time I've understood why my habits keep breaking."

That's the whole product in one sentence.

habitink.vercel.app
```

---

### DAY 20

**Goal:** Product Hunt eve. Build anticipation.

---

#### POST 1 — LinkedIn

**Exact post:**
```
Launching Habit Ink on Product Hunt tomorrow.

20 days ago I posted a quiet launch on LinkedIn. What I didn't expect:

→ People signing up from countries I'd never considered
→ The groups feature resonating more than any individual tracker feature
→ "Free forever" being the thing that made people share it

Tomorrow it goes wider.

If you've been thinking about trying it: habitink.vercel.app

And if you're on Product Hunt, I'll share the link tomorrow morning. An upvote would mean everything to a solo builder.
```

---

#### POST 2 — Twitter

```
Launching Habit Ink on Product Hunt tomorrow 🚀

If you've tried it and found it useful — an upvote tomorrow would mean the world.

I'll post the link at midnight PST.

Free habit tracker + daily journal: habitink.vercel.app
```

---

#### SEND REMINDER DMs

Message every person you contacted on Day 14 who said they'd upvote. Short message:
```
Hey [name]! Launching on Product Hunt tomorrow. Here's the link — would mean so much if you upvote tomorrow morning: [Product Hunt link]
```

---

### DAY 21 — PRODUCT HUNT LAUNCH DAY

**Goal:** Hit the Top 5 on Product Hunt. This can bring 200-1,000 new signups in a single day.

**Product Hunt launches at 12:01am PST. Set your alarm.**

---

#### PRODUCT HUNT TASKS (midnight PST onward)

1. Submit your listing at 12:01am PST
2. Immediately post your first comment (see Day 14 preparation)
3. Share the link everywhere:

**LinkedIn post (post at 8am your local time):**
```
Habit Ink is live on Product Hunt today! 🚀

3 weeks ago I launched quietly on LinkedIn. Today it goes on the world's biggest platform for new product launches.

Habit Ink: free habit tracker + daily journal in one web app. No download. No subscription. Forever free.

If you've found it useful, or if you're just curious — an upvote on Product Hunt today would mean everything to a solo builder.

👉 [Product Hunt link]

And the app itself: habitink.vercel.app
```

**Twitter post (post at 8am):**
```
Habit Ink is live on Product Hunt today! 🚀

Free habit tracker + daily journal. No download. Free forever.

Upvote here: [Product Hunt link]

#producthunt #buildinpublic
```

**Reddit r/SideProject (post at 9am):**
```
Title: Habit Ink just launched on Product Hunt — free habit tracker + journal web app

We're live! Habit Ink is on Product Hunt today. Free habit tracker + daily journal in one web app, no download needed.

Would love support from this community: [Product Hunt link]

And the app: habitink.vercel.app
```

**Discord servers:** Post the Product Hunt link in every server you joined.

**Personal messages:** Message every person in your contacts who might upvote. Be direct: "I launched on Product Hunt today, would you upvote? Here's the link."

---

#### DURING THE DAY

Respond to every single comment on your Product Hunt listing within 30 minutes. This is crucial — engagement signals help you rank higher.

---

### DAY 22

**Goal:** Post-PH follow-up. Capture the momentum. Convert visitors to regular users.

---

#### POST 1 — LinkedIn

**Exact post:**
```
Product Hunt results for Habit Ink: [share what happened honestly]

[If you ranked well]: Made the Top [X] on Product Hunt yesterday. [X] upvotes, [X] new signups.

The comment that made my day: "[paste a real comment from PH]"

For everyone who upvoted, shared, and tried the app — thank you. Building alone is hard. Days like yesterday are why it's worth it.

habitink.vercel.app — still free, always will be.
```

---

### DAY 23

**Goal:** The "streak psychology" blog angle — research-backed content that performs on LinkedIn.

---

#### POST 1 — LinkedIn

**Exact post:**
```
Missing one day does not ruin a habit streak.

The original research (UCL, 2010) explicitly confirmed this: "Missing one opportunity to perform the behavior did not materially affect the habit formation process."

What ruins a habit isn't a single miss. It's the shame spiral after the miss that turns one day into five.

The two rules I follow:
1. Never miss twice. One miss is an accident. Two misses is a pattern. Three misses is a new (bad) habit.
2. Write one sentence on the day you miss. Not to punish yourself — to understand the context. That sentence will tell you more than 30 green days.

The psychology of streaks is more nuanced than "don't break the chain." The chain is a tool, not a moral judgment.

More on this: habitink.vercel.app/blog/habit-streak-psychology
```

---

### DAY 24

**Goal:** Reddit r/habittracking (small but perfectly targeted — your ideal user is here).

---

#### POST 1 — Reddit r/habittracking

**Title:**
```
Built a free web app that combines habit tracking and daily journaling — sharing for feedback
```

**Exact post:**
```
Hey r/habittracking!

Long-time lurker, first post. I built Habit Ink (habitink.vercel.app) because I was using two separate apps — one for tracking, one for journaling — and they were never connected.

The thing I kept wanting: the ability to see a missed habit day and immediately see what I wrote that day. Was I tired? Traveling? Stressed? The pattern that was breaking my habits was in the journal, but I'd have to manually cross-reference across apps.

Habit Ink puts them on the same screen. Check your habits at the top. Journal (4 fields: intention, notes, wins, challenges) directly below. After 30 days of entries, the patterns are obvious.

Features for the habit-tracking crowd:
- 5 types: yes/no, number, decimal, time, custom text
- Schedules: daily, weekdays, weekends, alternate, or custom days
- Target direction: ≥ or ≤ (for steps/calories/both)
- Streaks with milestones at 7/14/30/60/100/200/365
- Calendar heatmap, 15-week horizontal heatmap, per-habit analytics
- Groups with shared challenges and leaderboards
- CSV export with all your data

Free forever. No paywalls. Sign in with Google.

Genuinely curious: for people who've tried combining tracking + journaling, what's been the biggest friction point? What do you wish existed?
```

---

### DAY 25

**Goal:** Instagram Reels or TikTok — highest organic reach right now.

---

#### VIDEO CONTENT — Instagram Reels / TikTok

**If you're comfortable on camera, record this script (30-60 seconds):**

```
POV: you've failed at the same habits 6 times.

Here's what I was missing.

I was tracking my habits. Green day, red day, streak broken. But I never knew WHY it kept breaking.

The data I needed wasn't in the tracker. It was in my journal. But my journal was in a different app.

So I built Habit Ink. One web app where your habit tracking and your daily journal are on the same screen. Same day. You check the habit. You write about it. Right there.

After 30 days you can see exactly what circumstances make your habits fail.

It's free. No download. Sign in with Google.

Link in bio.
```

**If not comfortable on camera, do a screen recording:**
- Open the app
- Show the Today screen with habits + journal visible
- Scroll slowly
- Add text overlay: "habit tracker + journal = the combo nobody talks about"
- Caption: "This is why your streak keeps breaking. And it's free."

**Hashtags:**
```
#habittracker #habitjournal #selfimprovement #productivity #morningroutine #streaks #habitbuilding #freepapp #nodownload #habitink #dailyjournal #goalsetting #personalgrowth #selfcare #routine
```

---

### DAY 26

**Goal:** Engage the journaling community on Reddit — different angle than Day 9.

---

#### POST 1 — Reddit r/bulletjournal

**Title:**
```
Anyone else track habits AND keep a written journal? Here's what I learned combining them
```

**Exact post:**
```
I've been a bullet journaler for years. Habit trackers (those little grid pages), weekly logs, daily reflections — the whole system.

The insight that changed my practice: my most useful data wasn't the filled circles in the habit grid. It was the daily log entries from the days I didn't fill them.

"Didn't exercise — worked until 9pm."
"Missed meditation — had calls back to back."
"No reading — felt too scattered to focus."

Those entries told me more about my habits than months of tracking. But in a bujo they're always separated — the habit grid is one page, the daily log is another. Cross-referencing is manual and I never actually did it.

I ended up building a digital version that puts them together (Habit Ink, free at habitink.vercel.app — full disclosure I built it). But even if you don't use digital tools: the practice of writing one sentence on every day you break a habit, right next to the tracker itself, is worth trying.

For those of you who do both habit tracking and journaling: do you find ways to connect the two, or are they always separate pages/systems?
```

---

### DAY 27

**Goal:** LinkedIn carousel-style post on habit types.

---

#### POST 1 — LinkedIn

**Exact post:**
```
"What habits are worth tracking?"

Everyone answers this differently. Here's a framework that's worked for me.

The habits worth tracking are the ones that have:
→ A clear binary (did you do it or not?) OR a measurable amount
→ A time when it naturally happens
→ A visible effect within 30 days (either in how you feel or what you've produced)

Some examples by category:

Health: 8 glasses of water (number), take vitamins (yes/no), sleep 7+ hours (number)
Fitness: 8,000 steps (number), stretch 10 min (yes/no), run 3km (decimal)
Learning: Read 20 pages (number), write 500 words (number), practice instrument 30 min (time)
Mindfulness: Meditate 10 min (yes/no), no phone before 9am (yes/no), write in journal (yes/no)
Productivity: Complete 3 priority tasks (yes/no), deep work 2 hours (time), no email before 10am (yes/no)

The mistake I made for years: tracking too many habits at once. 3-5 strong habits beat 15 weak ones every time.

What's the one habit that would have the biggest impact on your life if you did it consistently for 90 days?

(All of the above are available as one-tap templates in Habit Ink — habitink.vercel.app)
```

---

### DAY 28

**Goal:** Testimonial-based content. Social proof is now available from 4 weeks of users.

---

#### POST 1 — LinkedIn

**Exact post:**
```
Some things people have said about Habit Ink after using it:

"I didn't know I wanted a habit tracker and journal in the same app until I saw it."

"I've been keeping a journal and a tracker in separate apps for 3 years. This is the first time I've understood why my habits keep breaking."

"The groups feature is what actually makes me come back. My friends can see my streak."

"It's the cleanest habit app I've tried. And it's actually free — not 'free for 3 habits.'"

This is why I build.

Still free, still growing: habitink.vercel.app
```

---

### DAY 29

**Goal:** SEO — share the highest-volume blog post angle.

---

#### POST 1 — LinkedIn

**Exact post:**
```
The habit research almost everyone gets wrong.

"It takes 21 days to build a habit" — you've probably heard this. It comes from a 1960 book by a plastic surgeon who observed patients adjusting to post-surgery changes.

The actual controlled research (UCL, 2009) found the average was 66 days. The range: 18 to 254 days, depending on the person and the complexity of the habit.

What this means practically:
→ If you're on day 25 and struggling, you're probably at the hardest point — not close to done
→ Simpler habits (drink a glass of water with lunch) automate faster than complex ones (go to the gym)
→ Missing one day doesn't reset you — the study confirmed this explicitly

The 66-day frame changes how you think about habit building. Not a sprint — a slow process with a real end point.

Full breakdown: habitink.vercel.app/blog/66-day-habit-challenge
```

---

### DAY 30

**Goal:** One month reflection. Honest, human, and forward-looking.

---

#### POST 1 — LinkedIn (most important post of the month)

**Exact post:**
```
30 days since I launched Habit Ink. Here's the full honest story.

What I expected: a quiet launch, a few hundred signups from my network, some polite feedback.

What actually happened:
→ [X] people signed up across [X] countries
→ The most engaged users: people who already journaled and wanted their tracking connected to it
→ The biggest surprise: Groups. People started group challenges with their friends within days of signing up
→ The hardest feedback: people want reminders. Web apps can't push-notify like native apps. This is a real gap I'm thinking about.

What I learned about launching:

1. Your warm network is your first audience, not your whole audience. Post once, then let the content do the work.

2. Honest building-in-public posts outperform product promotion posts every single time.

3. The feature that resonates is never the one you spent the most time on. I spent months on the tracker. People talk about the journal.

4. "Free forever" is a product decision, not just a pricing decision. People trust it differently than freemium.

Habit Ink is still free, still growing, still built by one person.

If you haven't tried it: habitink.vercel.app

What would you build if you had the time?
```

---

#### POST 2 — Twitter

```
30 days of Habit Ink.

[X] signups.
[X] countries.
[X] things I'd do differently.

The one thing I wouldn't change: making it free forever.

Thank you to everyone who tried it, shared it, or gave feedback.

habitink.vercel.app

The building continues 🖊
```

---

## Summary: Key Rules for This Plan

### Platform Rules
| Platform | Karma/Requirement | Best Post Time | Post Type |
|---|---|---|---|
| LinkedIn | None | 8–10am | Text-only or minimal image |
| Twitter/X | None | 9am–12pm | Tweet threads |
| Hacker News | None | 9am PST | Show HN with immediate first comment |
| Reddit r/SideProject | Low (ok with 30) | 9am–12pm | Text post |
| Reddit r/webdev | Low (ok with 30) | 9am–12pm | Technical text post |
| Reddit r/Journaling | ~50 karma | 9am–12pm | Community-first text post |
| Reddit r/productivity | ~100 karma | 9am–12pm | Insight post, not promo |
| Reddit r/selfimprovement | ~100 karma | 9am–12pm | Personal story post |
| Instagram | None | 11am–1pm | Visual screenshot or Reel |
| TikTok | None | 7–9pm | 30-60 sec screen recording |
| Product Hunt | None | 12:01am PST on launch day | Full listing |
| Discord servers | None | Anytime | Introduction + share |
| Facebook groups | Approval needed | 10am–12pm | Community post |

### Cardinal Rules
1. **Never post and ghost.** Respond to every comment within 1 hour on launch day, within 24 hours every other day.
2. **Disclose on Reddit.** Always say "I built this" or "full disclosure." Getting caught hiding it will destroy the post.
3. **Never cross-post the same text.** Each platform gets a unique angle. LinkedIn: insight + product. Reddit: community-first. Twitter: short and punchy.
4. **Build Reddit karma through comments before posting.** You cannot rush this. Days 5 and 12 are dedicated karma-building days.
5. **Product Hunt is a single day.** Everything before it builds momentum. Everything after it consolidates it.
6. **The blog is a long game.** The 6 articles target real search volume. They will bring traffic in 3-6 months. Keep them live and indexed.
7. **The most important metric in month 1 is return visits, not signups.** If people come back 3 days in a row, you have something.
