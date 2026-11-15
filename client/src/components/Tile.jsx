import { createElement } from 'react';
import { inkOn } from '../lib/colors';
import { iconOf } from '../lib/cats';

export default function Tile({ p, size = 44, className = '', style }) {
  return (
    <div className={`tile ${className}`} style={{ '--h': p.hex, color: inkOn(p.hex), ...style }}>
      {p.image_url ? <img src={p.image_url} alt="" draggable="false" loading="lazy" /> : createElement(iconOf(p.category), { size })}
    </div>
  );
}
