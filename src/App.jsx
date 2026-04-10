import { useState } from 'react';
import { TodoCard } from './components/TodoCard';
import './App.css';

/* ── Logo mark SVG ── */
function CheckSquareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

/* ── Sample data ── */
const INITIAL_TODOS = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for all new API endpoints and update the README with clear examples and usage guidelines for onboarding.',
    priority: 'high',
    dueDate: new Date(2026, 2, 1, 18, 0, 0),
    status: 'in-progress',
    tags: ['work', 'urgent', 'design'],
  },
  {
    id: '2',
    title: 'Review open pull requests',
    description: 'Go through all pending PRs from the team. Leave meaningful code review comments and approve the ones that meet the quality bar.',
    priority: 'medium',
    dueDate: new Date(2026, 3, 15, 17, 0, 0),
    status: 'pending',
    tags: ['work', 'review'],
  },
  {
    id: '3',
    title: 'Fix authentication session bug',
    description: 'Users cannot properly log out — sessions persist past logout. Reproduce in staging, isolate the token lifecycle issue, and patch.',
    priority: 'high',
    dueDate: new Date(2026, 2, 5, 12, 0, 0),
    status: 'in-progress',
    tags: ['urgent', 'bug'],
  },
  {
    id: '4',
    title: 'Refactor data-fetching layer',
    description: 'Extract duplicated fetch logic into shared hooks. Add proper error boundaries, loading states, and caching with TanStack Query.',
    priority: 'low',
    dueDate: new Date(2026, 4, 1, 10, 0, 0),
    status: 'pending',
    tags: ['work', 'refactor'],
  },
];

/* ── App ── */
export default function App() {
  const [todos, setTodos] = useState(INITIAL_TODOS);

  const handleEdit   = (id) => { console.log('Edit:', id); alert(`Edit task ${id}`); };
  const handleDelete = (id) => { setTodos((prev) => prev.filter((t) => t.id !== id)); };
  const handleToggle = (id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' ? (t.priority === 'high' ? 'in-progress' : 'pending') : 'done' }
          : t
      )
    );
  };

  /* Stats */
  const total    = todos.length;
  const pending  = todos.filter((t) => t.status === 'pending').length;
  const inProg   = todos.filter((t) => t.status === 'in-progress').length;
  const done     = todos.filter((t) => t.status === 'done').length;

  return (
    <div className="app-wrapper">

      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="header-inner">

          {/* Logo */}
          <div className="header-logo" aria-label="TaskFlow app">
            <div className="logo-mark" aria-hidden="true">
              <CheckSquareIcon />
            </div>
            <span className="logo-text">Task<span>Flow</span></span>
          </div>

          <h1 className="app-title">Your Tasks, Organised</h1>
          <p className="app-subtitle">
            Track priorities, deadlines and progress — all in one place.
          </p>

          {/* Stats pills */}
          <div className="stats-bar" role="group" aria-label="Task statistics">
            <div className="stat-pill stat-pill-total" aria-label={`${total} total tasks`}>
              <span className="stat-dot dot-total" aria-hidden="true" />
              {total} Total
            </div>
            <div className="stat-pill stat-pill-pending" aria-label={`${pending} pending`}>
              <span className="stat-dot dot-pending" aria-hidden="true" />
              {pending} Pending
            </div>
            <div className="stat-pill stat-pill-progress" aria-label={`${inProg} in progress`}>
              <span className="stat-dot dot-progress" aria-hidden="true" />
              {inProg} In Progress
            </div>
            <div className="stat-pill stat-pill-done" aria-label={`${done} done`}>
              <span className="stat-dot dot-done" aria-hidden="true" />
              {done} Done
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main" id="main-content">
        <p className="section-label" aria-hidden="true">Tasks</p>

        {todos.length === 0 ? (
          <div className="empty-state" role="status">
            <p>🎉 All tasks completed!</p>
            <p>Nothing left to do. Great work.</p>
          </div>
        ) : (
          <div className="cards-grid" role="list" aria-label="Todo tasks">
            {todos.map((todo) => (
              <div key={todo.id} role="listitem">
                <TodoCard
                  {...todo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusToggle={handleToggle}
                />
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
