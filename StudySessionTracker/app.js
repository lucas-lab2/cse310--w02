// app.js
// Connects the HTML page to the logic in tracker.js (DOM + events + storage).

const STORAGE_KEY = "studySessions";
let sessions = loadSessions(); // the app's data lives in this array

// ── DOM references ──────────────────────────────────────────────────────────
const form           = document.getElementById("session-form");
const subjectInput   = document.getElementById("subject");
const minutesInput   = document.getElementById("minutes");
const dateInput      = document.getElementById("date");
const errorBox       = document.getElementById("error");
const listEl         = document.getElementById("session-list");
const totalEl        = document.getElementById("total");
const sessionCount   = document.getElementById("session-count");
const subjectsEl     = document.getElementById("subjects");

// Countdown elements
const countdownSection = document.getElementById("countdown-section");
const cdSubjectName    = document.getElementById("countdown-subject-name");
const cdHours          = document.getElementById("cd-hours");
const cdMinutes        = document.getElementById("cd-minutes");
const cdSeconds        = document.getElementById("cd-seconds");
const cdProgress       = document.getElementById("cd-progress");

// ── Countdown state ─────────────────────────────────────────────────────────
let countdownInterval = null;   // setInterval handle
let countdownEndsAt   = null;   // Date object: when the current timer expires
let countdownTotalSec = 0;      // original total seconds (for progress bar)

/**
 * Starts (or restarts) the countdown for the most recently added session.
 * @param {string} subject  - Subject name shown in the UI.
 * @param {number} minutes  - Duration of the session in minutes.
 */
function startCountdown(subject, minutes) {
  // Clear any previous timer
  if (countdownInterval) clearInterval(countdownInterval);

  countdownTotalSec = minutes * 60;
  countdownEndsAt   = new Date(Date.now() + countdownTotalSec * 1000);
  cdSubjectName.textContent = subject;

  countdownSection.classList.add("active");

  // Tick immediately so the display is correct before the first second passes
  tickCountdown();
  countdownInterval = setInterval(tickCountdown, 1000);
}

/**
 * Updates the hh:mm:ss display and progress bar every second.
 */
function tickCountdown() {
  const remainingMs  = countdownEndsAt - Date.now();

  if (remainingMs <= 0) {
    // Session complete
    clearInterval(countdownInterval);
    countdownInterval = null;
    cdHours.textContent   = "00";
    cdMinutes.textContent = "00";
    cdSeconds.textContent = "00";
    cdProgress.style.width = "0%";
    cdSubjectName.innerHTML =
      "🎉 Session complete! Great work on <strong>" +
      cdSubjectName.querySelector("strong")?.textContent + "</strong>";
    return;
  }

  const totalSecsLeft = Math.ceil(remainingMs / 1000);
  const h = Math.floor(totalSecsLeft / 3600);
  const m = Math.floor((totalSecsLeft % 3600) / 60);
  const s = totalSecsLeft % 60;

  cdHours.textContent   = String(h).padStart(2, "0");
  cdMinutes.textContent = String(m).padStart(2, "0");
  cdSeconds.textContent = String(s).padStart(2, "0");

  // Progress bar shrinks from 100 % → 0 %
  const pct = Math.max(0, (remainingMs / (countdownTotalSec * 1000)) * 100);
  cdProgress.style.width = pct + "%";
}

// ── Persistence ─────────────────────────────────────────────────────────────

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

// ── Rendering ────────────────────────────────────────────────────────────────

/**
 * Redraws the whole page (list, stats, and per-subject summary).
 */
function render() {
  // 1. Session list
  listEl.innerHTML = "";
  const sorted = sortByDateDesc(sessions);

  if (sorted.length === 0) {
    listEl.innerHTML = '<li class="empty-state">No sessions yet. Add one above! 👆</li>';
  } else {
    for (const s of sorted) {
      const li = document.createElement("li");

      const dateSpan = document.createElement("span");
      dateSpan.className = "session-date";
      dateSpan.textContent = s.date;

      const subjSpan = document.createElement("span");
      subjSpan.className = "session-subj";
      subjSpan.textContent = s.subject;

      const durSpan = document.createElement("span");
      durSpan.className = "session-dur";
      durSpan.textContent = formatDuration(s.minutes);

      const btn = document.createElement("button");
      btn.className = "btn-delete";
      btn.textContent = "Delete";
      btn.addEventListener("click", () => handleDelete(s.id));

      li.appendChild(dateSpan);
      li.appendChild(subjSpan);
      li.appendChild(durSpan);
      li.appendChild(btn);
      listEl.appendChild(li);
    }
  }

  // 2. Stats
  totalEl.textContent        = formatDuration(totalMinutes(sessions));
  sessionCount.textContent   = sessions.length;

  // 3. Summary per subject
  subjectsEl.innerHTML = "";
  const bySubject = minutesBySubject(sessions);
  if (Object.keys(bySubject).length === 0) {
    subjectsEl.innerHTML = '<li class="empty-state" style="list-style:none">No data yet.</li>';
  } else {
    for (const subject in bySubject) {
      const li = document.createElement("li");
      li.textContent = `${subject}: ${formatDuration(bySubject[subject])}`;
      subjectsEl.appendChild(li);
    }
  }
}

// ── Event handlers ───────────────────────────────────────────────────────────

/**
 * Runs when the form is submitted: validates, adds, saves, redraws, and
 * starts the countdown for the new session.
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

  // Start countdown for the newly added session
  startCountdown(session.subject, session.minutes);

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

// ── Bootstrap ────────────────────────────────────────────────────────────────
form.addEventListener("submit", handleSubmit);
dateInput.value = today();
render();

