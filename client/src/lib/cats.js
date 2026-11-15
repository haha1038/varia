import { PiTShirt, PiHandbag, PiSneaker, PiPencilSimple, PiCoffee, PiHeadphones, PiBookOpenText, PiFlowerTulip, PiPackage } from 'react-icons/pi';

export const CATS = [
  { key: '옷', Icon: PiTShirt },
  { key: '가방', Icon: PiHandbag },
  { key: '신발', Icon: PiSneaker },
  { key: '문구', Icon: PiPencilSimple },
  { key: '주방', Icon: PiCoffee },
  { key: '전자기기', Icon: PiHeadphones },
  { key: '책', Icon: PiBookOpenText },
  { key: '소품', Icon: PiFlowerTulip },
  { key: '기타', Icon: PiPackage },
];

export const iconOf = (key) => (CATS.find((c) => c.key === key) || CATS[CATS.length - 1]).Icon;
