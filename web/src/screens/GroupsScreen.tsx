import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Check } from 'lucide-react';
import { useGroups } from '@/context/GroupContext';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useFont } from '@/hooks/useFont';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { env } from '@/lib/env';
import type { GroupWithStats } from '@/lib/db/groupTypes';

const EMOJIS = [
  '💪','🏃','📚','💧','🥗','😴','🧘','🎯',
  '💰','✍️','🎨','🎵','🏋️','🌱','🧠','❤️',
  '☀️','🌙','🍎','📖','🛁','☕','✅','🎮',
];

const HABIT_COLORS = [
  '#2B3A8C','#1A6B3A','#8B2635','#C9A84C',
  '#6B3A8C','#1A6B6B','#C04A1A','#3A7A8C',
];

function GroupCard({ group, onClick }: { group: GroupWithStats; onClick: () => void }) {
  const colors = useColors();
  const font = useFont();

  const greenCount = group.membersToday.filter(m => m.completedToday).length;
  const greyCount = group.membersToday.filter(m => !m.completedToday).length;

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${group.color}`,
        borderRadius: 14,
        padding: '14px 16px',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'opacity 0.12s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{group.emoji}</span>
        <p style={{ ...font.label, fontSize: 16, color: colors.foreground, margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
        {group.unreadCount > 0 && (
          <div style={{ backgroundColor: colors.destructive, borderRadius: 10, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ ...font.label, fontSize: 11, color: '#fff' }}>🔴 {group.unreadCount} new</span>
          </div>
        )}
      </div>
      <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: '0 0 6px' }}>
        {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} · {group.activeChallengeCount} challenge{group.activeChallengeCount !== 1 ? 's' : ''}
      </p>
      {group.motto && (
        <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic', margin: '0 0 8px' }}>"{group.motto}"</p>
      )}
      {group.membersToday.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, flexShrink: 0 }}>Today:</span>
          {group.membersToday.slice(0, 8).map(m => (
            <div
              key={m.userId}
              style={{
                width: 10, height: 10, borderRadius: 5, flexShrink: 0,
                backgroundColor: m.completedToday ? colors.success : colors.border,
              }}
            />
          ))}
          {group.membersToday.length > 8 && (
            <span style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, flexShrink: 0 }}>+{group.membersToday.length - 8}</span>
          )}
          <span style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, marginLeft: 2, flexShrink: 0 }}>
            {greenCount}/{group.membersToday.length} done
          </span>
        </div>
      )}
    </button>
  );
}

function CreateGroupModal({ visible, onClose, onCreated }: {
  visible: boolean;
  onClose: () => void;
  onCreated: (groupId: string, inviteCode: string) => void;
}) {
  const colors = useColors();
  const font = useFont();
  const { createGroup } = useGroups();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [color, setColor] = useState('#2B3A8C');
  const [saving, setSaving] = useState(false);

  const canCreate = name.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate || saving) return;
    setSaving(true);
    try {
      const group = await createGroup(name.trim(), emoji, color);
      setName(''); setEmoji('👥'); setColor('#2B3A8C');
      onCreated(group.id, group.inviteCode);
    } catch (err: unknown) {
      showToast((err as Error).message || 'Failed to create group.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: '24px 20px 28px' }}>
        <p style={{ ...font.heading, fontSize: 22, color: colors.primary, margin: '0 0 4px' }}>New Group</p>
        <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 20px' }}>Create a circle to track habits together</p>

        {/* Emoji picker */}
        <p style={{ ...font.label, fontSize: 12, color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 10px' }}>Icon</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{ width: 44, height: 44, borderRadius: 10, border: `${emoji === e ? 2 : 1}px solid ${emoji === e ? color : colors.border}`, backgroundColor: emoji === e ? color + '20' : colors.muted, cursor: 'pointer', fontSize: 20 }}>
              {e}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <p style={{ ...font.label, fontSize: 12, color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 10px' }}>Color</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {HABIT_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, border: color === c ? `3px solid ${colors.foreground}` : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: color === c ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.1s' }}>
              {color === c && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>

        {/* Name */}
        <p style={{ ...font.label, fontSize: 12, color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 10px' }}>Group Name</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Morning Warriors"
          maxLength={40}
          style={{ ...font.body, fontSize: 15, color: colors.foreground, border: `1.5px solid ${name ? color : colors.border}`, borderRadius: 10, padding: '12px 14px', backgroundColor: colors.card, width: '100%', outline: 'none', display: 'block', boxSizing: 'border-box', marginBottom: 20 }}
        />

        <button
          onClick={handleCreate}
          disabled={!canCreate || saving}
          style={{ ...font.label, fontSize: 16, fontWeight: 700, backgroundColor: canCreate ? color : colors.muted, color: canCreate ? '#fff' : colors.mutedForeground, border: 'none', borderRadius: 13, padding: '15px 24px', width: '100%', cursor: canCreate && !saving ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s', opacity: saving ? 0.7 : 1 }}
        >
          {saving && <span style={{ width: 16, height: 16, border: '2.5px solid #ffffff60', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
          {saving ? 'Creating…' : 'Create Group'}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Modal>
  );
}

function InviteModal({ visible, onClose, inviteCode }: { visible: boolean; onClose: () => void; inviteCode: string }) {
  const colors = useColors();
  const font = useFont();
  const [copied, setCopied] = useState(false);

  const url = `${env.appUrl}/join/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: '24px 20px 28px', textAlign: 'center' }}>
        <p style={{ ...font.heading, fontSize: 22, color: colors.primary, margin: '0 0 4px' }}>Invite Friends 🎉</p>
        <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 20px' }}>Anyone with this link can join your group.</p>

        <div style={{ backgroundColor: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, wordBreak: 'break-all', textAlign: 'left' }}>
          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: 0 }}>{url}</p>
        </div>

        <button
          onClick={handleCopy}
          style={{ ...font.label, fontSize: 15, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
        >
          {copied ? <Check size={16} color="#fff" /> : <Copy size={16} color="#fff" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button onClick={onClose} style={{ ...font.body, fontSize: 14, background: 'none', border: 'none', color: colors.mutedForeground, cursor: 'pointer', padding: 8 }}>Done</button>
      </div>
    </Modal>
  );
}

export default function GroupsScreen() {
  const colors = useColors();
  const font = useFont();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { groups, loadingGroups } = useGroups();
  const { user } = useAuth();

  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState('');

  const currentUserId = user?.id ?? '';
  const createdByMeCount = groups.filter(g => g.createdBy === currentUserId).length;
  const atCreationLimit = createdByMeCount >= 10;

  const handleCreated = (groupId: string, inviteCode: string) => {
    setShowCreate(false);
    setNewInviteCode(inviteCode);
    setShowInvite(true);
  };

  const padding = isDesktop ? '0 24px' : '0 16px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '18px 24px 14px' : '16px 16px 12px', borderBottom: `1px solid ${colors.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...font.heading, fontSize: isDesktop ? 28 : 24, color: colors.primary }}>Groups</span>
        <button
          onClick={() => setShowCreate(true)}
          disabled={atCreationLimit}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: atCreationLimit ? colors.muted : colors.primary, color: atCreationLimit ? colors.mutedForeground : '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: atCreationLimit ? 'default' : 'pointer', opacity: atCreationLimit ? 0.6 : 1 }}
        >
          <Plus size={16} color={atCreationLimit ? colors.mutedForeground : '#fff'} />
          <span style={{ ...font.label, fontSize: 14 }}>New Group</span>
        </button>
      </div>

      {atCreationLimit && (
        <div style={{ padding: '8px 16px', backgroundColor: colors.muted }}>
          <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0, textAlign: 'center' }}>
            You've created 10/10 groups. Delete a group you own to create a new one.
          </p>
        </div>
      )}

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: `16px ${isDesktop ? '24px' : '16px'}` }}>
        {loadingGroups ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '14px 16px', height: 90, opacity: 0.5 }} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
            <span style={{ fontSize: 64 }}>👥</span>
            <p style={{ ...font.heading, fontSize: 22, color: colors.foreground, margin: 0 }}>Your Circle</p>
            <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, textAlign: 'center', maxWidth: 260, margin: 0, lineHeight: 1.6 }}>
              Create a group to track habits with friends, run challenges, and stay accountable together.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}
            >
              <Plus size={18} color="#fff" />
              <span style={{ ...font.label, fontSize: 15 }}>Create Group</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 12 }}>
            {groups.map(group => (
              <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} inviteCode={newInviteCode} />
    </div>
  );
}
