import { useState, useEffect, useRef } from 'react';

function draftKey(boardId, taskId) {
  return `collabboard_draft_${boardId}_${taskId || 'new'}`;
}

export default function TaskModal({ boardId, initialTask, members, defaultStatus, onSave, onClose }) {
  const isEditing = !!initialTask;
  const key = draftKey(boardId, initialTask?.id);
  const hasCheckedDraft = useRef(false);

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [assignee, setAssignee] = useState(initialTask?.assignee || '');
  const [error, setError] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    if (hasCheckedDraft.current) return;
    hasCheckedDraft.current = true;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setPriority(draft.priority || 'medium');
        setDueDate(draft.dueDate || '');
        setAssignee(draft.assignee || '');
        setDraftRestored(true);
      } catch {
        localStorage.removeItem(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isBlank = !title && !description && !dueDate && !assignee && priority === 'medium';
    if (isBlank) return;
    const draft = { title, description, priority, dueDate, assignee };
    localStorage.setItem(key, JSON.stringify(draft));
  }, [title, description, priority, dueDate, assignee, key]);

  const clearDraft = () => localStorage.removeItem(key);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    clearDraft();
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      assignee,
      status: initialTask?.status || defaultStatus || 'todo',
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
    setPriority(initialTask?.priority || 'medium');
    setDueDate(initialTask?.dueDate || '');
    setAssignee(initialTask?.assignee || '');
    setDraftRestored(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {draftRestored && (
          <div className="draft-banner">
            <span>We restored your unsaved draft.</span>
            <button type="button" onClick={handleDiscardDraft}>Discard</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design the login page"
                className="modal-input"
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more detail (optional)"
                className="modal-input modal-textarea"
                rows={3}
              />
            </div>

            <div className="input-group">
              <label>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="modal-input"
              />
            </div>

            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}