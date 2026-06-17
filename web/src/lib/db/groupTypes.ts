export interface Group {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  motto: string;
  mottoAuthor: string;
  welcomeMessage: string;
  memberLimit: number;
  challengeCreator: 'any' | 'admin';
  createdBy: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithStats extends Group {
  memberCount: number;
  activeChallengeCount: number;
  unreadCount: number;
  membersToday: MemberTodayStatus[];
}

export interface MemberTodayStatus {
  userId: string;
  displayName: string;
  avatarUrl: string;
  userEmoji: string;
  completedToday: boolean;
  challengesDoneToday: number;
  timezone?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  lastSeenAt: string | null;
  muted: boolean;
  displayName: string;
  avatarUrl: string;
  userEmoji: string;
  timezone?: string;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  createdBy: string;
  name: string;
  emoji: string;
  color: string;
  habitType: string;
  target: string;
  /** For number/decimal challenges: 'gte' = reach at least the target, 'lte' = stay at or under it (e.g. calories) */
  targetComparison: 'gte' | 'lte';
  schedule: string;
  customDays?: number[];
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ChallengeParticipant {
  challengeId: string;
  userId: string;
  joinedAt: string;
  displayName: string;
  avatarUrl: string;
  userEmoji: string;
  completedToday: boolean;
  completionRate: number;
  streakWithinChallenge: number;
  actualToday?: string;
}

export interface FeedEntry {
  entryId: string;
  userId: string;
  challengeId: string;
  challengeName: string;
  challengeEmoji: string;
  challengeColor: string;
  date: string;
  status: string;
  actual?: string;
  done: boolean;
  displayName: string;
  avatarUrl: string;
  userEmoji: string;
  createdAt: string;
  streak: number;
  reactions: FeedReaction[];
  isMilestone: boolean;
  milestoneText: string;
}

export interface FeedReaction {
  emoji: string;
  count: number;
  myReaction: boolean;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: string;
  displayName: string;
  avatarUrl: string;
  userEmoji: string;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  myReaction: boolean;
}

export interface GroupNudge {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  seen: boolean;
  createdAt: string;
}

export interface ChallengeInput {
  name: string;
  emoji: string;
  color: string;
  habitType: string;
  target: string;
  targetComparison?: 'gte' | 'lte';
  schedule: string;
  customDays?: number[];
  startDate: string;
  endDate: string;
}

export interface GroupSettings {
  name: string;
  emoji: string;
  color: string;
  description: string;
  motto: string;
  mottoAuthor: string;
  welcomeMessage: string;
  memberLimit: number;
  challengeCreator: 'any' | 'admin';
}

export interface GroupTrophy {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface WeeklyDigest {
  weekLabel: string;
  totalCheckins: number;
  topPerformerName: string;
  topPerformerCount: number;
  longestStreakName: string;
  longestStreak: number;
  groupStreakDays: number;
}
