# 🌐 Internet Debate Arena

A full-stack **MERN debate platform** where users can create debate topics, argue on **Pro / Con sides**, vote on arguments, and engage in structured discussions.
The platform includes authentication, real-time interactions, moderation tools, bookmarking, and trending debates.

---

# 🚀 Features

### 👤 Authentication

* User registration and login
* Secure password hashing with bcrypt
* JWT-based authentication
* Protected routes

### 🗳️ Debate System

* Create debate topics
* Join debates with **Pro / Con arguments**
* Vote on debates
* View trending debates

### 💬 Arguments & Discussions

* Post arguments under debates
* Support for **Pro / Con sides**
* Real-time updates using Socket.io
* Reply to arguments

### ⭐ User Interaction

* Bookmark debates
* Like arguments
* Report inappropriate content

### 🛠 Admin Features

* View all users
* Moderate debates
* Remove abusive content
* Handle reports

### ⚡ Performance

* Redis caching for faster responses
* Pagination for large datasets
* Optimized API responses

### 🔒 Security

* Helmet for HTTP security headers
* CORS configuration
* Express-mongo-sanitize
* Rate limiting

---

# 🏗 Tech Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Socket.io Client
* CSS / Tailwind (if used)

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.io

## Other Tools

* Redis (caching)
* Winston (logging)
* Morgan (request logging)

---

# 📂 Project Structure

```
Internet-Debate-Arena
│
├── client                # React frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── context
│   │   ├── services
│   │   └── socket
│   │
│   ├── package.json
│   └── vite.config.js
│
└── server                # Node.js backend
    ├── controllers
    ├── models
    ├── routes
    ├── middleware
    ├── config
    ├── socket
    ├── utils
    └── server.js
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the repository

```
git clone https://github.com/abhayvf07/internet-debate-arena.git
cd internet-debate-arena
```

---

# 🔧 Backend Setup

```
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
REDIS_URL=your_redis_url
```

Run backend server:

```
npm run dev
```

---

# 💻 Frontend Setup

```
cd client
npm install
```

Create `.env` file:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run frontend:

```
npm run dev
```

---

# 🌍 Deployment

### Frontend

Deploy using platforms like **Vercel**.

### Backend

Deploy using **Render**.

Environment variables must be added in the hosting dashboard.

---

# 📸 Screenshots

*(Add screenshots of your project UI here)*

Example sections:

* Homepage
* Debate page
* Argument section
* Admin dashboard

---

# 📊 Future Improvements

* AI moderation for abusive content
* Debate ranking algorithm
* User reputation system
* Notifications for replies
* Debate analytics

---

# 🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss improvements.

---

# 📄 License

# 👨‍💻 Author

**Abhay Fulsavange**

GitHub:
https://github.com/abhayvf07

---

⭐ If you like this project, consider giving it a **star on GitHub**!
