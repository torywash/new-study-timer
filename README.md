# Study Timer (NEW)

A study timing application for tracking focused study sessions, visualizing time spent, and capturing notes alongside each session. Updated version of the old `study-buddy` repo on my account.

# Features

### General Features

- **Study session tracking** — start, stop, pause, and log study sessions over time
- **Timer + graph** — a running timer with a visual display and a graph of session history
- **Notes** — jot notes tied to a session or study topic

### Productivity techniques

- **Interval/Pomodoro mode** — configurable work/break cycles that auto-advance the timer
- **Focus mode** — distraction-free timer view that silences notifications
- **Session presets** — one-tap templates (e.g. 25/5 Pomodoro, 90/15 deep work) alongside fully custom durations
- **Ambient sound presets** — optional background audio (white noise, lo-fi, rain) with volume control
- **Task linking** — attach a to-do item to a session and mark it complete when the session ends

###  Motivation & gamification

- **Streaks** — track consecutive days with at least one logged session
- **Goals** — set target hours per day/week, per category or overall, with progress toward the goal
- **Achievements/badges** — milestone rewards (first session, 7-day streak, 100 hours logged)
- **Contribution-style heatmap** — GitHub-style calendar heatmap visualizing session frequency/intensity over time
- **Points/levels** — lightweight leveling system tied to accumulated focused time

### Integrations & sync

- **Calendar sync** — reflect planned or completed sessions as events in Google Calendar
- **Cloud sync** — persist sessions across devices instead of local-only storage
- **Export/import** — download session history as CSV/JSON for backup or external analysis
- **Reminders/notifications** — browser or desktop notifications for scheduled sessions or streak upkeep
- **Flexible categories/tags** — generalize "study subject" into freeform categories so the timer works for work, exercise, or other focus sessions, not just studying

# Tech Stack
### Frontend
- `NEXT.js`, `Shadcn`, `Reicon`

### Backend
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

# Contributing

- Work happens on feature branches; open a pull request into `main` rather than committing directly.
- A repository ruleset on `main` blocks direct pushes and force-pushes, and automatically requests a **GitHub Copilot code review** on every pull request — wait for that feedback and address it before merging.
- Merge once the PR is in good shape; `merge`, `squash`, and `rebase` are all allowed.
