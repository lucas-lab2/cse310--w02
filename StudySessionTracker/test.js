// test.js - simple tests for tracker.js. Run with: node test.js
const t = require("./tracker");
const assert = require("assert");

// Build some sample data
let list = [];
list = t.addSession(list, t.createSession("JavaScript", 90, "2026-11-01"));
list = t.addSession(list, t.createSession("Math", 30, "2026-11-03"));
list = t.addSession(list, t.createSession("JavaScript", 60, "2026-11-02"));

assert.strictEqual(t.totalMinutes(list), 180);
assert.strictEqual(t.formatDuration(150), "2h 30min");
assert.deepStrictEqual(t.minutesBySubject(list), { JavaScript: 150, Math: 30 });
assert.strictEqual(t.sortByDateDesc(list)[0].date, "2026-11-03");
assert.strictEqual(t.removeSession(list, list[0].id).length, 2);
assert.ok(t.validateSession("", 10, "2026-11-01"));      // empty subject -> error
assert.strictEqual(t.validateSession("A", 10, "2026-11-01"), null); // valid -> null

console.log("All tests passed!");
