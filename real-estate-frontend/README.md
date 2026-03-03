# Real Estate Frontend — React + Vite + Tailwind CSS

## Tech Stack
- **React 18** with React Router DOM v6
- **Vite** (fast dev server + build)
- **Tailwind CSS** (utility-first styling)
- **React Hook Form** (form handling + validation)
- **Axios** (HTTP client with interceptors)
- **React Hot Toast** (notifications)
- **Lucide React** (icons)
- **DM Sans + Sora** (Google Fonts)

## Setup

### 1. Install dependencies
```bash
cd real-estate-frontend
npm install
```

### 2. Start development server
```bash
npm run dev
```
Opens at: **http://localhost:5173**

> **Note:** The Vite proxy forwards `/api` requests to `http://localhost:8080` — make sure your Spring Boot backend is running first.

### 3. Build for production
```bash
npm run build
```

---

## Project Structure
```
src/
├── api/
│   ├── axios.js          # Axios instance with interceptors
│   └── services.js       # API service functions per module
├── components/
│   ├── common/index.jsx  # Reusable UI (Modal, Badge, Table, etc.)
│   └── layout/
│       ├── AppLayout.jsx # Main layout with sidebar
│       └── Sidebar.jsx   # Navigation sidebar
├── context/
│   └── AuthContext.jsx   # JWT auth state management
└── pages/
    ├── auth/             # Login, Register
    ├── DashboardPage.jsx # Stats + recent activity
    ├── properties/       # Property CRUD
    ├── deals/            # Deal CRUD
    ├── visits/           # Visit scheduling CRUD
    ├── documents/        # Document management CRUD
    ├── profits/          # Profit tracking CRUD
    └── users/            # User management (ADMIN only)
```

---

## Features

### Authentication
- JWT-based login / register
- Token stored in localStorage
- Auto-redirect on 401 (token expired)
- Role-based route guards

### All 7 Modules with Full CRUD
| Module | Create | Read | Update | Delete |
|---|---|---|---|---|
| Properties | ✅ | ✅ | ✅ | ✅ |
| Deals | ✅ | ✅ | ✅ | ✅ |
| Visits | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ |
| Profits | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ |

### Validations (React Hook Form)
- Required field checks
- Email format validation
- Phone number (10 digits)
- Numeric range checks (price > 0, commission 0–100%)
- Future-date validation for visits
- Password min 6 chars
- Confirm password match
- Real-time error messages under fields

### Role-Based UI
- Sidebar shows only relevant links per role
- Pages protect routes by role
- Action buttons (add/edit/delete) hidden based on role

### UX Features
- Live profit calculator (commission + net profit preview)
- Search + filter on all list pages
- Toast notifications for all actions
- Confirm dialog before delete
- Loading spinners
- Empty state illustrations
- Responsive table with horizontal scroll
```
