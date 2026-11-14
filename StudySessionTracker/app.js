// app.js
// Connects the HTML page to the logic in tracker.js (DOM + events + storage).
// Uses the Day.js library (loaded from a CDN in index.html) to format dates.

const STORAGE_KEY = "studySessions";
let sessions = loadSessions();

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
const toastEl        = document.getElementById("toast");

// Countdown elements
const countdownSection = document.getElementById("countdown-section");
const cdSubjectName    = document.getElementById("countdown-subject-name");
const cdHours          = document.getElementById("cd-hours");
const cdMinutes        = document.getElementById("cd-minutes");
const cdSeconds        = document.getElementById("cd-seconds");
const cdProgress       = document.getElementById("cd-progress");
const btnPauseResume   = document.getElementById("btn-pause-resume");
const btnStop          = document.getElementById("btn-stop");

// ── Countdown state ──────────────────────────────────────────────────────────
let countdownInterval  = null;   // setInterval handle
let countdownEndsAt    = null;   // ms timestamp when the timer expires
let countdownTotalSec  = 0;      // original total seconds (for progress bar)
let isPaused           = false;  // whether the timer is currently paused
let pausedRemainingMs  = 0;      // ms left at the moment of pause
let activeSessionId    = null;   // id of the session being counted down

// ── Countdown functions ──────────────────────────────────────────────────────

/**
 * Starts a fresh countdown for a session.
 * @param {string} subject
 * @param {number} minutes
 * @param {number|string} sessionId
 */
function startCountdown(subject, minutes, sessionId) {
  clearCountdownTimer();

  activeSessionId   = sessionId;
  isPaused          = false;
  countdownTotalSec = minutes * 60;
  countdownEndsAt   = Date.now() + countdownTotalSec * 1000;

  cdSubjectName.textContent = subject;
  document.getElementById("countdown-label").innerHTML =
    "Studying <strong id=\"countdown-subject-name\">" + subject + "</strong>";

  btnPauseResume.textContent = "⏸ Pause";
  btnPauseResume.classList.remove("btn-resume");
  btnPauseResume.classList.add("btn-pause");
  countdownSection.classList.add("active");

  tickCountdown();
  countdownInterval = setInterval(tickCountdown, 1000);
}

/**
 * Clears the interval without touching the UI (internal helper).
 */
function clearCountdownTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

/**
 * Fully stops and hides the countdown (e.g. Stop button or session deleted).
 */
function stopCountdown() {
  clearCountdownTimer();
  activeSessionId = null;
  isPaused = false;
  countdownSection.classList.remove("active");
  // Reset digits for next use
  cdHours.textContent   = "00";
  cdMinutes.textContent = "00";
  cdSeconds.textContent = "00";
  cdProgress.style.width = "100%";
}

/**
 * Pauses the running countdown, preserving remaining time.
 */
function pauseCountdown() {
  if (!countdownInterval) return;
  pausedRemainingMs = countdownEndsAt - Date.now();
  clearCountdownTimer();
  isPaused = true;
  btnPauseResume.textContent = "▶ Resume";
  btnPauseResume.classList.remove("btn-pause");
  btnPauseResume.classList.add("btn-resume");
  countdownSection.classList.add("paused");
}

/**
 * Resumes a paused countdown from where it left off.
 */
function resumeCountdown() {
  if (!isPaused) return;
  countdownEndsAt = Date.now() + pausedRemainingMs;
  isPaused = false;
  btnPauseResume.textContent = "⏸ Pause";
  btnPauseResume.classList.remove("btn-resume");
  btnPauseResume.classList.add("btn-pause");
  countdownSection.classList.remove("paused");
  tickCountdown();
  countdownInterval = setInterval(tickCountdown, 1000);
}

/**
 * Updates the hh:mm:ss display and progress bar every second.
 */
function tickCountdown() {
  const remainingMs = countdownEndsAt - Date.now();

  if (remainingMs <= 0) {
    clearCountdownTimer();
    activeSessionId = null;
    cdHours.textContent   = "00";
    cdMinutes.textContent = "00";
    cdSeconds.textContent = "00";
    cdProgress.style.width = "0%";
    // Show completion message in the label paragraph
    const labelEl = document.getElementById("countdown-label");
    const name = document.getElementById("countdown-subject-name")?.textContent || "";
    labelEl.innerHTML = "🎉 Session complete! Great work on <strong>" + name + "</strong>";
    return;
  }

  const totalSecsLeft = Math.ceil(remainingMs / 1000);
  const h = Math.floor(totalSecsLeft / 3600);
  const m = Math.floor((totalSecsLeft % 3600) / 60);
  const s = totalSecsLeft % 60;

  cdHours.textContent   = String(h).padStart(2, "0");
  cdMinutes.textContent = String(m).padStart(2, "0");
  cdSeconds.textContent = String(s).padStart(2, "0");

  const pct = Math.max(0, (remainingMs / (countdownTotalSec * 1000)) * 100);
  cdProgress.style.width = pct + "%";
}

// ── Toast helper ─────────────────────────────────────────────────────────────
let toastTimeout = null;

/**
 * Shows a brief toast message at the bottom of the screen.
 * @param {string} msg
 */
function showToast(msg) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.textContent = msg;
  toastEl.classList.add("visible");
  toastTimeout = setTimeout(() => toastEl.classList.remove("visible"), 3000);
}

// ── Persistence ──────────────────────────────────────────────────────────────

/**
 * Reads the saved sessions from the browser's localStorage.
 * @returns {Array} Saved sessions, or an empty array if there are none.
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

// ── Rendering ─────────────────────────────────────────────────────────────────

/**
 * Formats a YYYY-MM-DD string (e.g. "Nov 14, 2026") using the Day.js library.
 * If the library did not load (for example, no internet), shows the raw date.
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (typeof dayjs === "undefined") return dateString;
  return dayjs(dateString).format("MMM D, YYYY");
}

/**
 * Redraws the whole page: session list, stats, and per-subject summary.
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

      // Mark the active session so the user knows which one is running
      if (s.id === activeSessionId) li.classList.add("session-active");

      const dateSpan = document.createElement("span");
      dateSpan.className = "session-date";
      dateSpan.textContent = formatDate(s.date); // Day.js formatting

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
  totalEl.textContent      = formatDuration(totalMinutes(sessions));
  sessionCount.textContent = sessions.length;

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

// ── Event handlers ────────────────────────────────────────────────────────────

/**
 * Form submit — always adds the session to the list.
 * If a countdown is already running, keeps it and shows a toast instead of
 * replacing the timer.
 */
function handleSubmit(event) {
  event.preventDefault();

  const error = validateSession(subjectInput.value, minutesInput.value, dateInput.value);
  errorBox.textContent = error || "";
  if (error) return;

  const session = createSession(subjectInput.value, minutesInput.value, dateInput.value);
  sessions = addSession(sessions, session);
  saveSessions();

  const isRunning = countdownInterval !== null || isPaused;

  if (isRunning) {
    // Keep the existing countdown — just save & re-render, then toast
    render();
    showToast("✅ Session \"" + session.subject + "\" added! Current countdown continues.");
  } else {
    // No active countdown — start one for this new session
    render();
    startCountdown(session.subject, session.minutes, session.id);
  }

  form.reset();
  dateInput.value = today();
}

/**
 * Delete button — if the deleted session is the active one, stop the countdown.
 */
function handleDelete(id) {
  if (id === activeSessionId) {
    stopCountdown();
    showToast("🛑 Active session deleted — countdown stopped.");
  }
  sessions = removeSession(sessions, id);
  saveSessions();
  render();
}

/** Pause / Resume button */
btnPauseResume.addEventListener("click", () => {
  if (isPaused) {
    resumeCountdown();
  } else {
    pauseCountdown();
  }
});

/** Stop button */
btnStop.addEventListener("click", () => {
  stopCountdown();
  showToast("⏹ Countdown stopped.");
});

/**
 * Returns today's date as YYYY-MM-DD (default value of the date field).
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
form.addEventListener("submit", handleSubmit);
dateInput.value = today();
render();

