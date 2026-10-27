/**
 * =====================================================
 * MY ARCHIVE BUDDY — script.js
 * Vanilla JavaScript archive management app.
 * All data is stored in localStorage under the key
 * "archiveBuddyRecords".
 * =====================================================
 */

// ─── CONSTANTS ────────────────────────────────────────
const STORAGE_KEY = 'archiveBuddyRecords';

// ─── SAMPLE DATA ──────────────────────────────────────
/**
 * A small set of fictional records shown on the very
 * first visit (before the user adds any real data).
 */
const SAMPLE_RECORDS = [
  {
    id: 'sample-1',
    archiveNumber: 'ARC-2023-001',
    docTitle: 'Annual Budget Report 2023',
    category: 'Finance',
    docDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 'sample-2',
    archiveNumber: 'ARC-2023-002',
    docTitle: 'Employee Onboarding Handbook',
    category: 'HR',
    docDate: '2023-03-10',
    status: 'Active',
  },
  {
    id: 'sample-3',
    archiveNumber: 'ARC-2022-015',
    docTitle: 'Office Lease Agreement',
    category: 'Legal',
    docDate: '2022-07-01',
    status: 'Transferred',
  },
  {
    id: 'sample-4',
    archiveNumber: 'ARC-2021-008',
    docTitle: 'Q3 Operations Summary',
    category: 'Operations',
    docDate: '2021-10-20',
    status: 'Inactive',
  },
  {
    id: 'sample-5',
    archiveNumber: 'ARC-2023-009',
    docTitle: 'Vendor Correspondence – April',
    category: 'Correspondence',
    docDate: '2023-04-18',
    status: 'Active',
  },
];

// ─── STATE ────────────────────────────────────────────
/** The in-memory list of archive records. Kept in sync with localStorage. */
let records = [];

/** When editing a record this holds its id; null means "add new" mode. */
let editingId = null;

// ─── DOM REFERENCES ───────────────────────────────────
// Grab all the elements we need once at startup.
const form             = document.getElementById('archive-form');
const editIdInput      = document.getElementById('edit-id');
const archiveNumberInput = document.getElementById('archive-number');
const docTitleInput    = document.getElementById('doc-title');
const categorySelect   = document.getElementById('category');
const docDateInput     = document.getElementById('doc-date');
const statusSelect     = document.getElementById('status');
const submitBtn        = document.getElementById('submit-btn');
const cancelBtn        = document.getElementById('cancel-btn');
const formTitle        = document.getElementById('form-title');
const notification     = document.getElementById('form-notification');

const searchInput      = document.getElementById('search-input');
const filterStatus     = document.getElementById('filter-status');
const filterCategory   = document.getElementById('filter-category');
const tableBody        = document.getElementById('table-body');
const resultCount      = document.getElementById('result-count');
const emptyState       = document.getElementById('empty-state');

const confirmDialog    = document.getElementById('confirm-dialog');
const dialogConfirm    = document.getElementById('dialog-confirm');
const dialogCancel     = document.getElementById('dialog-cancel');

// Dashboard count elements
const countTotal       = document.getElementById('count-total');
const countActive      = document.getElementById('count-active');
const countInactive    = document.getElementById('count-inactive');
const countTransferred = document.getElementById('count-transferred');

// ─── STORAGE HELPERS ─────────────────────────────────

/**
 * Load records from localStorage.
 * If no records exist yet, seed with sample data.
 * @returns {Array} Array of record objects.
 */
function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Corrupted data — start fresh
      return [];
    }
  }
  // First visit: save and return sample data
  saveRecords(SAMPLE_RECORDS);
  return SAMPLE_RECORDS.slice(); // return a copy
}

/**
 * Persist the current records array to localStorage.
 * @param {Array} data - The records array to save.
 */
function saveRecords(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── ID GENERATOR ─────────────────────────────────────

/**
 * Generate a simple unique id using timestamp + random number.
 * @returns {string}
 */
function generateId() {
  return 'rec-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

// ─── DASHBOARD ────────────────────────────────────────

/**
 * Recalculate and render the four dashboard stat cards.
 */
function updateDashboard() {
  const total       = records.length;
  const active      = records.filter(r => r.status === 'Active').length;
  const inactive    = records.filter(r => r.status === 'Inactive').length;
  const transferred = records.filter(r => r.status === 'Transferred').length;

  // textContent is always safe — no HTML injection risk
  countTotal.textContent       = total;
  countActive.textContent      = active;
  countInactive.textContent    = inactive;
  countTransferred.textContent = transferred;
}

// ─── TABLE RENDERING ──────────────────────────────────

/**
 * Render the archive table based on current search/filter inputs.
 * Uses safe DOM methods (createElement / textContent) instead of
 * innerHTML to prevent XSS from user-supplied data.
 */
function renderTable() {
  const query    = searchInput.value.trim().toLowerCase();
  const byStatus = filterStatus.value;
  const byCat    = filterCategory.value;

  // Filter the records array
  const filtered = records.filter(r => {
    const matchSearch =
      !query ||
      r.archiveNumber.toLowerCase().includes(query) ||
      r.docTitle.toLowerCase().includes(query);

    const matchStatus   = !byStatus || r.status === byStatus;
    const matchCategory = !byCat    || r.category === byCat;

    return matchSearch && matchStatus && matchCategory;
  });

  // Clear existing rows
  tableBody.textContent = '';

  if (filtered.length === 0) {
    // Show the empty-state panel and hide the table wrapper
    emptyState.classList.remove('hidden');
    document.querySelector('.table-wrapper').style.display = 'none';
    resultCount.textContent = 'No records match your filters.';
    return;
  }

  // Records found — show the table, hide empty state
  emptyState.classList.add('hidden');
  document.querySelector('.table-wrapper').style.display = '';
  resultCount.textContent =
    `Showing ${filtered.length} of ${records.length} record${records.length !== 1 ? 's' : ''}`;

  // Build each table row using safe DOM APIs
  filtered.forEach((record, index) => {
    const tr = document.createElement('tr');

    // Row number
    appendCell(tr, String(index + 1));

    // Archive number
    appendCell(tr, record.archiveNumber);

    // Document title
    appendCell(tr, record.docTitle);

    // Category
    appendCell(tr, record.category);

    // Document date — format nicely
    appendCell(tr, formatDate(record.docDate));

    // Status badge (uses a span with a safe CSS class)
    const statusTd = document.createElement('td');
    const badge    = document.createElement('span');
    badge.textContent = record.status;
    badge.className   = 'badge ' + getBadgeClass(record.status);
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    // Action buttons
    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.className   = 'btn btn-icon btn-edit';
    editBtn.setAttribute('aria-label', 'Edit ' + record.archiveNumber);
    editBtn.addEventListener('click', () => startEdit(record.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Del';
    deleteBtn.className   = 'btn btn-icon btn-delete';
    deleteBtn.setAttribute('aria-label', 'Delete ' + record.archiveNumber);
    deleteBtn.addEventListener('click', () => confirmDelete(record.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(document.createTextNode(' ')); // tiny spacer
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    tableBody.appendChild(tr);
  });
}

/**
 * Helper: create a <td> with safe textContent and append it to a row.
 * @param {HTMLTableRowElement} tr
 * @param {string} text
 */
function appendCell(tr, text) {
  const td = document.createElement('td');
  td.textContent = text;
  tr.appendChild(td);
}

/**
 * Return the CSS class name for a status badge.
 * @param {string} status
 * @returns {string}
 */
function getBadgeClass(status) {
  const map = {
    Active:      'badge-active',
    Inactive:    'badge-inactive',
    Transferred: 'badge-transferred',
  };
  return map[status] || '';
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a more readable form.
 * Falls back to the raw string if parsing fails.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  // e.g. "15 Jan 2023"
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

// ─── FORM VALIDATION ──────────────────────────────────

/**
 * Validate the form fields.
 * Shows inline error messages and adds an .invalid class to bad fields.
 * @returns {boolean} true if all fields are valid.
 */
function validateForm() {
  let valid = true;

  // Helper to set or clear an error for a field
  function setError(inputEl, errorEl, message) {
    if (message) {
      inputEl.classList.add('invalid');
      errorEl.textContent = message;
      valid = false;
    } else {
      inputEl.classList.remove('invalid');
      errorEl.textContent = '';
    }
  }

  const num   = archiveNumberInput.value.trim();
  const title = docTitleInput.value.trim();
  const cat   = categorySelect.value;
  const date  = docDateInput.value;
  const stat  = statusSelect.value;

  // Archive number — required, and must be unique (unless editing the same record)
  if (!num) {
    setError(archiveNumberInput, document.getElementById('err-archive-number'), 'Archive number is required.');
  } else {
    const duplicate = records.find(
      r => r.archiveNumber.toLowerCase() === num.toLowerCase() && r.id !== editingId
    );
    setError(
      archiveNumberInput,
      document.getElementById('err-archive-number'),
      duplicate ? 'This archive number already exists.' : ''
    );
  }

  setError(
    docTitleInput,
    document.getElementById('err-doc-title'),
    !title ? 'Document title is required.' : ''
  );

  setError(
    categorySelect,
    document.getElementById('err-category'),
    !cat ? 'Please select a category.' : ''
  );

  setError(
    docDateInput,
    document.getElementById('err-doc-date'),
    !date ? 'Document date is required.' : ''
  );

  setError(
    statusSelect,
    document.getElementById('err-status'),
    !stat ? 'Please select a status.' : ''
  );

  return valid;
}

/**
 * Clear all inline validation errors and .invalid classes.
 */
function clearValidation() {
  const fields = [archiveNumberInput, docTitleInput, categorySelect, docDateInput, statusSelect];
  const errors = ['err-archive-number', 'err-doc-title', 'err-category', 'err-doc-date', 'err-status'];

  fields.forEach(f => f.classList.remove('invalid'));
  errors.forEach(id => { document.getElementById(id).textContent = ''; });
}

// ─── NOTIFICATION BANNER ──────────────────────────────

/**
 * Show a brief notification message above the form.
 * Automatically hides after 3 seconds.
 * @param {string} message - The message text (plain text only).
 * @param {'success'|'error'} type
 */
function showNotification(message, type = 'success') {
  notification.textContent = message; // safe: textContent only
  notification.className   = `notification ${type}`;
  notification.classList.remove('hidden');

  // Auto-dismiss
  setTimeout(() => {
    notification.classList.add('hidden');
    notification.textContent = '';
  }, 3000);
}

// ─── FORM SUBMISSION (ADD / EDIT) ─────────────────────

/**
 * Handle the form submit event.
 * Either creates a new record or updates the existing one being edited.
 */
form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearValidation();

  if (!validateForm()) return; // Stop if validation failed

  const num   = archiveNumberInput.value.trim();
  const title = docTitleInput.value.trim();
  const cat   = categorySelect.value;
  const date  = docDateInput.value;
  const stat  = statusSelect.value;

  if (editingId) {
    // ── UPDATE existing record ──
    const index = records.findIndex(r => r.id === editingId);
    if (index !== -1) {
      records[index] = {
        id: editingId,
        archiveNumber: num,
        docTitle: title,
        category: cat,
        docDate: date,
        status: stat,
      };
    }
    showNotification(`✅ Record "${num}" updated successfully!`);
    resetForm();
  } else {
    // ── CREATE new record ──
    const newRecord = {
      id:            generateId(),
      archiveNumber: num,
      docTitle:      title,
      category:      cat,
      docDate:       date,
      status:        stat,
    };
    records.push(newRecord);
    showNotification(`🎉 Archive "${num}" added!`);
    resetForm();
  }

  saveRecords(records);
  updateDashboard();
  renderTable();
});

// ─── RESET FORM ───────────────────────────────────────

/**
 * Reset the form back to "Add New" mode, clearing all fields and errors.
 */
function resetForm() {
  editingId = null;
  editIdInput.value = '';
  form.reset();
  clearValidation();
  formTitle.textContent = '➕ Add New Archive';
  submitBtn.textContent = '💾 Save Archive';
  cancelBtn.classList.add('hidden');
}

// Cancel button — only visible in edit mode
cancelBtn.addEventListener('click', () => {
  resetForm();
});

// ─── EDIT RECORD ──────────────────────────────────────

/**
 * Load a record's data into the form so the user can edit it.
 * @param {string} id - The id of the record to edit.
 */
function startEdit(id) {
  const record = records.find(r => r.id === id);
  if (!record) return;

  editingId = id;

  // Populate form fields with existing values
  archiveNumberInput.value = record.archiveNumber;
  docTitleInput.value      = record.docTitle;
  categorySelect.value     = record.category;
  docDateInput.value       = record.docDate;
  statusSelect.value       = record.status;

  // Update form header & button label
  formTitle.textContent = '✏️ Edit Archive';
  submitBtn.textContent = '💾 Update Archive';
  cancelBtn.classList.remove('hidden');

  clearValidation();

  // Scroll to the form so the user sees it
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── DELETE RECORD (with confirmation dialog) ─────────

/** Holds the id of the record pending deletion. */
let pendingDeleteId = null;

/**
 * Open the native <dialog> confirmation box before deleting.
 * @param {string} id
 */
function confirmDelete(id) {
  const record = records.find(r => r.id === id);
  if (!record) return;

  pendingDeleteId = id;

  // Update dialog message with the archive number (safe — textContent)
  document.getElementById('dialog-message').textContent =
    `Are you sure you want to delete "${record.archiveNumber}"? This cannot be undone.`;

  confirmDialog.showModal();
}

// "Yes, Delete" button inside the dialog
dialogConfirm.addEventListener('click', () => {
  if (pendingDeleteId) {
    records = records.filter(r => r.id !== pendingDeleteId);
    saveRecords(records);
    updateDashboard();
    renderTable();

    // If we were editing this record, cancel the edit
    if (editingId === pendingDeleteId) resetForm();

    showNotification('🗑️ Record deleted.', 'error');
    pendingDeleteId = null;
  }
  confirmDialog.close();
});

// "Cancel" button inside the dialog
dialogCancel.addEventListener('click', () => {
  pendingDeleteId = null;
  confirmDialog.close();
});

// Allow closing the dialog by clicking the backdrop
confirmDialog.addEventListener('click', (e) => {
  // The dialog element itself covers the backdrop; check if the click
  // was outside the inner box (i.e., on the backdrop area).
  if (e.target === confirmDialog) {
    pendingDeleteId = null;
    confirmDialog.close();
  }
});

// ─── SEARCH & FILTER ─────────────────────────────────

/**
 * Re-render the table whenever the user types in the search box
 * or changes a filter dropdown. No data is modified here.
 */
searchInput.addEventListener('input', renderTable);
filterStatus.addEventListener('change', renderTable);
filterCategory.addEventListener('change', renderTable);

// ─── INITIALISE APP ───────────────────────────────────

/**
 * Entry point — runs once when the page loads.
 * 1. Load records from localStorage (or seed sample data).
 * 2. Render the dashboard and table.
 * 3. Put the cancel button in its default hidden state.
 */
function init() {
  records = loadRecords();
  cancelBtn.classList.add('hidden'); // hidden until edit mode is activated
  updateDashboard();
  renderTable();
}

// Kick off the app
init();
