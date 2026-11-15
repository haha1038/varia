export const won = (n) => `${Number(n || 0).toLocaleString('ko-KR')}원`;

export const ago = (d) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return '방금';
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}일 전`;
  return new Date(d).toLocaleDateString('ko-KR');
};

export const ymd = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

export const hueOf = (s = '') => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export const phoneFormat = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
};
