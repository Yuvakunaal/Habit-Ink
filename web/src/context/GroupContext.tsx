import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/db/types';
import { useAuth } from '@/context/AuthContext';
import { useGroupUnread } from '@/context/GroupUnreadContext';
import { toDateKey } from '@/context/HabitContext';
import { toDateKeyInTimezone } from '@/lib/dateUtils';
import {
  mapGroupFromDB,
  mapChallengeFromDB,
  mapMemberFromDB,
} from '@/lib/db/mappers';
import type {
  Group,
  GroupWithStats,
  GroupMember,
  GroupChallenge,
  ChallengeParticipant,
  FeedEntry,
  FeedReaction,
  GroupMessage,
  MessageReaction,
  GroupNudge,
  ChallengeInput,
  GroupSettings,
  GroupTrophy,
  WeeklyDigest,
  MemberTodayStatus,
} from '@/lib/db/groupTypes';

const PAGE_SIZE = 20;
const MAX_CHALLENGES_PER_GROUP = 15;
const MAX_GROUPS_CREATED_PER_USER = 10;
// Matches the `group_messages_content_length` DB check constraint — keep both in sync.
export const MAX_MESSAGE_LENGTH = 2000;
// Sliding-window cap: oldest message is auto-deleted from DB when the 101st arrives.
export const MAX_CHAT_MESSAGES = 100;

function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
}

// Pulls the leading numeric value out of strings like "7,000 steps" or "5.5 km" so
// number/decimal challenge check-ins can be compared against their target.
function parseLeadingNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isNaN(n) ? null : n;
}

interface GroupContextType {
  groups: GroupWithStats[];
  loadingGroups: boolean;
  refetchGroups: () => Promise<void>;

  createGroup: (name: string, emoji: string, color: string) => Promise<Group>;
  updateGroupSettings: (groupId: string, settings: Partial<GroupSettings>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  regenerateInviteCode: (groupId: string) => Promise<string>;

  joinGroupByCode: (code: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  promoteMember: (groupId: string, userId: string) => Promise<void>;
  updateMemberSettings: (groupId: string, updates: { muted?: boolean }) => Promise<void>;
  markGroupSeen: (groupId: string) => Promise<void>;

  fetchGroupById: (groupId: string) => Promise<Group>;
  fetchGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  fetchGroupChallenges: (groupId: string) => Promise<GroupChallenge[]>;
  fetchFeedPage: (groupId: string, before?: string) => Promise<FeedEntry[]>;
  fetchMessages: (groupId: string, limit: number, before?: string) => Promise<GroupMessage[]>;
  fetchChallengeParticipants: (challengeId: string) => Promise<ChallengeParticipant[]>;
  fetchTodaysPulse: (groupId: string) => Promise<MemberTodayStatus[]>;
  fetchPendingNudges: (groupId: string) => Promise<GroupNudge[]>;
  computeGroupStreak: (groupId: string) => Promise<number>;
  computeGroupTrophies: (groupId: string, groupStreakDays: number) => Promise<GroupTrophy[]>;
  computeWeeklyDigest: (groupId: string, groupStreakDays: number) => Promise<WeeklyDigest | null>;

  createChallenge: (groupId: string, data: ChallengeInput) => Promise<GroupChallenge>;
  updateChallenge: (challengeId: string, data: ChallengeInput) => Promise<GroupChallenge>;
  joinChallenge: (challenge: GroupChallenge, userId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  checkInChallenge: (challenge: GroupChallenge, actual?: string) => Promise<boolean>;
  undoCheckInChallenge: (challengeId: string) => Promise<void>;

  toggleFeedReaction: (groupId: string, entryId: string, emoji: string, hasMyReaction: boolean) => Promise<void>;

  sendNudge: (groupId: string, toUserId: string) => Promise<void>;
  markNudgeSeen: (nudgeId: string) => Promise<void>;

  sendMessage: (groupId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleMessageReaction: (messageId: string, groupId: string, emoji: string, hasMyReaction: boolean) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | null>(null);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setTotalUnread } = useGroupUnread();
  const [groups, setGroups] = useState<GroupWithStats[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const refetchGroups = useCallback(async () => {
    if (!user) return;
    setLoadingGroups(true);
    try {
      // Step 1: Fetch memberships
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, role, last_seen_at, muted')
        .eq('user_id', user.id);

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        setTotalUnread(0);
        return;
      }

      const groupIds = memberships.map(m => m.group_id);
      const membershipMap = Object.fromEntries(memberships.map(m => [m.group_id, m]));

      // Step 2: Fetch groups
      const { data: groupRows } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (!groupRows) { setGroups([]); return; }

      const today = new Date();
      const todayKey = toDateKey(today);
      const yesterdayKey = toDateKey(new Date(today.getTime() - 86400000));
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      // Step 3: Batch fetch all group-level data in ONE Promise.all (6 total queries regardless of group count)
      const [allMembersRes, allChallengesRes, allMessagesRes] = await Promise.all([
        supabase.from('group_members').select('group_id, user_id').in('group_id', groupIds),
        supabase.from('group_challenges').select('group_id, id, end_date').in('group_id', groupIds),
        supabase.from('group_messages').select('group_id, created_at').in('group_id', groupIds).gte('created_at', thirtyDaysAgo),
      ]);

      // Build maps
      const memberIdsByGroup: Record<string, string[]> = {};
      for (const row of (allMembersRes.data ?? []) as { group_id: string; user_id: string }[]) {
        (memberIdsByGroup[row.group_id] ??= []).push(row.user_id);
      }

      const challengeIdsByGroup: Record<string, string[]> = {};
      const activeChallengeCountByGroup: Record<string, number> = {};
      for (const row of (allChallengesRes.data ?? []) as { group_id: string; id: string; end_date: string }[]) {
        (challengeIdsByGroup[row.group_id] ??= []).push(row.id);
        if (row.end_date >= todayKey) {
          activeChallengeCountByGroup[row.group_id] = (activeChallengeCountByGroup[row.group_id] ?? 0) + 1;
        }
      }

      const messagesByGroup: Record<string, string[]> = {};
      for (const row of (allMessagesRes.data ?? []) as { group_id: string; created_at: string }[]) {
        (messagesByGroup[row.group_id] ??= []).push(row.created_at);
      }

      // Build challengeGroupMap (challengeId → groupId)
      const challengeGroupMap: Record<string, string> = {};
      for (const [gid, cids] of Object.entries(challengeIdsByGroup)) {
        for (const cid of cids) challengeGroupMap[cid] = gid;
      }

      const allMemberIds = [...new Set(Object.values(memberIdsByGroup).flat())];
      const allChallengeIds = [...new Set(Object.values(challengeIdsByGroup).flat())];

      // Step 4: Batch fetch profiles + checkins
      const [profilesRes, checkinsRes] = await Promise.all([
        allMemberIds.length > 0
          ? supabase.from('profiles').select('id, user_name, user_emoji, avatar_url, timezone').in('id', allMemberIds)
          : Promise.resolve({ data: [] as { id: string; user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string }[] }),
        allChallengeIds.length > 0
          ? supabase.from('group_challenge_checkins').select('user_id, challenge_id, date')
              .in('challenge_id', allChallengeIds)
              .in('date', [todayKey, yesterdayKey])
              .eq('done', true)
          : Promise.resolve({ data: [] as { user_id: string; challenge_id: string; date: string }[] }),
      ]);

      const profilesMap = Object.fromEntries(
        (profilesRes.data ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string }) => [p.id, p])
      );

      // Group checkins by group_id for fast lookup
      const checkinsByGroup: Record<string, { user_id: string; date: string }[]> = {};
      for (const row of (checkinsRes.data ?? []) as { user_id: string; challenge_id: string; date: string }[]) {
        const gid = challengeGroupMap[row.challenge_id];
        if (gid) (checkinsByGroup[gid] ??= []).push({ user_id: row.user_id, date: row.date });
      }

      // Step 5: Build enriched groups client-side
      const enriched: GroupWithStats[] = groupRows.map(gr => {
        const membership = membershipMap[gr.id];
        const memberIds = memberIdsByGroup[gr.id] ?? [];

        // Unread count
        const unreadCount = membership?.muted
          ? 0
          : (messagesByGroup[gr.id] ?? []).filter(ts => ts > (membership?.last_seen_at ?? gr.created_at)).length;

        // Members today
        const groupCheckins = checkinsByGroup[gr.id] ?? [];
        const membersToday: MemberTodayStatus[] = memberIds.map((uid: string) => {
          const profile = profilesMap[uid];
          const memberTz = (profile as { timezone?: string } | undefined)?.timezone || 'UTC';
          const memberToday = toDateKeyInTimezone(memberTz);
          const done = groupCheckins.filter(e => e.user_id === uid && e.date === memberToday);
          return {
            userId: uid,
            displayName: (profile as { user_name?: string } | undefined)?.user_name || 'Member',
            avatarUrl: (profile as { avatar_url?: string } | undefined)?.avatar_url ?? '',
            userEmoji: (profile as { user_emoji?: string } | undefined)?.user_emoji ?? '😊',
            completedToday: done.length > 0,
            challengesDoneToday: done.length,
            timezone: memberTz,
          };
        });

        return {
          ...mapGroupFromDB(gr),
          memberCount: memberIds.length,
          activeChallengeCount: activeChallengeCountByGroup[gr.id] ?? 0,
          unreadCount,
          membersToday,
        } as GroupWithStats;
      });

      setGroups(enriched);
      setTotalUnread(enriched.reduce((sum, g) => sum + g.unreadCount, 0));
    } finally {
      setLoadingGroups(false);
    }
  }, [user, setTotalUnread]);

  useEffect(() => {
    if (user) refetchGroups();
    else { setGroups([]); setLoadingGroups(false); }
  }, [user, refetchGroups]);

  // ── Group CRUD ──────────────────────────────────────────────────────────────

  const createGroup = async (name: string, emoji: string, color: string): Promise<Group> => {
    const userId = user!.id;

    const { count } = await supabase
      .from('groups')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId);

    if ((count ?? 0) >= MAX_GROUPS_CREATED_PER_USER) {
      throw new Error(`You can create a maximum of ${MAX_GROUPS_CREATED_PER_USER} groups.`);
    }

    let inviteCode = generateInviteCode();
    let groupData: { id: string; [key: string]: unknown };

    const { data, error } = await supabase
      .from('groups')
      .insert({ name, emoji, color, created_by: userId, invite_code: inviteCode })
      .select().single();

    if (error?.code === '23505') {
      inviteCode = generateInviteCode();
      const retry = await supabase.from('groups')
        .insert({ name, emoji, color, created_by: userId, invite_code: inviteCode })
        .select().single();
      if (retry.error) throw retry.error;
      groupData = retry.data;
    } else if (error) {
      throw error;
    } else {
      groupData = data;
    }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: groupData.id, user_id: userId, role: 'admin' });

    if (memberError) {
      await supabase.from('groups').delete().eq('id', groupData.id);
      throw memberError;
    }

    await refetchGroups();
    return mapGroupFromDB(groupData as Parameters<typeof mapGroupFromDB>[0]);
  };

  const updateGroupSettings = async (groupId: string, settings: Partial<GroupSettings>): Promise<void> => {
    const update: Database['public']['Tables']['groups']['Update'] = {};
    if (settings.name !== undefined) update.name = settings.name;
    if (settings.emoji !== undefined) update.emoji = settings.emoji;
    if (settings.color !== undefined) update.color = settings.color;
    if (settings.description !== undefined) update.description = settings.description;
    if (settings.motto !== undefined) update.motto = settings.motto;
    if (settings.mottoAuthor !== undefined) update.motto_author = settings.mottoAuthor;
    if (settings.welcomeMessage !== undefined) update.welcome_message = settings.welcomeMessage;
    if (settings.memberLimit !== undefined) update.member_limit = settings.memberLimit;
    if (settings.challengeCreator !== undefined) update.challenge_creator = settings.challengeCreator;
    const { error } = await supabase.from('groups').update(update).eq('id', groupId);
    if (error) throw error;
    await refetchGroups();
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error && error.code !== 'PGRST116') throw error;
    await refetchGroups();
  };

  const regenerateInviteCode = async (groupId: string): Promise<string> => {
    const newCode = generateInviteCode();
    const { error } = await supabase.from('groups').update({ invite_code: newCode }).eq('id', groupId);
    if (error) throw error;
    await refetchGroups();
    return newCode;
  };

  // ── Membership ──────────────────────────────────────────────────────────────

  const joinGroupByCode = async (code: string): Promise<Group> => {
    const { data: group } = await supabase.from('groups').select('*').eq('invite_code', code).single();
    if (!group) throw new Error('Group not found');

    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user!.id)
      .maybeSingle();
    if (existing) {
      await refetchGroups();
      return mapGroupFromDB(group);
    }

    const { count: memberCount } = await supabase
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', group.id);

    if ((memberCount ?? 0) >= group.member_limit) {
      throw new Error(`This group is full (${group.member_limit}/${group.member_limit} members).`);
    }

    const { error } = await supabase.from('group_members').insert({
      group_id: group.id, user_id: user!.id, role: 'member',
    });
    if (error) {
      // A concurrent join racing past the member_limit check above lands here either as a
      // unique-constraint conflict (already a member — fine, ignore) or as the DB-level
      // `enforce_group_member_limit` trigger rejecting the insert (the rare true race case —
      // surface the same friendly message the upfront check above would have shown).
      if (error.code === '23505') {
        // already a member, nothing to do
      } else if (error.message?.toLowerCase().includes('member limit')) {
        throw new Error(`This group is full (${group.member_limit}/${group.member_limit} members).`);
      } else {
        throw error;
      }
    }

    await refetchGroups();
    return mapGroupFromDB(group);
  };

  const leaveGroup = async (groupId: string): Promise<void> => {
    const userId = user!.id;

    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, role, joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (!members) return;

    const isAdmin = members.find(m => m.user_id === userId)?.role === 'admin';
    const otherMembers = members.filter(m => m.user_id !== userId);
    const otherAdmins = otherMembers.filter(m => m.role === 'admin');

    if (otherMembers.length === 0) {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
    } else {
      if (isAdmin && otherAdmins.length === 0) {
        const { error: promoteError } = await supabase.from('group_members')
          .update({ role: 'admin' })
          .eq('group_id', groupId)
          .eq('user_id', otherMembers[0].user_id);
        if (promoteError) throw promoteError;
      }
      const { error: leaveError } = await supabase.from('group_members').delete()
        .eq('group_id', groupId).eq('user_id', userId);
      if (leaveError) throw leaveError;
    }

    await refetchGroups();
  };

  const removeMember = async (groupId: string, userId: string): Promise<void> => {
    const { error } = await supabase.from('group_members').delete()
      .eq('group_id', groupId).eq('user_id', userId);
    if (error) throw error;
    await refetchGroups();
  };

  const promoteMember = async (groupId: string, userId: string): Promise<void> => {
    const { error } = await supabase.from('group_members')
      .update({ role: 'admin' })
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
  };

  const updateMemberSettings = async (groupId: string, updates: { muted?: boolean }): Promise<void> => {
    const { error } = await supabase.from('group_members')
      .update(updates)
      .eq('group_id', groupId)
      .eq('user_id', user!.id);
    if (error) throw error;
    await refetchGroups();
  };

  const markGroupSeen = async (groupId: string): Promise<void> => {
    const { error } = await supabase.from('group_members')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('group_id', groupId)
      .eq('user_id', user!.id);
    // Non-fatal: a failed "seen" timestamp just means unread badges go stale, not data loss.
    // Don't throw — most call sites fire this without awaiting/catching.
    if (error) console.error('markGroupSeen failed:', error);
  };

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchGroupById = async (groupId: string): Promise<Group> => {
    const { data, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
    if (error || !data) throw error ?? new Error('Group not found');
    return mapGroupFromDB(data);
  };

  const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    const { data: memberRows } = await supabase
      .from('group_members').select('*').eq('group_id', groupId);
    if (!memberRows) return [];

    const userIds = memberRows.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles').select('id, user_name, user_emoji, avatar_url, timezone').in('id', userIds);
    const profilesMap = Object.fromEntries((profiles ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string }) => [p.id, p]));

    return memberRows.map(m => mapMemberFromDB(m, profilesMap[m.user_id] ?? null));
  };

  const fetchGroupChallenges = async (groupId: string): Promise<GroupChallenge[]> => {
    const { data } = await supabase.from('group_challenges').select('*').eq('group_id', groupId).order('created_at', { ascending: false });
    return (data ?? []).map(mapChallengeFromDB);
  };

  const fetchFeedPage = async (groupId: string, before?: string): Promise<FeedEntry[]> => {
    const { data: challenges } = await supabase
      .from('group_challenges').select('id, name, emoji, color').eq('group_id', groupId);
    if (!challenges || challenges.length === 0) return [];
    const challengeIds = challenges.map((c: { id: string }) => c.id);

    const cursor = before ?? new Date().toISOString();

    const { data: entries } = await supabase
      .from('group_challenge_checkins')
      .select('id, user_id, challenge_id, date, actual, done, created_at')
      .in('challenge_id', challengeIds)
      .lt('created_at', cursor)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (!entries || entries.length === 0) return [];

    const userIds = [...new Set(entries.map((e: { user_id: string }) => e.user_id))];
    const entryIds = entries.map((e: { id: string }) => e.id);

    const [profilesRes, reactionsRes] = await Promise.all([
      supabase.from('profiles').select('id, user_name, user_emoji, avatar_url').in('id', userIds),
      supabase.from('group_reactions').select('entry_id, from_user_id, emoji').eq('group_id', groupId).in('entry_id', entryIds),
    ]);

    const challengesMap = Object.fromEntries(challenges.map((c: { id: string; name: string; emoji: string; color: string }) => [c.id, c]));
    const profilesMap = Object.fromEntries((profilesRes.data ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string }) => [p.id, p]));
    const currentUserId = user!.id;
    const REACTION_EMOJIS = ['🔥', '❤️', '💪'];

    return entries.map((entry: { id: string; user_id: string; challenge_id: string; date: string; actual: string | null; done: boolean; created_at: string }) => {
      const challenge = challengesMap[entry.challenge_id];
      const profile = profilesMap[entry.user_id];
      const entryReactions = (reactionsRes.data ?? []).filter((r: { entry_id: string }) => r.entry_id === entry.id);

      const reactions: FeedReaction[] = REACTION_EMOJIS.map(emoji => ({
        emoji,
        count: entryReactions.filter((r: { emoji: string }) => r.emoji === emoji).length,
        myReaction: entryReactions.some((r: { emoji: string; from_user_id: string }) => r.emoji === emoji && r.from_user_id === currentUserId),
      }));

      return {
        entryId: entry.id,
        userId: entry.user_id,
        challengeId: entry.challenge_id,
        challengeName: challenge?.name ?? 'Challenge',
        challengeEmoji: challenge?.emoji ?? '🎯',
        challengeColor: challenge?.color ?? '#2B3A8C',
        date: entry.date,
        status: 'done',
        actual: entry.actual ?? undefined,
        done: entry.done,
        createdAt: entry.created_at,
        displayName: profile?.user_name || 'Member',
        avatarUrl: profile?.avatar_url ?? '',
        userEmoji: profile?.user_emoji ?? '😊',
        streak: 0,
        reactions,
        isMilestone: false,
        milestoneText: '',
      };
    });
  };

  const fetchMessages = async (groupId: string, limit: number, before?: string): Promise<GroupMessage[]> => {
    let query = supabase
      .from('group_messages')
      .select('id, group_id, user_id, content, created_at')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) query = query.lt('created_at', before);

    const { data: msgs } = await query;
    if (!msgs) return [];

    const reversed = [...msgs].reverse();
    const userIds = [...new Set(reversed.map((m: { user_id: string }) => m.user_id))];
    const msgIds = reversed.map((m: { id: string }) => m.id);

    const [profilesRes, reactionsRes] = await Promise.all([
      supabase.from('profiles').select('id, user_name, user_emoji, avatar_url').in('id', userIds),
      supabase.from('group_message_reactions').select('message_id, user_id, emoji').in('message_id', msgIds),
    ]);

    const profilesMap = Object.fromEntries((profilesRes.data ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string }) => [p.id, p]));
    const MESSAGE_REACTION_EMOJIS = ['🔥', '❤️', '😂', '👍', '💯'];
    const currentUserId = user!.id;

    return reversed.map((m: { id: string; group_id: string; user_id: string; content: string; created_at: string }) => ({
      id: m.id,
      groupId: m.group_id,
      userId: m.user_id,
      content: m.content,
      createdAt: m.created_at,
      displayName: profilesMap[m.user_id]?.user_name || 'Member',
      avatarUrl: profilesMap[m.user_id]?.avatar_url ?? '',
      userEmoji: profilesMap[m.user_id]?.user_emoji ?? '😊',
      reactions: MESSAGE_REACTION_EMOJIS.map(emoji => ({
        emoji,
        count: (reactionsRes.data ?? []).filter((r: { message_id: string; emoji: string }) => r.message_id === m.id && r.emoji === emoji).length,
        myReaction: (reactionsRes.data ?? []).some((r: { message_id: string; emoji: string; user_id: string }) => r.message_id === m.id && r.emoji === emoji && r.user_id === currentUserId),
      })) as MessageReaction[],
    }));
  };

  const fetchChallengeParticipants = async (challengeId: string): Promise<ChallengeParticipant[]> => {
    const { data: participantRows } = await supabase
      .from('group_challenge_members')
      .select('challenge_id, user_id, joined_at')
      .eq('challenge_id', challengeId);

    if (!participantRows || participantRows.length === 0) return [];

    const userIds = participantRows.map((p: { user_id: string }) => p.user_id);

    const [profilesRes, challengeRes] = await Promise.all([
      supabase.from('profiles').select('id, user_name, user_emoji, avatar_url, timezone').in('id', userIds),
      supabase.from('group_challenges').select('start_date, end_date').eq('id', challengeId).single(),
    ]);

    const profilesMap = Object.fromEntries((profilesRes.data ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string }) => [p.id, p]));
    const challenge = challengeRes.data;
    const todayKey = toDateKey(new Date());

    let entriesData: { user_id: string; date: string; actual: string | null; done: boolean }[] = [];
    if (challenge) {
      const { data } = await supabase
        .from('group_challenge_checkins')
        .select('user_id, date, actual, done')
        .eq('challenge_id', challengeId)
        .in('user_id', userIds)
        .gte('date', challenge.start_date)
        .lte('date', challenge.end_date ?? todayKey);
      entriesData = data ?? [];
    }

    return participantRows.map((p: { challenge_id: string; user_id: string; joined_at: string }) => {
      const profile = profilesMap[p.user_id];
      const memberTz = profile?.timezone || 'UTC';
      const participantToday = toDateKeyInTimezone(memberTz);

      const userEntries = entriesData.filter(e => e.user_id === p.user_id);
      const joinKey = toDateKey(new Date(p.joined_at));
      const effectiveStart = joinKey > (challenge?.start_date ?? joinKey) ? joinKey : (challenge?.start_date ?? joinKey);

      const scheduledDays = Math.max(1, Math.floor(
        (new Date(todayKey).getTime() - new Date(effectiveStart).getTime()) / 86400000
      ) + 1);
      const doneDays = userEntries.filter(e => e.done).length;
      const completionRate = Math.round((doneDays / scheduledDays) * 100);

      const completedToday = userEntries.some(e => e.date === participantToday && e.done);
      // Show today's logged value even if it didn't reach the target — transparency for the
      // group — but completedToday (used for streaks/leaderboard ranking) still requires done.
      const actualToday = userEntries.find(e => e.date === participantToday)?.actual ?? undefined;

      let streak = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (key < effectiveStart) break;
        if (userEntries.some(e => e.date === key && e.done)) streak++;
        else if (i === 0) continue;
        else break;
      }

      return {
        challengeId: p.challenge_id,
        userId: p.user_id,
        joinedAt: p.joined_at,
        displayName: profile?.user_name || 'Member',
        avatarUrl: profile?.avatar_url ?? '',
        userEmoji: profile?.user_emoji ?? '😊',
        completedToday,
        completionRate,
        streakWithinChallenge: streak,
        actualToday,
      };
    });
  };

  const fetchTodaysPulse = async (groupId: string): Promise<MemberTodayStatus[]> => {
    const { data: members } = await supabase
      .from('group_members').select('user_id').eq('group_id', groupId);
    if (!members || members.length === 0) return [];
    const memberIds = members.map((m: { user_id: string }) => m.user_id);

    const { data: challenges } = await supabase
      .from('group_challenges').select('id').eq('group_id', groupId);
    const challengeIds = (challenges ?? []).map((c: { id: string }) => c.id);

    const { data: profiles } = await supabase
      .from('profiles').select('id, user_name, user_emoji, avatar_url, timezone').in('id', memberIds);

    const viewerToday = new Date();
    const viewerYesterday = new Date(viewerToday.getTime() - 86400000);
    const rangeStart = toDateKey(viewerYesterday);
    const rangeEnd = toDateKey(viewerToday);

    const entries = challengeIds.length > 0
      ? (await supabase
          .from('group_challenge_checkins').select('user_id, date')
          .in('user_id', memberIds)
          .in('challenge_id', challengeIds)
          .gte('date', rangeStart)
          .lte('date', rangeEnd)
          .eq('done', true)).data
      : [];

    const profilesMap = Object.fromEntries((profiles ?? []).map((p: { id: string; user_name?: string; user_emoji?: string; avatar_url?: string; timezone?: string }) => [p.id, p]));

    return memberIds.map((userId: string) => {
      const profile = profilesMap[userId];
      const memberTz = profile?.timezone || 'UTC';
      const memberToday = toDateKeyInTimezone(memberTz);
      const doneToday = (entries ?? []).filter(
        (e: { user_id: string; date: string }) => e.user_id === userId && e.date === memberToday
      );
      return {
        userId,
        displayName: profile?.user_name || 'Member',
        avatarUrl: profile?.avatar_url ?? '',
        userEmoji: profile?.user_emoji ?? '😊',
        completedToday: doneToday.length > 0,
        challengesDoneToday: doneToday.length,
        timezone: memberTz,
      };
    });
  };

  const fetchPendingNudges = async (groupId: string): Promise<GroupNudge[]> => {
    const { data } = await supabase
      .from('group_nudges')
      .select('id, from_user_id, created_at, seen')
      .eq('group_id', groupId)
      .eq('to_user_id', user!.id)
      .eq('seen', false);

    if (!data || data.length === 0) return [];

    const fromIds = [...new Set(data.map((n: { from_user_id: string }) => n.from_user_id))];
    const { data: profiles } = await supabase
      .from('profiles').select('id, user_name').in('id', fromIds);
    const profilesMap = Object.fromEntries((profiles ?? []).map((p: { id: string; user_name?: string }) => [p.id, p.user_name || 'Member']));

    return data.map((n: { id: string; from_user_id: string; seen: boolean; created_at: string }) => ({
      id: n.id,
      groupId,
      fromUserId: n.from_user_id,
      toUserId: user!.id,
      fromDisplayName: profilesMap[n.from_user_id] ?? 'Member',
      seen: n.seen,
      createdAt: n.created_at,
    }));
  };

  // ── Streak / Trophies / Digest ──────────────────────────────────────────────

  const computeGroupStreak = async (groupId: string): Promise<number> => {
    const { data: members } = await supabase
      .from('group_members').select('user_id').eq('group_id', groupId);
    if (!members || members.length === 0) return 0;

    const { data: challenges } = await supabase
      .from('group_challenges').select('id').eq('group_id', groupId);
    const challengeIds = (challenges ?? []).map((c: { id: string }) => c.id);
    if (challengeIds.length === 0) return 0;

    const memberIds = members.map((m: { user_id: string }) => m.user_id);
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 89);
    const startKey = toDateKey(ninetyDaysAgo);

    const { data: entries } = await supabase
      .from('group_challenge_checkins')
      .select('user_id, date')
      .in('user_id', memberIds)
      .in('challenge_id', challengeIds)
      .gte('date', startKey)
      .eq('done', true);

    const datesWithActivity = new Set((entries ?? []).map((e: { date: string }) => e.date));

    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      if (datesWithActivity.has(key)) {
        streak++;
      } else if (i === 0) {
        continue; // grace period
      } else {
        break;
      }
    }
    return streak;
  };

  const computeGroupTrophies = async (groupId: string, groupStreakDays: number): Promise<GroupTrophy[]> => {
    const { data: group } = await supabase.from('groups').select('created_at').eq('id', groupId).single();
    const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
    const { data: challenges } = await supabase.from('group_challenges').select('id, end_date').eq('group_id', groupId);

    const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
    const challengeIds = (challenges ?? []).map((c: { id: string }) => c.id);
    const todayKey = toDateKey(new Date());

    const { count: totalDone } = challengeIds.length > 0
      ? await supabase
          .from('group_challenge_checkins')
          .select('id', { count: 'exact', head: true })
          .in('user_id', memberIds)
          .in('challenge_id', challengeIds)
          .eq('done', true)
      : { count: 0 };

    const daysSinceCreated = group
      ? Math.floor((Date.now() - new Date(group.created_at).getTime()) / 86400000)
      : 0;

    const completedChallenges = (challenges ?? []).filter((c: { end_date: string }) => c.end_date < todayKey);

    return [
      { id: 'first_steps', icon: '🌱', title: 'First Steps', description: 'Your group was created', earned: true, earnedAt: group?.created_at },
      { id: 'week_one', icon: '🔥', title: 'Week One', description: 'Group active for 7 days', earned: daysSinceCreated >= 7 },
      { id: 'century', icon: '💯', title: 'Century', description: '100 challenge check-ins completed together', earned: (totalDone ?? 0) >= 100 },
      { id: 'five_hundred', icon: '⚡', title: 'Power Circle', description: '500 challenge check-ins completed together', earned: (totalDone ?? 0) >= 500 },
      { id: 'perfect_week', icon: '💎', title: 'Perfect Week', description: 'Group streak of 7+ days', earned: groupStreakDays >= 7 },
      { id: 'challenge_champs', icon: '🏆', title: 'Challenge Champions', description: 'Completed your first challenge', earned: completedChallenges.length > 0 },
      { id: 'triple_threat', icon: '🎯', title: 'Triple Threat', description: 'Completed 3 challenges', earned: completedChallenges.length >= 3 },
    ];
  };

  const computeWeeklyDigest = async (groupId: string, groupStreakDays: number): Promise<WeeklyDigest | null> => {
    const today = new Date();
    // Always show the last completed week (Mon–Sun), regardless of current day
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon..6=Sat
    const daysSinceLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceLastMonday - 7);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysSinceLastMonday - 1);

    const startKey = toDateKey(lastMonday);
    const endKey = toDateKey(lastSunday);

    const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
    if (!members || members.length === 0) return null;
    const memberIds = members.map((m: { user_id: string }) => m.user_id);

    const { data: challenges } = await supabase.from('group_challenges').select('id').eq('group_id', groupId);
    const challengeIds = (challenges ?? []).map((c: { id: string }) => c.id);
    if (challengeIds.length === 0) return null;

    const { data: entries } = await supabase
      .from('group_challenge_checkins')
      .select('user_id, date')
      .in('user_id', memberIds)
      .in('challenge_id', challengeIds)
      .gte('date', startKey)
      .lte('date', endKey)
      .eq('done', true);

    if (!entries || entries.length === 0) return null;

    const { data: profiles } = await supabase
      .from('profiles').select('id, user_name').in('id', memberIds);
    const profilesMap = Object.fromEntries((profiles ?? []).map((p: { id: string; user_name?: string }) => [p.id, p.user_name || 'Member']));

    const countByUser: Record<string, number> = {};
    for (const e of entries) {
      countByUser[e.user_id] = (countByUser[e.user_id] ?? 0) + 1;
    }
    const totalCheckins = entries.length;
    const topUserId = Object.entries(countByUser).sort((a, b) => b[1] - a[1])[0]?.[0];

    const longestUserId = topUserId;
    const longestStreak = topUserId ? countByUser[topUserId] : 0;

    const weekLabel = `${lastMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    return {
      weekLabel,
      totalCheckins,
      topPerformerName: topUserId ? (profilesMap[topUserId] ?? 'Member') : 'No one',
      topPerformerCount: topUserId ? countByUser[topUserId] : 0,
      longestStreakName: longestUserId ? (profilesMap[longestUserId] ?? 'Member') : 'No one',
      longestStreak,
      groupStreakDays,
    };
  };

  // ── Challenges ──────────────────────────────────────────────────────────────

  const createChallenge = async (groupId: string, data: ChallengeInput): Promise<GroupChallenge> => {
    const { count } = await supabase
      .from('group_challenges')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if ((count ?? 0) >= MAX_CHALLENGES_PER_GROUP) {
      throw new Error(
        `This group has reached the limit of ${MAX_CHALLENGES_PER_GROUP} challenges. ` +
        `Delete a completed challenge from the Trophy Room to create a new one.`
      );
    }

    const { data: challenge, error } = await supabase
      .from('group_challenges')
      .insert({
        group_id: groupId,
        created_by: user!.id,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        habit_type: data.habitType,
        target: data.target,
        target_comparison: data.targetComparison ?? 'gte',
        schedule: data.schedule,
        custom_days: data.customDays ?? null,
        start_date: data.startDate,
        end_date: data.endDate,
      })
      .select().single();

    if (error) throw error;

    const mapped = mapChallengeFromDB(challenge);
    await joinChallenge(mapped, user!.id);

    return mapped;
  };

  const updateChallenge = async (challengeId: string, data: ChallengeInput): Promise<GroupChallenge> => {
    const { data: updated, error } = await supabase
      .from('group_challenges')
      .update({
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        habit_type: data.habitType,
        target: data.target,
        target_comparison: data.targetComparison ?? 'gte',
        schedule: data.schedule,
        custom_days: data.customDays ?? null,
        end_date: data.endDate,
      })
      .eq('id', challengeId)
      .select().single();
    if (error) throw error;
    return mapChallengeFromDB(updated);
  };

  const joinChallenge = async (challenge: GroupChallenge, userId: string): Promise<void> => {
    // Guard against double-join (e.g. stale UI state): bail out before creating anything
    const { data: existing } = await supabase
      .from('group_challenge_members')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (existing) return;

    const { error } = await supabase
      .from('group_challenge_members')
      .insert({ challenge_id: challenge.id, user_id: userId });
    if (error && error.code !== '23505') throw error;
  };

  const leaveChallenge = async (challengeId: string): Promise<void> => {
    const { error } = await supabase.from('group_challenge_members').delete()
      .eq('challenge_id', challengeId).eq('user_id', user!.id);
    if (error) throw error;
  };

  const deleteChallenge = async (challengeId: string): Promise<void> => {
    const { error } = await supabase.from('group_challenges').delete().eq('id', challengeId);
    if (error) throw error;
  };

  const checkInChallenge = async (challenge: GroupChallenge, actual?: string): Promise<boolean> => {
    const todayKey = toDateKey(new Date());
    // For number/decimal challenges, only count today as "done" if the logged value actually
    // reaches the target — e.g. logging 4,000 against a 7,000-step target should still show
    // the value to the group, but must NOT count as completed for streaks/leaderboard/pulse.
    let done = true;
    if (challenge.habitType === 'number' || challenge.habitType === 'decimal') {
      const targetNum = parseLeadingNumber(challenge.target);
      const actualNum = parseLeadingNumber(actual);
      if (targetNum !== null && actualNum !== null) {
        done = challenge.targetComparison === 'lte' ? actualNum <= targetNum : actualNum >= targetNum;
      }
    }
    // Upsert (not insert) so re-logging today's value — e.g. editing "5km" to "6km" — overwrites
    // the existing row instead of failing on the (challenge_id, user_id, date) unique constraint.
    const { error } = await supabase.from('group_challenge_checkins')
      .upsert(
        { challenge_id: challenge.id, user_id: user!.id, date: todayKey, actual: actual ?? null, done },
        { onConflict: 'challenge_id,user_id,date' }
      );
    if (error) throw error;
    return done;
  };

  const undoCheckInChallenge = async (challengeId: string): Promise<void> => {
    const todayKey = toDateKey(new Date());
    const { error } = await supabase.from('group_challenge_checkins').delete()
      .eq('challenge_id', challengeId).eq('user_id', user!.id).eq('date', todayKey);
    if (error) throw error;
  };

  // ── Feed reactions ──────────────────────────────────────────────────────────

  const toggleFeedReaction = async (groupId: string, entryId: string, emoji: string, hasMyReaction: boolean): Promise<void> => {
    if (hasMyReaction) {
      const { error } = await supabase.from('group_reactions').delete()
        .eq('from_user_id', user!.id).eq('entry_id', entryId).eq('emoji', emoji);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('group_reactions').insert({
        group_id: groupId, from_user_id: user!.id, entry_id: entryId, emoji,
      });
      if (error) throw error;
    }
  };

  // ── Nudges ──────────────────────────────────────────────────────────────────

  const sendNudge = async (groupId: string, toUserId: string): Promise<void> => {
    const sentDate = toDateKey(new Date());
    const { error } = await supabase.from('group_nudges').insert({
      group_id: groupId,
      from_user_id: user!.id,
      to_user_id: toUserId,
      sent_date: sentDate,
    });
    if (error?.code === '23505') throw new Error('already_nudged');
    if (error) throw error;
  };

  const markNudgeSeen = async (nudgeId: string): Promise<void> => {
    const { error } = await supabase.from('group_nudges').update({ seen: true }).eq('id', nudgeId);
    if (error) throw error;
  };

  // ── Chat ────────────────────────────────────────────────────────────────────

  const trimChatMessages = async (groupId: string): Promise<void> => {
    const { count } = await supabase
      .from('group_messages')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    const excess = (count ?? 0) - MAX_CHAT_MESSAGES;
    if (excess <= 0) return;

    const { data: oldest } = await supabase
      .from('group_messages')
      .select('id')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(excess);

    if (oldest && oldest.length > 0) {
      await supabase
        .from('group_messages')
        .delete()
        .in('id', oldest.map((m: { id: string }) => m.id));
    }
  };

  const sendMessage = async (groupId: string, content: string): Promise<void> => {
    // Defensive cap to match the textarea's maxLength and the DB check constraint — guards
    // any future caller that bypasses the UI (e.g. a pasted value somehow exceeding maxLength).
    const trimmed = content.slice(0, MAX_MESSAGE_LENGTH);
    const { error } = await supabase.from('group_messages').insert({
      group_id: groupId, user_id: user!.id, content: trimmed,
    });
    if (error) throw error;

    // Sliding-window trim: keep at most MAX_CHAT_MESSAGES per group. Errors are swallowed
    // so a trim failure never surfaces as a send error to the user.
    await trimChatMessages(groupId).catch(() => {});
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    const { error } = await supabase.from('group_messages').delete().eq('id', messageId);
    if (error) throw error;
  };

  const toggleMessageReaction = async (messageId: string, groupId: string, emoji: string, hasMyReaction: boolean): Promise<void> => {
    if (hasMyReaction) {
      const { error } = await supabase.from('group_message_reactions').delete()
        .eq('message_id', messageId).eq('user_id', user!.id).eq('emoji', emoji);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('group_message_reactions').insert({
        message_id: messageId, group_id: groupId, user_id: user!.id, emoji,
      });
      if (error) throw error;
    }
  };

  const value: GroupContextType = {
    groups, loadingGroups, refetchGroups,
    createGroup, updateGroupSettings, deleteGroup, regenerateInviteCode,
    joinGroupByCode, leaveGroup, removeMember, promoteMember, updateMemberSettings, markGroupSeen,
    fetchGroupById, fetchGroupMembers, fetchGroupChallenges, fetchFeedPage,
    fetchMessages, fetchChallengeParticipants, fetchTodaysPulse, fetchPendingNudges,
    computeGroupStreak, computeGroupTrophies, computeWeeklyDigest,
    createChallenge, updateChallenge, joinChallenge, leaveChallenge, deleteChallenge,
    checkInChallenge, undoCheckInChallenge,
    toggleFeedReaction,
    sendNudge, markNudgeSeen,
    sendMessage, deleteMessage, toggleMessageReaction,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroups(): GroupContextType {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroups must be inside GroupProvider');
  return ctx;
}
