import { useState } from 'react';

const COLORS = [
  { key: 'accent', var: 'var(--accent)' },
  { key: 'coral', var: 'var(--cursor-coral)' },
  { key: 'teal', var: 'var(--cursor-teal)' },
  { key: 'amber', var: 'var(--cursor-amber)' },
];

export default function BoardModal({ initialBoard, onSave, onClose }) {
  const isEditing = !!initialBoard;

  const [name, setName] = useState(initialBoard?.name || '');
  const [description, setDescription] = useState(initialBoard?.description || '');
  const [color, setColor] = useState(initialBoard?.color || 'accent');
  const [dueDate, setDueDate] = useState(initialBoard?.dueDate || '');
  const [members, setMembers] = useState(initialBoard?.members || []);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');

  const handleAddMember = () => {
    const email = memberEmail.trim();
    if (!email) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setError('That person is already on this board.');
      return;
    }
    setMembers((prev) => [...prev, { id: crypto.randomUUID(), email }]);
    setMemberEmail('');
    setError('');
  };

  const handleRemoveMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Board name is required.');
      return;
    }
    onSave({ name: name.trim(), description: description.trim(), color, dueDate, members });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit board' : 'Create a new board'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label>Board name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CS402 Final Project"
                className="modal-input"
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this board for?"
                className="modal-input modal-textarea"
                rows={3}
              />
            </div>

            <div className="input-group">
              <label>Due date <span className="label-optional">(optional)</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="input-group">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.key}
                    className={`color-swatch${color === c.key ? ' selected' : ''}`}
                    style={{ backgroundColor: c.var }}
                    onClick={() => setColor(c.key)}
                    aria-label={c.key}
                  />
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Members</label>
              <div className="member-input-row">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder="name@university.edu"
                  className="modal-input"
                />
                <button type="button" className="btn btn-ghost" onClick={handleAddMember}>
                  Add
                </button>
              </div>

              {members.length > 0 && (
                <div className="member-chip-list">
                  {members.map((m) => (
                    <span key={m.id} className="member-chip">
                      {m.email}
                      <button type="button" onClick={() => handleRemoveMember(m.id)} aria-label={`Remove ${m.email}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save changes' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
