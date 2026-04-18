
const PRIORITY_THEMES = {
  high:   { label: 'High',   class: 'accent-high',   badgeClass: 'badge-priority-high' },
  medium: { label: 'Medium', class: 'accent-medium', badgeClass: 'badge-priority-medium' },
  low:    { label: 'Low',    class: 'accent-low',    badgeClass: 'badge-priority-low' }
};

const STATUS_THEMES = {
  'pending':     { label: 'Pending',     class: 'badge-status-pending' },
  'in-progress': { label: 'In Progress', class: 'badge-status-inprogress' },
  'done':        { label: 'Done',        class: 'badge-status-done' }
};

let state = {
  id: 'todo-1',
  title: 'Complete project documentation',
  description: 'Write comprehensive documentation for the new API endpoints and update the README file with clear examples and usage guidelines. This description is quite long to test the expand/collapse behavior requirement for Stage 1.',
  priority: 'high',
  status: 'in-progress',
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2.5),
  tags: ['work', 'urgent'],
  isEditing: false,
  isExpanded: false
};

const savedState = localStorage.getItem('taskflow-state');
if (savedState) {
  const parsed = JSON.parse(savedState);
  parsed.dueDate = new Date(parsed.dueDate);
  state = { ...state, ...parsed };
}

function saveState() {
  localStorage.setItem('taskflow-state', JSON.stringify(state));
}


function calculateTime(date) {
  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  const isOverdue = diff < 0;

  let text = '';
  if (days > 0) text = `Due in ${days} day${days > 1 ? 's' : ''}`;
  else if (hours > 0) text = `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
  else if (minutes > 0) text = `Due in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  else text = 'Due now';

  if (isOverdue) {
    if (days > 0) text = `Overdue by ${days} day${days > 1 ? 's' : ''}`;
    else if (hours > 0) text = `Overdue by ${hours} hour${hours > 1 ? 's' : ''}`;
    else if (minutes > 0) text = `Overdue by ${minutes} min${minutes > 1 ? 's' : ''}`;
    else text = 'Just overdue';
  }

  return { text, isOverdue };
}


function render() {
  const container = document.getElementById('todo-container');
  if (!container) return;

  const { text: timeText, isOverdue } = calculateTime(state.dueDate);
  const isDone = state.status === 'done';
  const showOverdue = isOverdue && !isDone;

  const priorityTheme = PRIORITY_THEMES[state.priority] || PRIORITY_THEMES.medium;
  const statusTheme = STATUS_THEMES[state.status] || STATUS_THEMES.pending;

  if (state.isEditing) {
    container.innerHTML = renderEditMode();
    attachEditListeners();
  } else {
    container.innerHTML = renderViewMode(priorityTheme, statusTheme, timeText, showOverdue, isDone);
    attachViewListeners();
  }

  saveState();
}

function renderViewMode(priorityTheme, statusTheme, timeText, showOverdue, isDone) {
  const descLength = state.description.length;
  const showExpand = descLength > 100;

  return `
    <article class="todo-card ${priorityTheme.class} ${isDone ? 'is-done' : ''} ${showOverdue ? 'is-overdue' : ''} ${state.isExpanded ? '' : 'is-collapsed'}" 
             data-testid="test-todo-card" 
             id="${state.id}">
      
      ${showOverdue ? `<div class="overdue-indicator" data-testid="test-todo-overdue-indicator">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Overdue
      </div>` : ''}

      <div class="card-header">
        <label class="checkbox-container">
          <input type="checkbox" class="checkbox-hidden" ${isDone ? 'checked' : ''} id="status-checkbox" data-testid="test-todo-complete-toggle">
          <div class="checkbox-visual">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 7 4 10 11 1"/></svg>
          </div>
        </label>
        
        <h2 class="todo-title" data-testid="test-todo-title">${state.title}</h2>
        
        <div class="card-actions">
           <button class="icon-btn" id="edit-btn" data-testid="test-todo-edit-button" aria-label="Edit Task">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
           </button>
        </div>
      </div>

      <div class="collapsible-container" id="desc-container" data-testid="test-todo-collapsible-section">
        <p class="todo-description" data-testid="test-todo-description">${state.description}</p>
      </div>

      ${showExpand ? `
        <button class="expand-toggle" id="expand-btn" data-testid="test-todo-expand-toggle" 
                aria-expanded="${state.isExpanded}" aria-controls="desc-container">
          ${state.isExpanded ? 'Show Less ↑' : 'Show More ↓'}
        </button>
      ` : ''}

      <div class="meta-row">
        <div class="badge ${priorityTheme.badgeClass}" data-testid="test-todo-priority-indicator">
          <span class="dot"></span> ${priorityTheme.label} Priority
        </div>

        <select class="status-control-select" id="status-select" data-testid="test-todo-status-control" aria-label="Change Status">
          <option value="pending" ${state.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${state.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${state.status === 'done' ? 'selected' : ''}>Done</option>
        </select>

        <div class="meta-chip" id="time-display" aria-live="polite">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${isDone ? 'Completed' : timeText}
        </div>
      </div>

      <div class="tags-row">
        ${state.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    </article>
  `;
}

function renderEditMode() {
  return `
    <div class="todo-card edit-mode" data-testid="test-todo-edit-form">
      <h3 style="margin: 0 0 16px 0; font-size: 18px;">Edit Task</h3>
      
      <div class="form-group">
        <label for="edit-title">Title</label>
        <input type="text" id="edit-title" class="form-control" value="${state.title}" data-testid="test-todo-edit-title-input">
      </div>

      <div class="form-group">
        <label for="edit-desc">Description</label>
        <textarea id="edit-desc" class="form-control" rows="4" data-testid="test-todo-edit-description-input">${state.description}</textarea>
      </div>

      <div class="meta-row" style="margin-top: 8px;">
        <div class="form-group" style="flex: 1;">
          <label for="edit-priority">Priority</label>
          <select id="edit-priority" class="form-control" data-testid="test-todo-edit-priority-select">
            <option value="high" ${state.priority === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${state.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${state.priority === 'low' ? 'selected' : ''}>Low</option>
          </select>
        </div>

        <div class="form-group" style="flex: 1;">
          <label for="edit-date">Due Date</label>
          <input type="datetime-local" id="edit-date" class="form-control" 
                 value="${state.dueDate.toISOString().slice(0, 16)}" 
                 data-testid="test-todo-edit-due-date-input">
        </div>
      </div>

      <div class="actions-row">
        <button class="btn btn-save" id="save-btn" data-testid="test-todo-save-button">Save Changes</button>
        <button class="btn btn-cancel" id="cancel-btn" data-testid="test-todo-cancel-button">Cancel</button>
      </div>
    </div>
  `;
}


function attachViewListeners() {
  const checkbox = document.getElementById('status-checkbox');
  const statusSelect = document.getElementById('status-select');
  const editBtn = document.getElementById('edit-btn');
  const expandBtn = document.getElementById('expand-btn');

  checkbox?.addEventListener('change', () => {
    state.status = checkbox.checked ? 'done' : 'pending';
    render();
  });

  statusSelect?.addEventListener('change', (e) => {
    state.status = e.target.value;
    render();
  });

  editBtn?.addEventListener('click', () => {
    state.isEditing = true;
    render();
    document.getElementById('edit-title')?.focus();
  });

  expandBtn?.addEventListener('click', () => {
    state.isExpanded = !state.isExpanded;
    render();
  });
}

function attachEditListeners() {
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  saveBtn?.addEventListener('click', () => {
    state.title = document.getElementById('edit-title').value;
    state.description = document.getElementById('edit-desc').value;
    state.priority = document.getElementById('edit-priority').value;
    state.dueDate = new Date(document.getElementById('edit-date').value);
    state.isEditing = false;
    render();
    document.getElementById('edit-btn')?.focus();
  });

  cancelBtn?.addEventListener('click', () => {
    state.isEditing = false;
    render();
    document.getElementById('edit-btn')?.focus();
  });
}

setInterval(() => {
  if (!state.isEditing && state.status !== 'done') {
    render();
  }
}, 30000);

render();
