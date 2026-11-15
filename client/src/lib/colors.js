export const FAMILIES = [
  { key: 'red', label: '빨강', hex: '#E5383B' },
  { key: 'orange', label: '주황', hex: '#FF7A21' },
  { key: 'yellow', label: '노랑', hex: '#FFC83A' },
  { key: 'green', label: '초록', hex: '#22B072' },
  { key: 'sky', label: '하늘', hex: '#4CC8F2' },
  { key: 'blue', label: '파랑', hex: '#2F55EE' },
  { key: 'purple', label: '보라', hex: '#8A47F2' },
  { key: 'pink', label: '분홍', hex: '#FF7DBE' },
  { key: 'black', label: '검정', hex: '#1D1D20' },
  { key: 'white', label: '하양', hex: '#F2F0EA' },
];

export const familyOf = (key) => FAMILIES.find((f) => f.key === key);

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t));

export const shadesOf = (key) => {
  if (key === 'white') return ['#FFFFFF', '#F7F4EC', '#ECE8DE', '#DCD7CB', '#C9C3B5'];
  if (key === 'black') return ['#4A4A50', '#333338', '#1D1D20', '#111113', '#000000'];
  const base = familyOf(key).hex;
  return [mix(base, '#FFFFFF', 0.45), mix(base, '#FFFFFF', 0.22), base, mix(base, '#000000', 0.18), mix(base, '#000000', 0.36)];
};

export const inkOn = (hex) => {
  const [r, g, b] = toRgb(hex || '#888888').map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.36 ? '#18181B' : '#FFFFFF';
};
