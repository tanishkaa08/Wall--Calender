# Calendar-final

A wall-calendar style web application built with React and Vite. The interface presents a monthly calendar as a paper page on a textured wall, with a side panel for tasks, weather, and a small mascot.

The runnable application lives in the `my-react-app` directory.

## Features

### Calendar and navigation

- **Month view** with a Monday-first week grid, padded leading and trailing days from adjacent months, and clear styling for in-month versus out-of-month cells.
- **Navigate months** using previous/next controls (adjacent month names), **horizontal drag** on the calendar page (swipe threshold changes month), and **keyboard shortcuts** (Left/Right arrow keys; ignored while focus is in an input or textarea).
- **Jump to today** when the viewed month is not the current month.
- **Year picker** opened from the year next to the month title; choose from a small range centered on the current year.
- **Mini month navigator** (J F M …) at the bottom of the page for quick jumps between months in the same year, with visual emphasis on the active month and a ring on the current month when viewing that year.
- **Page-flip style animation** when changing months, with direction-aware motion (Framer Motion).
- **Optional paper-turn sound** when changing month or year via navigation (Web Audio API).

### Visual design and themes

- **Wall scene** with background texture, optional nail-and-string decoration on large screens, and a paper card aesthetic (shadows, spiral binding graphic, corner fold).
- **Per-month hero image** from curated seasonal photography; each month has its own **accent colors**, **season** (for subtle ambient particles: snow, petals, fireflies, leaves), and an **inspirational quote** in the data layer.
- **Custom hero image per calendar month**: upload a photo from the calendar header; images are scaled and compressed client-side before storage. Clear control restores the default month image.
- **Light and dark themes** toggled from a fixed control; preference is persisted in local storage and applied via `data-theme` on the document root.
- **Typography** using Google Fonts (Cormorant Garamond, Outfit, Caveat) for headings, UI, and handwritten-style note text.

### Date selection and tasks

- **Range selection**: click a start date, then a second date to define an inclusive range. Clicking the same start date again clears the selection. If the second click is before the first, the range is normalized.
- **Visual selection** on the grid: start, end, and in-between states, including rounded row edges when a range spans multiple weeks.
- **Today** highlighted on the grid when it falls in the visible month.
- **Selected range day count** shown as a small badge on the calendar chrome.
- **Task creation** opens when a full range is selected: enter text and choose one of four **Eisenhower-style priorities** (Urgent/Important matrix: UI, UU, NI, NN). Save attaches the task to that date range; cancel clears the range selection.
- **Sticky note list** for the current month: each saved task appears as a note with priority label, date span, lined note styling, pushpin decoration, slight rotation variation, and **delete** on hover.
- **Mascot character** beside the calendar whose **mood** reflects context (for example resting when there are no month tasks, writing when creating a task, otherwise a ready/helpful state).

### Holidays and tooltips

- **Indian public and festival dates** for **2025, 2026, and 2027** (Republic Day, Independence Day, major religious and cultural observances, etc.) keyed by `yyyy-MM-dd`.
- **Holiday indicators** on in-month days: accent underline, dot, and optional background tint when the day is not selected and not today.
- **Hover tooltip** showing the holiday name for that date.

### Weather

- When a **date range is selected**, a **weather forecast panel** can appear for that span (Open-Meteo API, fixed default location **Delhi, India**, Asia/Kolkata timezone).
- Shows per-day **condition** (WMO weather code mapped to labels and icons), **high/low temperatures**, and **max wind** where the API provides values.
- Loading and error handling; the widget hides when there is no usable data.

### Data persistence

- **localStorage** under a single store key: sticky/task notes, optional per-month custom hero images, and dark mode flag.
- Notes include **id**, **start and end dates** (`yyyy-MM-dd`), **text**, **priority**, and **createdAt** timestamp.

### Repository extras

- The `my-react-app/src/components/calendar/notesPanel.tsx` module implements an alternate **notes panel** UI (tabs, per-date notes, add/delete flows). It is **not** wired into the default `App` entry; the primary experience uses the wall scene, range tasks, and sticky notes described above.

## Tech stack

- React 19, Vite 8
- TypeScript / TSX for calendar components
- Tailwind CSS (v4) with the Vite plugin
- date-fns for dates and ranges
- Framer Motion for layout and page transitions
- Lucide React for icons

## Getting started

Prerequisites: **Node.js** (current LTS recommended) and **npm**.

```bash
cd my-react-app
npm install
npm run dev
```

Open the URL printed in the terminal (Vite defaults to `http://localhost:5173/`; another port is used if 5173 is busy).

### Other scripts

- `npm run build` – production build to `my-react-app/dist`
- `npm run preview` – serve the production build locally

## Project layout (high level)

- `my-react-app/index.html` – HTML shell; mount point `id="root"`
- `my-react-app/index.jsx` – React entry
- `my-react-app/App.jsx` – Renders the main wall scene
- `my-react-app/src/components/calendar/` – Calendar UI (wall scene, paper, grid, notes, weather, mascot, etc.)
- `my-react-app/src/data/calendarData.ts` – Month images, themes, holidays, priorities
- `my-react-app/src/hooks/useCalendarStore.ts` – Local persistence and note CRUD helpers

## External services

- **Open-Meteo** (`api.open-meteo.com`) for forecast JSON (no API key in this project; subject to their terms and availability).
- **Unsplash** URLs in `calendarData` for default month hero images (network access required for those assets unless cached by the browser).

## Accessibility and testing

- Various controls expose `aria-label` / `data-testid` attributes to support automation and screen reader hints where implemented.
