export const colors = {
  bg: '#EEF2F1',
  card: '#FFFFFF',
  ink: '#13233A',
  muted: '#5B6B7E',
  line: '#D3DBDA',
  brand: '#0E6E73',
  brandSoft: '#DCEFEF',
  low: '#2BA67A',
  mid: '#E3A23B',
  high: '#D8463B',
  me: '#2F6FEB',
};

export const LEVEL_LABEL = { low: 'خفيف', mid: 'متوسط', high: 'زحمة' };

export const levelOf = (count, capacity) => {
  const v = count / capacity;
  return v < 0.55 ? 'low' : v < 0.8 ? 'mid' : 'high';
};

export const pctOf = (count, capacity) => Math.min(100, Math.round((count / capacity) * 100));

export const levelOfPct = (pct) => (pct < 55 ? 'low' : pct < 80 ? 'mid' : 'high');

export const rtl = { textAlign: 'right', writingDirection: 'rtl' };

export const shadow = {
  shadowColor: '#13233A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const formatHour = (h) => {
  const suffix = h < 12 ? 'ص' : 'م';
  const hh = h > 12 ? h - 12 : h;
  return `${hh}:00 ${suffix}`;
};
