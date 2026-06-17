import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Settings as SettingsIcon, RefreshCw, Plus, ChevronDown, ChevronRight,
  Copy, Check, Send, X, MoreVertical, Pencil, Smile,
  PawPrint, Pizza, Dumbbell, Plane, Lightbulb, Sparkles, Flag, Search, Trash2,
} from 'lucide-react';
import { useGroups, MAX_MESSAGE_LENGTH } from '@/context/GroupContext';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useFont } from '@/hooks/useFont';
import { useToast } from '@/context/ToastContext';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Confetti } from '@/components/Confetti';
import { supabase } from '@/lib/supabase';
import { toDateKey, isScheduledForDate } from '@/context/HabitContext';
import { toDateKeyInTimezone } from '@/lib/dateUtils';
import type { Habit } from '@/context/HabitContext';
import type {
  Group, GroupMember, GroupChallenge, ChallengeParticipant,
  FeedEntry, GroupMessage, GroupTrophy, WeeklyDigest, MemberTodayStatus,
  ChallengeInput,
} from '@/lib/db/groupTypes';
import { env } from '@/lib/env';

// ─── Constants ───────────────────────────────────────────────────────────────
const EMOJIS = [
  '💪', '🏃', '📚', '💧', '🥗', '😴', '🧘', '🎯',
  '💰', '✍️', '🎨', '🎵', '🏋️', '🌱', '🧠', '❤️',
  '☀️', '🌙', '🍎', '📖', '🛁', '☕', '✅', '🎮',
];
const HABIT_COLORS = [
  '#2B3A8C', '#1A6B3A', '#8B2635', '#C9A84C',
  '#6B3A8C', '#1A6B6B', '#C04A1A', '#3A7A8C',
];
const REACTION_EMOJIS = ['🔥', '❤️', '😂', '👍', '💯'];
const FEED_REACTION_EMOJIS = ['🔥', '❤️', '💪'];
type TabKey = 'feed' | 'challenges' | 'members' | 'chat' | 'settings';

// Full chat-composer emoji keyboard (WhatsApp/iOS/Slack-style), grouped into the standard
// Unicode categories. Each entry carries a short name so the picker can show a hover label
// and support keyword search — matching how every major chat app's emoji keyboard behaves.
interface EmojiEntry { char: string; name: string; }
interface EmojiCategory { key: string; label: string; icon: React.ElementType; emojis: EmojiEntry[]; }

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    key: 'smileys', label: 'Smileys & People', icon: Smile,
    emojis: [
      { char: '😀', name: 'grinning face' }, { char: '😃', name: 'grinning face with big eyes' },
      { char: '😄', name: 'grinning face with smiling eyes' }, { char: '😁', name: 'beaming face' },
      { char: '😆', name: 'squinting face' }, { char: '😅', name: 'sweat smile' },
      { char: '🤣', name: 'rolling on the floor laughing' }, { char: '😂', name: 'tears of joy' },
      { char: '🙂', name: 'slightly smiling face' }, { char: '🙃', name: 'upside-down face' },
      { char: '😉', name: 'winking face' }, { char: '😊', name: 'smiling face' },
      { char: '😇', name: 'angel' }, { char: '🥰', name: 'smiling face with hearts' },
      { char: '😍', name: 'heart eyes' }, { char: '🤩', name: 'star-struck' },
      { char: '😘', name: 'blowing a kiss' }, { char: '😗', name: 'kissing face' },
      { char: '😋', name: 'yummy face' }, { char: '😛', name: 'tongue out' },
      { char: '😜', name: 'winking tongue' }, { char: '🤪', name: 'zany face' },
      { char: '🤑', name: 'money mouth' }, { char: '🤗', name: 'hugging face' },
      { char: '🤭', name: 'hand over mouth' }, { char: '🤫', name: 'shushing face' },
      { char: '🤔', name: 'thinking face' }, { char: '😐', name: 'neutral face' },
      { char: '😑', name: 'expressionless' }, { char: '😶', name: 'no mouth' },
      { char: '😏', name: 'smirking face' }, { char: '😒', name: 'unamused' },
      { char: '🙄', name: 'eye roll' }, { char: '😬', name: 'grimacing' },
      { char: '😌', name: 'relieved' }, { char: '😔', name: 'pensive' },
      { char: '😪', name: 'sleepy' }, { char: '🤤', name: 'drooling' },
      { char: '😴', name: 'sleeping' }, { char: '😷', name: 'medical mask' },
      { char: '🤒', name: 'thermometer face' }, { char: '🤢', name: 'nauseated' },
      { char: '🥵', name: 'hot face' }, { char: '🥶', name: 'cold face' },
      { char: '😵', name: 'dizzy' }, { char: '🤯', name: 'mind blown' },
      { char: '🥳', name: 'party face' }, { char: '😎', name: 'cool sunglasses' },
      { char: '🤓', name: 'nerd face' }, { char: '🧐', name: 'monocle' },
      { char: '😕', name: 'confused' }, { char: '😟', name: 'worried' },
      { char: '😮', name: 'open mouth' }, { char: '😲', name: 'astonished' },
      { char: '😳', name: 'flushed' }, { char: '🥺', name: 'pleading face' },
      { char: '😢', name: 'crying' }, { char: '😭', name: 'sobbing' },
      { char: '😱', name: 'screaming in fear' }, { char: '😖', name: 'confounded' },
      { char: '😞', name: 'disappointed' }, { char: '😩', name: 'weary' },
      { char: '😫', name: 'tired' }, { char: '🥱', name: 'yawning' },
      { char: '😤', name: 'huffing' }, { char: '😡', name: 'enraged' },
      { char: '😠', name: 'angry' }, { char: '🤬', name: 'cursing' },
      { char: '👶', name: 'baby' }, { char: '🧒', name: 'child' },
      { char: '🧑', name: 'person' }, { char: '👨', name: 'man' }, { char: '👩', name: 'woman' },
      { char: '🧓', name: 'older person' }, { char: '👍', name: 'thumbs up' },
      { char: '👎', name: 'thumbs down' }, { char: '👏', name: 'clapping' },
      { char: '🙌', name: 'raising hands' }, { char: '🙏', name: 'folded hands' },
      { char: '💪', name: 'flexed biceps' }, { char: '👋', name: 'waving hand' },
      { char: '🤝', name: 'handshake' }, { char: '✌️', name: 'victory' },
      { char: '🤞', name: 'fingers crossed' }, { char: '👌', name: 'ok hand' },
      { char: '🤘', name: 'rock on' }, { char: '🤙', name: 'call me' },
      { char: '👉', name: 'pointing right' }, { char: '👈', name: 'pointing left' },
      { char: '👆', name: 'pointing up' }, { char: '✋', name: 'raised hand' },
      { char: '👊', name: 'fist bump' }, { char: '✊', name: 'raised fist' },
      { char: '💅', name: 'nail polish' }, { char: '💋', name: 'kiss mark' },
    ],
  },
  {
    key: 'animals', label: 'Animals & Nature', icon: PawPrint,
    emojis: [
      { char: '🐶', name: 'dog' }, { char: '🐱', name: 'cat' }, { char: '🐭', name: 'mouse' },
      { char: '🐹', name: 'hamster' }, { char: '🐰', name: 'rabbit' }, { char: '🦊', name: 'fox' },
      { char: '🐻', name: 'bear' }, { char: '🐼', name: 'panda' }, { char: '🐨', name: 'koala' },
      { char: '🐯', name: 'tiger' }, { char: '🦁', name: 'lion' }, { char: '🐮', name: 'cow' },
      { char: '🐷', name: 'pig' }, { char: '🐸', name: 'frog' }, { char: '🐵', name: 'monkey' },
      { char: '🙈', name: 'see-no-evil monkey' }, { char: '🐔', name: 'chicken' },
      { char: '🐧', name: 'penguin' }, { char: '🐦', name: 'bird' }, { char: '🦄', name: 'unicorn' },
      { char: '🐝', name: 'bee' }, { char: '🦋', name: 'butterfly' }, { char: '🐢', name: 'turtle' },
      { char: '🐍', name: 'snake' }, { char: '🦖', name: 'dinosaur' }, { char: '🐙', name: 'octopus' },
      { char: '🦀', name: 'crab' }, { char: '🐠', name: 'fish' }, { char: '🐬', name: 'dolphin' },
      { char: '🐳', name: 'whale' }, { char: '🦈', name: 'shark' }, { char: '🐊', name: 'crocodile' },
      { char: '🐘', name: 'elephant' }, { char: '🦒', name: 'giraffe' }, { char: '🐪', name: 'camel' },
      { char: '🐎', name: 'horse' }, { char: '🐄', name: 'cattle' }, { char: '🐑', name: 'sheep' },
      { char: '🐓', name: 'rooster' }, { char: '🦉', name: 'owl' }, { char: '🦇', name: 'bat' },
      { char: '🐺', name: 'wolf' }, { char: '🐗', name: 'boar' }, { char: '🌵', name: 'cactus' },
      { char: '🌲', name: 'tree' }, { char: '🌴', name: 'palm tree' }, { char: '🌸', name: 'cherry blossom' },
      { char: '🌻', name: 'sunflower' }, { char: '🌹', name: 'rose' }, { char: '🍀', name: 'four leaf clover' },
      { char: '🌈', name: 'rainbow' }, { char: '☀️', name: 'sun' }, { char: '⭐', name: 'star' },
      { char: '🌙', name: 'crescent moon' }, { char: '⚡', name: 'lightning' }, { char: '🔥', name: 'fire' },
      { char: '❄️', name: 'snowflake' },
    ],
  },
  {
    key: 'food', label: 'Food & Drink', icon: Pizza,
    emojis: [
      { char: '🍏', name: 'green apple' }, { char: '🍎', name: 'red apple' }, { char: '🍐', name: 'pear' },
      { char: '🍊', name: 'orange' }, { char: '🍋', name: 'lemon' }, { char: '🍌', name: 'banana' },
      { char: '🍉', name: 'watermelon' }, { char: '🍇', name: 'grapes' }, { char: '🍓', name: 'strawberry' },
      { char: '🫐', name: 'blueberries' }, { char: '🍒', name: 'cherries' }, { char: '🍑', name: 'peach' },
      { char: '🥭', name: 'mango' }, { char: '🍍', name: 'pineapple' }, { char: '🥝', name: 'kiwi' },
      { char: '🍅', name: 'tomato' }, { char: '🥑', name: 'avocado' }, { char: '🥦', name: 'broccoli' },
      { char: '🌽', name: 'corn' }, { char: '🥕', name: 'carrot' }, { char: '🍞', name: 'bread' },
      { char: '🥐', name: 'croissant' }, { char: '🧀', name: 'cheese' }, { char: '🍳', name: 'fried egg' },
      { char: '🥞', name: 'pancakes' }, { char: '🥓', name: 'bacon' }, { char: '🍔', name: 'burger' },
      { char: '🍟', name: 'fries' }, { char: '🍕', name: 'pizza' }, { char: '🌭', name: 'hot dog' },
      { char: '🌮', name: 'taco' }, { char: '🌯', name: 'burrito' }, { char: '🍝', name: 'pasta' },
      { char: '🍜', name: 'ramen' }, { char: '🍣', name: 'sushi' }, { char: '🍤', name: 'fried shrimp' },
      { char: '🍦', name: 'soft ice cream' }, { char: '🍩', name: 'donut' }, { char: '🍪', name: 'cookie' },
      { char: '🎂', name: 'birthday cake' }, { char: '🍰', name: 'cake' }, { char: '🍫', name: 'chocolate' },
      { char: '🍬', name: 'candy' }, { char: '☕', name: 'coffee' }, { char: '🍵', name: 'tea' },
      { char: '🧃', name: 'juice box' }, { char: '🥤', name: 'soda cup' }, { char: '🍺', name: 'beer' },
      { char: '🍻', name: 'cheers' }, { char: '🍷', name: 'wine' }, { char: '🥂', name: 'champagne toast' },
      { char: '🍾', name: 'champagne' },
    ],
  },
  {
    key: 'activities', label: 'Activities', icon: Dumbbell,
    emojis: [
      { char: '⚽', name: 'soccer ball' }, { char: '🏀', name: 'basketball' }, { char: '🏈', name: 'football' },
      { char: '⚾', name: 'baseball' }, { char: '🎾', name: 'tennis' }, { char: '🏐', name: 'volleyball' },
      { char: '🏉', name: 'rugby' }, { char: '🎱', name: 'pool' }, { char: '🏓', name: 'ping pong' },
      { char: '🏸', name: 'badminton' }, { char: '🥊', name: 'boxing glove' }, { char: '🥋', name: 'martial arts' },
      { char: '⛳', name: 'golf' }, { char: '🏹', name: 'archery' }, { char: '🎣', name: 'fishing' },
      { char: '🤿', name: 'diving mask' }, { char: '🥅', name: 'goal net' }, { char: '🏆', name: 'trophy' },
      { char: '🥇', name: 'gold medal' }, { char: '🥈', name: 'silver medal' }, { char: '🥉', name: 'bronze medal' },
      { char: '🏅', name: 'sports medal' }, { char: '🎯', name: 'dart' }, { char: '🎮', name: 'video game' },
      { char: '🕹️', name: 'joystick' }, { char: '🎲', name: 'dice' }, { char: '🧩', name: 'puzzle' },
      { char: '♟️', name: 'chess pawn' }, { char: '🎳', name: 'bowling' }, { char: '🚴', name: 'cycling' },
      { char: '🏋️', name: 'weightlifting' }, { char: '🧘', name: 'yoga' }, { char: '🏃', name: 'running' },
      { char: '🤸', name: 'cartwheel' }, { char: '⛹️', name: 'basketball player' },
    ],
  },
  {
    key: 'travel', label: 'Travel & Places', icon: Plane,
    emojis: [
      { char: '🚗', name: 'car' }, { char: '🚕', name: 'taxi' }, { char: '🚌', name: 'bus' },
      { char: '🚎', name: 'trolley' }, { char: '🏎️', name: 'race car' }, { char: '🚓', name: 'police car' },
      { char: '🚑', name: 'ambulance' }, { char: '🚒', name: 'fire truck' }, { char: '🚚', name: 'truck' },
      { char: '🚲', name: 'bicycle' }, { char: '🛵', name: 'scooter' }, { char: '🏍️', name: 'motorcycle' },
      { char: '🚆', name: 'train' }, { char: '🚇', name: 'metro' }, { char: '✈️', name: 'airplane' },
      { char: '🛫', name: 'departure' }, { char: '🚀', name: 'rocket' }, { char: '🛸', name: 'flying saucer' },
      { char: '🚁', name: 'helicopter' }, { char: '⛵', name: 'sailboat' }, { char: '🚤', name: 'speedboat' },
      { char: '🛳️', name: 'cruise ship' }, { char: '⚓', name: 'anchor' }, { char: '🗽', name: 'statue of liberty' },
      { char: '🗼', name: 'tower' }, { char: '🏰', name: 'castle' }, { char: '🏯', name: 'japanese castle' },
      { char: '🎡', name: 'ferris wheel' }, { char: '🎢', name: 'roller coaster' }, { char: '🏖️', name: 'beach' },
      { char: '🏝️', name: 'desert island' }, { char: '🏔️', name: 'mountain' }, { char: '🌋', name: 'volcano' },
      { char: '🏕️', name: 'camping' }, { char: '🗻', name: 'mount fuji' }, { char: '🌅', name: 'sunrise' },
      { char: '🌇', name: 'sunset' }, { char: '🌃', name: 'night city' }, { char: '🌌', name: 'milky way' },
      { char: '🎆', name: 'fireworks' },
    ],
  },
  {
    key: 'objects', label: 'Objects', icon: Lightbulb,
    emojis: [
      { char: '⌚', name: 'watch' }, { char: '📱', name: 'phone' }, { char: '💻', name: 'laptop' },
      { char: '⌨️', name: 'keyboard' }, { char: '🖥️', name: 'desktop' }, { char: '🖨️', name: 'printer' },
      { char: '🖱️', name: 'mouse' }, { char: '📷', name: 'camera' }, { char: '🎥', name: 'video camera' },
      { char: '📺', name: 'tv' }, { char: '🎧', name: 'headphones' }, { char: '🎤', name: 'microphone' },
      { char: '🎵', name: 'musical note' }, { char: '🎶', name: 'musical notes' }, { char: '🎸', name: 'guitar' },
      { char: '🎹', name: 'piano' }, { char: '🥁', name: 'drum' }, { char: '📚', name: 'books' },
      { char: '📖', name: 'open book' }, { char: '✏️', name: 'pencil' }, { char: '✒️', name: 'pen' },
      { char: '📝', name: 'memo' }, { char: '📌', name: 'pin' }, { char: '📎', name: 'paperclip' },
      { char: '✂️', name: 'scissors' }, { char: '🔒', name: 'locked' }, { char: '🔑', name: 'key' },
      { char: '🔨', name: 'hammer' }, { char: '🛠️', name: 'tools' }, { char: '💡', name: 'lightbulb' },
      { char: '🔦', name: 'flashlight' }, { char: '🕯️', name: 'candle' }, { char: '💰', name: 'money bag' },
      { char: '💵', name: 'dollar bills' }, { char: '💳', name: 'credit card' }, { char: '🎁', name: 'gift' },
      { char: '🎈', name: 'balloon' }, { char: '🎀', name: 'ribbon' },
    ],
  },
  {
    key: 'symbols', label: 'Symbols', icon: Sparkles,
    emojis: [
      { char: '❤️', name: 'red heart' }, { char: '🧡', name: 'orange heart' }, { char: '💛', name: 'yellow heart' },
      { char: '💚', name: 'green heart' }, { char: '💙', name: 'blue heart' }, { char: '💜', name: 'purple heart' },
      { char: '🖤', name: 'black heart' }, { char: '🤍', name: 'white heart' }, { char: '🤎', name: 'brown heart' },
      { char: '💔', name: 'broken heart' }, { char: '❣️', name: 'heart exclamation' }, { char: '💕', name: 'two hearts' },
      { char: '💞', name: 'revolving hearts' }, { char: '💓', name: 'beating heart' }, { char: '💗', name: 'growing heart' },
      { char: '💖', name: 'sparkling heart' }, { char: '💘', name: 'heart with arrow' }, { char: '💝', name: 'heart with ribbon' },
      { char: '💟', name: 'heart decoration' }, { char: '☮️', name: 'peace symbol' }, { char: '✝️', name: 'cross' },
      { char: '☯️', name: 'yin yang' }, { char: '✡️', name: 'star of david' }, { char: '🔯', name: 'six pointed star' },
      { char: '♻️', name: 'recycling' }, { char: '✅', name: 'check mark' }, { char: '❌', name: 'cross mark' },
      { char: '❓', name: 'question mark' }, { char: '❗', name: 'exclamation mark' }, { char: '💯', name: 'hundred points' },
      { char: '🔥', name: 'fire' }, { char: '✨', name: 'sparkles' }, { char: '⭐', name: 'star' },
      { char: '🌟', name: 'glowing star' }, { char: '💫', name: 'dizzy star' }, { char: '💥', name: 'collision' },
      { char: '💢', name: 'anger symbol' }, { char: '💤', name: 'zzz' }, { char: '🆗', name: 'ok button' },
      { char: '🔝', name: 'top arrow' }, { char: '🔞', name: 'no one under eighteen' },
    ],
  },
  {
    key: 'flags', label: 'Flags', icon: Flag,
    emojis: [
      { char: '🏳️', name: 'white flag' }, { char: '🏴', name: 'black flag' }, { char: '🏁', name: 'checkered flag' },
      { char: '🚩', name: 'triangular flag' }, { char: '🏳️‍🌈', name: 'rainbow flag' },
      { char: '🇺🇸', name: 'United States' }, { char: '🇬🇧', name: 'United Kingdom' }, { char: '🇮🇳', name: 'India' },
      { char: '🇨🇦', name: 'Canada' }, { char: '🇦🇺', name: 'Australia' }, { char: '🇩🇪', name: 'Germany' },
      { char: '🇫🇷', name: 'France' }, { char: '🇪🇸', name: 'Spain' }, { char: '🇮🇹', name: 'Italy' },
      { char: '🇯🇵', name: 'Japan' }, { char: '🇰🇷', name: 'South Korea' }, { char: '🇨🇳', name: 'China' },
      { char: '🇧🇷', name: 'Brazil' }, { char: '🇲🇽', name: 'Mexico' }, { char: '🇿🇦', name: 'South Africa' },
      { char: '🇳🇬', name: 'Nigeria' }, { char: '🇦🇪', name: 'UAE' }, { char: '🇸🇬', name: 'Singapore' },
      { char: '🇳🇿', name: 'New Zealand' }, { char: '🇮🇪', name: 'Ireland' }, { char: '🇳🇱', name: 'Netherlands' },
      { char: '🇸🇪', name: 'Sweden' }, { char: '🇨🇭', name: 'Switzerland' }, { char: '🇷🇺', name: 'Russia' },
      { char: '🇵🇰', name: 'Pakistan' }, { char: '🇧🇩', name: 'Bangladesh' }, { char: '🇮🇩', name: 'Indonesia' },
      { char: '🇹🇭', name: 'Thailand' }, { char: '🇵🇭', name: 'Philippines' }, { char: '🇪🇬', name: 'Egypt' },
      { char: '🇸🇦', name: 'Saudi Arabia' },
    ],
  },
];

const EMOJI_FLAT = EMOJI_CATEGORIES.flatMap(c => c.emojis);

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function computeMemberStreak(entries: { date: string; status: string }[]): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === key);
    if (dayEntries.length === 0) {
      if (i === 0) continue;
      break;
    }
    if (dayEntries.some(e => e.status === 'done')) streak++;
    else break;
  }
  return streak;
}

function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const dateKey = iso.slice(0, 10);
  const todayKey2 = toDateKey(new Date());
  const yesterdayKey2 = toDateKey(new Date(Date.now() - 86400000));
  if (dateKey === todayKey2) return 'Today';
  if (dateKey === yesterdayKey2) return 'Yesterday';
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
}

function getDateKey(daysAgo: number): string {
  return toDateKey(new Date(Date.now() - daysAgo * 86400000));
}

function getThisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(d);
}

function addDaysToKey(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function dbRowToHabit(row: {
  id: string;
  name?: string;
  emoji?: string;
  schedule: string;
  custom_days?: number[] | null;
  start_date: string;
}): Habit {
  return {
    id: row.id, name: row.name ?? '', type: 'yesno', target: '',
    schedule: row.schedule as Habit['schedule'],
    customDays: row.custom_days ?? undefined,
    startDate: row.start_date, emoji: row.emoji ?? '✅', color: '#000', createdAt: '',
  };
}

// ─── AvatarCircle ────────────────────────────────────────────────────────────
function AvatarCircle({
  emoji, name, size, ring, ringColor, badge,
}: {
  emoji?: string; name: string; size: number;
  ring?: number; ringColor?: string; badge?: React.ReactNode;
}) {
  const outlineStyle: React.CSSProperties = ring
    ? { outline: `${ring}px solid ${ringColor}`, outlineOffset: 2 }
    : {};
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {/* Always show the user's in-app profile emoji (customizable in Profile), never their
          Google account photo — the Google photo can't be changed by the user from within the
          app, so it would show stale/wrong info here once they pick a different profile icon. */}
      <div style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: '#6B3A8C20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, ...outlineStyle,
      }}>
        {emoji || name.charAt(0).toUpperCase()}
      </div>
      {badge}
    </div>
  );
}

// ─── ChallengeLogInput ───────────────────────────────────────────────────────
// Mirrors TodayScreen's ActualCell pattern (number/decimal numeric-only typing,
// time/custom as free text) so logging a group challenge feels the same as Today's.
function ChallengeLogInput({
  habitType, value, onChange, onSubmit, colors, font, placeholder,
}: {
  habitType: string; value: string; onChange: (v: string) => void; onSubmit: () => void;
  colors: ReturnType<typeof useColors>; font: ReturnType<typeof useFont>; placeholder?: string;
}) {
  const allowDecimal = habitType === 'decimal';
  const inputStyle: React.CSSProperties = {
    ...font.body, fontSize: 16, color: colors.foreground, border: `1.5px solid ${colors.border}`,
    borderRadius: 10, padding: '12px 14px', backgroundColor: colors.card, width: '100%',
    outline: 'none', boxSizing: 'border-box', textAlign: 'center',
  };
  if (habitType === 'number' || habitType === 'decimal') {
    return (
      <input
        autoFocus type="text" inputMode={allowDecimal ? 'decimal' : 'numeric'} value={value}
        placeholder={placeholder || '0'}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSubmit(); return; }
          const allow = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
          const allowedChars = allowDecimal ? /^[0-9.]$/ : /^[0-9]$/;
          if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
          if (e.key === '.' && value.includes('.')) e.preventDefault();
        }}
        style={inputStyle}
      />
    );
  }
  return (
    <input
      autoFocus type="text" value={value}
      placeholder={placeholder || (habitType === 'time' ? 'e.g. 00:45' : 'e.g. Done!')}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onSubmit(); }}
      style={inputStyle}
    />
  );
}

function MiniHeatmap({ entries, days, colors, dotSize = 8 }: {
  entries: { date: string; status: string }[]; days: number;
  colors: ReturnType<typeof useColors>; dotSize?: number;
}) {
  const dots: boolean[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = getDateKey(i);
    dots.push(entries.some(e => e.date === key && e.status === 'done'));
  }
  const cols = days >= 28 ? 7 : days;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`, gap: 2 }}>
      {dots.map((done, idx) => (
        <div key={idx} style={{
          width: dotSize, height: dotSize, borderRadius: 2,
          backgroundColor: done ? colors.success : colors.border,
          opacity: done ? 1 : 0.35,
        }} />
      ))}
    </div>
  );
}

// ─── CreateChallengeModal ────────────────────────────────────────────────────
function CreateChallengeModal({
  visible, onClose, onSaved, groupColor, groupId, editing,
}: {
  visible: boolean; onClose: () => void;
  onSaved: (ch: GroupChallenge, isNew: boolean) => void; groupColor: string; groupId: string;
  editing?: GroupChallenge | null;
}) {
  const colors = useColors();
  const font = useFont();
  const today = toDateKey(new Date());
  const { createChallenge, updateChallenge } = useGroups();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState(groupColor || '#2B3A8C');
  const [type, setType] = useState('yesno');
  const [target, setTarget] = useState('');
  const [numAmount, setNumAmount] = useState('');
  const [numUnit, setNumUnit] = useState('');
  const [targetComparison, setTargetComparison] = useState<'gte' | 'lte'>('gte');
  const [schedule, setSchedule] = useState('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const TYPES = [
    { value: 'yesno', label: '✓ Yes/No' },
    { value: 'number', label: '# Number' },
    { value: 'decimal', label: '∂ Decimal' },
    { value: 'time', label: '⏱ Time' },
    { value: 'custom', label: '✏️ Custom' },
  ];
  const SCHEDULES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'alternate', label: 'Alternate' },
    { value: 'custom', label: 'Custom' },
  ];

  // Reset (or pre-fill from `editing`) every time the modal opens
  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setName(editing.name);
      setEmoji(editing.emoji);
      setColor(editing.color || groupColor || '#2B3A8C');
      setType(editing.habitType);
      setSchedule(editing.schedule);
      setCustomDays(editing.customDays ?? [1, 2, 3, 4, 5]);
      setStartDate(editing.startDate);
      setEndDate(editing.endDate);
      setTargetComparison(editing.targetComparison ?? 'gte');
      if (editing.habitType === 'number' || editing.habitType === 'decimal') {
        const m = editing.target.match(/^([\d.]+)\s*(.*)$/);
        if (m) { setNumAmount(m[1]); setNumUnit(m[2].trim()); }
        else { setNumAmount(''); setNumUnit(editing.target); }
        setTarget('');
      } else {
        setTarget(editing.target);
        setNumAmount(''); setNumUnit('');
      }
    } else {
      setName(''); setEmoji('🎯'); setColor(groupColor || '#2B3A8C');
      setType('yesno'); setTarget(''); setNumAmount(''); setNumUnit(''); setTargetComparison('gte');
      setSchedule('daily'); setCustomDays([1, 2, 3, 4, 5]); setStartDate(today); setEndDate('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editing]);

  const handleTypeChange = (t: string) => {
    setType(t);
    setTarget(''); setNumAmount(''); setNumUnit(''); setTargetComparison('gte');
  };

  const minEndDate = startDate ? addDaysToKey(startDate, 1) : '';
  const canSave = name.trim().length > 0 && !!startDate && !!endDate && endDate > startDate;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      let finalTarget = '';
      if (type === 'number' || type === 'decimal') {
        const a = numAmount.trim();
        const u = numUnit.trim();
        finalTarget = a && u ? `${a} ${u}` : a || u;
      } else if (type !== 'yesno') {
        finalTarget = target.trim();
      }
      const input: ChallengeInput = {
        name: name.trim(), emoji, color, habitType: type,
        target: finalTarget,
        targetComparison: (type === 'number' || type === 'decimal') ? targetComparison : undefined,
        schedule,
        customDays: schedule === 'custom' ? customDays : undefined,
        startDate, endDate,
      };
      if (editing) {
        const ch = await updateChallenge(editing.id, input);
        onSaved(ch, false);
        showToast(`"${ch.name}" updated!`, 'success');
      } else {
        const ch = await createChallenge(groupId, input);
        onSaved(ch, true);
        showToast(`Challenge "${ch.name}" created! You've been auto-joined.`, 'success');
      }
    } catch (err: unknown) {
      showToast((err as Error).message || 'Failed to save challenge.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = { ...font.label, fontSize: 12, color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 8px', display: 'block' };
  const inputStyle: React.CSSProperties = { ...font.body, fontSize: 14, color: colors.foreground, border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', backgroundColor: colors.card, width: '100%', outline: 'none', boxSizing: 'border-box' };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div style={{ padding: '24px 20px 28px', maxHeight: '85vh', overflowY: 'auto' }}>
        <p style={{ ...font.heading, fontSize: 20, color: colors.primary, margin: '0 0 16px' }}>{editing ? 'Edit Challenge' : 'New Challenge'}</p>

        <label style={labelStyle}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. July Reading Club" maxLength={60}
          style={{ ...inputStyle, marginBottom: 16, borderColor: name ? color : colors.border }} />

        <label style={labelStyle}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)} style={{ width: 38, height: 38, borderRadius: 8, border: `${emoji === e ? 2 : 1}px solid ${emoji === e ? color : colors.border}`, backgroundColor: emoji === e ? color + '20' : colors.muted, cursor: 'pointer', fontSize: 18 }}>{e}</button>
          ))}
        </div>

        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {HABIT_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, border: color === c ? `3px solid ${colors.foreground}` : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: color === c ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.1s' }}>
              {color === c && <Check size={12} color="#fff" />}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => handleTypeChange(t.value)} style={{ ...font.body, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: `1px solid ${type === t.value ? color : colors.border}`, backgroundColor: type === t.value ? color + '18' : colors.muted, color: type === t.value ? color : colors.mutedForeground, cursor: 'pointer' }}>{t.label}</button>
          ))}
        </div>

        {type === 'yesno' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: colors.muted, borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <Check size={14} color={colors.success} />
            <span style={{ ...font.body, fontSize: 14, color: colors.mutedForeground }}>Tracked as: <strong>Done</strong> or <strong>Not done</strong> each day</span>
          </div>
        ) : (type === 'number' || type === 'decimal') ? (
          <>
            <label style={labelStyle}>Target / Goal</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text" inputMode={type === 'decimal' ? 'decimal' : 'numeric'} value={numAmount} maxLength={12}
                onKeyDown={e => {
                  if (type === 'decimal' && e.key === ',') {
                    e.preventDefault();
                    if (!numAmount.includes('.')) setNumAmount(v => v + '.');
                    return;
                  }
                  const allow = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'];
                  const allowedChars = type === 'decimal' ? /^[0-9.]$/ : /^[0-9]$/;
                  if (!allow.includes(e.key) && !allowedChars.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
                  if (e.key === '.' && numAmount.includes('.')) e.preventDefault();
                }}
                onChange={e => setNumAmount(e.target.value)}
                placeholder={type === 'decimal' ? 'e.g. 7.5' : 'e.g. 7000'}
                style={{ ...inputStyle, flex: '0 0 110px' }}
              />
              <input
                value={numUnit} onChange={e => setNumUnit(e.target.value)} onBlur={e => setNumUnit(e.target.value.trim())}
                placeholder={type === 'decimal' ? 'Unit (km, hrs…)' : 'Unit (steps, reps…)'}
                maxLength={24}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>

            <label style={labelStyle}>Counts as done when the logged value is…</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={() => setTargetComparison('gte')} style={{ flex: 1, ...font.body, fontSize: 13, padding: '8px 10px', borderRadius: 8, border: `1px solid ${targetComparison === 'gte' ? color : colors.border}`, backgroundColor: targetComparison === 'gte' ? color + '18' : colors.muted, color: targetComparison === 'gte' ? color : colors.mutedForeground, cursor: 'pointer' }}>
                ≥ At least the target
              </button>
              <button onClick={() => setTargetComparison('lte')} style={{ flex: 1, ...font.body, fontSize: 13, padding: '8px 10px', borderRadius: 8, border: `1px solid ${targetComparison === 'lte' ? color : colors.border}`, backgroundColor: targetComparison === 'lte' ? color + '18' : colors.muted, color: targetComparison === 'lte' ? color : colors.mutedForeground, cursor: 'pointer' }}>
                ≤ At most the target
              </button>
            </div>
            <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: '0 0 16px' }}>
              {targetComparison === 'gte'
                ? "e.g. steps, pages, reps — logging below this target won't count as done for that day, but the value still shows to the group."
                : "e.g. calories, screen time — logging above this target won't count as done for that day, but the value still shows to the group."}
            </p>
          </>
        ) : (
          <>
            <label style={labelStyle}>Target / Goal</label>
            <input
              value={target} onChange={e => setTarget(e.target.value)} onBlur={e => setTarget(e.target.value.trim())}
              placeholder={type === 'time' ? 'e.g. 2 hours, 30 min' : 'e.g. 30 pages, write 500 words'}
              maxLength={60}
              style={{ ...inputStyle, marginBottom: 16 }}
            />
          </>
        )}

        <label style={labelStyle}>Schedule</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: schedule === 'custom' ? 10 : 16 }}>
          {SCHEDULES.map(s => (
            <button key={s.value} onClick={() => setSchedule(s.value)} style={{ ...font.body, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: `1px solid ${schedule === s.value ? color : colors.border}`, backgroundColor: schedule === s.value ? color + '18' : colors.muted, color: schedule === s.value ? color : colors.mutedForeground, cursor: 'pointer' }}>{s.label}</button>
          ))}
        </div>
        {schedule === 'custom' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {DAYS.map((d, i) => (
              <button key={i} onClick={() => setCustomDays(cd => cd.includes(i) ? cd.filter(x => x !== i) : [...cd, i])}
                style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${customDays.includes(i) ? color : colors.border}`, backgroundColor: customDays.includes(i) ? color : 'transparent', color: customDays.includes(i) ? '#fff' : colors.mutedForeground, ...font.body, fontSize: 12, cursor: 'pointer' }}>{d}</button>
            ))}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: colors.border, margin: '4px 0 16px' }} />

        {editing ? (
          <>
            <label style={labelStyle}>Start Date</label>
            <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 16px' }}>{startDate} (can't be changed once a challenge has started)</p>
          </>
        ) : (
          <>
            <label style={labelStyle}>Start Date</label>
            <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setEndDate(addDaysToKey(startDate, d))}
                  style={{ ...font.body, fontSize: 13, padding: '6px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.muted, color: colors.mutedForeground, cursor: 'pointer' }}>{d} days</button>
              ))}
            </div>
          </>
        )}

        <label style={labelStyle}>End Date</label>
        <input type="date" value={endDate} min={minEndDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} />

        <button onClick={handleSave} disabled={!canSave || saving}
          style={{ ...font.label, fontSize: 15, fontWeight: 700, backgroundColor: canSave ? color : colors.muted, color: canSave ? '#fff' : colors.mutedForeground, border: 'none', borderRadius: 12, padding: '14px 20px', width: '100%', cursor: canSave && !saving ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
          {saving && <span style={{ width: 14, height: 14, border: '2px solid #ffffff60', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />}
          {saving ? (editing ? 'Saving…' : 'Creating…') : (editing ? 'Save Changes' : 'Create Challenge')}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function GroupDetailScreen() {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const colors = useColors();
  const font = useFont();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    groups, fetchGroupById, fetchGroupMembers, fetchFeedPage, fetchTodaysPulse,
    fetchPendingNudges, computeGroupStreak, computeWeeklyDigest, sendNudge,
    markNudgeSeen, markGroupSeen, toggleFeedReaction,
  } = useGroups();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('feed');
  const [mottoDismissed, setMottoDismissed] = useState(false);

  const currentMember = members.find(m => m.userId === user?.id);
  const currentMemberRole = currentMember?.role ?? 'member';

  // ── Feed tab state ──
  const [feedItems, setFeedItems] = useState<FeedEntry[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [todaysPulse, setTodaysPulse] = useState<MemberTodayStatus[]>([]);
  const [weeklyDigest, setWeeklyDigest] = useState<WeeklyDigest | null>(null);
  const [nudgePopupFor, setNudgePopupFor] = useState<string | null>(null);
  const [nudgedMemberIds, setNudgedMemberIds] = useState<Set<string>>(new Set());
  const [sendingNudge, setSendingNudge] = useState(false);
  const [cheerPopupFor, setCheerPopupFor] = useState<string | null>(null);
  const [sendingCheer, setSendingCheer] = useState(false);
  const [feedReactionPickerFor, setFeedReactionPickerFor] = useState<string | null>(null);
  const [scalingReaction, setScalingReaction] = useState<{ entryId: string; emoji: string } | null>(null);

  useEffect(() => {
    if (!groupId || !user) return;
    const prefix = `nudged_${groupId}_`;
    const set = new Set<string>();
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) set.add(key.slice(prefix.length));
    }
    setNudgedMemberIds(set);
  }, [groupId, user]);

  const loadFeed = useCallback(async (before?: string) => {
    if (!groupId) return;
    try {
      const page = await fetchFeedPage(groupId, before);
      setFeedItems(prev => before ? [...prev, ...page] : page);
      setHasMoreFeed(page.length >= 20);
    } catch {
      showToast('Failed to load feed.', 'error');
    }
  }, [groupId, fetchFeedPage, showToast]);

  const loadFeedTab = useCallback(async () => {
    if (!groupId) return;
    setLoadingFeed(true);
    try {
      await loadFeed(undefined);
      const pulse = await fetchTodaysPulse(groupId);
      setTodaysPulse(pulse);
      const streakDays = await computeGroupStreak(groupId);
      const digest = await computeWeeklyDigest(groupId, streakDays);
      setWeeklyDigest(digest);
    } catch {
      showToast('Failed to load feed.', 'error');
    } finally {
      setLoadingFeed(false);
    }
  }, [groupId, loadFeed, fetchTodaysPulse, computeGroupStreak, computeWeeklyDigest, showToast]);

  useEffect(() => {
    if (activeTab === 'feed' && groupId) {
      loadFeedTab();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupId]);

  // Realtime: new group_challenge_checkins -> refresh feed
  useEffect(() => {
    if (!groupId) return;
    const channel = supabase
      .channel(`group_feed_${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_challenge_checkins' }, (payload) => {
        // group_challenge_checkins has no group_id column — a member-of-this-group match alone
        // isn't enough, since the same user could be checking in to a challenge in a DIFFERENT
        // group they're also in. Confirm the challenge actually belongs to this group first.
        const row = payload.new as { user_id: string; challenge_id: string };
        if (!members.some(m => m.userId === row.user_id)) return;
        supabase.from('group_challenges').select('id').eq('id', row.challenge_id).eq('group_id', groupId).maybeSingle()
          .then(({ data }) => { if (data) loadFeed(undefined); });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, members, loadFeed]);

  const handleManualRefresh = () => loadFeed(undefined);

  const handleLoadMoreFeed = async () => {
    if (feedItems.length === 0 || loadingMoreFeed) return;
    const oldest = feedItems[feedItems.length - 1];
    setLoadingMoreFeed(true);
    try {
      await loadFeed(oldest.createdAt);
    } finally {
      setLoadingMoreFeed(false);
    }
  };

  const handleNudge = async (toUserId: string) => {
    if (!groupId || sendingNudge) return;
    setSendingNudge(true);
    try {
      await sendNudge(groupId, toUserId);
      const member = todaysPulse.find(m => m.userId === toUserId);
      showToast(`Nudge sent to ${member?.displayName ?? 'them'}! 💪`, 'success');
      sessionStorage.setItem(`nudged_${groupId}_${toUserId}`, '1');
      setNudgedMemberIds(prev => new Set(prev).add(toUserId));
      setNudgePopupFor(null);
    } catch (err: unknown) {
      if ((err as Error).message?.includes('already_nudged') || (err as { code?: string }).code === '23505') {
        showToast('You already nudged them today!', 'info');
      } else {
        showToast('Failed to send nudge.', 'error');
      }
      setNudgePopupFor(null);
    } finally {
      setSendingNudge(false);
    }
  };

  const handlePulseAvatarClick = (member: MemberTodayStatus) => {
    if (member.userId === user?.id) {
      // Scroll to own feed entry
      const el = document.getElementById(`feed-user-${member.userId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (member.completedToday) {
      setCheerPopupFor(prev => prev === member.userId ? null : member.userId);
      return;
    }
    // Only allow nudging once the member's local day has actually started
    const memberToday = member.timezone ? toDateKeyInTimezone(member.timezone) : toDateKey(new Date());
    const viewerToday = toDateKey(new Date());
    if (memberToday > viewerToday) return;
    setNudgePopupFor(prev => prev === member.userId ? null : member.userId);
  };

  const handleCheer = async (toUserId: string) => {
    if (!groupId || sendingCheer) return;
    setSendingCheer(true);
    try {
      // Find this member's most recent feed entry and add a 🔥 reaction
      const memberEntry = feedItems.find(e => e.userId === toUserId);
      if (memberEntry) {
        const existing = memberEntry.reactions.find(r => r.emoji === '🔥');
        if (!existing?.myReaction) {
          await toggleFeedReaction(groupId, memberEntry.entryId, '🔥', false);
          setFeedItems(prev => prev.map(e => {
            if (e.entryId !== memberEntry.entryId) return e;
            const reactions = [...e.reactions];
            const idx = reactions.findIndex(r => r.emoji === '🔥');
            if (idx >= 0) reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, myReaction: true };
            else reactions.push({ emoji: '🔥', count: 1, myReaction: true });
            return { ...e, reactions };
          }));
        }
      }
      const member = todaysPulse.find(m => m.userId === toUserId);
      showToast(`🔥 Cheered for ${member?.displayName ?? 'them'}!`, 'success');
      setCheerPopupFor(null);
    } catch {
      showToast('Failed to send cheer.', 'error');
    } finally {
      setSendingCheer(false);
    }
  };

  const handleFeedReaction = async (entry: FeedEntry, emoji: string) => {
    if (!groupId) return;
    const existing = entry.reactions.find(r => r.emoji === emoji);
    const hasMyReaction = existing?.myReaction ?? false;
    setScalingReaction({ entryId: entry.entryId, emoji });
    setTimeout(() => setScalingReaction(null), 100);

    setFeedItems(prev => prev.map(e => {
      if (e.entryId !== entry.entryId) return e;
      const reactions = [...e.reactions];
      const idx = reactions.findIndex(r => r.emoji === emoji);
      if (hasMyReaction && idx >= 0) {
        reactions[idx] = { ...reactions[idx], count: Math.max(0, reactions[idx].count - 1), myReaction: false };
      } else if (idx >= 0) {
        reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, myReaction: true };
      } else {
        reactions.push({ emoji, count: 1, myReaction: true });
      }
      return { ...e, reactions };
    }));

    try {
      await toggleFeedReaction(groupId, entry.entryId, emoji, hasMyReaction);
    } catch {
      showToast('Failed to react.', 'error');
      loadFeed(undefined);
    }
  };

  // ── Challenges tab state ──
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [participantsByChallenge, setParticipantsByChallenge] = useState<Record<string, ChallengeParticipant[]>>({});
  const [loadingParticipantsFor, setLoadingParticipantsFor] = useState<string | null>(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<GroupChallenge | null>(null);
  const [trophyRoomOpen, setTrophyRoomOpen] = useState(false);
  const [deletingChallengeId, setDeletingChallengeId] = useState<string | null>(null);
  const [showTrophyDeleteConfirm, setShowTrophyDeleteConfirm] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [celebratingChallenge, setCelebratingChallenge] = useState<GroupChallenge | null>(null);
  const [celebrationStats, setCelebrationStats] = useState<{ rate: number; topName: string; topRate: number } | null>(null);
  // Tracks which challenges the current user has joined — fetched upfront so the
  // Join/Leave button is correct immediately, without waiting for a card to be expanded.
  const [myJoinedChallengeIds, setMyJoinedChallengeIds] = useState<Set<string>>(new Set());
  // Tracks which challenges the current user has logged anything for today (regardless of
  // whether the logged value actually met the target — see myCheckinDoneToday for that)
  const [myCheckinsToday, setMyCheckinsToday] = useState<Set<string>>(new Set());
  // Tracks which of today's logged check-ins actually counted as "done" (met the target)
  const [myCheckinDoneToday, setMyCheckinDoneToday] = useState<Set<string>>(new Set());
  // For non-yes/no challenges, the actual value the user logged today (e.g. "5.2 km")
  const [myCheckinActuals, setMyCheckinActuals] = useState<Record<string, string>>({});
  const [togglingCheckinId, setTogglingCheckinId] = useState<string | null>(null);
  // Log-progress modal (number/decimal/time/custom challenges)
  const [loggingChallenge, setLoggingChallenge] = useState<GroupChallenge | null>(null);
  const [loggingValue, setLoggingValue] = useState('');
  const [savingLog, setSavingLog] = useState(false);
  // Lightweight per-challenge counts (joined / checked in today), loaded upfront for ALL
  // challenges so the collapsed card never shows a stale "0 joined" before expansion.
  const [challengeCounts, setChallengeCounts] = useState<Record<string, { joined: number; doneToday: number }>>({});

  // Leave challenge flow
  const [leavingChallenge, setLeavingChallenge] = useState<GroupChallenge | null>(null);
  const [leaveChallengeStep, setLeaveChallengeStep] = useState<'confirm' | null>(null);
  const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null);

  const {
    fetchGroupChallenges, fetchChallengeParticipants, joinChallenge, leaveChallenge, deleteChallenge,
    checkInChallenge, undoCheckInChallenge,
  } = useGroups();

  const todayKey = toDateKey(new Date());
  const activeChallenges = challenges.filter(c => c.endDate >= todayKey);
  const completedChallenges = challenges.filter(c => c.endDate < todayKey);

  // Cheap, no-profile-join counts for every challenge — used so collapsed cards always
  // show a live "X joined · Y checked in today" without needing fetchChallengeParticipants.
  const loadChallengeCounts = useCallback(async (chs: GroupChallenge[]) => {
    if (chs.length === 0) { setChallengeCounts({}); return; }
    const ids = chs.map(c => c.id);
    const todayKeyNow = toDateKey(new Date());
    const [{ data: memberRows }, { data: checkinRows }] = await Promise.all([
      supabase.from('group_challenge_members').select('challenge_id').in('challenge_id', ids),
      supabase.from('group_challenge_checkins').select('challenge_id').eq('date', todayKeyNow).eq('done', true).in('challenge_id', ids),
    ]);
    const counts: Record<string, { joined: number; doneToday: number }> = {};
    for (const id of ids) counts[id] = { joined: 0, doneToday: 0 };
    for (const r of (memberRows ?? []) as { challenge_id: string }[]) counts[r.challenge_id].joined++;
    for (const r of (checkinRows ?? []) as { challenge_id: string }[]) counts[r.challenge_id].doneToday++;
    setChallengeCounts(counts);
  }, []);

  const loadChallengesTab = useCallback(async () => {
    if (!groupId) return;
    setLoadingChallenges(true);
    try {
      const chs = await fetchGroupChallenges(groupId);
      setChallenges(chs);
      loadChallengeCounts(chs);

      if (chs.length > 0 && user) {
        const todayKey = toDateKey(new Date());
        const [{ data: myRows }, { data: myCheckins }] = await Promise.all([
          supabase.from('group_challenge_members').select('challenge_id')
            .eq('user_id', user.id).in('challenge_id', chs.map(c => c.id)),
          supabase.from('group_challenge_checkins').select('challenge_id, actual, done')
            .eq('user_id', user.id).eq('date', todayKey).in('challenge_id', chs.map(c => c.id)),
        ]);
        setMyJoinedChallengeIds(new Set((myRows ?? []).map((r: { challenge_id: string }) => r.challenge_id)));
        const checkinRows = (myCheckins ?? []) as { challenge_id: string; actual: string | null; done: boolean }[];
        setMyCheckinsToday(new Set(checkinRows.map(r => r.challenge_id)));
        setMyCheckinDoneToday(new Set(checkinRows.filter(r => r.done).map(r => r.challenge_id)));
        setMyCheckinActuals(Object.fromEntries(checkinRows.filter(r => r.actual).map(r => [r.challenge_id, r.actual as string])));
      } else {
        setMyJoinedChallengeIds(new Set());
        setMyCheckinsToday(new Set());
        setMyCheckinDoneToday(new Set());
        setMyCheckinActuals({});
      }

      const uncelebrated = chs.find(c => c.endDate < todayKey && !sessionStorage.getItem(`celebrated_${c.id}`));
      if (uncelebrated) {
        sessionStorage.setItem(`celebrated_${uncelebrated.id}`, '1');
        const participants = await fetchChallengeParticipants(uncelebrated.id);
        setParticipantsByChallenge(prev => ({ ...prev, [uncelebrated.id]: participants }));
        if (participants.length > 0) {
          const avgRate = Math.round(participants.reduce((s, p) => s + p.completionRate, 0) / participants.length);
          const top = participants.reduce((a, b) => a.completionRate >= b.completionRate ? a : b);
          setCelebrationStats({ rate: avgRate, topName: top.displayName, topRate: top.completionRate });
        } else {
          setCelebrationStats({ rate: 0, topName: 'No one', topRate: 0 });
        }
        setCelebratingChallenge(uncelebrated);
        setConfettiActive(true);
      }
    } catch {
      showToast('Failed to load challenges.', 'error');
    } finally {
      setLoadingChallenges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, fetchGroupChallenges, fetchChallengeParticipants, loadChallengeCounts, showToast]);

  useEffect(() => {
    if (activeTab === 'challenges' && groupId) loadChallengesTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupId]);

  const handleExpandChallenge = async (challengeId: string) => {
    if (expandedChallenge === challengeId) { setExpandedChallenge(null); return; }
    setExpandedChallenge(challengeId);
    if (!participantsByChallenge[challengeId]) {
      setLoadingParticipantsFor(challengeId);
      try {
        const participants = await fetchChallengeParticipants(challengeId);
        setParticipantsByChallenge(prev => ({ ...prev, [challengeId]: participants }));
      } finally {
        setLoadingParticipantsFor(null);
      }
    }
  };

  const handleJoinChallenge = async (challenge: GroupChallenge) => {
    if (myJoinedChallengeIds.has(challenge.id) || joiningChallengeId === challenge.id) return;
    setJoiningChallengeId(challenge.id);
    try {
      await joinChallenge(challenge, user!.id);
      showToast(`Joined "${challenge.name}"!`, 'success');
      setMyJoinedChallengeIds(prev => new Set(prev).add(challenge.id));
      setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[challenge.id]; return n; });
      setChallengeCounts(prev => ({ ...prev, [challenge.id]: { joined: (prev[challenge.id]?.joined ?? 0) + 1, doneToday: prev[challenge.id]?.doneToday ?? 0 } }));
      if (expandedChallenge === challenge.id) handleExpandChallenge(challenge.id);
    } catch (err: unknown) {
      // 23505 = unique constraint — we were already joined; resync state instead of erroring
      if ((err as { code?: string })?.code === '23505') {
        setMyJoinedChallengeIds(prev => new Set(prev).add(challenge.id));
        showToast(`Already joined "${challenge.name}".`, 'info');
      } else {
        showToast((err as Error).message || 'Failed to join challenge.', 'error');
      }
    } finally {
      setJoiningChallengeId(null);
    }
  };

  const startLeaveChallenge = (challenge: GroupChallenge) => {
    setLeavingChallenge(challenge);
    setLeaveChallengeStep('confirm');
  };

  const handleLeaveChallengeConfirm = async () => {
    if (!leavingChallenge) return;
    try {
      await leaveChallenge(leavingChallenge.id);
      showToast('Left challenge.', 'success');
      setMyJoinedChallengeIds(prev => { const n = new Set(prev); n.delete(leavingChallenge.id); return n; });
      setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[leavingChallenge.id]; return n; });
      setChallengeCounts(prev => {
        const existing = prev[leavingChallenge.id];
        if (!existing) return prev;
        return { ...prev, [leavingChallenge.id]: { ...existing, joined: Math.max(0, existing.joined - 1) } };
      });
    } catch {
      showToast('Failed to leave challenge.', 'error');
    } finally {
      setLeavingChallenge(null);
      setLeaveChallengeStep(null);
    }
  };

  const handleToggleCheckin = async (challenge: GroupChallenge) => {
    if (togglingCheckinId === challenge.id) return;
    const alreadyDone = myCheckinsToday.has(challenge.id);
    setTogglingCheckinId(challenge.id);
    setMyCheckinsToday(prev => {
      const n = new Set(prev);
      if (alreadyDone) n.delete(challenge.id); else n.add(challenge.id);
      return n;
    });
    setMyCheckinDoneToday(prev => {
      const n = new Set(prev);
      if (alreadyDone) n.delete(challenge.id); else n.add(challenge.id);
      return n;
    });
    try {
      if (alreadyDone) {
        await undoCheckInChallenge(challenge.id);
      } else {
        await checkInChallenge(challenge);
        showToast(`Checked in for "${challenge.name}"! 🎯`, 'success');
      }
      setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[challenge.id]; return n; });
      setChallengeCounts(prev => {
        const existing = prev[challenge.id] ?? { joined: 0, doneToday: 0 };
        const doneToday = Math.max(0, existing.doneToday + (alreadyDone ? -1 : 1));
        return { ...prev, [challenge.id]: { ...existing, doneToday } };
      });
    } catch {
      setMyCheckinsToday(prev => {
        const n = new Set(prev);
        if (alreadyDone) n.add(challenge.id); else n.delete(challenge.id);
        return n;
      });
      setMyCheckinDoneToday(prev => {
        const n = new Set(prev);
        if (alreadyDone) n.add(challenge.id); else n.delete(challenge.id);
        return n;
      });
      showToast('Failed to update check-in.', 'error');
    } finally {
      setTogglingCheckinId(null);
    }
  };

  const openLogModal = (challenge: GroupChallenge) => {
    setLoggingValue(myCheckinActuals[challenge.id] ?? '');
    setLoggingChallenge(challenge);
  };

  const handleSaveLoggedValue = async () => {
    if (!loggingChallenge || savingLog) return;
    const value = loggingValue.trim();
    if (!value) return;
    const challenge = loggingChallenge;
    const wasDoneBefore = myCheckinDoneToday.has(challenge.id);
    setSavingLog(true);
    try {
      const done = await checkInChallenge(challenge, value);
      setMyCheckinsToday(prev => new Set(prev).add(challenge.id));
      setMyCheckinDoneToday(prev => {
        const n = new Set(prev);
        if (done) n.add(challenge.id); else n.delete(challenge.id);
        return n;
      });
      setMyCheckinActuals(prev => ({ ...prev, [challenge.id]: value }));
      setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[challenge.id]; return n; });
      const delta = (done ? 1 : 0) - (wasDoneBefore ? 1 : 0);
      if (delta !== 0) {
        setChallengeCounts(prev => {
          const existing = prev[challenge.id] ?? { joined: 0, doneToday: 0 };
          return { ...prev, [challenge.id]: { ...existing, doneToday: Math.max(0, existing.doneToday + delta) } };
        });
      }
      if (done) {
        showToast(`Logged "${value}" for "${challenge.name}" — target reached! 🎯`, 'success');
      } else if (challenge.targetComparison === 'lte') {
        showToast(`Logged "${value}" — that's over your goal of ${challenge.target || 'the target'}. Try to stay under next time!`, 'info');
      } else {
        showToast(`Logged "${value}" — target is ${challenge.target || 'not yet reached'}. Keep going!`, 'info');
      }
      setLoggingChallenge(null);
    } catch {
      showToast('Failed to save your progress.', 'error');
    } finally {
      setSavingLog(false);
    }
  };

  const handleClearLoggedValue = async () => {
    if (!loggingChallenge || savingLog) return;
    const challenge = loggingChallenge;
    const wasDoneBefore = myCheckinDoneToday.has(challenge.id);
    setSavingLog(true);
    try {
      await undoCheckInChallenge(challenge.id);
      setMyCheckinsToday(prev => { const n = new Set(prev); n.delete(challenge.id); return n; });
      setMyCheckinDoneToday(prev => { const n = new Set(prev); n.delete(challenge.id); return n; });
      setMyCheckinActuals(prev => { const n = { ...prev }; delete n[challenge.id]; return n; });
      setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[challenge.id]; return n; });
      if (wasDoneBefore) {
        setChallengeCounts(prev => {
          const existing = prev[challenge.id];
          if (!existing) return prev;
          return { ...prev, [challenge.id]: { ...existing, doneToday: Math.max(0, existing.doneToday - 1) } };
        });
      }
      showToast('Check-in cleared.', 'success');
      setLoggingChallenge(null);
    } catch {
      showToast('Failed to clear check-in.', 'error');
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteChallengeConfirm = async () => {
    if (!deletingChallengeId) return;
    try {
      await deleteChallenge(deletingChallengeId);
      setChallenges(prev => prev.filter(c => c.id !== deletingChallengeId));
      showToast('Challenge deleted. You can now create a new one.', 'success');
    } catch {
      showToast('Failed to delete challenge.', 'error');
    } finally {
      setShowTrophyDeleteConfirm(false);
      setDeletingChallengeId(null);
    }
  };

  const handleToggleTrophyRoom = async () => {
    const willOpen = !trophyRoomOpen;
    setTrophyRoomOpen(willOpen);
    if (!willOpen) return;
    const missing = completedChallenges.filter(c => !participantsByChallenge[c.id]);
    await Promise.all(missing.map(async c => {
      try {
        const participants = await fetchChallengeParticipants(c.id);
        setParticipantsByChallenge(prev => ({ ...prev, [c.id]: participants }));
      } catch { /* non-fatal */ }
    }));
  };

  const canCreateChallenge = group ? !(group.challengeCreator === 'admin' && currentMemberRole !== 'admin') : false;

  const renderChallengesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...font.heading, fontSize: 16, color: colors.foreground, margin: 0 }}>Challenges {challenges.length}/15</p>
        {canCreateChallenge && challenges.length < 15 && (
          <button onClick={() => setShowCreateChallenge(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 9, padding: '7px 12px', cursor: 'pointer' }}>
            <Plus size={14} color="#fff" />
            <span style={{ ...font.label, fontSize: 13 }}>New Challenge</span>
          </button>
        )}
      </div>

      {loadingChallenges ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 100, borderRadius: colors.radius, backgroundColor: colors.card, border: `1px solid ${colors.border}`, opacity: 0.5 }} />)}
        </div>
      ) : activeChallenges.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center', gap: 6 }}>
          <span style={{ fontSize: 48 }}>🎯</span>
          <p style={{ ...font.heading, fontSize: 16, color: colors.foreground, margin: 0 }}>No challenges yet</p>
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: 0 }}>Create the first challenge for your group!</p>
        </div>
      ) : (
        activeChallenges.map(challenge => {
          const participants = participantsByChallenge[challenge.id];
          const isJoined = myJoinedChallengeIds.has(challenge.id);
          const counts = challengeCounts[challenge.id];
          const joinedCount = counts?.joined ?? participants?.length ?? 0;
          const doneTodayCount = counts?.doneToday ?? 0;
          const totalDays = Math.max(1, Math.round((new Date(challenge.endDate + 'T12:00:00').getTime() - new Date(challenge.startDate + 'T12:00:00').getTime()) / 86400000));
          const dayNum = Math.min(totalDays, Math.max(1, Math.round((Date.now() - new Date(challenge.startDate + 'T12:00:00').getTime()) / 86400000) + 1));
          const pct = Math.round((dayNum / totalDays) * 100);
          const expanded = expandedChallenge === challenge.id;
          const sortedParticipants = [...(participants ?? [])].sort((a, b) => b.completionRate - a.completionRate || b.streakWithinChallenge - a.streakWithinChallenge);

          return (
            <div key={challenge.id} style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderLeft: `4px solid ${challenge.color}`, borderRadius: colors.radius, padding: 12 }}>
              <button onClick={() => handleExpandChallenge(challenge.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{challenge.emoji}</span>
                  <p style={{ ...font.label, fontSize: 14, color: colors.foreground, margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{challenge.name}</p>
                  <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0, flexShrink: 0 }}>Day {dayNum} / {totalDays}</p>
                  {expanded ? <ChevronDown size={16} color={colors.mutedForeground} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} color={colors.mutedForeground} style={{ flexShrink: 0 }} />}
                </div>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: challenge.color, borderRadius: 3 }} />
                </div>
                <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0 }}>{joinedCount} joined · {doneTodayCount} checked in today</p>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {(currentMemberRole === 'admin' || challenge.createdBy === user?.id) ? (
                  <button onClick={() => { setEditingChallenge(challenge); setShowCreateChallenge(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} aria-label="Edit challenge">
                    <Pencil size={14} color={colors.mutedForeground} />
                  </button>
                ) : <span />}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {isJoined ? (
                  <>
                    {challenge.habitType === 'yesno' ? (
                      <button onClick={() => handleToggleCheckin(challenge)} disabled={togglingCheckinId === challenge.id} style={{
                        ...font.label, fontSize: 12, borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                        border: `1px solid ${myCheckinsToday.has(challenge.id) ? colors.success : colors.border}`,
                        backgroundColor: myCheckinsToday.has(challenge.id) ? colors.success + '18' : 'transparent',
                        color: myCheckinsToday.has(challenge.id) ? colors.success : colors.foreground,
                      }}>
                        {myCheckinsToday.has(challenge.id) ? '✅ Done today' : 'Mark today done'}
                      </button>
                    ) : (
                      <button onClick={() => openLogModal(challenge)} style={{
                        ...font.label, fontSize: 12, borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                        border: `1px solid ${myCheckinDoneToday.has(challenge.id) ? colors.success : myCheckinsToday.has(challenge.id) ? colors.accent : colors.border}`,
                        backgroundColor: myCheckinDoneToday.has(challenge.id) ? colors.success + '18' : myCheckinsToday.has(challenge.id) ? colors.accent + '18' : 'transparent',
                        color: myCheckinDoneToday.has(challenge.id) ? colors.success : myCheckinsToday.has(challenge.id) ? colors.accent : colors.foreground,
                        maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {myCheckinDoneToday.has(challenge.id)
                          ? `✅ ${myCheckinActuals[challenge.id] ?? 'Logged'}`
                          : myCheckinsToday.has(challenge.id)
                            ? `⚠️ ${myCheckinActuals[challenge.id] ?? 'Logged'} (below target)`
                            : 'Log progress'}
                      </button>
                    )}
                    <button onClick={() => startLeaveChallenge(challenge)} style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, background: 'none', border: `1px solid ${colors.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>Leave</button>
                  </>
                ) : (
                  <button onClick={() => handleJoinChallenge(challenge)} disabled={joiningChallengeId === challenge.id} style={{ ...font.label, fontSize: 12, color: '#fff', background: challenge.color, border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
                    {joiningChallengeId === challenge.id ? 'Joining…' : 'Join'}
                  </button>
                )}
                </div>
              </div>

              {expanded && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {loadingParticipantsFor === challenge.id ? (
                    <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>Loading leaderboard…</p>
                  ) : sortedParticipants.length === 0 ? (
                    <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>No participants yet.</p>
                  ) : sortedParticipants.map((p, idx) => {
                    const medal = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                    const challengeStart = new Date(challenge.startDate + 'T12:00:00').getTime();
                    const joinedDay = Math.max(1, Math.round((new Date(p.joinedAt).getTime() - challengeStart) / 86400000) + 1);
                    return (
                      <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 18, fontSize: 13, flexShrink: 0 }}>{medal ?? ''}</span>
                        <AvatarCircle emoji={p.userEmoji} name={p.displayName} size={26} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.displayName}</p>
                          {p.actualToday ? (
                            <p style={{ ...font.body, fontSize: 10, color: p.completedToday ? colors.success : colors.accent, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.completedToday ? '✅' : '⚠️'} Today: {p.actualToday}
                            </p>
                          ) : joinedDay > 1 ? (
                            <p style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, margin: 0 }}>Joined on Day {joinedDay}</p>
                          ) : null}
                        </div>
                        <p style={{ ...font.label, fontSize: 13, color: colors.foreground, margin: 0, flexShrink: 0 }}>{p.completionRate}%</p>
                        <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0, minWidth: 50, textAlign: 'right', flexShrink: 0 }}>🔥 {p.streakWithinChallenge}d</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {completedChallenges.length > 0 && (
        <div>
          <button onClick={() => handleToggleTrophyRoom()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>
            {trophyRoomOpen ? <ChevronDown size={14} color={colors.mutedForeground} /> : <ChevronRight size={14} color={colors.mutedForeground} />}
            <span style={{ ...font.label, fontSize: 13, color: colors.mutedForeground }}>🏆 Completed Challenges ({completedChallenges.length})</span>
          </button>
          {trophyRoomOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {completedChallenges.map(challenge => {
                const participants = participantsByChallenge[challenge.id];
                const top = participants && participants.length > 0 ? participants.reduce((a, b) => a.completionRate >= b.completionRate ? a : b) : null;
                const canDelete = currentMemberRole === 'admin' || challenge.createdBy === user?.id;
                return (
                  <div key={challenge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: colors.radius, border: `1px solid ${colors.border}`, backgroundColor: colors.card, opacity: 0.65 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🏆</span>
                      <div>
                        <p style={{ ...font.label, fontSize: 13, margin: 0, color: colors.foreground }}>{challenge.name}</p>
                        <p style={{ ...font.body, fontSize: 11, margin: '2px 0 0', color: colors.mutedForeground }}>
                          {participants?.length ?? 0} participants · ended {challenge.endDate}{top && ` · 👑 ${top.displayName} ${top.completionRate}%`}
                        </p>
                      </div>
                    </div>
                    {canDelete && (
                      <button onClick={() => { setDeletingChallengeId(challenge.id); setShowTrophyDeleteConfirm(true); }} style={{ padding: '4px 10px', borderRadius: colors.radius, cursor: 'pointer', border: `1px solid ${colors.destructive}`, background: 'transparent', color: colors.destructive, fontSize: 11, flexShrink: 0 }}>
                        Delete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Members tab state ──
  const [memberEntries, setMemberEntries] = useState<Record<string, { date: string; status: string }[]>>({});
  const [memberEntriesByHabit, setMemberEntriesByHabit] = useState<Record<string, { date: string; status: string }[]>>({});
  const [memberHabits, setMemberHabits] = useState<Record<string, Habit[]>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [groupStreak, setGroupStreak] = useState(0);
  const [trophies, setTrophies] = useState<GroupTrophy[]>([]);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [selectedMemberAbout, setSelectedMemberAbout] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(null);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);

  const { computeGroupTrophies, removeMember, promoteMember } = useGroups();

  const loadMembersTab = useCallback(async () => {
    if (!groupId || members.length === 0) return;
    setLoadingMembers(true);
    try {
      const memberIds = members.map(m => m.userId);
      const startKey = getDateKey(60);

      const { data: groupChallenges } = await supabase
        .from('group_challenges').select('id, name, emoji, schedule, custom_days, start_date').eq('group_id', groupId);
      const challengeIds = (groupChallenges ?? []).map((c: { id: string }) => c.id);

      const [entriesRes, membershipsRes, streakDays] = await Promise.all([
        challengeIds.length > 0
          ? supabase.from('group_challenge_checkins').select('user_id, challenge_id, date')
              .in('user_id', memberIds).in('challenge_id', challengeIds).gte('date', startKey).eq('done', true)
          : Promise.resolve({ data: [] as { user_id: string; challenge_id: string; date: string }[] }),
        challengeIds.length > 0
          ? supabase.from('group_challenge_members').select('user_id, challenge_id')
              .in('user_id', memberIds).in('challenge_id', challengeIds)
          : Promise.resolve({ data: [] as { user_id: string; challenge_id: string }[] }),
        computeGroupStreak(groupId),
      ]);

      const entriesByUser: Record<string, { date: string; status: string }[]> = {};
      const entriesByChallenge: Record<string, { date: string; status: string }[]> = {};
      for (const e of (entriesRes.data ?? []) as { user_id: string; challenge_id: string; date: string }[]) {
        (entriesByUser[e.user_id] ??= []).push({ date: e.date, status: 'done' });
        (entriesByChallenge[e.challenge_id] ??= []).push({ date: e.date, status: 'done' });
      }

      const challengesById = Object.fromEntries((groupChallenges ?? []).map(
        (c: { id: string; name: string; emoji: string; schedule: string; custom_days: number[] | null; start_date: string }) => [c.id, c]
      ));
      const habitsByUser: Record<string, Habit[]> = {};
      for (const m of (membershipsRes.data ?? []) as { user_id: string; challenge_id: string }[]) {
        const ch = challengesById[m.challenge_id];
        if (ch) (habitsByUser[m.user_id] ??= []).push(dbRowToHabit(ch));
      }

      setMemberEntries(entriesByUser);
      setMemberEntriesByHabit(entriesByChallenge);
      setMemberHabits(habitsByUser);
      setGroupStreak(streakDays);

      const tro = await computeGroupTrophies(groupId, streakDays);
      setTrophies(tro);
    } catch {
      showToast('Failed to load members data.', 'error');
    } finally {
      setLoadingMembers(false);
    }
  }, [groupId, members, computeGroupStreak, computeGroupTrophies, showToast]);

  useEffect(() => {
    if (activeTab === 'members' && groupId && members.length > 0) loadMembersTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupId, members.length]);

  useEffect(() => {
    if (!selectedMember) { setSelectedMemberAbout(null); return; }
    supabase.from('profiles').select('about').eq('id', selectedMember.userId).maybeSingle()
      .then((res: { data: unknown }) => setSelectedMemberAbout((res.data as { about?: string } | null)?.about ?? null));
  }, [selectedMember]);

  const handleRemoveMemberConfirm = async () => {
    if (!groupId || !removingMemberId) return;
    try {
      await removeMember(groupId, removingMemberId);
      setMembers(prev => prev.filter(m => m.userId !== removingMemberId));
      showToast('Member removed.', 'success');
    } catch {
      showToast('Failed to remove member.', 'error');
    } finally {
      setShowRemoveConfirm(false);
      setRemovingMemberId(null);
    }
  };

  const handlePromoteMemberConfirm = async () => {
    if (!groupId || !promotingMemberId) return;
    try {
      await promoteMember(groupId, promotingMemberId);
      setMembers(prev => prev.map(m => m.userId === promotingMemberId ? { ...m, role: 'admin' as const } : m));
      showToast('Member promoted to Admin.', 'success');
    } catch {
      showToast('Failed to promote member.', 'error');
    } finally {
      setShowPromoteConfirm(false);
      setPromotingMemberId(null);
    }
  };

  function computeWeeklyRate(memberId: string, monday: string, endKey: string): number {
    const entries = memberEntries[memberId] ?? [];
    const habits = memberHabits[memberId] ?? [];
    let scheduled = 0, done = 0;
    let d = new Date(monday + 'T12:00:00');
    const end = new Date(endKey + 'T12:00:00');
    while (d <= end) {
      const key = toDateKey(d);
      const dayHabits = habits.filter(h => isScheduledForDate(h, key));
      scheduled += dayHabits.length;
      done += Math.min(dayHabits.length, entries.filter(e => e.date === key && e.status === 'done').length);
      d = new Date(d.getTime() + 86400000);
    }
    return scheduled > 0 ? Math.round((done / scheduled) * 100) : 0;
  }

  const thisMonday = getThisMonday();
  const today = toDateKey(new Date());
  const lastMonday = addDaysToKey(thisMonday, -7);
  const lastSunday = addDaysToKey(thisMonday, -1);

  const weeklyLeaderboard = members.map(m => {
    const entries = memberEntries[m.userId] ?? [];
    const thisWeekRate = computeWeeklyRate(m.userId, thisMonday, today);
    const lastWeekRate = computeWeeklyRate(m.userId, lastMonday, lastSunday);
    const streak = computeMemberStreak(entries);
    const thirtyDayEntries = entries.filter(e => e.date >= getDateKey(30));
    const habits = memberHabits[m.userId] ?? [];
    let scheduled30 = 0, done30 = 0;
    for (let i = 0; i < 30; i++) {
      const key = getDateKey(i);
      const dayHabits = habits.filter(h => isScheduledForDate(h, key));
      scheduled30 += dayHabits.length;
      done30 += Math.min(dayHabits.length, thirtyDayEntries.filter(e => e.date === key && e.status === 'done').length);
    }
    const consistency30 = scheduled30 > 0 ? Math.round((done30 / scheduled30) * 100) : 0;
    return { member: m, rate: thisWeekRate, lastWeekRate, streak, consistency30, improvement: thisWeekRate - lastWeekRate };
  }).sort((a, b) => b.rate - a.rate);

  const hotStreakId = weeklyLeaderboard.length > 0 ? weeklyLeaderboard.reduce((a, b) => a.streak >= b.streak ? a : b).member.userId : null;
  const mostConsistentId = weeklyLeaderboard.length > 0 ? weeklyLeaderboard.reduce((a, b) => a.consistency30 >= b.consistency30 ? a : b).member.userId : null;
  const mostImprovedId = weeklyLeaderboard.length > 0 ? weeklyLeaderboard.reduce((a, b) => a.improvement >= b.improvement ? a : b).member.userId : null;

  const renderMembersTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ backgroundColor: colors.success + '12', border: `1px solid ${colors.success}40`, borderRadius: colors.radius, padding: 14 }}>
        {groupStreak > 0 ? (
          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 8px' }}>🔥 At least one of you completed a habit every day for {groupStreak} day{groupStreak !== 1 ? 's' : ''} in a row!</p>
        ) : (
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 8px' }}>Start your group streak — complete a habit today!</p>
        )}
        <div style={{ display: 'flex', gap: -4 }}>
          {todaysPulse.slice(0, 8).map(m => (
            <AvatarCircle key={m.userId} emoji={m.userEmoji} name={m.displayName} size={28} ring={2} ringColor={colors.background} />
          ))}
        </div>
      </div>

      <div>
        <p style={{ ...font.label, fontSize: 12, color: colors.mutedForeground, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 8px' }}>Group Trophies</p>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {trophies.map(t => (
            <div key={t.id} title={t.earned ? `Earned ${t.earnedAt ?? ''}` : t.description} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, flexShrink: 0,
              backgroundColor: t.earned ? colors.primary + '18' : 'transparent',
              border: `1px solid ${t.earned ? colors.primary : colors.border}`,
              opacity: t.earned ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span style={{ ...font.body, fontSize: 12, color: t.earned ? colors.primary : colors.mutedForeground }}>{t.title}</span>
              <span style={{ fontSize: 11 }}>{t.earned ? '✓' : '🔒'}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ ...font.label, fontSize: 12, color: colors.mutedForeground, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 8px' }}>This Week</p>
        {loadingMembers ? (
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground }}>Loading…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(leaderboardExpanded ? weeklyLeaderboard : weeklyLeaderboard.slice(0, 5)).map((row, idx) => {
              const medal = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              return (
                <div key={row.member.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: row.member.userId === user?.id ? colors.primary + '08' : 'transparent', borderRadius: 8, padding: '2px 4px' }}>
                  <span style={{ width: 18, fontSize: 13 }}>{medal}</span>
                  <AvatarCircle emoji={row.member.userEmoji} name={row.member.displayName} size={28} />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ ...font.body, fontSize: 13, color: colors.foreground }}>{row.member.displayName}</span>
                    {row.member.userId === hotStreakId && row.streak > 0 && <span style={{ ...font.body, fontSize: 10, padding: '1px 6px', borderRadius: 6, backgroundColor: colors.muted, color: colors.mutedForeground }}>🔥 Hot Streak</span>}
                    {row.member.userId === mostConsistentId && row.consistency30 > 0 && <span style={{ ...font.body, fontSize: 10, padding: '1px 6px', borderRadius: 6, backgroundColor: colors.muted, color: colors.mutedForeground }}>💎 Most Consistent</span>}
                    {row.member.userId === mostImprovedId && row.improvement > 0 && <span style={{ ...font.body, fontSize: 10, padding: '1px 6px', borderRadius: 6, backgroundColor: colors.muted, color: colors.mutedForeground }}>🌱 Most Improved</span>}
                  </div>
                  <span style={{ ...font.label, fontSize: 13, color: colors.foreground }}>{row.rate}%</span>
                </div>
              );
            })}
            {weeklyLeaderboard.length > 5 && (
              <button onClick={() => setLeaderboardExpanded(e => !e)} style={{ ...font.body, fontSize: 12, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '2px 4px' }}>
                {leaderboardExpanded ? 'Show less' : `Show all ${weeklyLeaderboard.length} members`}
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <p style={{ ...font.label, fontSize: 12, color: colors.mutedForeground, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 8px' }}>All Members</p>
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 10 }}>
          {members.map(m => {
            const entries = memberEntries[m.userId] ?? [];
            const habits = memberHabits[m.userId] ?? [];
            const streak = computeMemberStreak(entries);
            return (
              <div key={m.userId} onClick={() => setSelectedMember(m)} style={{
                backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.primary}40`,
                borderRadius: colors.radius, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AvatarCircle emoji={m.userEmoji} name={m.displayName} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ ...font.label, fontSize: 13, color: colors.foreground, margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName}</p>
                      {m.role === 'admin' && <span style={{ ...font.body, fontSize: 10, padding: '1px 6px', borderRadius: 6, backgroundColor: colors.muted, color: colors.mutedForeground, flexShrink: 0 }}>Admin</span>}
                    </div>
                    <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0 }}>{streak > 0 ? `🔥 ${streak} days` : 'No streak yet'}</p>
                  </div>
                  {currentMemberRole === 'admin' && m.userId !== user?.id && (
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      {m.role !== 'admin' && (
                        <button onClick={(e) => { e.stopPropagation(); setPromotingMemberId(m.userId); setShowPromoteConfirm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Promote to Admin">
                          <Flag size={15} color={colors.mutedForeground} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setRemovingMemberId(m.userId); setShowRemoveConfirm(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} title="Remove member">
                        <MoreVertical size={16} color={colors.mutedForeground} />
                      </button>
                    </div>
                  )}
                </div>
                <MiniHeatmap entries={entries} days={28} colors={colors} dotSize={7} />
                <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0 }}>{habits.length} challenge{habits.length !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {currentMemberRole === 'admin' && members.length === 1 ? (
          <button onClick={() => { setShowDeleteStep1(true); }} style={{ ...font.label, fontSize: 14, color: '#fff', backgroundColor: colors.destructive, border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}>Delete Group</button>
        ) : (
          <button onClick={handleLeaveGroupStart} style={{ ...font.label, fontSize: 14, color: colors.destructive, backgroundColor: 'transparent', border: `1.5px solid ${colors.destructive}`, borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}>Leave Group</button>
        )}
      </div>

      {selectedMember && (
        <Modal visible={!!selectedMember} onClose={() => setSelectedMember(null)}>
          <div style={{ padding: '24px 20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AvatarCircle emoji={selectedMember.userEmoji} name={selectedMember.displayName} size={56} />
              <div>
                <p style={{ ...font.heading, fontSize: 18, color: colors.foreground, margin: 0 }}>{selectedMember.displayName}</p>
                <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>Member since {selectedMember.joinedAt.slice(0, 10)}</p>
              </div>
            </div>
            {(() => {
              const memberStats = weeklyLeaderboard.find(r => r.member.userId === selectedMember.userId);
              return memberStats ? (
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...font.heading, fontSize: 18, color: colors.primary, margin: 0 }}>{memberStats.streak}</p>
                    <p style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, margin: 0 }}>streak</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...font.heading, fontSize: 18, color: colors.primary, margin: 0 }}>{memberStats.consistency30}%</p>
                    <p style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, margin: 0 }}>30d rate</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...font.heading, fontSize: 18, color: colors.primary, margin: 0 }}>{memberStats.rate}%</p>
                    <p style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, margin: 0 }}>this week</p>
                  </div>
                </div>
              ) : null;
            })()}
            {selectedMemberAbout && (
              <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.5 }}>"{selectedMemberAbout}"</p>
            )}
            {(() => {
              const habits = memberHabits[selectedMember.userId] ?? [];
              if (habits.length === 0) {
                return <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground }}>This member hasn't joined any challenges yet.</p>;
              }
              return (
                <>
                  <p style={{ ...font.label, fontSize: 13, color: colors.foreground, margin: '0 0 10px' }}>{habits.length} challenge{habits.length !== 1 ? 's' : ''}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    {habits.map(h => {
                      const habitEntries = memberEntriesByHabit[h.id] ?? [];
                      return (
                        <div key={h.id}>
                          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 4px' }}>{h.emoji} {h.name || 'Challenge'}</p>
                          <MiniHeatmap entries={habitEntries} days={30} colors={colors} dotSize={7} />
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0 }}>Showing this member's check-ins for group challenges.</p>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        visible={showRemoveConfirm}
        icon="🚫"
        title="Remove this member?"
        message="They'll lose access to the feed, challenges, and chat."
        confirmLabel="Remove"
        destructive
        onConfirm={handleRemoveMemberConfirm}
        onCancel={() => { setShowRemoveConfirm(false); setRemovingMemberId(null); }}
      />
      <ConfirmDialog
        visible={showPromoteConfirm}
        icon="👑"
        title="Promote to Admin?"
        message="They'll be able to edit group settings, remove members, and manage challenges."
        confirmLabel="Promote"
        onConfirm={handlePromoteMemberConfirm}
        onCancel={() => { setShowPromoteConfirm(false); setPromotingMemberId(null); }}
      />
    </div>
  );

  // ── Chat tab state ──
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [hasEarlierMessages, setHasEarlierMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatReactionPickerFor, setChatReactionPickerFor] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategoryKey, setEmojiCategoryKey] = useState(EMOJI_CATEGORIES[0].key);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [hoveredEmojiName, setHoveredEmojiName] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [showDeleteMessageConfirm, setShowDeleteMessageConfirm] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const chatLoadedOnce = useRef(false);
  const messagesRef = useRef<GroupMessage[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const currentMemberRef = useRef<GroupMember | undefined>(undefined);
  useEffect(() => { currentMemberRef.current = currentMember; }, [currentMember]);

  const { fetchMessages, sendMessage, deleteMessage, toggleMessageReaction } = useGroups();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadChatTab = useCallback(async () => {
    if (!groupId) return;
    // Only show the full-screen "Loading…" skeleton on the very first load. Refreshes triggered
    // by sending a message, pinning, or realtime updates should swap data in silently — otherwise
    // every send flashes the whole message list to a loading state and back.
    const isFirstLoad = !chatLoadedOnce.current;
    if (isFirstLoad) setLoadingMessages(true);
    try {
      const msgs = await fetchMessages(groupId, 50);
      setMessages(msgs);
      setHasEarlierMessages(msgs.length === 50);
      chatLoadedOnce.current = true;
      setTimeout(scrollToBottom, 50);
    } catch {
      showToast('Failed to load messages.', 'error');
    } finally {
      if (isFirstLoad) setLoadingMessages(false);
    }
  }, [groupId, fetchMessages, showToast, scrollToBottom]);

  useEffect(() => {
    if (activeTab === 'chat' && groupId) loadChatTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupId]);

  useEffect(() => {
    if (!groupId) return;
    const channel = supabase
      .channel(`group_chat_${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, async (payload) => {
        if (!chatLoadedOnce.current) return;
        const row = payload.new as { id: string; group_id: string; user_id: string; content: string; created_at: string };
        const { data: profile } = await supabase.from('profiles').select('id, user_name, user_emoji, avatar_url').eq('id', row.user_id).maybeSingle();
        const newMsg: GroupMessage = {
          id: row.id,
          groupId: row.group_id,
          userId: row.user_id,
          content: row.content,
          createdAt: row.created_at,
          displayName: (profile as { user_name?: string } | null)?.user_name || 'Member',
          avatarUrl: (profile as { avatar_url?: string } | null)?.avatar_url ?? '',
          userEmoji: (profile as { user_emoji?: string } | null)?.user_emoji ?? '😊',
          reactions: [],
        };
        setMessages(prev => {
          // Replace matching optimistic temp message from same user+content
          const withoutTemp = prev.filter(m => !(m.id.startsWith('temp_') && m.userId === row.user_id && m.content === row.content));
          if (withoutTemp.some(m => m.id === row.id)) return withoutTemp;
          return [...withoutTemp, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, (payload) => {
        if (!chatLoadedOnce.current) return;
        const deletedId = (payload.old as { id?: string })?.id;
        if (deletedId) setMessages(prev => prev.filter(m => m.id !== deletedId));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_message_reactions' }, (payload) => {
        if (!chatLoadedOnce.current) return;
        const row = (payload.new ?? payload.old) as { message_id?: string } | null;
        const messageId = row?.message_id;
        if (!messageId || !messagesRef.current.some(m => m.id === messageId)) return;
        supabase.from('group_message_reactions').select('message_id, user_id, emoji').eq('message_id', messageId)
          .then((res: { data: { message_id: string; user_id: string; emoji: string }[] | null }) => {
            const rxns = res.data;
            if (!rxns) return;
            const EMOJIS_ALL = ['🔥', '❤️', '😂', '👍', '💯'];
            setMessages(prev => prev.map(m => {
              if (m.id !== messageId) return m;
              return {
                ...m,
                reactions: EMOJIS_ALL.map(emoji => ({
                  emoji,
                  count: rxns.filter((r: { emoji: string }) => r.emoji === emoji).length,
                  myReaction: rxns.some((r: { emoji: string; user_id: string }) => r.emoji === emoji && r.user_id === user?.id),
                })).filter(r => r.count > 0),
              };
            }));
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, scrollToBottom, user?.id]);

  const handleLoadEarlierMessages = async () => {
    if (!groupId || messages.length === 0) return;
    const oldest = messages[0];
    try {
      const older = await fetchMessages(groupId, 50, oldest.createdAt);
      setMessages(prev => [...older, ...prev]);
      setHasEarlierMessages(older.length === 50);
    } catch {
      showToast('Failed to load earlier messages.', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!groupId || !messageInput.trim() || sendingMessage) return;
    const content = messageInput.trim();
    const tempId = `temp_${Date.now()}`;
    setMessageInput('');
    if (messageInputRef.current) messageInputRef.current.style.height = 'auto';
    setShowEmojiPicker(false);
    setSendingMessage(true);
    const tempMsg: GroupMessage = {
      id: tempId,
      groupId,
      userId: user!.id,
      content,
      createdAt: new Date().toISOString(),
      displayName: currentMember?.displayName ?? 'You',
      avatarUrl: currentMember?.avatarUrl ?? '',
      userEmoji: currentMember?.userEmoji ?? '😊',
      reactions: [],
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);
    try {
      await sendMessage(groupId, content);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessageInput(content);
      showToast('Failed to send message.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    const el = messageInputRef.current;
    if (!el) { setMessageInput(prev => prev + emoji); return; }
    const start = el.selectionStart ?? messageInput.length;
    const end = el.selectionEnd ?? messageInput.length;
    const next = messageInput.slice(0, start) + emoji + messageInput.slice(end);
    setMessageInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleDeleteMessageConfirm = async () => {
    if (!deletingMessageId) return;
    try {
      await deleteMessage(deletingMessageId);
      setMessages(prev => prev.filter(m => m.id !== deletingMessageId));
    } catch {
      showToast('Failed to delete message.', 'error');
    } finally {
      setShowDeleteMessageConfirm(false);
      setDeletingMessageId(null);
    }
  };

  const handleChatReaction = async (message: GroupMessage, emoji: string) => {
    if (!groupId) return;
    const existing = message.reactions.find(r => r.emoji === emoji);
    const hasMyReaction = existing?.myReaction ?? false;
    setChatReactionPickerFor(null);
    setMessages(prev => prev.map(m => {
      if (m.id !== message.id) return m;
      const reactions = [...m.reactions];
      const idx = reactions.findIndex(r => r.emoji === emoji);
      if (hasMyReaction && idx >= 0) reactions[idx] = { ...reactions[idx], count: Math.max(0, reactions[idx].count - 1), myReaction: false };
      else if (idx >= 0) reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, myReaction: true };
      else reactions.push({ emoji, count: 1, myReaction: true });
      return { ...m, reactions };
    }));
    try {
      await toggleMessageReaction(message.id, groupId, emoji, hasMyReaction);
    } catch {
      showToast('Failed to react.', 'error');
      loadChatTab();
    }
  };

  const activeEmojiCategory = EMOJI_CATEGORIES.find(c => c.key === emojiCategoryKey) ?? EMOJI_CATEGORIES[0];
  const emojiSearchResults = emojiSearch.trim()
    ? EMOJI_FLAT.filter(e => e.name.toLowerCase().includes(emojiSearch.trim().toLowerCase()))
    : null;

  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter(m => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  const renderChatTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        className="chat-scrollbar"
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 16px 4px 4px',
          ['--scrollbar-thumb' as string]: colors.border,
          ['--scrollbar-thumb-hover' as string]: colors.mutedForeground,
        } as React.CSSProperties}
      >
        {hasEarlierMessages && (
          <button onClick={handleLoadEarlierMessages} style={{ ...font.body, fontSize: 12, color: colors.primary, background: 'none', border: `1px solid ${colors.border}`, borderRadius: 9, padding: '8px 0', cursor: 'pointer', marginBottom: 10 }}>Load earlier messages</button>
        )}
        {showChatSearch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', flexShrink: 0 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, backgroundColor: colors.muted, borderRadius: 10, padding: '6px 10px', border: `1px solid ${colors.border}` }}>
              <Search size={13} color={colors.mutedForeground} />
              <input
                autoFocus
                value={chatSearchQuery}
                onChange={e => setChatSearchQuery(e.target.value)}
                placeholder="Search messages…"
                style={{ ...font.body, fontSize: 13, color: colors.foreground, background: 'none', border: 'none', outline: 'none', flex: 1, minWidth: 0 }}
              />
              {chatSearchQuery && (
                <button onClick={() => setChatSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={13} color={colors.mutedForeground} />
                </button>
              )}
            </div>
            <button onClick={() => { setShowChatSearch(false); setChatSearchQuery(''); }} style={{ ...font.body, fontSize: 12, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Cancel</button>
          </div>
        )}
        {loadingMessages ? (
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center' }}>Loading…</p>
        ) : displayedMessages.length === 0 ? (
          chatSearchQuery.trim()
            ? <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', padding: '20px 0' }}>No messages matching "{chatSearchQuery}"</p>
            : <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', padding: '30px 0' }}>No messages yet. Say hello! 👋</p>
        ) : (
          displayedMessages.map((m, idx) => {
            const isMine = m.userId === user?.id;
            const prevMsg = displayedMessages[idx - 1];
            const isNewSenderGroup = !prevMsg || prevMsg.userId !== m.userId;
            const reactions = m.reactions.filter(r => r.count > 0);
            const canDelete = isMine || currentMemberRole === 'admin';
            const mDateKey = m.createdAt.slice(0, 10);
            const prevDateKey = idx > 0 ? displayedMessages[idx - 1].createdAt.slice(0, 10) : null;
            const showSeparator = mDateKey !== prevDateKey;

            return (
              <React.Fragment key={m.id}>
                {showSeparator && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 4px' }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    <span style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, whiteSpace: 'nowrap', padding: '0 6px' }}>{formatDateLabel(m.createdAt)}</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  </div>
                )}
                <div
                  className="chat-row"
                  style={{ position: 'relative', display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, marginTop: isNewSenderGroup ? 12 : 2 }}
                >
                  {!isMine && (
                    <div style={{ width: 28, flexShrink: 0 }}>
                      {isNewSenderGroup && <AvatarCircle emoji={m.userEmoji} name={m.displayName} size={28} />}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '72%', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    {!isMine && isNewSenderGroup && (
                      <p style={{ ...font.label, fontSize: 11, color: colors.primary, margin: '0 0 2px 2px' }}>{m.displayName}</p>
                    )}

                    {/* Relative wrapper scoped to JUST the bubble — keeps the delete badge anchored
                        to the bubble's own corner even when a name label sits above it. */}
                    <div style={{ position: 'relative' }}>
                      <div
                        onClick={() => setChatReactionPickerFor(prev => prev === m.id ? null : m.id)}
                        style={{
                          cursor: 'pointer', padding: '8px 12px',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          backgroundColor: isMine ? colors.primary : colors.muted,
                        }}
                      >
                        <p style={{ ...font.body, fontSize: 14, color: isMine ? '#fff' : colors.foreground, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</p>
                        <p style={{ ...font.body, fontSize: 10, color: isMine ? '#ffffffb0' : colors.mutedForeground, margin: '3px 0 0', textAlign: 'right' }}>{formatTime(m.createdAt)}</p>
                      </div>

                      {/* Delete badge: absolutely positioned over the bubble's outer corner — never
                          shifts layout, faint at rest, fully visible on row hover (see .chat-row / .chat-delete-btn) */}
                      {canDelete && (
                        <button
                          className="chat-delete-btn"
                          onClick={(e) => { e.stopPropagation(); setDeletingMessageId(m.id); setShowDeleteMessageConfirm(true); }}
                          aria-label="Delete message"
                          style={{
                            position: 'absolute', top: -6, [isMine ? 'left' : 'right']: -6,
                            width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: colors.card, border: `1px solid ${colors.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                        >
                          <Trash2 size={10} color={colors.destructive} />
                        </button>
                      )}
                    </div>

                    {reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
                        {reactions.map(r => (
                          <button key={r.emoji} onClick={(e) => { e.stopPropagation(); handleChatReaction(m, r.emoji); }} style={{
                            ...font.body, fontSize: 11, padding: '2px 7px', borderRadius: 7, cursor: 'pointer',
                            border: `1px solid ${r.myReaction ? colors.primary : colors.border}`,
                            backgroundColor: r.myReaction ? colors.primary + '18' : 'transparent',
                            color: r.myReaction ? colors.primary : colors.mutedForeground,
                          }}>{r.emoji} {r.count}</button>
                        ))}
                        <button onClick={async () => {
                          const rxns = await supabase.from('group_message_reactions').select('user_id, emoji').eq('message_id', m.id);
                          const uids = [...new Set((rxns.data ?? []).map((r: { user_id: string }) => r.user_id))];
                          if (uids.length === 0) return;
                          const profiles = await supabase.from('profiles').select('id, user_name').in('id', uids);
                          const names = (profiles.data ?? []).map((p: { user_name?: string }) => p.user_name || 'Member').join(', ');
                          showToast(`Reacted: ${names}`, 'info');
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', ...font.body, fontSize: 10, color: colors.mutedForeground, padding: '0 2px', marginLeft: 2 }}>
                          👁
                        </button>
                      </div>
                    )}

                    {chatReactionPickerFor === m.id && (
                      <div style={{ display: 'flex', gap: 4, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 6, marginTop: 4, width: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                        {REACTION_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={() => handleChatReaction(m, emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2 }}>{emoji}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {messageInput.length > MAX_MESSAGE_LENGTH - 100 && (
        <p style={{
          ...font.body, fontSize: 11, margin: '4px 2px 0', textAlign: 'right', flexShrink: 0,
          color: messageInput.length >= MAX_MESSAGE_LENGTH ? colors.destructive : colors.mutedForeground,
        }}>
          {messageInput.length}/{MAX_MESSAGE_LENGTH}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 10, flexShrink: 0 }}>
        <button
          onClick={() => { setShowChatSearch(s => !s); if (showChatSearch) setChatSearchQuery(''); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, width: 40, height: 40, flexShrink: 0 }}
          aria-label="Search messages"
        >
          <Search size={18} color={showChatSearch ? colors.primary : colors.mutedForeground} />
        </button>
        <button
          onClick={() => setShowEmojiPicker(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, width: 40, height: 40, flexShrink: 0,
          }}
          aria-label="Open emoji picker"
        >
          <Smile size={20} color={colors.mutedForeground} />
        </button>
        <textarea
          ref={messageInputRef}
          value={messageInput}
          onChange={e => {
            setMessageInput(e.target.value);
            const el = e.target;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Message..."
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          style={{ ...font.body, fontSize: 14, color: colors.foreground, border: `1.5px solid ${colors.border}`, borderRadius: 20, padding: '10px 16px', backgroundColor: colors.card, flex: 1, outline: 'none', resize: 'none', overflowY: 'auto', maxHeight: 120, boxSizing: 'border-box' }}
        />
        <button onClick={handleSendMessage} disabled={!messageInput.trim() || sendingMessage} style={{
          backgroundColor: messageInput.trim() && !sendingMessage ? colors.primary : colors.muted, border: 'none', borderRadius: '50%',
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: messageInput.trim() && !sendingMessage ? 'pointer' : 'default', flexShrink: 0,
          opacity: sendingMessage ? 0.6 : 1,
        }}>
          <Send size={16} color={messageInput.trim() && !sendingMessage ? '#fff' : colors.mutedForeground} />
        </button>
      </div>

      <Modal visible={showEmojiPicker} onClose={() => { setShowEmojiPicker(false); setEmojiSearch(''); }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'min(420px, 70vh)', width: '100%' }}>
          {/* Header */}
          <div style={{ padding: '16px 16px 10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ ...font.heading, fontSize: 17, color: colors.foreground, margin: 0 }}>Emoji</p>
              <button onClick={() => { setShowEmojiPicker(false); setEmojiSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }} aria-label="Close emoji picker">
                <X size={18} color={colors.mutedForeground} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: colors.muted, borderRadius: 10, padding: '8px 12px' }}>
              <Search size={15} color={colors.mutedForeground} />
              <input
                value={emojiSearch}
                onChange={e => setEmojiSearch(e.target.value)}
                placeholder="Search emoji..."
                style={{ ...font.body, fontSize: 14, color: colors.foreground, background: 'none', border: 'none', outline: 'none', flex: 1 }}
              />
              {emojiSearch && (
                <button onClick={() => setEmojiSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <X size={14} color={colors.mutedForeground} />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs (hidden while searching) */}
          {!emojiSearchResults && (
            <div className="hide-scrollbar" style={{ display: 'flex', gap: 4, padding: '0 16px 10px', overflowX: 'auto', flexShrink: 0 }}>
              {EMOJI_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const active = cat.key === emojiCategoryKey;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setEmojiCategoryKey(cat.key)}
                    title={cat.label}
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: active ? colors.primary + '18' : 'transparent',
                    }}
                  >
                    <Icon size={17} color={active ? colors.primary : colors.mutedForeground} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
            {emojiSearchResults ? (
              emojiSearchResults.length === 0 ? (
                <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, textAlign: 'center', padding: '30px 0' }}>No emoji found for "{emojiSearch}"</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                  {emojiSearchResults.map(e => (
                    <button
                      key={e.char} onClick={() => handleInsertEmoji(e.char)}
                      onMouseEnter={() => setHoveredEmojiName(e.name)} onMouseLeave={() => setHoveredEmojiName(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: 6, borderRadius: 8, lineHeight: 1, aspectRatio: '1' }}
                    >
                      {e.char}
                    </button>
                  ))}
                </div>
              )
            ) : (
              <>
                <p style={{ ...font.label, fontSize: 11, color: colors.mutedForeground, letterSpacing: 0.6, textTransform: 'uppercase', margin: '8px 0 8px 2px' }}>{activeEmojiCategory.label}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                  {activeEmojiCategory.emojis.map(e => (
                    <button
                      key={e.char} onClick={() => handleInsertEmoji(e.char)}
                      onMouseEnter={() => setHoveredEmojiName(e.name)} onMouseLeave={() => setHoveredEmojiName(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: 6, borderRadius: 8, lineHeight: 1, aspectRatio: '1' }}
                    >
                      {e.char}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer: hover preview, like macOS/Slack pickers */}
          <div style={{ borderTop: `1px solid ${colors.border}`, padding: '10px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, minHeight: 20 }}>
            {hoveredEmojiName ? (
              <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0, textTransform: 'capitalize' }}>{hoveredEmojiName}</p>
            ) : (
              <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>Tap an emoji to add it — pick as many as you like</p>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        visible={showDeleteMessageConfirm}
        icon="🗑️"
        title="Delete this message?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteMessageConfirm}
        onCancel={() => { setShowDeleteMessageConfirm(false); setDeletingMessageId(null); }}
      />
    </div>
  );

  // ── Settings tab state ──
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmoji, setSettingsEmoji] = useState('👥');
  const [settingsColor, setSettingsColor] = useState('#2B3A8C');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [settingsMotto, setSettingsMotto] = useState('');
  const [settingsMottoAuthor, setSettingsMottoAuthor] = useState('');
  const [settingsWelcomeMessage, setSettingsWelcomeMessage] = useState('');
  const [settingsMemberLimit, setSettingsMemberLimit] = useState(20);
  const [settingsChallengeCreator, setSettingsChallengeCreator] = useState<'any' | 'admin'>('any');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [currentMuted, setCurrentMuted] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regeneratedCode, setRegeneratedCode] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [showDeleteStep1, setShowDeleteStep1] = useState(false);
  const [showDeleteStep2, setShowDeleteStep2] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingGroup, setDeletingGroup] = useState(false);

  const [leaveStep, setLeaveStep] = useState<'idle' | 'confirm'>('idle');
  const [leavingGroup, setLeavingGroup] = useState(false);

  const {
    updateGroupSettings, deleteGroup, regenerateInviteCode, updateMemberSettings,
    leaveGroup,
  } = useGroups();

  useEffect(() => {
    if (group) {
      setSettingsName(group.name);
      setSettingsEmoji(group.emoji);
      setSettingsColor(group.color);
      setSettingsDescription(group.description);
      setSettingsMotto(group.motto);
      setSettingsMottoAuthor(group.mottoAuthor);
      setSettingsWelcomeMessage(group.welcomeMessage);
      setSettingsMemberLimit(group.memberLimit);
      setSettingsChallengeCreator(group.challengeCreator);
    }
    if (currentMember) setCurrentMuted(currentMember.muted);
  }, [group, currentMember]);

  const handleSaveIdentity = async () => {
    if (!groupId || savingSettings) return;
    setSavingSettings(true);
    try {
      await updateGroupSettings(groupId, {
        name: settingsName.trim(), emoji: settingsEmoji, color: settingsColor,
        description: settingsDescription, motto: settingsMotto, mottoAuthor: settingsMottoAuthor,
        welcomeMessage: settingsWelcomeMessage,
      });
      setGroup(prev => prev ? { ...prev, name: settingsName.trim(), emoji: settingsEmoji, color: settingsColor, description: settingsDescription, motto: settingsMotto, mottoAuthor: settingsMottoAuthor, welcomeMessage: settingsWelcomeMessage } : prev);
      showToast('Group updated!', 'success');
    } catch {
      showToast('Failed to update group.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChallengeCreatorChange = async (val: 'any' | 'admin') => {
    if (!groupId) return;
    setSettingsChallengeCreator(val);
    try {
      await updateGroupSettings(groupId, { challengeCreator: val });
      setGroup(prev => prev ? { ...prev, challengeCreator: val } : prev);
    } catch {
      showToast('Failed to update permissions.', 'error');
    }
  };

  const handleSaveMemberLimit = async () => {
    if (!groupId) return;
    if (isNaN(settingsMemberLimit) || settingsMemberLimit < 2 || settingsMemberLimit > 100) {
      showToast('Member limit must be between 2 and 100.', 'error');
      return;
    }
    if (settingsMemberLimit < members.length) {
      showToast("Can't set limit below current member count.", 'error');
      return;
    }
    setSavingLimit(true);
    try {
      await updateGroupSettings(groupId, { memberLimit: settingsMemberLimit });
      setGroup(prev => prev ? { ...prev, memberLimit: settingsMemberLimit } : prev);
      showToast('Member limit updated.', 'success');
    } catch {
      showToast('Failed to update member limit.', 'error');
    } finally {
      setSavingLimit(false);
    }
  };

  const handleToggleMuted = async () => {
    if (!groupId) return;
    const newVal = !currentMuted;
    setCurrentMuted(newVal);
    try {
      await updateMemberSettings(groupId, { muted: newVal });
    } catch {
      setCurrentMuted(!newVal);
      showToast('Failed to update setting.', 'error');
    }
  };

  const handleRegenerateConfirm = async () => {
    if (!groupId) return;
    try {
      const code = await regenerateInviteCode(groupId);
      setRegeneratedCode(code);
      setGroup(prev => prev ? { ...prev, inviteCode: code } : prev);
      showToast('New invite link generated!', 'success');
    } catch {
      showToast('Failed to regenerate invite link.', 'error');
    } finally {
      setShowRegenerateConfirm(false);
    }
  };

  const handleCopyInvite = () => {
    const code = regeneratedCode ?? group?.inviteCode ?? '';
    navigator.clipboard.writeText(`${env.appUrl}/join/${code}`).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  };

  const handleLeaveGroupStart = () => {
    setLeaveStep('confirm');
  };

  const handleLeaveGroupFinalConfirm = async () => {
    if (!groupId || !group) return;
    setLeavingGroup(true);
    try {
      await leaveGroup(groupId);
      navigate('/groups');
      showToast(`You've left ${group.name}.`, 'success');
    } catch {
      showToast('Failed to leave group.', 'error');
    } finally {
      setLeavingGroup(false);
      setLeaveStep('idle');
    }
  };

  const handleDeleteGroupFinal = async () => {
    if (!groupId || !group) return;
    setDeletingGroup(true);
    try {
      await deleteGroup(groupId);
      navigate('/groups');
      showToast(`${group.name} has been deleted. You can now create a new group.`, 'success');
    } catch {
      showToast('Failed to delete group.', 'error');
    } finally {
      setDeletingGroup(false);
      setShowDeleteStep2(false);
      setDeleteConfirmText('');
    }
  };

  const canDeleteGroup = deleteConfirmText === group?.name;

  const labelStyle: React.CSSProperties = { ...font.label, fontSize: 12, color: colors.primary, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 8px', display: 'block' };
  const inputStyle: React.CSSProperties = { ...font.body, fontSize: 14, color: colors.foreground, border: `1.5px solid ${colors.border}`, borderRadius: 10, padding: '10px 12px', backgroundColor: colors.card, width: '100%', outline: 'none', boxSizing: 'border-box' };
  const sectionStyle: React.CSSProperties = { backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: colors.radius, padding: 14 };
  const sectionTitleStyle: React.CSSProperties = { ...font.label, fontSize: 14, color: colors.foreground, margin: '0 0 12px' };

  const renderSettingsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🎨 Group Identity</p>
        {currentMemberRole === 'admin' ? (
          <>
            <label style={labelStyle}>Group Name</label>
            <input value={settingsName} onChange={e => setSettingsName(e.target.value)} maxLength={40} style={{ ...inputStyle, marginBottom: 14 }} />

            <label style={labelStyle}>Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setSettingsEmoji(e)} style={{ width: 36, height: 36, borderRadius: 8, border: `${settingsEmoji === e ? 2 : 1}px solid ${settingsEmoji === e ? settingsColor : colors.border}`, backgroundColor: settingsEmoji === e ? settingsColor + '20' : colors.muted, cursor: 'pointer', fontSize: 17 }}>{e}</button>
              ))}
            </div>

            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {HABIT_COLORS.map(c => (
                <button key={c} onClick={() => setSettingsColor(c)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, border: settingsColor === c ? `3px solid ${colors.foreground}` : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>

            <label style={labelStyle}>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({120 - settingsDescription.length} left)</span></label>
            <input value={settingsDescription} onChange={e => setSettingsDescription(e.target.value.slice(0, 120))} maxLength={120} placeholder="Short bio for your group" style={{ ...inputStyle, marginBottom: 14 }} />

            <label style={labelStyle}>Motto <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({100 - settingsMotto.length} left)</span></label>
            <input value={settingsMotto} onChange={e => setSettingsMotto(e.target.value.slice(0, 100))} maxLength={100} placeholder="Rise together, fall together" style={{ ...inputStyle, marginBottom: 14 }} />

            <label style={labelStyle}>Motto By <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({40 - settingsMottoAuthor.length} left)</span></label>
            <input value={settingsMottoAuthor} onChange={e => setSettingsMottoAuthor(e.target.value.slice(0, 40))} maxLength={40} placeholder="The Circle" style={{ ...inputStyle, marginBottom: 14 }} />

            <label style={labelStyle}>Welcome Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({200 - settingsWelcomeMessage.length} left)</span></label>
            <input value={settingsWelcomeMessage} onChange={e => setSettingsWelcomeMessage(e.target.value.slice(0, 200))} maxLength={200} placeholder="Shown to new members when they join." style={{ ...inputStyle, marginBottom: 16 }} />

            <button onClick={handleSaveIdentity} disabled={savingSettings} style={{ ...font.label, fontSize: 14, fontWeight: 700, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 11, padding: '11px 18px', cursor: 'pointer', width: '100%' }}>
              {savingSettings ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 4px' }}>Name: {group?.name}</p>
            {group?.description && <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 4px' }}>Description: {group.description}</p>}
            {group?.motto && <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: 0 }}>Motto: "{group.motto}"{group.mottoAuthor && ` — ${group.mottoAuthor}`}</p>}
          </>
        )}
      </div>

      {currentMemberRole === 'admin' && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>🔗 Invite Link</p>
          <div style={{ backgroundColor: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 9, padding: '8px 12px', marginBottom: 10, wordBreak: 'break-all' }}>
            <p style={{ ...font.body, fontSize: 12, color: colors.foreground, margin: 0 }}>{env.appUrl}/join/{regeneratedCode ?? group?.inviteCode}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCopyInvite} style={{ flex: 1, ...font.label, fontSize: 13, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {inviteCopied ? <Check size={14} color="#fff" /> : <Copy size={14} color="#fff" />}
              {inviteCopied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={() => setShowRegenerateConfirm(true)} style={{ flex: 1, ...font.label, fontSize: 13, color: colors.mutedForeground, backgroundColor: colors.muted, border: 'none', borderRadius: 9, padding: '9px 0', cursor: 'pointer' }}>🔄 Regenerate</button>
          </div>
        </div>
      )}

      {currentMemberRole === 'admin' && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>⚙️ Permissions</p>
          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 8px' }}>Who can create challenges?</p>
          {(['any', 'admin'] as const).map(val => (
            <button key={val} onClick={() => handleChallengeCreatorChange(val)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', width: '100%', textAlign: 'left' }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid ${settingsChallengeCreator === val ? colors.primary : colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {settingsChallengeCreator === val && <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
              </div>
              <span style={{ ...font.body, fontSize: 13, color: colors.foreground }}>{val === 'any' ? 'Anyone in the group' : 'Admins only'}</span>
            </button>
          ))}
        </div>
      )}

      {currentMemberRole === 'admin' && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>👥 Member Limit</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <input type="number" min={2} max={100} value={settingsMemberLimit} onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setSettingsMemberLimit(v); }} style={{ ...inputStyle, width: 80 }} />
            <button onClick={handleSaveMemberLimit} disabled={savingLimit} style={{ ...font.label, fontSize: 13, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', cursor: 'pointer' }}>Save</button>
          </div>
          <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>Currently: {members.length} members</p>
        </div>
      )}

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>🔔 My Settings</p>
        <button onClick={handleToggleMuted} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ ...font.body, fontSize: 13, color: colors.foreground }}>Mute notifications from this group</span>
          <div style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: currentMuted ? colors.primary : colors.muted, position: 'relative', transition: 'background-color 0.15s' }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', position: 'absolute', top: 2, left: currentMuted ? 20 : 2, transition: 'left 0.15s' }} />
          </div>
        </button>
        <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: '8px 0 0' }}>When muted, you won't see nudge toasts or unread badges for this group.</p>
      </div>

      <div style={{ height: 1, backgroundColor: colors.border, margin: '4px 0' }} />
      <p style={{ ...font.label, fontSize: 14, color: colors.destructive, margin: '0 0 8px' }}>⛔ Danger Zone</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleLeaveGroupStart} disabled={leavingGroup} style={{ ...font.label, fontSize: 14, color: colors.destructive, backgroundColor: 'transparent', border: `1.5px solid ${colors.destructive}`, borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}>Leave Group</button>
        {currentMemberRole === 'admin' && (
          <button onClick={() => setShowDeleteStep1(true)} style={{ ...font.label, fontSize: 14, color: '#fff', backgroundColor: colors.destructive, border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}>Delete Group</button>
        )}
      </div>

      {/* Regenerate invite confirm */}
      <ConfirmDialog
        visible={showRegenerateConfirm}
        icon="🔄"
        title="Regenerate invite link?"
        message="Old link will stop working. Members who haven't joined yet will need the new link."
        confirmLabel="Regenerate"
        destructive
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setShowRegenerateConfirm(false)}
      />
    </div>
  );

  // Shared across Members + Settings tabs — must render unconditionally in main JSX
  const renderSharedGroupModals = () => (
    <>
      {/* Leave group: final confirm */}
      <ConfirmDialog
        visible={leaveStep === 'confirm'}
        icon="🚪"
        title={`Leave ${group?.name ?? 'group'}?`}
        message="You'll lose access to the feed, challenges, and chat. Other members will stay. Your past activity in this group feed will also be removed."
        confirmLabel="Leave"
        destructive
        onConfirm={handleLeaveGroupFinalConfirm}
        onCancel={() => setLeaveStep('idle')}
      />

      {/* Delete group: step 1 */}
      <ConfirmDialog
        visible={showDeleteStep1}
        icon="🗑️"
        title={`Delete "${group?.name}"?`}
        message={`This will permanently delete all ${members.length} members and their membership, all challenges and participant history, the entire chat history, and all reactions, nudges, and trophies. This cannot be undone. Every member will immediately lose access to this group.`}
        confirmLabel="Yes, continue →"
        destructive
        onConfirm={() => { setShowDeleteStep1(false); setShowDeleteStep2(true); }}
        onCancel={() => setShowDeleteStep1(false)}
      />

      {/* Delete group: step 2 type-to-confirm */}
      <Modal visible={showDeleteStep2} onClose={() => { setShowDeleteStep2(false); setDeleteConfirmText(''); }}>
        <div style={{ padding: '24px 20px 28px' }}>
          <p style={{ fontSize: 36, margin: '0 0 8px', textAlign: 'center' }}>⚠️</p>
          <p style={{ ...font.heading, fontSize: 17, color: colors.foreground, margin: '0 0 12px', textAlign: 'center' }}>Confirm deletion</p>
          <p style={{ ...font.body, fontSize: 13, color: colors.mutedForeground, margin: '0 0 12px', textAlign: 'center' }}>To permanently delete this group, type the group name exactly as shown below:</p>
          <p style={{ ...font.label, fontSize: 14, color: colors.foreground, margin: '0 0 10px', textAlign: 'center' }}>"{group?.name}"</p>
          <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleDeleteGroupFinal} disabled={!canDeleteGroup || deletingGroup} style={{ ...font.label, fontSize: 14, fontWeight: 700, color: '#fff', backgroundColor: canDeleteGroup ? colors.destructive : colors.muted, border: 'none', borderRadius: 11, padding: '12px 0', cursor: canDeleteGroup ? 'pointer' : 'default' }}>
              {deletingGroup ? 'Deleting…' : 'Delete Forever'}
            </button>
            <button onClick={() => { setShowDeleteStep2(false); setDeleteConfirmText(''); }} style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, backgroundColor: colors.muted, border: 'none', borderRadius: 11, padding: '11px 0', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );

  // ── Mount: load group + members, pending nudges, group-deleted realtime ──
  useEffect(() => {
    if (!groupId) return;
    let active = true;
    (async () => {
      setLoadingGroup(true);
      try {
        const cached = groups.find(g => g.id === groupId);
        if (cached) setGroup(cached);
        const [g, m] = await Promise.all([fetchGroupById(groupId), fetchGroupMembers(groupId)]);
        if (!active) return;
        setGroup(g);
        setMembers(m);
        await markGroupSeen(groupId);

        const nudges = await fetchPendingNudges(groupId);
        for (const n of nudges) {
          showToast(`💪 ${n.fromDisplayName} is cheering you on!`, 'success');
          await markNudgeSeen(n.id);
        }
      } catch {
        showToast('Failed to load group.', 'error');
      } finally {
        if (active) setLoadingGroup(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Keep group settings, membership, and challenges in sync across all members in realtime —
  // without this, only the admin who made a change sees it until everyone else manually refreshes.
  useEffect(() => {
    if (!groupId) return;
    const channel = supabase
      .channel(`group_sync_${groupId}`)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'groups', filter: `id=eq.${groupId}` }, () => {
        navigate('/groups');
        showToast('This group was deleted by the admin.', 'info');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${groupId}` }, () => {
        fetchGroupById(groupId).then(setGroup).catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` }, (payload) => {
        const removedUserId = payload.eventType === 'DELETE' ? (payload.old as { user_id?: string })?.user_id : undefined;
        if (removedUserId && removedUserId === user?.id) {
          navigate('/groups');
          showToast('You were removed from this group.', 'info');
          return;
        }
        fetchGroupMembers(groupId).then(setMembers).catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_challenges', filter: `group_id=eq.${groupId}` }, () => {
        if (activeTab === 'challenges') loadChallengesTab();
      })
      // group_challenge_checkins/members have no group_id column — filter client-side against
      // this group's known challenge ids so other members' check-ins/joins update live here too.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_challenge_checkins' }, (payload) => {
        const row = (payload.new ?? payload.old) as { challenge_id?: string } | null;
        const challengeId = row?.challenge_id;
        if (!challengeId || !challenges.some(c => c.id === challengeId)) return;
        if (activeTab === 'challenges') {
          loadChallengeCounts(challenges);
          setParticipantsByChallenge(prev => {
            if (!(challengeId in prev)) return prev;
            const n = { ...prev }; delete n[challengeId]; return n;
          });
          if (expandedChallenge === challengeId) {
            fetchChallengeParticipants(challengeId).then(p => setParticipantsByChallenge(prev => ({ ...prev, [challengeId]: p })));
          }
        }
        if (activeTab === 'members') loadMembersTab();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_challenge_members' }, (payload) => {
        const row = (payload.new ?? payload.old) as { challenge_id?: string } | null;
        const challengeId = row?.challenge_id;
        if (!challengeId || !challenges.some(c => c.id === challengeId)) return;
        if (activeTab === 'challenges') loadChallengeCounts(challenges);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_nudges', filter: `group_id=eq.${groupId}` }, async (payload) => {
        const row = payload.new as { id: string; to_user_id: string; from_user_id: string };
        if (row.to_user_id !== user?.id) return;
        if (currentMemberRef.current?.muted) return;
        const { data: profile } = await supabase.from('profiles').select('user_name').eq('id', row.from_user_id).single();
        showToast(`💪 ${profile?.user_name ?? 'Someone'} is cheering you on!`, 'success');
        markNudgeSeen(row.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, activeTab, challenges, expandedChallenge]);

  useEffect(() => {
    setMottoDismissed(sessionStorage.getItem(`motto_dismissed_${groupId}`) === '1');
  }, [groupId]);

  const handleSwitchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setFeedReactionPickerFor(null);
    setChatReactionPickerFor(null);
    setNudgePopupFor(null);
    setCheerPopupFor(null);
    if (tab !== 'chat') { setShowChatSearch(false); setChatSearchQuery(''); }
    if (tab === 'chat' && groupId) markGroupSeen(groupId);
  };

  // ── Feed render helpers ──
  const renderSkeletonCards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: colors.radius,
          padding: 12, opacity: 0.5,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted }} />
            <div style={{ width: 100, height: 10, borderRadius: 4, backgroundColor: colors.muted }} />
          </div>
          <div style={{ width: '70%', height: 10, borderRadius: 4, backgroundColor: colors.muted, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(j => <div key={j} style={{ width: 40, height: 20, borderRadius: 8, backgroundColor: colors.muted }} />)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFeedTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {weeklyDigest && (
        <div style={{
          backgroundColor: colors.primary + '08', borderLeft: `4px solid ${colors.primary}`,
          borderRadius: colors.radius, padding: 14,
        }}>
          <p style={{ ...font.label, fontSize: 13, color: colors.primary, margin: '0 0 6px' }}>📊 {weeklyDigest.weekLabel}</p>
          <p style={{ ...font.body, fontSize: 13, color: colors.foreground, margin: '0 0 4px' }}>Your group completed {weeklyDigest.totalCheckins} challenge check-ins together</p>
          <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: '0 0 2px' }}>👑 Top: {weeklyDigest.topPerformerName} — {weeklyDigest.topPerformerCount} check-ins</p>
          <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: '0 0 2px' }}>🔥 Most Active: {weeklyDigest.longestStreakName} · {weeklyDigest.longestStreak} check-ins</p>
          <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>🏃 Group streak: {weeklyDigest.groupStreakDays} days</p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ ...font.label, fontSize: 12, color: colors.mutedForeground, letterSpacing: 0.6, textTransform: 'uppercase', margin: 0 }}>Today's Pulse</p>
          <button onClick={handleManualRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <RefreshCw size={14} color={colors.mutedForeground} />
          </button>
        </div>
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingTop: 8, paddingBottom: 6 }}>
          {todaysPulse.map(m => (
            <div key={m.userId} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 52 }}>
              <button onClick={() => handlePulseAvatarClick(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <AvatarCircle
                  emoji={m.userEmoji} name={m.displayName} size={40}
                  ring={3} ringColor={m.completedToday ? colors.success : colors.border}
                  badge={
                    <>
                      {m.challengesDoneToday > 0 && (
                        <div style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.success, color: '#fff', borderRadius: 8, minWidth: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: `1.5px solid ${colors.background}` }}>
                          {m.challengesDoneToday}
                        </div>
                      )}
                      {nudgedMemberIds.has(m.userId) && (
                        <div style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#fff', borderRadius: 8, width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${colors.border}` }}>
                          💪
                        </div>
                      )}
                    </>
                  }
                />
              </button>
              <p style={{ ...font.body, fontSize: 10, color: colors.mutedForeground, margin: 0, maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName}</p>
            </div>
          ))}
        </div>
      </div>

      {loadingFeed ? renderSkeletonCards() : feedItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
          <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, margin: 0 }}>No activity yet — complete a habit and you'll show up here! 🌱</p>
        </div>
      ) : (
        <>
          {feedItems.map(entry => (
            <div key={entry.entryId} id={`feed-user-${entry.userId}`} style={{
              backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: colors.radius,
              padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AvatarCircle emoji={entry.userEmoji} name={entry.displayName} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...font.label, fontSize: 13, color: colors.foreground, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.displayName}</p>
                  <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: 0 }}>
                    {entry.done ? 'completed' : 'logged progress for'} today's check-in for {entry.challengeEmoji} {entry.challengeName}
                    {entry.actual && <span> — {entry.actual}</span>}
                    {!entry.done && <span style={{ color: colors.accent }}> (target not reached)</span>}
                    {entry.done && entry.streak > 1 && <span> · 🔥 {entry.streak} day streak</span>}
                  </p>
                </div>
                <p style={{ ...font.body, fontSize: 11, color: colors.mutedForeground, margin: 0, flexShrink: 0 }}>{formatRelativeTime(entry.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', position: 'relative', alignItems: 'center' }}>
                {FEED_REACTION_EMOJIS.map(emoji => {
                  const r = entry.reactions.find(x => x.emoji === emoji);
                  if (!r || r.count === 0) return null;
                  const scaling = scalingReaction?.entryId === entry.entryId && scalingReaction?.emoji === emoji;
                  return (
                    <button key={emoji} onClick={() => handleFeedReaction(entry, emoji)} style={{
                      ...font.body, fontSize: 12, padding: '4px 9px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${r.myReaction ? colors.primary : colors.border}`,
                      backgroundColor: r.myReaction ? colors.primary + '18' : 'transparent',
                      color: r.myReaction ? colors.primary : colors.mutedForeground,
                      transform: scaling ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.1s',
                    }}>
                      {emoji} {r.count}
                    </button>
                  );
                })}
                <button onClick={() => setFeedReactionPickerFor(prev => prev === entry.entryId ? null : entry.entryId)}
                  style={{ ...font.body, fontSize: 12, padding: '4px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${colors.border}`, backgroundColor: 'transparent', color: colors.mutedForeground }}>
                  +
                </button>
                {entry.reactions.some(r => r.count > 0) && (
                  <button onClick={async () => {
                    const rxns = await supabase.from('group_reactions').select('from_user_id').eq('entry_id', entry.entryId);
                    const uids = [...new Set((rxns.data ?? []).map((r: { from_user_id: string }) => r.from_user_id))];
                    if (uids.length === 0) return;
                    const profiles = await supabase.from('profiles').select('id, user_name').in('id', uids);
                    const names = (profiles.data ?? []).map((p: { user_name?: string }) => p.user_name || 'Member').join(', ');
                    showToast(`Reacted: ${names}`, 'info');
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', ...font.body, fontSize: 10, color: colors.mutedForeground, padding: '0 2px' }}>
                    👁
                  </button>
                )}
                {feedReactionPickerFor === entry.entryId && (
                  <div style={{ position: 'absolute', bottom: 32, left: 0, zIndex: 10, display: 'flex', gap: 4, backgroundColor: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {FEED_REACTION_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => { handleFeedReaction(entry, emoji); setFeedReactionPickerFor(null); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2 }}>{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {hasMoreFeed && (
            <button onClick={handleLoadMoreFeed} disabled={loadingMoreFeed} style={{
              ...font.label, fontSize: 13, color: colors.primary, backgroundColor: 'transparent',
              border: `1px solid ${colors.border}`, borderRadius: 10, padding: '10px 0',
              cursor: loadingMoreFeed ? 'default' : 'pointer',
              opacity: loadingMoreFeed ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {loadingMoreFeed && <span style={{ width: 13, height: 13, border: `2px solid ${colors.primary}40`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />}
              {loadingMoreFeed ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );

  if (loadingGroup) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, height: '100%' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${colors.primary}30`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!group) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, height: '100%', gap: 12 }}>
        <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground }}>Group not found.</p>
        <button onClick={() => navigate('/groups')} style={{ ...font.label, fontSize: 14, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}>Back to Groups</button>
      </div>
    );
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'challenges', label: 'Challenges' },
    { key: 'members', label: 'Members' },
    { key: 'chat', label: 'Chat' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '14px 24px' : '12px 16px', borderBottom: `1px solid ${colors.line}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} color={colors.foreground} />
        </button>
        <span style={{ fontSize: 28 }}>{group.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...font.heading, fontSize: 18, color: colors.foreground, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
          {group.description && (
            <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.description}</p>
          )}
        </div>
        <div style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, flexShrink: 0 }}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
        {currentMemberRole === 'admin' && (
          <button onClick={() => handleSwitchTab('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
            <SettingsIcon size={20} color={colors.mutedForeground} />
          </button>
        )}
      </div>

      {/* Motto banner */}
      {group.motto && !mottoDismissed && (
        <div style={{ backgroundColor: colors.primary + '08', borderBottom: `1px solid ${colors.line}`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <p style={{ ...font.body, fontSize: 13, fontStyle: 'italic', color: colors.mutedForeground, margin: 0, flex: 1 }}>
            "{group.motto}"{group.mottoAuthor && <span> — {group.mottoAuthor}</span>}
          </p>
          <button onClick={() => { sessionStorage.setItem(`motto_dismissed_${groupId}`, '1'); setMottoDismissed(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}>
            <X size={14} color={colors.mutedForeground} />
          </button>
        </div>
      )}

      {/* Tab pills */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${colors.line}`, overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => handleSwitchTab(t.key)} style={{
            ...font.label, fontSize: 13, padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', flexShrink: 0,
            backgroundColor: activeTab === t.key ? colors.primary + '18' : 'transparent',
            color: activeTab === t.key ? colors.primary : colors.mutedForeground,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '16px 24px' : '14px 16px' }}>
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {renderSharedGroupModals()}

      {/* Challenges modals */}
      <CreateChallengeModal
        visible={showCreateChallenge}
        editing={editingChallenge}
        onClose={() => { setShowCreateChallenge(false); setEditingChallenge(null); }}
        onSaved={(ch, isNew) => {
          if (isNew) {
            setChallenges(prev => [ch, ...prev]);
            setMyJoinedChallengeIds(prev => new Set(prev).add(ch.id));
          } else {
            setChallenges(prev => prev.map(c => c.id === ch.id ? ch : c));
            setParticipantsByChallenge(prev => { const n = { ...prev }; delete n[ch.id]; return n; });
          }
          setShowCreateChallenge(false);
          setEditingChallenge(null);
        }}
        groupColor={group.color}
        groupId={group.id}
      />

      <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />
      <Modal visible={!!celebratingChallenge} onClose={() => setCelebratingChallenge(null)}>
        {celebratingChallenge && celebrationStats && (
          <div style={{ padding: '28px 22px', textAlign: 'center' }}>
            <p style={{ fontSize: 44, margin: '0 0 8px' }}>🏆</p>
            <p style={{ ...font.heading, fontSize: 20, color: colors.foreground, margin: '0 0 4px' }}>Challenge Complete!</p>
            <p style={{ ...font.body, fontSize: 14, color: colors.mutedForeground, margin: '0 0 14px' }}>{celebratingChallenge.name}</p>
            <p style={{ ...font.body, fontSize: 14, color: colors.foreground, margin: '0 0 6px' }}>Together: {celebrationStats.rate}% completion</p>
            <p style={{ ...font.body, fontSize: 14, color: colors.foreground, margin: '0 0 20px' }}>👑 {celebrationStats.topName} — {celebrationStats.topRate}%</p>
            <button onClick={() => setCelebratingChallenge(null)} style={{ ...font.label, fontSize: 15, fontWeight: 700, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', width: '100%', cursor: 'pointer' }}>Awesome!</button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        visible={leaveChallengeStep === 'confirm'}
        icon="🚪"
        title={`Leave ${leavingChallenge?.name ?? 'challenge'}?`}
        message="Your progress will be removed from the leaderboard."
        confirmLabel="Leave"
        destructive
        onConfirm={handleLeaveChallengeConfirm}
        onCancel={() => { setLeavingChallenge(null); setLeaveChallengeStep(null); }}
      />
      <ConfirmDialog
        visible={showTrophyDeleteConfirm}
        icon="🗑️"
        title={`Delete "${challenges.find(c => c.id === deletingChallengeId)?.name ?? ''}"?`}
        message="This removes the challenge and all participant history from the Trophy Room."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteChallengeConfirm}
        onCancel={() => { setShowTrophyDeleteConfirm(false); setDeletingChallengeId(null); }}
      />
      <ConfirmDialog
        visible={!!nudgePopupFor}
        icon="💪"
        title={`Nudge ${todaysPulse.find(m => m.userId === nudgePopupFor)?.displayName ?? 'them'}?`}
        message="They'll get a friendly reminder that you're cheering them on."
        confirmLabel={sendingNudge ? 'Sending…' : 'Send Nudge'}
        cancelLabel="Cancel"
        disabled={sendingNudge}
        onConfirm={() => nudgePopupFor && handleNudge(nudgePopupFor)}
        onCancel={() => setNudgePopupFor(null)}
      />
      <ConfirmDialog
        visible={!!cheerPopupFor}
        icon="🔥"
        title={`Cheer for ${todaysPulse.find(m => m.userId === cheerPopupFor)?.displayName ?? 'them'}?`}
        message="They've already completed today — send them a 🔥 to show your appreciation!"
        confirmLabel={sendingCheer ? 'Sending…' : 'Send Cheer 🔥'}
        cancelLabel="Cancel"
        disabled={sendingCheer}
        onConfirm={() => cheerPopupFor && handleCheer(cheerPopupFor)}
        onCancel={() => setCheerPopupFor(null)}
      />

      <Modal visible={!!loggingChallenge} onClose={() => setLoggingChallenge(null)}>
        {loggingChallenge && (
          <div style={{ padding: '24px 20px 28px' }}>
            <p style={{ fontSize: 36, margin: '0 0 8px', textAlign: 'center' }}>{loggingChallenge.emoji}</p>
            <p style={{ ...font.heading, fontSize: 17, color: colors.foreground, margin: '0 0 6px', textAlign: 'center' }}>{loggingChallenge.name}</p>
            {loggingChallenge.target && (
              <p style={{ ...font.body, fontSize: 12, color: colors.mutedForeground, margin: '0 0 16px', textAlign: 'center' }}>Target: {loggingChallenge.target}</p>
            )}
            <ChallengeLogInput
              habitType={loggingChallenge.habitType} value={loggingValue} onChange={setLoggingValue}
              onSubmit={handleSaveLoggedValue} colors={colors} font={font} placeholder={loggingChallenge.target}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <button
                onClick={handleSaveLoggedValue} disabled={!loggingValue.trim() || savingLog}
                style={{
                  ...font.label, fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 11, padding: '12px 0',
                  backgroundColor: loggingValue.trim() ? colors.primary : colors.muted,
                  color: loggingValue.trim() ? '#fff' : colors.mutedForeground,
                  cursor: loggingValue.trim() && !savingLog ? 'pointer' : 'default',
                }}
              >
                {savingLog ? 'Saving…' : 'Save'}
              </button>
              {myCheckinsToday.has(loggingChallenge.id) && (
                <button
                  onClick={handleClearLoggedValue} disabled={savingLog}
                  style={{ ...font.body, fontSize: 13, color: colors.destructive, backgroundColor: 'transparent', border: `1px solid ${colors.destructive}`, borderRadius: 11, padding: '11px 0', cursor: 'pointer' }}
                >
                  Clear today's check-in
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
