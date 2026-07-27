# TaskPulse - AI-Powered Task Management & Gamification Platform

> A full-stack application that motivates users to complete tasks through AI-powered verification and intelligent gamification.

## 🚀 Project Overview

**TaskPulse** is a sophisticated task management platform that combines modern web technologies with AI/ML capabilities to help users complete tasks and build productive habits. Users submit task completions, take AI-generated verification quizzes, and earn rewards based on authentic completion and behavioral analysis.

### Key Innovation
- **AI-Powered Verification:** Google Gemini API generates contextual quiz questions to verify task completion authenticity
- **Fraud Detection:** Machine learning model analyzes behavioral patterns to prevent reward abuse
- **Gamification:** Real-time rewards, streaks, and badges to maintain user motivation

---

## ✨ Features

### Core Functionality
- ✅ **User Management:** Create and manage user profiles with reward tracking
- ✅ **Task Submission:** Submit task summaries with automatic quiz generation
- ✅ **AI Quiz Generation:** Google Gemini creates 1 theory + 2 MCQ questions per task
- ✅ **Intelligent Grading:** AI evaluates quiz answers with detailed feedback (0-30 points)
- ✅ **Fraud Detection:** ML model analyzes 8+ behavioral features to prevent gaming
- ✅ **Reward System:** Grant badges and track reward history
- ✅ **Task History:** Complete history view with score, risk level, and reward status

### Advanced Features
- 🔒 **Error Resilience:** Graceful fallbacks when AI APIs are unavailable
- 📊 **Risk Assessment:** Fraud probability displayed as Low/Medium/High
- ⚡ **Real-time API:** FastAPI async endpoints for fast response times
- 🔌 **CORS Enabled:** Secure frontend-backend communication
- 📦 **Docker Ready:** Containerized for easy deployment

---

## 🛠 Technology Stack

### **Backend (Python)**
- **Framework:** FastAPI 0.111+
- **Server:** Uvicorn (ASGI)
- **Database ORM:** SQLAlchemy 2.0+
- **Data Validation:** Pydantic v2
- **Runtime:** Python 3.11+

### **Frontend (React)**
- **Framework:** React 18
- **Build Tool:** Vite 4.4+
- **Styling:** Tailwind CSS 3.3+
- **Routing:** React Router DOM v6
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **UI Icons:** Lucide React

### **AI/ML Services**
- **LLM:** Google Gemini API (gemini-2.5-flash)
- **ML Framework:** scikit-learn (fraud detection classifier)
- **Embeddings:** Sentence Transformers (all-MiniLM-L6-v2)
- **Model Serialization:** joblib

### **DevOps**
- **Containerization:** Docker
- **Database Support:** PostgreSQL, SQLite
- **Environment:** Python dotenv for secrets

---

## 📁 Project Structure

```
taskpulse/
│
├── Backend (Python - FastAPI)
│   ├── main.py                 # FastAPI app, route handlers
│   ├── models.py               # SQLAlchemy ORM models (User, Task, Quiz, RewardHistory)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── crud.py                 # Database CRUD operations
│   ├── database.py             # SQLAlchemy engine & session setup
│   ├── config.py               # Configuration settings
│   ├── ai_services.py          # Google Gemini integration
│   ├── ml_services.py          # ML utilities
│   ├── logging_config.py       # Logging configuration
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Container configuration
│   └── ml/
│       └── fraud_model.pkl     # Trained fraud detection model
│
├── Frontend (React + Vite)
│   ├── taskpulse-frontend/
│   │   ├── package.json        # Node dependencies
│   │   ├── package-lock.json   # Lock file
│   │   ├── vite.config.js      # Vite build config
│   │   ├── tailwind.config.js  # Tailwind config
│   │   ├── postcss.config.js   # PostCSS config
│   │   ├── index.html          # Entry point
│   │   └── src/
│   │       ├── App.jsx         # Root component
│   │       ├── pages/          # Page components
│   │       ├── components/     # Reusable components
│   │       ├── hooks/          # Custom React hooks
│   │       ├── store/          # Zustand state management
│   │       └── styles/         # Global CSS
│   │
│   └── node_modules/           # Installed dependencies
│
└── Documentation
    ├── README.md               # This file
    ├── TECH_STACK.md           # Detailed technology explanation
    ├── TODO.md                 # Implementation roadmap
    └── .env.example            # Example environment variables
```

---

## 🔧 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn
- Google Gemini API key (optional, has fallbacks)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/harshavardhan-lst/taskpulse.git
cd taskpulse

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file with your API keys
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# 5. Run the FastAPI server
uvicorn main:app --reload

# API documentation available at:
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd taskpulse-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Application will be available at:
# http://localhost:5173
```

### Docker Setup (Full Stack)

```bash
# Build Docker image
docker build -t taskpulse .

# Run container
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_api_key \
  taskpulse

# API available at http://localhost:8000
```

---

## 📡 API Endpoints

### User Management
```
POST   /users                    # Create new user
GET    /rewards/{user_id}        # Get reward history
GET    /history/{user_id}        # Get task history
DELETE /users/{user_id}          # Delete user
```

### Task Management
```
POST   /tasks                    # Submit new task
GET    /quiz/{task_id}           # Generate quiz for task
POST   /quiz/submit              # Submit quiz answers & get score
```

### Response Example: Quiz Submit
```json
{
  "score": 25,
  "fraud_probability": 0.15,
  "passed": true,
  "reward_granted": true,
  "explanation": "Great job! Your answers demonstrate good understanding..."
}
```

---

## 📊 How It Works

### Request Flow

```
1. User submits task
   POST /tasks → {"user_id": 1, "summary": "Completed Python project"}

2. System generates quiz
   GET /quiz/1 → Gemini API generates 3 questions

3. User takes quiz
   POST /quiz/submit with answers

4. System evaluates
   ├─ Gemini grades answers (0-30 points)
   ├─ ML model calculates fraud probability
   ├─ Decision: score >= 15 AND fraud_prob < 0.6 → reward
   └─ Update database with results

5. View results
   GET /history/1 → Shows all tasks with scores and rewards
```

### Fraud Detection Features
The ML model analyzes these 8 features:
- Quiz score
- Time taken to complete
- Number of attempts
- User's average score history
- Tasks completed today
- Account age (in days)
- Previous rewards earned
- Time of day

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  total_rewards INT DEFAULT 0
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  summary TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- pending/rewarded
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL UNIQUE,
  score INT,
  fraud_probability FLOAT,
  reward_granted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

### Reward History Table
```sql
CREATE TABLE reward_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  reward_name VARCHAR(255),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 💡 Example Usage

### Using cURL

#### 1. Create a User
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

#### 2. Submit a Task
```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "summary": "Built a REST API with FastAPI"
  }'
```

#### 3. Get Quiz
```bash
curl -X GET http://localhost:8000/quiz/1
```

#### 4. Submit Quiz Answers
```bash
curl -X POST http://localhost:8000/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": 1,
    "questions": [...],
    "answers": ["HTTP 201", "FastAPI", "True"],
    "time_taken": 120,
    "attempts": 1,
    "avg_user_score": 20,
    "tasks_completed_today": 1,
    "account_age_days": 30,
    "previous_rewards": 5,
    "time_of_day": 14
  }'
```

#### 5. View Reward History
```bash
curl -X GET http://localhost:8000/rewards/1
```

#### 6. View Task History
```bash
curl -X GET http://localhost:8000/history/1
```

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
pytest

# Frontend tests
npm test

# With coverage
pytest --cov=.
```

---

## 🚀 Deployment

### Deploy to Production
```bash
# Build frontend
cd taskpulse-frontend
npm run build

# Start backend with production settings
uvicorn main:app --host 0.0.0.0 --port 8000

# Or use Gunicorn for production
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Environment Variables Required
```
GEMINI_API_KEY          # Google Gemini API key
DATABASE_URL            # PostgreSQL connection string (optional)
CORS_ORIGINS            # Allowed frontend origins
ENVIRONMENT             # development/production
```

---

## 🔒 Security Features

- ✅ Input validation via Pydantic
- ✅ CORS protection for frontend communication
- ✅ Environment variable secrets management
- ✅ Fraud detection prevents reward abuse
- ✅ Error handling prevents data exposure
- ✅ Type safety with FastAPI

---

## 📈 Performance Optimizations

- **Frontend:** Vite enables fast HMR and optimized builds
- **Backend:** Async FastAPI endpoints for non-blocking I/O
- **Caching:** Global client initialization for Gemini and embedding models
- **Database:** Connection pooling via SQLAlchemy
- **ML Model:** Pre-loaded fraud model for instant predictions

---

## 🐛 Error Handling

The system gracefully handles common failures:

| Error | Fallback |
|-------|----------|
| Gemini API unavailable | Generic fallback questions |
| ML model missing | Default fraud score (0.2) |
| Database connection fails | Proper HTTP 500 response |
| Invalid input | Pydantic validation error (HTTP 422) |

---

## 🗺️ Roadmap

- [ ] Add JWT authentication
- [ ] Implement Redis caching
- [ ] Create leaderboard page
- [ ] Add analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Async task queue (Celery)
- [ ] Email notifications
- [ ] Payment integration

See [TODO.md](TODO.md) for more details.

---

## 📚 Learn More

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **SQLAlchemy Docs:** https://docs.sqlalchemy.org/
- **Google Gemini:** https://deepmind.google/technologies/gemini/
- **scikit-learn:** https://scikit-learn.org/

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Harshavardhan**
- GitHub: [@harshavardhan-lst](https://github.com/harshavardhan-lst)
- Repository: [TaskPulse](https://github.com/harshavardhan-lst/taskpulse)

---

## ⭐ Show Your Support

If you found this project helpful, please give it a star on GitHub!

---

**Last Updated:** July 27, 2026  
**Status:** ✅ Active Development
