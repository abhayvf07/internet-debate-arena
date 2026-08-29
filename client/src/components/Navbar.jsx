// Navbar — logo, search, theme toggle, auth links, and admin access

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className="glass"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "0.75rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 0,
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        gap: "1rem",
      }}
    >
      <Link
        to={user ? "/debates/all" : "/"}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>⚔️</span>
        <span
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #818cf8, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Debate Arena
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost"
          style={{ fontSize: "1.1rem", padding: "0.4rem 0.6rem" }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Leaderboard */}
        <Link
          to="/leaderboard"
          className="btn-ghost"
          style={{ textDecoration: "none", fontSize: "0.85rem" }}
        >
          🏆
        </Link>

        {user ? (
          <>
            <Link
              to="/create"
              className="btn-primary"
              style={{ textDecoration: "none", fontSize: "0.85rem" }}
            >
              + New Debate
            </Link>
            <Link
              to="/profile"
              className="btn-ghost"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : null}
              {user.name}
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="btn-ghost"
                style={{ textDecoration: "none", color: "#f59e0b" }}
              >
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="btn-ghost">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-ghost"
              style={{ textDecoration: "none" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{ textDecoration: "none", fontSize: "0.85rem" }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}