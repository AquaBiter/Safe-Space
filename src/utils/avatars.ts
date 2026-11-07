// Generates consistent, gentle color pairings and initials for anonymous handles
const AVATAR_PALETTES = [
  { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { bg: 'bg-teal-100 text-teal-800 border-teal-200' },
  { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { bg: 'bg-sky-100 text-sky-800 border-sky-200' },
  { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { bg: 'bg-violet-100 text-violet-800 border-violet-200' },
  { bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  { bg: 'bg-amber-100 text-amber-800 border-amber-200' },
];

export function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getInitials(name: string): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const ANONYMOUS_PSEUDONYMS = [
  'QuietSeeker',
  'GentleVoyager',
  'BraveSunflower',
  'HealingHeart',
  'SilentRiver',
  'StrivingSoul',
  'PeacefulPonderer',
  'SolitaryStar',
  'KindObserver',
  'ResilientSpirit',
  'MorningDew',
  'CloudWatcher',
  'HumbleScholar',
  'WanderingThought',
  'SerenePathfinder',
];

export function getRandomPseudonym(): string {
  const index = Math.floor(Math.random() * ANONYMOUS_PSEUDONYMS.length);
  return ANONYMOUS_PSEUDONYMS[index];
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
