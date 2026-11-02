import { ChannelItem, Employee } from './types';

export const PALETTES: [string, string, string][] = [
  ['#5A7E10', '#2F4208', '#FFEFA6'],
  ['#FFCE07', '#B88A00', '#27380A'],
  ['#7A9B1E', '#34490B', '#FFF6CC'],
  ['#E5B800', '#6B7F12', '#27380A'],
  ['#46630D', '#1D2C05', '#FFEFA6'],
  ['#9BB52E', '#4A6410', '#1B2808']
];

export function getPalette(id: string): [string, string, string] {
  const sum = [...String(id)].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length];
}

export function getInitials(name: string): string {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => [...w][0])
    .join('')
    .toUpperCase();
}

export function getAvatarStyle(employee: Employee | { id: string; name: string; photo?: string }) {
  if (employee.photo) {
    return {
      backgroundImage: `url('${employee.photo}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  const [c1, c2, c3] = getPalette(employee.id);
  return {
    backgroundImage: `linear-gradient(145deg, ${c1}, ${c2})`,
    color: c3
  };
}

export interface ChannelMeta {
  name: string;
  bg: string;
  cta: string;
}

export const CHANNELS: Record<string, ChannelMeta> = {
  whatsapp: { name: 'WhatsApp', bg: '#1FAF54', cta: 'Chat' },
  email: { name: 'Gmail', bg: '#D93025', cta: 'Write' },
  linkedin: { name: 'LinkedIn', bg: '#0A66C2', cta: 'View profile' },
  facebook: { name: 'Facebook', bg: '#1877F2', cta: 'Open' },
  telegram: { name: 'Telegram', bg: '#229ED9', cta: 'Message' },
  instagram: { name: 'Instagram', bg: '#C13584', cta: 'Open' },
  phone: { name: 'Phone', bg: '#5A7E10', cta: 'Call' },
  website: { name: 'Website', bg: '#27380A', cta: 'Visit' },
  address: { name: 'Address', bg: '#B88A00', cta: '' },
  hours: { name: 'Hours', bg: '#6B7F12', cta: '' },
  other: { name: 'Link', bg: '#46630D', cta: 'Open' }
};

const CH_ALIAS: [string, RegExp][] = [
  ['whatsapp', /whats|^wa$/i],
  ['email', /mail|gmail/i],
  ['linkedin', /linked/i],
  ['facebook', /facebook|^fb$/i],
  ['telegram', /telegram/i],
  ['instagram', /insta/i],
  ['phone', /phone|mobile|call|tel/i],
  ['website', /web|site|url/i],
  ['address', /address|office|location/i],
  ['hours', /hour|time|open/i]
];

export function detectChannelType(item: ChannelItem): string {
  if (item.type && CHANNELS[item.type]) return item.type;
  const label = String(item.label || '').toLowerCase();
  const found = CH_ALIAS.find(([, regex]) => regex.test(label));
  return found ? found[0] : 'other';
}

export function getChannelHref(item: ChannelItem, detectedType: string): string {
  const val = String(item.value || '').trim();
  if (!val) return '';

  const formatUrl = (host: string, prefix: string) => {
    if (/^https?:\/\//i.test(val)) return val;
    if (val.toLowerCase().includes(host)) return 'https://' + val.replace(/^\/\//, '');
    return prefix + val.replace(/^@/, '');
  };

  switch (detectedType) {
    case 'whatsapp': {
      let digits = val.replace(/\D/g, '');
      if (/^0\d{10}$/.test(digits)) digits = '88' + digits;
      return digits ? `https://wa.me/${digits}` : '';
    }
    case 'email':
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(val)}`;
    case 'linkedin':
      return formatUrl('linkedin.com', 'https://www.linkedin.com/in/');
    case 'facebook':
      return formatUrl('facebook.com', 'https://www.facebook.com/');
    case 'telegram':
      return formatUrl('t.me', 'https://t.me/');
    case 'instagram':
      return formatUrl('instagram.com', 'https://www.instagram.com/');
    case 'website':
    case 'other':
      return /^https?:\/\//i.test(val) ? val : (/\.[a-z]{2,}/i.test(val) ? `https://${val}` : '');
    case 'phone':
      return `tel:${val.replace(/[^\d+]/g, '')}`;
    default:
      return '';
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export function generateUid(): string {
  return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csvContent = '\uFEFF' + [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
