// app.js
// Connects the HTML page to the logic in tracker.js (DOM + events + storage).

const STORAGE_KEY = "studySessions";
let sessions = loadSessions(); // the app's data lives in this array

// Grab the page elements we need
const form = document.getElementById("session-form");
const subjectInput = document.getElementById("subject");
const minutesInput = document.getElementById("minutes");
const dateInput = document.getElementById("date");
const errorBox = document.getElementById("error");
const listEl = document.getElementById("session-list");
const totalEl = document.getElementById("total");
const subjectsEl = document.getElementById("subjects");

/**
 * Reads saved sessions from the browser's localStorage.
 * @returns {Array} Saved sessions, or an empty array if none exist.
 */
function loadSessions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

/**
 * Saves the current sessions to localStorage so they survive a page refresh.
 */
function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Redraws the whole page (list, total, and per-subject summary).
 */
function render() {
  // 1. Session list
  listEl.innerHTML = "";
  for (const s of sortByDateDesc(sessions)) {
    const li = document.createElement("li");
    li.textContent = `${s.date} - ${s.subject} - ${formatDuration(s.minutes)} `;

    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.addEventListener("click", () => handleDelete(s.id));
    li.appendChild(btn);
    listEl.appendChild(li);
  }

  // 2. Total time
  totalEl.textContent = formatDuration(totalMinutes(sessions));

  // 3. Summary per subject
  subjectsEl.innerHTML = "";
  const bySubject = minutesBySubject(sessions);
  for (const subject in bySubject) {
    const li = document.createElement("li");
    li.textContent = `${subject}: ${formatDuration(bySubject[subject])}`;
    subjectsEl.appendChild(li);
  }
}

/**
 * Runs when the form is submitted: validates, adds, saves, and redraws.
 */
function handleSubmit(event) {
  event.preventDefault(); // stop the page from reloading

  const error = validateSession(subjectInput.value, minutesInput.value, dateInput.value);
  errorBox.textContent = error || "";
  if (error) return;

  const session = createSession(subjectInput.value, minutesInput.value, dateInput.value);
  sessions = addSession(sessions, session);
  saveSessions();
  render();
  form.reset();
  dateInput.value = today();
}

/**
 * Runs when a Delete button is clicked.
 */
function handleDelete(id) {
  sessions = removeSession(sessions, id);
  saveSessions();
  render();
}

/**
 * Returns today's date as YYYY-MM-DD (used as the default in the form).
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Start the app
form.addEventListener("submit", handleSubmit);
dateInput.value = today();
render();
