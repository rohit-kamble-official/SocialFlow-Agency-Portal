
## Overview

SocialFlow Agency Portal is a frontend-based dashboard application designed to streamline social media agency operations. It brings client management, content planning, approval workflows, and publishing schedules together into one clean, organized interface.

Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

## Features

### Authentication & Session Management
- Frontend login system with predefined user accounts
- Session persistence via `localStorage` — stay logged in across page reloads
- Registered users: **Tejas Sakore**, **Rohit Kamble**, **Ravi D.**, **Arjun M.**

### Dashboard
- Centralized overview of all client activity
- Content pipeline stats and workflow status at a glance
- Sidebar navigation with one-click client switching

### Content Management
- Create, edit, delete, and search posts
- Filter content by workflow status:

| Status | Description |
|--------|-------------|
| `Published` | Live and publicly visible |
| `Scheduled` | Queued for automated publishing |
| `Approved` | Cleared by stakeholders |
| `Not Approved` | Requires revision |
| `Not Started` | Not yet drafted |
| `Copy Approved` | Written copy cleared |
| `Copy Not Approved` | Copy requires revision |

### Client Management
- Multi-client support with dedicated content pipelines per client
- Instant context switching from the sidebar — no page reloads

### Content Calendar
- Month-view calendar for scheduling visibility
- Identify publishing gaps across concurrent campaigns

### Approval Workflow
- Track copy and creative approvals independently
- Notification badges for pending review actions
- Mark-all-as-read functionality

### Theme Support
- Full light/dark mode toggle
- Theme preference persisted in `localStorage`
- Dynamic logo switching based on active theme

### Search & Filtering
- Real-time search across posts and clients as you type
- Dynamic filtering without page navigation

---

## Project Structure

```
SocialFlow-Agency-Portal/
│
├── index.html           # Root layout — sidebar, dashboard, modals, login
├── styles.css           # Theming, responsive design, animations
├── app.js               # State management, rendering, event handling
├── data.js              # Mock client data and initial seed records
├── LOGO FOR Light.png   # Light-mode logotype
└── logo (1).png         # Dark-mode logotype
```

### Application State

```javascript
let state = {
  view:             'dashboard',  // Active section
  client:           'goviral',    // Selected client
  sidebarCollapsed: false,        // Sidebar toggle
  expandedPost:     null,         // Open post reference
  filterStatus:     'all',        // Content filter
  searchOpen:       false,        // Search panel
  currentUser:      null,         // Auth session
};
```

---

## Getting Started

No build tools or dependencies required.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/socialflow-agency-portal.git

# 2. Open in your browser
open index.html
```

Or simply drag `index.html` into any modern browser.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure and layout |
| CSS3 | Responsive design, theming, animations |
| JavaScript (ES6+) | Application logic, DOM, state management |
| LocalStorage API | Session and preference persistence |

---

## Known Limitations

This project is currently a **frontend prototype**. Before any production use, the following must be addressed:

> **Security:** The shared password is currently hardcoded in `app.js`. This is not safe for production — credentials must be moved server-side and properly encrypted.

- No backend server or REST API
- Data is stored in `localStorage` — device-specific, not shared between users
- No real-time synchronization between sessions
- No role-based access control

---

## Roadmap

### High Priority
- [ ] Backend integration (Node.js + Express or Firebase)
- [ ] Secure authentication (JWT / OAuth)
- [ ] Database integration (PostgreSQL or Firestore)
- [ ] Move credentials to server-side environment variables

### Medium Priority
- [ ] Migrate to React for component-based architecture
- [ ] Separate API service layer
- [ ] Unit and integration testing

### Future Enhancements
- [ ] Real-time collaboration via WebSockets
- [ ] Role-based access control (Admin, Editor, Viewer)
- [ ] Cloud deployment (Vercel + Render)
- [ ] Analytics and reporting module

---

## Use Cases

This project is well-suited for:

- Frontend portfolio showcase
- Internship and entry-level job applications
- UI/UX design demonstrations
- Social media agency dashboard prototypes
- JavaScript learning projects

---

## Author

Developed as a social media agency workflow management solution for efficient content operations and dashboard-based client management.

