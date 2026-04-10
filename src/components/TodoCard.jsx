import { useState, useEffect, useCallback } from 'react';
import '../styles/TodoCard.css';

/* ── Helpers ─────────────────────────────────────────── */

function getTimeRemaining(date) {
  const diffMs   = date.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60_000);

  if (diffMins <= -1440) {
    const d = Math.abs(Math.floor(diffMins / 1440));
    return { text: `Overdue by ${d} day${d !== 1 ? 's' : ''}`, urgency: 'overdue' };
  }
  if (diffMins < -60) {
    const h = Math.abs(Math.floor(diffMins / 60));
    return { text: `Overdue by ${h} hour${h !== 1 ? 's' : ''}`, urgency: 'overdue' };
  }
  if (diffMins < 0) {
    const m = Math.abs(diffMins);
    return { text: `Overdue by ${m} min${m !== 1 ? 's' : ''}`, urgency: 'overdue' };
  }
  if (diffMins === 0) return { text: 'Due now!', urgency: 'critical' };
  if (diffMins < 360)  return { text: `Due in ${diffMins} min${diffMins !== 1 ? 's' : ''}`,         urgency: 'critical' };
  if (diffMins < 1440) {
    const h = Math.ceil(diffMins / 60);
    return { text: `Due in ${h} hour${h !== 1 ? 's' : ''}`, urgency: 'soon' };
  }
  if (diffMins < 2880) return { text: 'Due tomorrow',   urgency: 'soon' };
  const d = Math.ceil(diffMins / 1440);
  return { text: `Due in ${d} day${d !== 1 ? 's' : ''}`, urgency: 'future' };
}

function formatDueDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Icons (inline SVG) ──────────────────────────────── */

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Priority & Status config ────────────────────────── */

const PRIORITY_CONFIG = {
  high:   { label: 'High',   dotClass: 'dot-high',   badgeClass: 'badge-priority-high',   accentClass: 'accent-high'   },
  medium: { label: 'Medium', dotClass: 'dot-medium', badgeClass: 'badge-priority-medium', accentClass: 'accent-medium' },
  low:    { label: 'Low',    dotClass: 'dot-low',    badgeClass: 'badge-priority-low',    accentClass: 'accent-low'    },
};

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badgeClass: 'badge-status-pending'     },
  'in-progress': { label: 'In Progress', badgeClass: 'badge-status-inprogress'  },
  done:        { label: 'Done',        badgeClass: 'badge-status-done'        },
};

const URGENCY_CLASS = {
  overdue:  'time-overdue',
  critical: 'time-critical',
  soon:     'time-soon',
  future:   'time-future',
};

/* ── Component ───────────────────────────────────────── */

export function TodoCard({
  id          = '1',
  title       = 'Complete project documentation',
  description = 'Write comprehensive documentation for the new API endpoints and update the README file with clear examples and usage guidelines.',
  priority    = 'high',
  dueDate     = new Date(2026, 2, 1, 18, 0, 0),
  status      = 'in-progress',
  tags        = ['work', 'urgent', 'design'],
  onEdit      = () => console.log('Edit clicked'),
  onDelete    = () => console.log('Delete clicked'),
  onStatusToggle = () => {},
}) {
  const [isCompleted,    setIsCompleted]    = useState(status === 'done');
  const [currentStatus,  setCurrentStatus]  = useState(status);
  const [timeData,       setTimeData]       = useState(() => getTimeRemaining(dueDate));

  // Refresh time remaining every 60 s
  const refreshTime = useCallback(() => setTimeData(getTimeRemaining(dueDate)), [dueDate]);

  useEffect(() => {
    refreshTime();
    const id = setInterval(refreshTime, 60_000);
    return () => clearInterval(id);
  }, [refreshTime]);

  const handleToggle = () => {
    const next = !isCompleted;
    setIsCompleted(next);
    setCurrentStatus(next ? 'done' : status === 'done' ? 'pending' : status);
    onStatusToggle(id);
  };

  const pCfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  const sCfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.pending;

  return (
    <article
      className={`todo-card ${isCompleted ? 'is-completed' : ''} ${pCfg.accentClass}`}
      data-testid="test-todo-card"
      aria-label={`Task: ${title}`}
    >

      {/* ── Top bar: checkbox + title + actions ── */}
      <div className="card-header">

        {/* Custom checkbox */}
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            id={`toggle-${id}`}
            className="todo-complete-toggle sr-only"
            data-testid="test-todo-complete-toggle"
            checked={isCompleted}
            onChange={handleToggle}
            aria-label={`Mark "${title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          />
          <label htmlFor={`toggle-${id}`} className="checkbox-visual" aria-hidden="true">
            <svg className="check-icon" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
        </div>

        <h2
          className="todo-title"
          data-testid="test-todo-title"
        >
          {title}
        </h2>

        {/* Action buttons — always present, visually revealed on hover */}
        <div className="card-actions" role="group" aria-label="Task actions">
          <button
            className="action-btn edit-btn"
            data-testid="test-todo-edit-button"
            onClick={() => onEdit(id)}
            aria-label={`Edit task: ${title}`}
            title="Edit"
          >
            <IconEdit />
          </button>
          <button
            className="action-btn delete-btn"
            data-testid="test-todo-delete-button"
            onClick={() => onDelete(id)}
            aria-label={`Delete task: ${title}`}
            title="Delete"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      <p className="todo-description" data-testid="test-todo-description">
        {description}
      </p>

      {/* ── Badges row ── */}
      <div className="badges-row">
        <span
          className={`badge priority-badge ${pCfg.badgeClass}`}
          data-testid="test-todo-priority"
          aria-label={`Priority: ${pCfg.label}`}
        >
          <span className={`priority-dot ${pCfg.dotClass}`} aria-hidden="true" />
          {pCfg.label}
        </span>

        <span
          className={`badge status-badge ${sCfg.badgeClass}`}
          data-testid="test-todo-status"
          aria-label={`Status: ${sCfg.label}`}
        >
          {sCfg.label}
        </span>
      </div>

      {/* ── Dates row ── */}
      <div className="dates-row">
        <time
          className="meta-chip"
          data-testid="test-todo-due-date"
          dateTime={dueDate.toISOString()}
        >
          <IconCalendar />
          {formatDueDate(dueDate)}
        </time>

        <span
          className={`meta-chip time-chip ${URGENCY_CLASS[timeData.urgency]}`}
          data-testid="test-todo-time-remaining"
          aria-live="polite"
          aria-atomic="true"
        >
          <IconClock />
          {timeData.text}
        </span>
      </div>

      {/* ── Tags ── */}
      <div className="tags-section">
        <ul
          className="tags-list"
          data-testid="test-todo-tags"
          role="list"
          aria-label="Task tags"
        >
          {tags.map((tag) => (
            <li key={tag}>
              <span
                className="tag-chip"
                data-testid={`test-todo-tag-${tag}`}
              >
                #{tag}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </article>
  );
}
