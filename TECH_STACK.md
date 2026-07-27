# TaskPulse - Tech Stack & Architecture

## **Project Overview**

TaskPulse is a full-stack task management and gamification platform that motivates users to complete habits and tasks by integrating AI-powered verification and fraud detection. Users submit task completions, take AI-generated quizzes to verify authenticity, receive rewards, and build streaks.

---

## **Technology Stack**

### **Backend**
- **Framework:** FastAPI (Python web framework for building REST APIs)
- **Runtime:** Python 3.11+
- **Database:** SQLAlchemy ORM (supports PostgreSQL, SQLite)
- **Data Validation:** Pydantic v2
- **Server:** Uvicorn (ASGI server)
- **Containerization:** Docker

### **Frontend**
- **Framework:** React 18
- **Build Tool:** Vite (modern bundler)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React

### **AI/ML Services**
- **LLM Integration:** Google Gemini API (AI-powered quiz generation & grading)
- **ML Framework:** scikit-learn (fraud detection model)
- **Embeddings:** Sentence Transformers (semantic analysis)
- **Model Serialization:** joblib

### **DevOps & Deployment**
- **Containerization:** Docker
- **API Documentation:** FastAPI built-in Swagger/OpenAPI

---

## **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                          TASKPULSE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │   FRONTEND (React)   │         │   BACKEND (FastAPI)  │   │
│  │                      │         │                      │   │
│  │ ├─ Dashboard        │◄───────►├─ /users              │   │
│  │ ├─ Task Submission  │  HTTP   ├─ /tasks              │   │
│  │ ├─ Quiz Interface   │  Axios  ├─ /quiz/{id}          │   │
│  │ ├─ Rewards Page     │         ├─ /quiz/submit        │   │
│  │ └─ History View     │         ├─ /rewards/{id}       │   │
│  │                      │         ├─ /history/{id}       │   │
│  │ Stack:              │         └─ /users/{id}         │   │
│  │ React + Vite        │                                  │   │
│  │ Tailwind + Zustand  │         Stack:                  │   │
│  │ Framer Motion       │         SQLAlchemy + Pydantic  │   │
│  └──────────────────────┘         └──────────────────────┘   │
│                                           │                   │
│                                           ▼                   │
│                            ┌──────────────────────────┐       │
│                            │   AI/ML Services         │       │
│                            │                          │       │
│                            ├─ Google Gemini API      │       │
│                            │  (Quiz Generation)      │       │
│                            │                          │       │
│                            ├─ scikit-learn           │       │
│                            │  (Fraud Detection)      │       │
│                            │                          │       │
│                            └──────────────────────────┘       │
│                                           │                   │
│                                           ▼                   │
│                            ┌──────────────────────────┐       │
│                            │   Database               │       │
│                            │   (SQL via SQLAlchemy)   │       │
│                            │                          │       │
│                            ├─ users                  │       │
│                            ├─ tasks                  │       │
│                            ├─ quizzes                │       │
│                            └─ reward_history         │       │
│                                                       │       │
└─────────────────────────────────────────────────────────────────┘
```

---

## **File Structure**

```
taskpulse/
├── Backend (Python)
│   ├── main.py                 # FastAPI app & route handlers
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic validation schemas
│   ├── crud.py                 # Database CRUD operations
│   ├── database.py             # SQLAlchemy setup
│   ├── config.py               # Configuration settings
│   ├── ai_services.py          # Google Gemini integration
│   ├── ml_services.py          # ML model utilities
│   ├── logging_config.py       # Logging configuration
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Container configuration
│   └── ml/
│       └── fraud_model.pkl     # Trained ML model
│
├── Frontend (React + Vite)
│   ├── taskpulse-frontend/
│   │   ├── package.json        # Node dependencies
│   │   ├── vite.config.js      # Vite configuration
│   │   ├── tailwind.config.js  # Tailwind styling
│   │   ├── postcss.config.js   # PostCSS configuration
│   │   ├── index.html          # Entry point
│   │   └── src/
│   │       ├── App.jsx         # Root component
│   │       ├── pages/          # Page components
│   │       ├── components/     # Reusable components
│   │       ├── hooks/          # Custom React hooks
│   │       ├── store/          # Zustand store (state)
│   │       └── styles/         # Global styles
│   │
│   └── package-lock.json       # Lock file
│
├── Documentation
│   ├── README.md               # Project overview
│   ├── TODO.md                 # Implementation checklist
│   └── TECH_STACK.md           # This file
│
└── Configuration
    ├── .github/                # GitHub workflows (CI/CD)
    ├── .gitignore             # Git ignore file
    └── .vscode/               # VSCode settings
```

---

## **Key Dependencies**

### **Backend (Python)**
```
fastapi>=0.111.0          # Web framework
uvicorn[standard]>=0.29.0 # ASGI server
sqlalchemy>=2.0.30        # ORM
pydantic>=2.7.1           # Data validation
google-genai>=0.1.0       # Gemini API client
joblib>=1.3.2             # Model serialization
sentence-transformers>=2.2.2  # Embeddings
scikit-learn>=1.3.0       # ML framework
python-dotenv>=1.0.0      # Environment variables
```

### **Frontend (Node.js)**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.4.5",
  "tailwindcss": "^3.3.5",
  "react-router-dom": "^6.18.0",
  "zustand": "^4.4.6",
  "framer-motion": "^10.16.4",
  "axios": "^1.6.0",
  "lucide-react": "^0.292.0",
  "canvas-confetti": "^1.9.4"
}
```

---

## **How Everything Works Together**

### **Data Flow**

1. **User Interaction (React Frontend)**
   - User submits task summary via React form
   - Axios sends HTTP POST to FastAPI backend

2. **Backend Processing (FastAPI)**
   - Receives request, validates with Pydantic
   - Stores in database via SQLAlchemy ORM
   - Triggers AI service for quiz generation

3. **AI Service (Google Gemini)**
   - Generates contextual questions based on task summary
   - Returns 1 theory + 2 MCQ questions

4. **User Quiz Response**
   - Frontend displays quiz with Framer Motion animations
   - User answers questions
   - Sends answers back to FastAPI

5. **Scoring & Fraud Detection**
   - Gemini AI grades answers (0-30 points)
   - scikit-learn ML model analyzes fraud probability
   - Decision: if (score >= 15) AND (fraud_prob < 0.6) → grant reward
   - Updates database with results

6. **Results & Rewards**
   - Frontend displays score, feedback, reward status
   - Zustand state management updates local state
   - Canvas-confetti animation on reward

---

## **Why These Technologies?**

| Component | Choice | Reason |
|-----------|--------|--------|
| **Backend** | FastAPI | Type-safe, async-ready, auto API docs, modern Python |
| **Frontend** | React + Vite | Fast builds, component reusability, large ecosystem |
| **Database** | SQLAlchemy | ORM flexibility, supports multiple databases |
| **AI** | Gemini API | State-of-art LLM, good for creative content generation |
| **ML** | scikit-learn | Battle-tested, lightweight fraud detection |
| **Styling** | Tailwind CSS | Utility-first, rapid UI development |
| **State** | Zustand | Lightweight, simple React state management |

---

## **Setup & Running**

### **Backend**
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY="your_key"

# Run FastAPI server
uvicorn main:app --reload  # http://localhost:8000

# Access API documentation
# http://localhost:8000/docs
```

### **Frontend**
```bash
cd taskpulse-frontend

# Install dependencies
npm install

# Run development server
npm run dev  # http://localhost:5173

# Build for production
npm run build
```

### **Docker (Full Stack)**
```bash
# Build image
docker build -t taskpulse .

# Run container
docker run -p 8000:8000 taskpulse
```

---

## **Interview Highlights**

1. **Full-Stack Integration:** React frontend seamlessly communicates with FastAPI backend using HTTP/REST
2. **AI Integration:** Real-world use of Google Gemini API for intelligent quiz generation
3. **ML Implementation:** Fraud detection model using behavioral features and scikit-learn
4. **Modern Stack:** Uses latest versions of frameworks (React 18, FastAPI, Vite)
5. **Production-Ready:** Docker containerization, proper error handling, environment configuration
6. **Type Safety:** Pydantic validation on backend, TypeScript-ready frontend
7. **Scalable Architecture:** Modular design, separated concerns (Frontend/Backend/AI/ML)

---

## **Performance Optimizations**

- **Vite:** Fast HMR (hot module replacement) during development
- **React:** Lazy loading with React Router for code splitting
- **FastAPI:** Async endpoints for non-blocking I/O
- **Database:** Indexed queries, connection pooling via SQLAlchemy
- **Caching:** Environment variable caching for ML models and Gemini client
- **Docker:** Multi-stage builds for smaller image sizes

---

## **Next Steps & Improvements**

- [ ] Add Redis caching for frequent queries
- [ ] Implement JWT authentication
- [ ] Add async task queue (Celery) for long-running Gemini calls
- [ ] Deploy to cloud (AWS/GCP/Azure)
- [ ] Add comprehensive test suite (pytest, Jest)
- [ ] Analytics dashboard for admin users
- [ ] Mobile app with React Native

---

**Created:** 2026-07-27  
**Project:** TaskPulse  
**Repository:** https://github.com/harshavardhan-lst/taskpulse
