# FocusTube

A distraction-free YouTube playlist progress tracker designed for learners who frequently lose focus after opening YouTube.

## Problem Statement

Many learners open YouTube with a specific goal:

* Continue a playlist
* Finish a course
* Watch a tutorial
* Complete a learning roadmap

However, once YouTube opens, recommendations, Shorts, trending videos, and notifications often divert attention away from the original learning objective.

FocusTube acts as a dedicated learning dashboard where users can:

* Track playlist progress
* Monitor completed videos
* Set daily goals
* Visualize learning statistics
* Stay focused on educational content

---

## Features

### Playlist Management

* Add unlimited playlists
* Store playlist URL
* Track total number of videos
* Add playlist descriptions
* Delete playlists when completed

### Progress Tracking

Two tracking modes are available:

#### Count-Based Tracking

Quickly record:

```text
Videos Watched = X
Total Videos = Y
```

Useful for large playlists.

#### Video-Level Tracking

Track individual videos:

* Add video titles
* Mark videos as watched
* Remove videos
* Mark progress up to a specific video

---

### Daily Goals

Create daily learning goals such as:

* Finish 2 React videos
* Complete one Java assignment
* Watch Database lecture

Features:

* Add goals
* Mark goals completed
* Delete goals
* Daily completion tracking

---

### Statistics Dashboard

Automatically calculates:

* Total playlists
* Total videos
* Watched videos
* Remaining videos
* Completed playlists

---

### Progress Visualization

Interactive charts built with Recharts.

Displays:

* Watched videos
* Remaining videos
* Playlist-wise completion percentages

---

### Responsive Design

Works on:

* Desktop
* Laptop
* Tablet
* Mobile Browser

---

## Technology Stack

### Frontend

* React
* JavaScript (ES6+)

### UI

* Custom CSS
* Flexbox
* CSS Grid
* Responsive Layouts

### Data Visualization

* Recharts

### State Management

* React Hooks

  * useState
  * useEffect

### Persistence

Current implementation uses:

```javascript
window.storage
```

Recommended migration:

```javascript
localStorage
```

or

```javascript
IndexedDB
```

---

## Project Structure (Recommended)

```text
src/
│
├── app/
│   └── App.jsx
│
├── components/
│   ├── Header/
│   ├── Goals/
│   ├── Playlists/
│   ├── Charts/
│   ├── Stats/
│   └── Common/
│
├── hooks/
│   ├── usePlaylists.js
│   ├── useGoals.js
│   └── useStorage.js
│
├── reducers/
│   ├── playlistReducer.js
│   └── goalReducer.js
│
├── services/
│   ├── storageService.js
│   └── youtubeService.js
│
├── utils/
│   ├── date.js
│   ├── constants.js
│   └── progress.js
│
└── main.jsx
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd focustube
```

### Install Dependencies

```bash
npm install
```

### Install Recharts

```bash
npm install recharts
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## How It Works

### Create a Playlist

Enter:

* Playlist Name
* Playlist URL
* Total Videos
* Description (optional)

### Track Progress

Choose one:

#### Method 1

Update watched count directly.

Example:

```text
Watched: 12
Total: 50
```

#### Method 2

Add individual video titles.

Example:

```text
✓ Introduction
✓ Variables
✓ Functions
□ React Hooks
□ Context API
```

---

### Set Daily Goals

Example:

```text
□ Complete React Hooks
□ Solve 3 DSA Problems
□ Revise DBMS Unit 2
```

Track completion throughout the day.

---

## Current Limitations

* No user authentication
* No cloud synchronization
* No automatic YouTube playlist import
* No streak system
* No session tracking
* No browser extension support

---

## Future Roadmap

### Phase 1

* Learning streaks
* Weekly reports
* Better analytics
* Search and filter playlists

### Phase 2

* YouTube Data API integration
* Automatic playlist import
* Video metadata fetching
* Thumbnail support

### Phase 3

* Firebase/Supabase backend
* User accounts
* Multi-device synchronization
* Cloud backups

### Phase 4

* Chrome Extension
* Recommendation blocker
* Learning mode
* Distraction-free YouTube experience

### Phase 5

* Android App
* iOS App
* Progressive Web App (PWA)

---

## Potential Use Cases

* College students
* Competitive exam preparation
* Programming courses
* Online certifications
* Self-paced learning
* Skill development roadmaps

---

## Why FocusTube?

FocusTube separates learning progress from YouTube itself.

Instead of relying on memory, learners get:

* Clear progress tracking
* Daily accountability
* Visual motivation
* Structured learning workflows

The goal is simple:

**Open YouTube with a purpose. Leave with progress.**

---

## License

MIT License

Feel free to modify, distribute, and improve the project.
