# 🌐 Internet Debate Arena

A full-stack **MERN debate platform** where users can create debate topics, argue on **Pro / Con sides**, vote on arguments, and engage in structured discussions.  
The platform features real-time interactions via Socket.io, Redis caching, JWT authentication, admin moderation, bookmarking, and trending debates.

---

## 💡 Why This Project?

Internet Debate Arena promotes structured discussions over random comment sections.  
It encourages users to think critically and present logical arguments on clearly defined Pro / Con sides.

---

## 🏆 Key Highlights

- ⚡ Real-time communication using **Socket.io**
- 🚀 **Redis** caching for high-performance API responses
- 🔐 Secure authentication using **JWT** (access + refresh tokens)
- 🛡️ Admin moderation system
- 📦 Scalable MERN architecture with service-layer pattern
- 🎨 Modern UI with **React 19** + **Tailwind CSS v4** + **Vite 7**

---

## 🚀 Features

### 👤 Authentication
- User registration and login
- Secure password hashing with **bcryptjs**
- **JWT access + refresh token** flow
- Protected routes (client-side + middleware)

### 🗳️ Debate System
- Create debate topics with categories
- Join debates on **Pro / Con sides**
- Vote on debates
- View trending & latest debates
- Category filtering & pagination

### 💬 Arguments & Discussions
- Post arguments under debates
- **Pro / Con** side support
- Real-time updates via **Socket.io**
- Threaded replies to arguments
- Like arguments

### ⭐ User Interaction
- Bookmark debates
- Like arguments
- Report inappropriate content
- User profile with contributions & stats

### 🛠 Admin Features
- View and manage all users
- Moderate debates (delete / hide)
- Remove abusive content
- Handle user reports
- Admin dashboard with analytics

### ⚡ Performance & Security
- **Redis** caching middleware
- Pagination for large datasets
- **Helmet** for HTTP security headers
- **CORS** configuration
- **express-mongo-sanitize** against NoSQL injection
- **xss-clean** against XSS attacks
- **Rate limiting** (strict on auth routes)
- **Joi** + **express-validator** request validation
- **Winston** + **Morgan** logging
- **Multer** for avatar uploads

---

## 🏗 Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | ^19.2.0 |
| Vite | ^7.3.1 |
| React Router DOM | ^7.13.1 |
| TanStack React Query | ^5.90.21 |
| Axios | ^1.13.6 |
| Socket.io Client | ^4.8.3 |
| Tailwind CSS | ^4.2.1 |
| Chart.js + react-chartjs-2 | ^4.5.1 / ^5.3.1 |
| React Hot Toast | ^2.6.0 |

### Backend
| Technology | Version |
|---|---|
| Node.js | LTS |
| Express.js | ^4.21.0 |
| MongoDB + Mongoose | ^8.6.0 |
| Socket.io | ^4.8.3 |
| ioredis | ^5.10.0 |
| JWT (jsonwebtoken) | ^9.0.2 |
| bcryptjs | ^2.4.3 |
| Multer | ^2.1.1 |
| Winston | ^3.19.0 |
| Joi | ^18.0.2 |
| Helmet | ^8.1.0 |

---

## 📂 Project Structure

```
Debate Arena/
│
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ArgumentCard.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── DebateAnalytics.jsx
│   │   │   ├── DebateCard.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReplySection.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   └── VoteButtons.jsx
│   │   ├── context/               # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                 # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateDebate.jsx
│   │   │   ├── DebatePage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios instance & API calls
│   │   ├── socket/
│   │   │   └── socket.js          # Socket.io client setup
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                        # Express.js backend
    ├── config/
    │   ├── db.js                  # MongoDB connection
    │   └── redis.js               # Redis client setup
    ├── controllers/               # Route handler logic
    │   ├── adminController.js
    │   ├── argumentController.js
    │   ├── authController.js
    │   ├── bookmarkReportController.js
    │   └── debateController.js
    ├── middleware/
    │   ├── adminMiddleware.js
    │   ├── authMiddleware.js
    │   ├── cacheMiddleware.js
    │   ├── errorMiddleware.js
    │   ├── joiValidator.js
    │   └── uploadMiddleware.js
    ├── models/                    # Mongoose schemas
    │   ├── Argument.js
    │   ├── Bookmark.js
    │   ├── Debate.js
    │   ├── Like.js
    │   ├── Report.js
    │   ├── User.js
    │   └── Vote.js
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── argumentRoutes.js
    │   ├── authRoutes.js
    │   ├── bookmarkRoutes.js
    │   ├── debateRoutes.js
    │   ├── reportRoutes.js
    │   └── userRoutes.js
    ├── services/                  # Business logic layer
    │   ├── adminService.js
    │   ├── argumentService.js
    │   ├── authService.js
    │   ├── bookmarkService.js
    │   ├── debateService.js
    │   └── reportService.js
    ├── socket/
    │   └── index.js               # Socket.io server setup
    ├── utils/
    │   ├── generateTokens.js
    │   ├── logger.js
    │   └── pagination.js
    ├── validators/
    │   ├── argumentValidator.js
    │   ├── authValidator.js
    │   └── debateValidator.js
    ├── uploads/                   # Avatar uploads (gitignored)
    │   └── avatars/
    ├── logs/                      # Winston logs (gitignored)
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud — e.g. Upstash)

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/abhayvf07/internet-debate-arena.git
cd internet-debate-arena
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (refer to `.env.example`):

```env
PORT=5050
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
JWT_SECRET=<random-256-bit-hex-string>
JWT_REFRESH_SECRET=<random-256-bit-hex-string>
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

Start the backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` (refer to `.env.example`):

```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

Start the frontend:

```bash
npm run dev        # development
npm run build      # production build
npm run preview    # preview production build
```

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get tokens |
| GET | `/api/debates` | ❌ | List all debates |
| POST | `/api/debates` | ✅ | Create a debate |
| GET | `/api/debates/:id` | ❌ | Get single debate |
| POST | `/api/arguments` | ✅ | Post an argument |
| POST | `/api/arguments/:id/like` | ✅ | Like an argument |
| POST | `/api/bookmarks` | ✅ | Bookmark a debate |
| POST | `/api/reports` | ✅ | Report content |
| GET | `/api/users/leaderboard` | ❌ | Get leaderboard |
| GET | `/api/admin/users` | 🔐 Admin | List all users |
| DELETE | `/api/admin/debates/:id` | 🔐 Admin | Remove a debate |

> Full API documentation can be explored via the running server. All endpoints are rate-limited.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user2@test.com | Abhay@07 |
| Admin | admin@test.com | Abhay@07 |

> ⚠️ Demo credentials are for testing only. Change them in production.

---

## 📸 Screenshots

### 🏠 Home Page
Displays trending debates, categories, and latest discussions.
<img width="1920" height="923" alt="Home Page" src="screenshots/Home_Page.png" />

### 🔐 Sign Up
User registration with secure authentication.
<img width="1920" height="919" alt="Sign Up" src="screenshots/Sign_Up.png" />

### 🔑 Login
Login with JWT authentication.
<img width="1920" height="919" alt="Login" src="screenshots/Login.png" />

### 🗳️ Create Debate
Create debate topics and choose Pro / Con framing.
<img width="1920" height="923" alt="Create Debate" src="screenshots/Create_Debate.png" />

### 📊 Leaderboard
Top contributors ranked by activity and engagement.
<img width="1920" height="910" alt="Leaderboard" src="screenshots/Leaderboard.png" />

### 👤 User Profile
User information, debate history, and contributions.
<img width="1920" height="904" alt="User Profile" src="screenshots/User_Portfolio.png" />

### 🛡️ Admin Dashboard
Manage users, debates, and reports.
<img width="1920" height="929" alt="Admin Dashboard" src="screenshots/Admin_Dashboard.png" />

---

## 📊 Future Improvements

- [ ] AI moderation for abusive content detection
- [ ] Debate ranking / scoring algorithm
- [ ] User reputation & badge system
- [ ] Push notifications for replies
- [ ] Enhanced debate analytics
- [ ] Email verification on registration
- [ ] OAuth (Google / GitHub) login
- [ ] Dark / light theme persistence

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Abhay Fulsavange**  
🔗 GitHub: [https://github.com/abhayvf07](https://github.com/abhayvf07)

---

⭐ If you find this project useful, consider giving it a **star on GitHub**!