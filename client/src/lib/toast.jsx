import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const timer = useRef(0);
  const show = useCallback((msg, kind = 'ok') => {
    clearTimeout(timer.current);
    setT({ msg, kind, k: Date.now() });
    timer.current = setTimeout(() => setT(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={`toast ${t ? 'on' : ''} ${t?.kind === 'err' ? 'err' : ''}`} role="status" aria-live="polite">
        <i />
        {t?.msg}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
