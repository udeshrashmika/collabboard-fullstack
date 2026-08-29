import { useEffect, useRef, useState } from 'react';

function draftKey(boardId, taskId) {
  return `collabboard_draft_${boardId}_${taskId || 'new'}`;
}

export default function TaskModal({
  boardId,
  initialTask,
  members = [],
  defaultStatus,
  onSave,
  onClose,
}) {
  const isEditing = !!initialTask;
  const key = draftKey(boardId, initialTask?.id);
  const hasCheckedDraft = useRef(false);

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(
    initialTask?.description || ''
  );
  const [priority, setPriority] = useState(
    initialTask?.priority || 'medium'
  );
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate
      ? initialTask.dueDate.slice(0, 10)
      : ''
  );
  const [assignee, setAssignee] = useState(
    initialTask?.assignee || ''
  );

  const [error, setError] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasCheckedDraft.current) {
      return;
    }

    hasCheckedDraft.current = true;

    const saved = localStorage.getItem(key);

    if (!saved) {
      return;
    }

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
  }, [key]);

  useEffect(() => {
    const isBlank =
      !title.trim() &&
      !description.trim() &&
      !dueDate &&
      !assignee &&
      priority === 'medium';

    if (isBlank) {
      return;
    }

    const draft = {
      title,
      description,
      priority,
      dueDate,
      assignee,
    };

    localStorage.setItem(
      key,
      JSON.stringify(draft)
    );
  }, [
    title,
    description,
    priority,
    dueDate,
    assignee,
    key,
  ]);

  const clearDraft = () => {
    localStorage.removeItem(key);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (
      !['low', 'medium', 'high'].includes(priority)
    ) {
      setError('Please select a valid priority.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        assignee: assignee || null,

        // Kept for compatibility with the Kanban UI.
        // The actual backend position is controlled by columnId.
        status:
          initialTask?.status ||
          defaultStatus ||
          'todo',
      });

      clearDraft();
    } catch (err) {
      console.error('Task save failed:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to save task.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    onClose();
  };

  const handleDiscardDraft = () => {
    clearDraft();

    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
    setPriority(initialTask?.priority || 'medium');

    setDueDate(
      initialTask?.dueDate
        ? initialTask.dueDate.slice(0, 10)
        : ''
    );

    setAssignee(initialTask?.assignee || '');

    setDraftRestored(false);
    setError('');
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
    >
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {isEditing ? 'Edit task' : 'New task'}
          </h2>

          <button
            type="button"
            className="icon-btn"
            aria-label="Close"
            onClick={handleClose}
            disabled={submitting}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {draftRestored && (
          <div className="draft-banner">
            <span>
              We restored your unsaved draft.
            </span>

            <button
              type="button"
              onClick={handleDiscardDraft}
              disabled={submitting}
            >
              Discard
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            <div className="input-group">
              <label htmlFor="task-title">
                Title
              </label>

              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Design the login page"
                className="modal-input"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div className="input-group">
              <label htmlFor="task-description">
                Description
              </label>

              <textarea
                id="task-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add more detail (optional)"
                className="modal-input modal-textarea"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="input-group">
              <label htmlFor="task-priority">
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                className="modal-input"
                disabled={submitting}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="task-due-date">
                Due date
              </label>

              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="modal-input"
                disabled={submitting}
              />
            </div>

            {members.length > 0 && (
              <div className="input-group">
                <label htmlFor="task-assignee">
                  Assignee
                </label>

                <select
                  id="task-assignee"
                  value={assignee}
                  onChange={(event) =>
                    setAssignee(event.target.value)
                  }
                  className="modal-input"
                  disabled={submitting}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members.map((member) => {
                    const memberId =
                      member._id ||
                      member.id ||
                      member.value;

                    const memberLabel =
                      member.name ||
                      member.email ||
                      member.label ||
                      memberId;

                    if (!memberId) {
                      return null;
                    }

                    return (
                      <option
                        key={memberId}
                        value={memberId}
                      >
                        {memberLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {error && (
              <p className="field-error">
                {error}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}