import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from './api';

const Ctx = createContext(null);

export function ProductsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [focus, setFocusNow] = useState(null);
  const timer = useRef(0);
  const setFocus = useCallback((c) => {
    clearTimeout(timer.current);
    if (c) setFocusNow(c);
    else timer.current = setTimeout(() => setFocusNow(null), 80);
  }, []);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    api.get('/products').then(({ data }) => setItems(data)).catch(() => setItems([])).finally(() => setLoaded(true));
  }, []);

  return <Ctx.Provider value={{ items, loaded, reload, focus, setFocus }}>{children}</Ctx.Provider>;
}

export const useProducts = () => useContext(Ctx);
