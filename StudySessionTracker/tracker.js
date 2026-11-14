// tracker.js
// Core logic for the Study Session Tracker.
// This file has NO DOM code, so it can be tested with Node.js.

/**
 * Creates a new study session object.
 * @param {string} subject - What was studied (e.g. "JavaScript").
 * @param {number} minutes - How long the session lasted, in minutes.
 * @param {string} date - Date in YYYY-MM-DD format.
 * @returns {object} A session with a unique id.
 */
function createSession(subject, minutes, date) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000), // simple unique id
    subject: subject.trim(),
    minutes: Number(minutes),
    date: date,
  };
}

/**
 * Checks whether the user input is valid.
 * @returns {string|null} An error message, or null if everything is OK.
 */
function validateSession(subject, minutes, date) {
  if (!subject || subject.trim() === "") return "Please enter a subject.";
  if (isNaN(minutes) || Number(minutes) <= 0) return "Minutes must be greater than 0.";
  if (!date) return "Please choose a date.";
  return null;
}

/**
 * Adds a session to the list and returns a NEW list (original is not changed).
 */
function addSession(sessions, session) {
  return [...sessions, session];
}

/**
 * Removes the session with the given id and returns a NEW list.
 */
function removeSession(sessions, id) {
  return sessions.filter((s) => s.id !== id);
}

/**
 * Adds up all minutes in the list.
 * @returns {number} Total minutes.
 */
function totalMinutes(sessions) {
  return sessions.reduce((sum, s) => sum + s.minutes, 0);
}

/**
 * Converts minutes into a friendly string like "2h 30min".
 */
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

/**
 * Groups sessions by subject and totals the minutes of each.
 * @returns {object} Example: { JavaScript: 120, Math: 45 }
 */
function minutesBySubject(sessions) {
  const result = {};
  for (const s of sessions) {
    result[s.subject] = (result[s.subject] || 0) + s.minutes;
  }
  return result;
}

/**
 * Returns the sessions sorted by date, newest first.
 */
function sortByDateDesc(sessions) {
  return [...sessions].sort((a, b) => b.date.localeCompare(a.date));
}

// Export for Node.js tests; in the browser "module" does not exist, so we skip it.
if (typeof module !== "undefined") {
  module.exports = {
    createSession, validateSession, addSession, removeSession,
    totalMinutes, formatDuration, minutesBySubject, sortByDateDesc,
  };
}
