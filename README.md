# 🌾 GramSeva — ग्राम पंचायत शिकायत निवारण एवं ई-शासन पोर्टल

> **Indian Village Governance & Grievance Web Application**  
> Built for rural citizens and Gram Panchayat administration.

---

## 🗂️ Project Structure

```
VILLAEGE-WEB/
├── backend/        # Node.js + Express + MongoDB REST API
└── frontend/       # React 18 + Vite + Tailwind CSS (Hindi UI)
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, Vite 5, Tailwind CSS 3, React Router v6      |
| Backend    | Node.js 18+, Express 4, Mongoose 8                     |
| Database   | MongoDB                                                 |
| Auth       | JWT (7-day tokens), bcryptjs                           |
| File Upload| Multer + Cloudinary (multer-storage-cloudinary)         |
| UI Icons   | Lucide React                                            |
| Toasts     | React Hot Toast                                         |
| Font       | Noto Sans Devanagari (Google Fonts)                    |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for photo uploads — free tier works)

### 1. Clone & Configure Backend

```bash
cd backend

# Copy and fill environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gramseva
JWT_SECRET=your_super_secret_key_change_this
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

```bash
npm install

# Seed default admin and village directory
npm run seed:admin       # Creates: username=sarpanch, password=Sarpanch@123
npm run seed:directory   # Seeds 6 village contacts

# Start dev server (port 5000)
npm run dev
```

### 2. Configure & Start Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

---

## 🔑 Default Admin Credentials

| Field    | Value         |
|----------|---------------|
| Username | `sarpanch`    |
| Password | `Sarpanch@123`|
| URL      | `/admin/login`|

> ⚠️ **Change the password** after first login in production.

---

## 📡 API Endpoints

### Public Routes (No Auth Required)

| Method | Endpoint                            | Description                                  |
|--------|-------------------------------------|----------------------------------------------|
| POST   | `/api/complaints`                   | Submit grievance (multipart/form-data)       |
| GET    | `/api/complaints/track/:identifier` | Track by Tracking ID or phone number         |
| GET    | `/api/notices`                      | Get latest 5 active notices                  |
| GET    | `/api/directory`                    | Get all village contacts                     |
| GET    | `/api/health`                       | Health check                                 |

### Admin Routes (JWT Bearer Token Required)

| Method | Endpoint                            | Description                                  |
|--------|-------------------------------------|----------------------------------------------|
| POST   | `/api/admin/login`                  | Login and get JWT token                      |
| GET    | `/api/admin/complaints`             | Paginated complaints (filter by status/ward) |
| PATCH  | `/api/admin/complaints/:id/status`  | Update status + admin remarks                |
| GET    | `/api/admin/stats`                  | Dashboard KPI counts                         |
| POST   | `/api/notices`                      | Publish a new notice                         |
| DELETE | `/api/notices/:id`                  | Archive/delete a notice                      |

---

## 🎨 Frontend Pages & Features

### Citizen Portal (`/`)
- **नोटिस बोर्ड** — Latest Panchayat announcements with WhatsApp share
- **शिकायत दर्ज करें** — Frictionless complaint form (no login required)
  - Ward pills (1–15), category cards with emoji, photo upload
  - Returns `GR-XXXX` tracking ID with WhatsApp save button
- **स्थिति ट्रैकर** — 4-step visual stepper, search by ID or phone
- **संपर्क सूची** — Emergency contacts with one-tap `tel:` call buttons

### Admin Dashboard (`/admin/dashboard`)
- **KPI Cards** — Total / Pending / In Progress / Resolved counts
- **Complaints Table** — Filter by status & ward, image lightbox, direct call button, inline status + remarks update
- **Notices Tab** — Publish and manage village announcements

---

## 🗄️ Database Models

| Model       | Key Fields                                                          |
|-------------|---------------------------------------------------------------------|
| `Complaint` | trackingId (GR-XXXX), citizenName, phone, wardNumber, category, imageUrl, status, adminRemarks |
| `Notice`    | title, description, category, isActive                             |
| `Directory` | name, role, phone, department, priority                            |
| `Admin`     | username, password (bcrypt), role                                  |

---

## 🏗️ Architecture

```
                    ┌─────────────────────┐
                    │   React Frontend     │
                    │  (Vite, port 5173)   │
                    └────────┬────────────┘
                             │  /api/* (proxied in dev)
                    ┌────────▼────────────┐
                    │   Express Backend    │
                    │   (port 5000)        │
                    └──────┬──────┬───────┘
                           │      │
              ┌────────────▼─┐  ┌─▼──────────┐
              │   MongoDB    │  │  Cloudinary │
              │  (gramseva)  │  │  (images)   │
              └──────────────┘  └─────────────┘
```

---

## 📱 Mobile-First Design

- All touch targets ≥ 48px height
- Full-screen modals on mobile
- Horizontal scroll tables on small screens
- Noto Sans Devanagari for crisp Hindi rendering
- WhatsApp deep links for rural share-ability

---

## 🌐 Deployment Notes

For production deployment:
1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `npm run build` in `frontend/`
3. Serve `frontend/dist/` via Express static or a CDN
4. Use MongoDB Atlas for cloud database
5. Set real Cloudinary credentials
6. Use a strong random `JWT_SECRET`

---

*GramSeva — डिजिटल इंडिया की ओर एक कदम | A step towards Digital India*
