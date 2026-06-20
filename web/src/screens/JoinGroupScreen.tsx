import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/useColors';
import { useFont } from '@/hooks/useFont';
import { useToast } from '@/context/ToastContext';
import { useGroups } from '@/context/GroupContext';

type State = 'loading' | 'rate_limited' | 'not_found' | 'unauthenticated' | 'ready_to_join' | 'already_member';

const MAX_ATTEMPTS_PER_HOUR = 10;

async function checkRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from('invite_code_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('attempted_at', oneHourAgo);
  return (count ?? 0) < MAX_ATTEMPTS_PER_HOUR;
}

async function logAttempt(userId: string) {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  await Promise.all([
    supabase.from('invite_code_attempts').insert({ user_id: userId }),
    supabase.from('invite_code_attempts').delete()
      .eq('user_id', userId).lt('attempted_at', oneHourAgo),
  ]);
}

export default function JoinGroupScreen() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const colors = useColors();
  const font = useFont();
  const { showToast } = useToast();
  const { joinGroupByCode } = useGroups();

  const [state, setState] = useState<State>('loading');
  const [group, setGroup] = useState<{ id: string; name: string; emoji: string; color: string; member_limit: number; welcome_message: string; description: string } | null>(null);
  const [joining, setJoining] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!code) { setState('not_found'); return; }
      setState('loading');

      // Auth check first — avoids showing "not found" when RLS blocks unauth reads
      if (!user) { setState('unauthenticated'); return; }

      const allowed = await checkRateLimit(user.id);
      if (!allowed) { setState('rate_limited'); return; }
      await logAttempt(user.id);

      const { data: groupData, error } = await supabase
        .from('groups')
        .select('id, name, emoji, color, member_limit, welcome_message, description')
        .eq('invite_code', code)
        .single();

      if (error || !groupData) { setState('not_found'); return; }
      setGroup(groupData);

      const { count } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupData.id);
      setMemberCount(count ?? 0);

      const { data: membership } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      setState(membership ? 'already_member' : 'ready_to_join');
    };
    load();
  }, [code, user]);

  const handleJoin = async () => {
    if (!group || !user || joining || !code) return;
    if (memberCount >= group.member_limit) {
      showToast(`This group is full (${group.member_limit}/${group.member_limit} members).`, 'error');
      return;
    }
    setJoining(true);
    try {
      await joinGroupByCode(code);
      if (group.welcome_message) {
        if (group.welcome_message.length > 80) {
          showToast(`Welcome! ${group.welcome_message}`, 'success');
        } else {
          showToast(`Welcome! The group says: ${group.welcome_message}`, 'success');
        }
      }
      navigate(`/groups/${group.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join group. Please try again.';
      showToast(message, 'error');
    } finally {
      setJoining(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    padding: '32px 28px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  };

  if (state === 'loading') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ width: 36, height: 36, border: `3px solid ${colors.primary}30`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...font.body, fontSize: 15, color: colors.mutedForeground, margin: 0 }}>Loading invite link…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'rate_limited') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
          <p style={{ ...font.heading, fontSize: 22, color: colors.foreground, margin: '0 0 10px' }}>Too Many Attempts</p>
          <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, margin: '0 0 24px', lineHeight: 1.6 }}>Too many attempts. Please try again in an hour.</p>
          <button onClick={() => navigate('/')} style={{ ...font.label, fontSize: 15, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', cursor: 'pointer', width: '100%' }}>
            Go to Habit Ink
          </button>
        </div>
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔗</div>
          <p style={{ ...font.heading, fontSize: 22, color: colors.foreground, margin: '0 0 10px' }}>Link not found</p>
          <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, margin: '0 0 24px', lineHeight: 1.6 }}>This invite link is invalid or has expired.</p>
          <button onClick={() => navigate('/')} style={{ ...font.label, fontSize: 15, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', cursor: 'pointer', width: '100%' }}>
            Go to Habit Ink
          </button>
        </div>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔐</div>
          <p style={{ ...font.heading, fontSize: 22, color: colors.foreground, margin: '0 0 10px' }}>Sign in to join</p>
          <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, margin: '0 0 24px', lineHeight: 1.6 }}>
            You've been invited to a Habit Ink group. Sign in first and we'll bring you right back to this link.
          </p>
          <button
            onClick={() => signIn({ redirectTo: window.location.href })}
            style={{ ...font.label, fontSize: 15, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}
          >
            Sign in with Google
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', ...font.body, fontSize: 13, color: colors.mutedForeground }}>
            Go to Habit Ink instead
          </button>
        </div>
      </div>
    );
  }

  const isFull = memberCount >= (group?.member_limit ?? 20);

  return (
    <div style={containerStyle}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={cardStyle}>
        {/* Group card */}
        <div style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: (group?.color ?? '#2B3A8C') + '20', border: `3px solid ${group?.color ?? '#2B3A8C'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>
          {group?.emoji ?? '👥'}
        </div>
        <p style={{ ...font.heading, fontSize: 24, color: colors.foreground, margin: '0 0 6px' }}>{group?.name}</p>
        {group?.description && (
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 12px', lineHeight: 1.5 }}>{group.description}</p>
        )}
        <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 24px' }}>
          {memberCount} / {group?.member_limit ?? 20} members
          {isFull && <span style={{ color: colors.destructive, marginLeft: 6 }}>· Group is full</span>}
        </p>

        {state === 'already_member' ? (
          <>
            <div style={{ backgroundColor: colors.success + '15', border: `1px solid ${colors.success}40`, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ ...font.label, fontSize: 13, color: colors.success, margin: 0 }}>You're already in this group</p>
            </div>
            <button
              onClick={() => navigate(`/groups/${group?.id}`)}
              style={{ ...font.label, fontSize: 15, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', width: '100%' }}
            >
              Open Group
            </button>
          </>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining || isFull}
            style={{ ...font.label, fontSize: 15, backgroundColor: isFull ? colors.muted : colors.primary, color: isFull ? colors.mutedForeground : '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', cursor: isFull ? 'default' : 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: joining ? 0.7 : 1 }}
          >
            {joining && <span style={{ width: 16, height: 16, border: '2.5px solid #ffffff60', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
            {isFull ? 'Group is Full' : joining ? 'Joining…' : 'Join Group'}
          </button>
        )}

        <button onClick={() => navigate('/')} style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', ...font.body, fontSize: 13, color: colors.mutedForeground }}>
          Go to Habit Ink instead
        </button>
      </div>
    </div>
  );
}
