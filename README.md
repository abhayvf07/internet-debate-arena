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
- **JWT access + refresh token** flow with SHA-256 hashed token storage
- Protected routes (client-side guard + server middleware)

### 🗳️ Debate System
- Create debate topics with title, description, category, and tags
- Join debates on **Pro / Con sides**
- Vote on debates with **toggle support** (switch sides or remove vote)
- View trending & latest debates
- Category filtering, tag filtering & pagination
- Auto-calculated **trending score** based on votes, arguments, views, and age

### 💬 Arguments & Discussions
- Post arguments under debates (Pro or Con side)
- **Threaded replies** to arguments (nested tree structure)
- Real-time updates via **Socket.io** (new arguments & vote changes broadcast instantly)
- Like arguments — authors earn points per like

### ⭐ User Interaction
- Bookmark debates for later reading
- Like / unlike arguments
- Report inappropriate arguments
- User profile with contribution stats (debates created, arguments posted, votes received)
- Points-based **leaderboard**

### 🛠 Admin Features
- View and manage all users (paginated)
- Ban / unban users (toggle, invalidates sessions)
- Delete debates and arguments with **cascade cleanup**
- Handle user reports (view pending, mark resolved)
- Admin dashboard with platform-wide stats

### ⚡ Performance & Security
- **Redis** caching middleware (TTL-based, auto-invalidated on writes)
- Graceful cache degradation — app works without Redis
- Pagination for large datasets (configurable limit, max cap)
- **Helmet** for HTTP security headers
- **CORS** restricted to CLIENT_URL only
- **express-mongo-sanitize** against NoSQL injection
- **xss-clean** against XSS attacks
- **Rate limiting** — 5 req/min on auth, 50 req/min on votes/likes, 100 req/min general
- **Joi** request validation with schema-level middleware
- Console logging + **Morgan** HTTP logging
- **Multer** for avatar file uploads

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
| Node.js | LTS (v18+) |
| Express.js | ^4.21.0 |
| MongoDB + Mongoose | ^8.6.0 |
| Socket.io | ^4.8.3 |
| ioredis | ^5.10.0 |
| JWT (jsonwebtoken) | ^9.0.2 |
| bcryptjs | ^2.4.3 |
| Multer | ^2.1.1 |
| Joi | ^18.0.2 |
| Helmet | ^8.1.0 |
| express-rate-limit | ^8.3.1 |
| express-mongo-sanitize | ^2.2.0 |
| xss-clean | ^0.1.4 |
| Morgan | ^1.10.1 |

---

## 📂 Project Structure

```
Debate Arena/
│
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ArgumentCard.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── DebateAnalytics.jsx
│   │   │   ├── DebateCard.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReplySection.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   └── VoteButtons.jsx
│   │   ├── context/               # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                 # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateDebate.jsx
│   │   │   ├── DebatePage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios instance, all API calls & token refresh interceptor
│   │   ├── socket/
│   │   │   └── socket.js          # Socket.io client singleton & room helpers
│   │   ├── utils/
│   │   │   └── helpers.js         # formatDate, truncateText, getInitials
│   │   ├── App.jsx                # Router, lazy loading, context providers
│   │   ├── index.css              # Global styles + Tailwind directives
│   │   └── main.jsx               # React DOM entry + QueryClient setup
│   ├── .env                       # Frontend environment variables
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                        # Express.js backend
    ├── config/
    │   ├── db.js                  # MongoDB connection via Mongoose
    │   └── redis.js               # ioredis client + getCache / setCache / deleteCache helpers
    ├── controllers/               # Thin request/response handlers — delegate to services
    │   ├── adminController.js
    │   ├── argumentController.js
    │   ├── authController.js
    │   ├── bookmarkReportController.js
    │   └── debateController.js
    ├── middleware/
    │   ├── adminMiddleware.js     # role === 'admin' guard
    │   ├── authMiddleware.js      # JWT verify + banned-user check → req.user
    │   ├── cacheMiddleware.js     # Redis TTL cache intercept for GET routes
    │   ├── errorMiddleware.js     # Global error handler + asyncHandler wrapper
    │   ├── joiValidator.js        # Joi schema validation middleware factory
    │   └── uploadMiddleware.js    # Multer config for avatar uploads
    ├── models/                    # Mongoose schemas & indexes
    │   ├── Argument.js
    │   ├── Bookmark.js
    │   ├── Debate.js
    │   ├── Like.js
    │   ├── Report.js
    │   ├── User.js
    │   └── Vote.js
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── argumentRoutes.js
    │   ├── authRoutes.js
    │   ├── bookmarkRoutes.js
    │   ├── debateRoutes.js
    │   ├── reportRoutes.js
    │   └── userRoutes.js
    ├── services/                  # All business logic lives here
    │   ├── adminService.js
    │   ├── argumentService.js
    │   ├── authService.js
    │   ├── bookmarkService.js
    │   ├── debateService.js
    │   └── reportService.js
    ├── socket/
    │   └── index.js               # Socket.io server init, JWT auth, debate rooms
    ├── utils/
    │   ├── generateTokens.js      # generateAccessToken (15m) + generateRefreshToken (7d)
    │   └── pagination.js          # Reusable paginate() helper for Mongoose queries
    ├── validators/
    │   ├── argumentValidator.js
    │   ├── authValidator.js
    │   └── debateValidator.js
    ├── uploads/                   # Avatar image storage (gitignored)
    │   └── avatars/
    ├── logs/                      # Optional runtime logs (gitignored)
    │   ├── combined.log
    │   └── error.log
    ├── .env                       # Server secrets & config
    ├── package.json
    └── server.js                  # Entry point — middleware stack, routes, server startup
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Redis** (local or cloud — [Upstash](https://upstash.com) free tier recommended)

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

Create a `.env` file in `server/`:

```env
PORT=5050
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
JWT_SECRET=<random-256-bit-hex-string>
JWT_REFRESH_SECRET=<another-random-256-bit-hex-string>
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

> 💡 `REDIS_URL` is optional — the app works without Redis, caching will simply be disabled.

Start the backend:

```bash
npm run dev        # development (nodemon auto-restart)
npm start          # production
```

The server starts on `http://localhost:5050`.

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

Start the frontend:

```bash
npm run dev        # development — http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `MONGO_URI` | ✅ Yes | MongoDB Atlas or local connection string |
| `JWT_SECRET` | ✅ Yes | Secret for signing access tokens (15m expiry) |
| `JWT_REFRESH_SECRET` | ✅ Yes | Secret for signing refresh tokens (7d expiry) |
| `CLIENT_URL` | ✅ Yes | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `REDIS_URL` | No | Redis connection URL — omit to disable caching |

### `client/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ Yes | Backend REST API base URL (e.g. `http://localhost:5050/api`) |
| `VITE_SOCKET_URL` | ✅ Yes | Backend Socket.io URL (e.g. `http://localhost:5050`) |

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & receive access + refresh tokens |
| POST | `/api/auth/refresh-token` | ❌ | Exchange refresh token for new access token |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/auth/stats` | ✅ | Get current user contribution stats |
| PUT | `/api/auth/avatar` | ✅ | Upload / update profile avatar |
| GET | `/api/users/leaderboard` | ❌ | Get top users ranked by points |
| GET | `/api/debates` | ❌ | List debates (filter, sort, paginate) |
| GET | `/api/debates/search` | ❌ | Full-text search debates |
| GET | `/api/debates/trending` | ❌ | Get top trending debates |
| POST | `/api/debates` | ✅ | Create a new debate |
| GET | `/api/debates/:id` | ❌ | Get single debate with vote counts |
| DELETE | `/api/debates/:id` | ✅ | Delete debate (creator or admin) |
| POST | `/api/debates/:id/vote` | ✅ | Vote Pro / Con — toggle supported |
| POST | `/api/debates/:id/view` | ❌ | Increment view count |
| GET | `/api/arguments/:debateId` | ❌ | Get all arguments (nested tree) |
| POST | `/api/arguments` | ✅ | Post a new argument |
| POST | `/api/arguments/reply` | ✅ | Reply to an existing argument |
| POST | `/api/arguments/like` | ✅ | Like / unlike an argument |
| DELETE | `/api/arguments/:id` | ✅ | Delete argument (author or admin) |
| GET | `/api/bookmarks` | ✅ | Get user's bookmarked debates |
| POST | `/api/bookmarks` | ✅ | Toggle bookmark on a debate |
| POST | `/api/reports` | ✅ | Report an argument |
| GET | `/api/admin/users` | 🔐 Admin | List all users (paginated) |
| GET | `/api/admin/stats` | 🔐 Admin | Platform-wide stats |
| GET | `/api/admin/reports` | 🔐 Admin | View all pending reports |
| PATCH | `/api/admin/users/:id/ban` | 🔐 Admin | Toggle user ban |
| DELETE | `/api/admin/debate/:id` | 🔐 Admin | Delete any debate (cascade) |
| DELETE | `/api/admin/argument/:id` | 🔐 Admin | Delete any argument (cascade) |

> All endpoints are rate-limited. Auth routes: 5 req/min. Vote & like routes: 50 req/min. General routes: 100 req/min.

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
- [ ] Debate ranking / scoring algorithm improvements
- [ ] User reputation & badge system
- [ ] Push notifications for replies
- [ ] Enhanced debate analytics
- [ ] Email verification on registration
- [ ] OAuth (Google / GitHub) login
- [ ] Refresh token rotation (single-use refresh tokens)

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

⭐ If you find this project useful, consider giving it a **star on GitHub**! make humanizer means look like write by fresher student project readme file with same format