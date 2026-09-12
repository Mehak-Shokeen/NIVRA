# Nivra

### Civic Issue Management Platform

Nivra is a full-stack civic issue management platform that connects citizens with authorities and field workers to report, track, assign and resolve community issues.

Citizens can report issues such as potholes, broken streetlights, garbage accumulation and water leakage, while authorities can verify and assign issues to workers and monitor resolution through analytics.

---

## 🚀 Live Demo

**Frontend:** https://nivra-two.vercel.app

**Backend:** https://nivra-backend-uh16.onrender.com

> The backend is hosted on Render's free tier and may take a short time to wake up after inactivity.

---

## ✨ Features

### 👤 Role-Based Access

Nivra supports four user roles:

- **Citizen** – Report and track civic issues
- **Worker** – View assigned issues and update their progress
- **Authority** – Verify issues, assign workers and monitor platform activity
- **Admin** – Manage users, roles and platform-level analytics

### 📍 Location-Based Issue Reporting

Citizens can submit issues with:

- Title
- Description
- Category
- Priority
- Location
- Image
- Additional details

Issues are displayed on an interactive map using Leaflet.

### 🗺️ Geospatial Duplicate Detection

Nivra uses **PostGIS** to perform location-based queries.

When a citizen reports an issue, the system can check for an existing open issue:

- Within a configurable geographic radius
- Matching the same issue category

This helps prevent multiple reports of the same physical problem.

### 🔄 Issue Lifecycle

Issues follow a structured workflow:

```text
NEW
 ↓
VERIFIED
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
RESOLVED
```

Every status change is tracked through issue status history.

### 👷 Worker Assignment

Authorities can assign verified issues to workers.

Workers can then view their assigned issues and update their progress.

### 💬 Comments & Notifications

The platform provides:

- Issue comments
- Worker assignment notifications
- Status update notifications
- Read/unread notification management

### 📊 Analytics Dashboard

Authorities and administrators can monitor:

- Total issues
- New issues
- Active issues
- Resolved issues
- Resolution rate
- Issues by category
- Issues by priority
- Issues by status
- Worker workload
- Resolution trends
- Geographic hotspots
- Average resolution time

### ⚡ Redis Caching & Rate Limiting

Redis is used to improve backend performance through:

- API response caching
- Cache invalidation after issue updates
- Request rate limiting

### 🖼️ Image Uploads

Issue images are uploaded and stored using **Cloudinary** rather than storing image files directly inside the application server.

### 🔐 Authentication & Security

Nivra uses:

- Spring Security
- JWT authentication
- Role-based authorization
- Password hashing
- Protected REST endpoints
- API rate limiting
- Input validation

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       Citizen       │
                    │       Worker        │
                    │      Authority      │
                    │        Admin        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React + Vite      │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │  Spring Security    │
                    │  JWT Authentication │
                    │  Business Logic     │
                    │  REST Controllers   │
                    └──────┬───────┬──────┘
                           │       │
              ┌────────────┘       └─────────────┐
              ▼                                  ▼
    ┌──────────────────┐              ┌──────────────────┐
    │ PostgreSQL       │              │ Redis            │
    │ + PostGIS        │              │                  │
    │                  │              │ Cache            │
    │ Users            │              │ Rate Limiting    │
    │ Issues           │              └──────────────────┘
    │ Comments         │
    │ Notifications    │
    │ Status History   │
    └──────────────────┘

                    ┌──────────────────┐
                    │    Cloudinary    │
                    │  Issue Images    │
                    └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Leaflet
- React Leaflet

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT

### Database

- PostgreSQL
- PostGIS

### Performance

- Redis
- Spring Cache

### Storage

- Cloudinary

### DevOps & Deployment

- Docker
- Docker Compose
- Git
- GitHub
- Render
- Vercel
- Supabase

---

## 📁 Project Structure

```text
NIVRA/
│
├── src/
│   └── main/
│       └── java/
│           └── com/nivra/nivra/
│               │
│               ├── config/
│               ├── controller/
│               ├── dto/
│               ├── entity/
│               ├── exception/
│               ├── repository/
│               ├── security/
│               ├── service/
│               └── specification/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── README.md
```

---

## 🔌 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Issues

```text
GET    /api/issues
GET    /api/issues/{id}
POST   /api/issues
PUT    /api/issues/{id}
DELETE /api/issues/{id}

GET    /api/issues/my
GET    /api/issues/assigned

PATCH  /api/issues/{id}/status
PATCH  /api/issues/{id}/assign
```

### Geospatial

```text
GET /api/issues/nearby
GET /api/issues/check-duplicate
```

### Comments

```text
GET  /api/issues/{issueId}/comments
POST /api/issues/{issueId}/comments
```

### Notifications

```text
GET   /api/notifications
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
```

### Analytics

```text
GET /api/analytics
```

### Administration

```text
GET   /api/admin/summary
GET   /api/admin/users
PATCH /api/admin/users/{id}/role
```

---

## 🐳 Running Locally with Docker

### Prerequisites

- Docker Desktop
- Git

Clone the repository:

```bash
git clone https://github.com/Mehak-Shokeen/NIVRA.git
cd NIVRA
```

Create a `.env` file in the project root:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_database_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then start the application:

```bash
docker compose up --build
```

The application will be available at:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8080
```

---

## 🗄️ Database

Nivra uses PostgreSQL with the PostGIS extension for spatial queries.

The application stores:

- Users
- Issues
- Issue status history
- Comments
- Notifications
- Worker assignments

PostGIS enables geographic operations such as:

- Nearby issue searches
- Location-based duplicate detection
- Geographic hotspot analysis

---

## 🔐 Environment Variables

The application expects the following environment variables:

```env
DB_USERNAME=
DB_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For the frontend:

```env
VITE_API_URL=
```

Never commit secrets or `.env` files to Git.

---

## 🌐 Deployment

Nivra is deployed using:

```text
GitHub
   │
   ├──► Render
   │      └── Spring Boot Backend
   │
   └──► Vercel
          └── React Frontend

Supabase
   └── PostgreSQL + PostGIS

Render Key Value
   └── Redis-compatible cache

Cloudinary
   └── Image storage
```

---

## 🔮 Future Improvements

Potential future improvements include:

- Real-time notifications using WebSockets
- Automated issue prioritization
- Image-based issue classification
- Advanced geographic clustering
- CI/CD with GitHub Actions
- Monitoring with Prometheus and Grafana
- Mobile application for field workers

---

## 👩‍💻 Author

**Mehak Shokeen**

Built as a full-stack project focused on backend engineering, geospatial data processing, authentication, caching and production deployment.
