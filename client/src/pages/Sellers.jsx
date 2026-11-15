import { useEffect, useState } from 'react';
import { useTitle } from '../lib/title';
import api from '../lib/api';
import { won, ago, ymd, hueOf } from '../lib/format';

export default function Sellers() {
  useTitle('판매자');
  const [list, setList] = useState(null);

  useEffect(() => { api.get('/sellers').then(({ data }) => setList(data)).catch(() => setList([])); }, []);

  return (
    <main className="page sellers">
      <h1 className="big">판매자</h1>
      <div className="sl">
        {list?.map((s, i) => (
          <div className="sl-i" key={s.id} style={{ '--k': Math.min(i, 12) }}>
            <div className="sl-h">
              <b className="av lg" style={{ '--av': hueOf(s.nickname) }}>{s.nickname.slice(0, 1)}</b>
              <div className="sl-who">
                <strong>{s.nickname}</strong>
                <span>{ymd(s.joined_at)} 가입</span>
              </div>
              <div className="sl-bar">
                {s.hexes.map((h, j) => <i key={j} style={{ background: h }} />)}
              </div>
              <dl className="sl-num">
                <div><dt>상품</dt><dd>{s.product_count}</dd></div>
                <div><dt>합계</dt><dd>{won(s.total_price)}</dd></div>
                <div><dt>최근</dt><dd>{ago(s.last_posted)}</dd></div>
              </dl>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
