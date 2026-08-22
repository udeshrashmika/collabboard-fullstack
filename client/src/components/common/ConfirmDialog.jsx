import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="dialog-overlay" onMouseDown={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="dialog-title" className="dialog-title">{title}</h3>
        {message && <p className="dialog-message">{message}</p>}

        <div className="dialog-actions">
          <button type="button" className="dialog-btn ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className="dialog-btn danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}