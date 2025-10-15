# Live video overlays

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ridhima-bhardwajs-projects/v0-live-video-overlays)
# 🎥 Live Video Overlays

Add and manage real-time text or logo overlays on live RTSP video streams.

---

## 🚀 Live Demo

- **Frontend (Next.js):** [https://v0-live-video-overlays.vercel.app](https://v0-live-video-overlays.vercel.app)  
- **Backend (Flask):** [https://tsp-overlay-backend.onrender.com](https://tsp-overlay-backend.onrender.com)  
- **GitHub Repository:** [https://github.com/Ridhima-bhardwaj/live-video-overlays](https://github.com/Ridhima-bhardwaj/live-video-overlays)

---

## 🧠 Overview

This project allows users to:
- Stream live video from any RTSP source.
- Add, position, and resize **custom overlays** (text or image) on top of the video.
- Manage overlays through full **CRUD APIs** (Create, Read, Update, Delete).

The backend (Flask) converts the RTSP stream into an HLS feed using **FFmpeg**,  
while the frontend (Next.js) plays it using a browser video player.

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | Next.js (React + TypeScript + Tailwind CSS) |
| Backend | Flask (Python 3) |
| Database | MongoDB Atlas |
| Streaming | FFmpeg (RTSP → HLS conversion) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## ⚙️ Architecture Flow

[RTSP Source] 
      ↓
[Flask Backend + FFmpeg] → Converts RTSP → HLS (.m3u8)
      ↓
[MongoDB Atlas] → Stores overlay data (CRUD)
      ↓
[Next.js Frontend] → Fetches overlays via API + renders video + overlays

---

## 🧪 Demo RTSP Stream

You can test with a public stream:
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov
```

---

## 🔧 Setup (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Ridhima-bhardwaj/live-video-overlays.git
cd live-video-overlays
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Runs on **http://localhost:3000**

### 3. Backend Setup
```bash
cd scripts/backend
pip install -r requirements.txt
python app.py
```
Backend runs on **http://localhost:5000**

---

## 🌐 Environment Variables

Create a `.env.local` file in the frontend root:

```bash
NEXT_PUBLIC_API_BASE=https://tsp-overlay-backend.onrender.com
NEXT_PUBLIC_HLS_BASE=https://tsp-overlay-backend.onrender.com/hls
```

Backend requires:

```bash
MONGO_URI=<your MongoDB Atlas URI>
FFMPEG_PATH=/usr/bin/ffmpeg  # optional, depends on your OS
```

---

## 🧠 Key Features

- 🎥 Play live video from any RTSP stream (converted to HLS)
- 🧱 Add text or logo overlays dynamically
- ✏️ Move, resize, and customize overlays
- 💾 CRUD API for overlays and settings
- ☁️ Deployed and production-ready

---

## 📚 Documentation

- [API Documentation → API_DOCS.md](./API_DOCS.md)
- In-app `/docs` route explains setup and usage.

---

## 📦 Deliverables Checklist

✅ Code Repository  
✅ API Documentation (CRUD + Stream)  
✅ User Guide (Setup + Usage)  
✅ Working Deployment Links (Frontend + Backend)  

---

## 👩‍💻 Author

**Ridhima Bhardwaj**  
Final Year B.Tech (CSE)  
Frontend & Full-Stack Developer  
[GitHub Profile](https://github.com/Ridhima-bhardwaj)

---
