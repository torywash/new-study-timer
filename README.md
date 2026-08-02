# Study Timer (NEW)

A study timing application for tracking focused study sessions, visualizing time spent, and capturing notes alongside each session. Updated version of the old `study-buddy` repo on my account.

# Features

- **Study session tracking** — start, stop, pause, and log study sessions over time
- **Timer + graph** — a running timer with a visual display and a graph of session history
- **Notes** — jot notes tied to a session or study topic

# Tech Stack
## Frontend
- `NEXT.js`, `Shadcn`, `Reicon`

## Backend
- `NEXT.js`


# Success Criteria

### UI/UX

- [ ] Timer state (running/paused/stopped) is visually obvious at a glance, with no ambiguity about whether a session is active
- [ ] Starting, pausing, and stopping a session takes no more than one click/tap from the main screen
- [ ] Timer display updates smoothly (at least once per second) with no visible lag or jitter
- [ ] Session history graph is readable and correctly reflects logged sessions (correct axis scale, labels, and time ranges)
- [ ] Notes area is easy to find and associate with the correct session/topic without extra navigation
- [ ] Layout is responsive and usable on both desktop and mobile-sized viewports
- [ ] App provides clear feedback for user actions (e.g. confirmation when a session is saved, warning before discarding unsaved notes)
- [ ] Meets basic accessibility standards: keyboard navigable, sufficient color contrast, screen-reader-friendly labels on timer controls

### Backend

- [ ] Study sessions persist reliably (start time, end time, duration, associated notes) across app restarts
- [ ] Timer logic is accurate — elapsed time matches wall-clock time within an acceptable margin of error, including after pause/resume
- [ ] Data model supports querying session history by date range for the graph view
- [ ] Notes are correctly associated with their session/topic and persist alongside session data
- [ ] Handles edge cases gracefully: app closed/crashed mid-session, system sleep/wake during an active timer, overlapping or back-to-back sessions
- [ ] API/data layer validates input (e.g. no negative durations, malformed timestamps) and fails predictably
- [ ] Performance remains stable as session history grows (no noticeable slowdown loading graph/history views)

### Testing

- [ ] Unit tests cover core timer logic (start/pause/resume/stop, elapsed time calculation, edge cases like rapid start/stop)
- [ ] Unit tests cover session data storage and retrieval, including notes association
- [ ] Integration tests verify a full session lifecycle: start session → pause/resume → stop → data appears correctly in history/graph
- [ ] Tests cover graph rendering logic against known sample data sets (correct aggregation and date bucketing)
- [ ] Edge cases are tested: zero-duration sessions, sessions spanning midnight/day boundaries, app restart mid-session
- [ ] Regression tests exist for any bug fixed during development
- [ ] Reasonable test coverage threshold is defined and enforced (e.g. via CI) before merging changes

