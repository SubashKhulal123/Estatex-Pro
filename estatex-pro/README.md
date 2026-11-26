# EstateX Pro — Premium Real Estate Platform

A production-grade MERN stack real estate platform with enterprise RBAC, advanced search, booking system, and stunning UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## ⚙️ Backend Setup

```bash
cd backend
npm install

# Copy env and configure
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, etc.

# Seed the database (creates users & sample properties)
npm run seed

# Start development server
npm run dev
# → API runs on http://localhost:5000
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install

# Start dev server
npm run dev
# → App runs on http://localhost:5173
```

---

## 🔑 Default Login Credentials

| Role        | Email                        | Password   |
|-------------|------------------------------|------------|
| Super Admin | superadmin@estatex.com       | Admin@123  |
| Admin       | admin@estatex.com            | Admin@123  |
| Agent       | agent@estatex.com            | Admin@123  |
| Customer    | customer@estatex.com         | Admin@123  |

---

## 🗂️ Project Structure

```
estatex-pro/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── uploads/         # Uploaded files
│   ├── utils/           # Seed script
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/       # ProtectedRoute
        │   ├── layout/       # Navbar, Sidebar, DashboardLayout
        │   └── properties/   # PropertyCard
        ├── context/          # AuthContext
        ├── pages/
        │   ├── admin/        # Admin dashboard pages
        │   ├── agent/        # Agent dashboard pages
        │   ├── auth/         # Login, Register
        │   ├── customer/     # Customer dashboard pages
        │   └── properties/   # Browse, Detail
        ├── services/         # API calls (axios)
        └── utils/            # Helpers, formatters
```

---

## 🔐 RBAC Roles & Permissions

| Role             | Can Do                                                        |
|------------------|---------------------------------------------------------------|
| Super Admin      | Full platform access, delete users                           |
| Admin            | Manage properties/users/bookings, view analytics             |
| Agent            | Create/edit own listings, manage visit requests              |
| Property Manager | Manage assigned properties, handle visits                    |
| Customer         | Browse, save properties, book visits, manage profile         |

---

## 🌐 API Reference

### Auth
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/auth/register    | Public  |
| POST   | /api/auth/login       | Public  |
| GET    | /api/auth/me          | Auth    |
| PUT    | /api/auth/profile     | Auth    |
| PUT    | /api/auth/change-password | Auth |

### Properties
| Method | Endpoint                    | Access         |
|--------|-----------------------------|----------------|
| GET    | /api/properties             | Public         |
| GET    | /api/properties/:id         | Public         |
| POST   | /api/properties             | Agent+         |
| PUT    | /api/properties/:id         | Owner/Admin    |
| DELETE | /api/properties/:id         | Owner/Admin    |
| POST   | /api/properties/:id/save    | Auth           |
| GET    | /api/properties/my-listings | Agent+         |
| GET    | /api/properties/analytics   | Agent+         |

### Bookings
| Method | Endpoint                     | Access     |
|--------|------------------------------|------------|
| GET    | /api/bookings                | Admin      |
| POST   | /api/bookings                | Customer   |
| GET    | /api/bookings/my-bookings    | Auth       |
| GET    | /api/bookings/agent-requests | Agent+     |
| PUT    | /api/bookings/:id/status     | Agent+     |
| PUT    | /api/bookings/:id/cancel     | Customer   |

### Users
| Method | Endpoint                          | Access     |
|--------|-----------------------------------|------------|
| GET    | /api/users                        | Admin      |
| POST   | /api/users                        | Admin      |
| PUT    | /api/users/:id                    | Admin      |
| DELETE | /api/users/:id                    | Super Admin|
| GET    | /api/users/analytics/platform     | Admin      |
| GET    | /api/users/notifications          | Auth       |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Query, Chart.js, React Icons, React Hot Toast

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Helmet, Morgan, CORS

---

## 🎯 Features

- ✅ Stunning Landing Page with hero search
- ✅ Advanced property search with filters & sorting
- ✅ Role-based dashboards (Admin / Agent / Customer)
- ✅ Complete CRUD for properties with image upload
- ✅ Booking system with approval workflow
- ✅ Analytics charts (Bar, Line, Doughnut)
- ✅ User management with RBAC
- ✅ Toast notifications
- ✅ Skeleton loading states
- ✅ Responsive mobile-first design
- ✅ Glassmorphism dark theme
- ✅ JWT authentication
- ✅ Profile management with avatar upload

---

## 🌍 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/estatex_pro
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
```
