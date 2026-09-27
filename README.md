# 🌱 EcoCollect - Smart Waste Collection & Recycling Platform

> **FIT-FEST 2026 HACKATHON Submission**  
> **Challenge:** Smart Waste Collection & Recycling Platform  
> **Candidate:** Om Pawar (`flora.education@gmail.com` | `+91 7045782996`)  
> **Deployment Target:** Google Cloud Run  

---

## 📌 1. Project Overview & Problem Statement

### 🌪️ The Real-World Problem
In modern urban communities, citizens often face severe friction in responsibly disposing of segregated waste (such as electronic waste, recyclable plastics, hazardous chemicals, and organic matter). Traditional garbage disposal often mixes recyclable materials together, leading to landfill fires, toxic groundwater leaching, and missed recycling opportunities. Meanwhile, municipal collection agencies and private recycling vendors struggle with disorganized pickup coordination, lack of route visibility, and no real-time transparency for residents.

### 💡 The EcoCollect Solution
**EcoCollect** is an end-to-end smart waste management operating system connecting environmentally conscious citizens with authorized collection agencies. It empowers users to schedule doorstep pickups for segregated waste streams, calculate their carbon savings and reward points in real time, and track their pickup vehicle live on a 5-stage dispatch pipeline. An integrated **Dispatcher Control Center** allows municipal administrators to manage logistics, allocate drivers, and export audit-ready CSV reports.

---

## 🚀 2. Key Features

| Feature | Description |
| :--- | :--- |
| ♻️ **Waste Category Selection** | 6 segregation categories (Plastics, Organic, E-Waste, Paper/Cardboard, Metal/Glass, Hazardous) with disposal rules and bin color coding. |
| 📍 **Geolocation & Address** | One-click GPS auto-detection + address, landmark, and pincode mapping for swift driver navigation. |
| 📅 **Smart Slot Scheduling** | Flexible date selection with 3 distinct daily pickup time windows (Morning, Afternoon, Evening). |
| 🔄 **Live 5-Stage Tracking Stepper** | Visual progression: `Submitted` ➔ `Assigned` ➔ `En Route` ➔ `Collected` ➔ `Recycled` with real-time audit log. |
| 👨‍💼 **Dispatcher & Admin Portal** | Real-time status advancement, driver and truck assignment, instant query search, and filtering by category or status. |
| 📊 **Impact & Carbon Analytics** | Live calculation of total kg diverted, greenhouse gas (CO₂ avoided), tree-year absorption equivalents, and eco-reward credits. |
| 📜 **Green Commendation Certificate** | Printable verified recycling certificate for citizens to celebrate their environmental contribution. |
| 📥 **One-Click CSV Export** | Instant download of municipal collection data for logistics planning and auditing. |

---

## 🛠️ 3. Technologies Used

- **Frontend:** Semantic HTML5, Vanilla JavaScript (ES6+), Glassmorphic CSS3 with CSS variables and responsive grid/flexbox layouts.
- **Backend:** Node.js Native HTTP Engine (zero third-party dependencies, instant startup time, negligible attack surface).
- **Architecture:** Lightweight RESTful API endpoints (`/api/requests`, `/api/categories`, `/api/stats`).
- **Containerization & Cloud:** Docker, Google Cloud Run (`node:20-alpine`).

---

## 💻 4. Local Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher) installed.

### Quick Start (No `npm install` needed!)
Since EcoCollect is engineered with zero bulky external dependencies, you can run it immediately:

```bash
# 1. Navigate to the project directory
cd "c:\Users\Mayur\OneDrive\Desktop\hackaton fit"

# 2. Start the application
node server.js
```

Open your browser and visit: **`http://localhost:8080`**

---

## 🌐 5. Google Cloud Run Deployment Guide

EcoCollect is pre-configured with a production-ready `Dockerfile` and dynamic port binding (`process.env.PORT || 8080`), making it 100% compliant with Google Cloud Run.

### Option A: 1-Command Deployment via Google Cloud CLI (`gcloud`)
```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# 3. Build and deploy directly to Cloud Run
gcloud run deploy ecocollect-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
Once deployed, Cloud Run will provide your live URL (e.g., `https://ecocollect-app-xxxxxx-uc.a.run.app`).

### Option B: Cloud Console / GitHub Integration
1. Push this repository to your GitHub account.
2. Open **Google Cloud Console** > **Cloud Run**.
3. Click **Create Service**.
4. Choose **Continuously deploy from a repository**.
5. Select your GitHub repository, choose branch `main`, and select **Dockerfile**.
6. Set port to `8080` and allow unauthenticated invocations.
7. Click **Create** to launch!

---

## 📡 6. REST API Reference

- `GET /api/categories` - Returns available waste categories, eco-points multipliers, and segregation guidelines.
- `GET /api/requests` - Fetch all pickup requests (supports `?status=`, `?category=`, and `?search=` filters).
- `POST /api/requests` - Submit a new citizen waste collection request.
- `GET /api/requests/:id` - Fetch live tracking status, driver details, and audit history for a specific request ID.
- `PATCH /api/requests/:id/status` - Dispatcher endpoint to assign drivers and transition pickup lifecycle status.
- `GET /api/stats` - Summary metrics for real-time impact dashboard (weights, CO₂, eco-points, category breakdown).
- `GET /health` - Health-check endpoint for Cloud Run container monitoring.

---

## 🏆 FIT-FEST 2026 Submission Credentials
- **Candidate Name:** Om Pawar
- **Registered Email:** flora.education@gmail.com
- **Contact:** +91 7045782996
- **Hackathon:** FIT-FEST 2026 HACKATHON
