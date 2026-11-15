import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-in" role="dialog" aria-modal="true">{children}</div>
    </div>,
    document.body
  );
}
