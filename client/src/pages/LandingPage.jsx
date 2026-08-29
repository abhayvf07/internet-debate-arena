// Landing page — public-facing hero, features, and CTA for unauthenticated users
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOW_IT_WORKS = [
  {
    icon: "🎯",
    title: "Join Debates",
    description:
      "Join debates on trending topics across politics, tech, science, and more.",
  },
  {
    icon: "💬",
    title: "Make Your Case",
    description:
      "Choose a side and submit well-reasoned arguments to support your position.",
  },
  {
    icon: "🗳️",
    title: "Vote & Rank",
    description:
      "Vote, discuss, and watch rankings evolve as the community weighs in.",
  },
];

const WHY_JOIN = [
  {
    icon: "🏛️",
    title: "Structured Debates",
    description: "Participate in organized, topic-focused discussions.",
  },
  {
    icon: "👍",
    title: "Community Voting",
    description: "Vote for the strongest arguments and shape outcomes.",
  },
  {
    icon: "📊",
    title: "Track Trends",
    description: "Follow community opinion trends across topics.",
  },
  {
    icon: "🏆",
    title: "Leaderboards",
    description: "Compete and earn points for quality contributions.",
  },
  {
    icon: "🧠",
    title: "Sharpen Skills",
    description: "Improve your reasoning and communication abilities.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/debates/all");
  }, [user, navigate]);

  if (user) return null;

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 1.5rem 3rem",
        }}
      >
        {/* ===== Hero Section ===== */}
        <section
          id="landing-hero"
          className="animate-in"
          style={{
            textAlign: "center",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            position: "relative",
          }}
        >
          {/* Decorative glow orb */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -55%)",
              width: "600px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.18) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                marginBottom: "1.25rem",
                lineHeight: 1.15,
                background:
                  "linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ⚔️ Internet Debate Arena
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                maxWidth: "560px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {
                "Structured debates on topics that matter.\nPick a side, make your case, and let the votes decide."
              }
            </p>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/login"
                className="btn-ghost"
                style={{
                  padding: "0.7rem 1.75rem",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{
                  padding: "0.7rem 1.75rem",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Platform Description ===== */}
        <section
          className="animate-in"
          style={{ marginBottom: "4rem", animationDelay: "0.1s" }}
        >
          <div
            className="glass"
            style={{
              padding: "2.5rem",
              textAlign: "center",
              maxWidth: "780px",
              margin: "0 auto",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.05rem",
                lineHeight: 1.75,
              }}
            >
              A platform where ideas compete on merit. Present structured
              arguments, engage in civil discourse, and let the community decide
              through transparent voting.
            </p>
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section
          id="landing-how-it-works"
          className="animate-in"
          style={{ marginBottom: "4rem", animationDelay: "0.15s" }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={step.title}
                className="glass glass-hover animate-in"
                style={{
                  padding: "2rem 1.75rem",
                  textAlign: "center",
                  animationDelay: `${0.1 + idx * 0.1}s`,
                }}
              >
                {/* Step number badge */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Why Join ===== */}
        <section
          id="landing-why-join"
          className="animate-in"
          style={{ marginBottom: "4rem", animationDelay: "0.2s" }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Why Join the Arena?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {WHY_JOIN.map((item, idx) => (
              <div
                key={item.title}
                className="glass glass-hover animate-in"
                style={{
                  padding: "1.75rem 1.5rem",
                  animationDelay: `${0.15 + idx * 0.06}s`,
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                  {item.icon}
                </div>

                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA Section ===== */}
        <section
          id="landing-cta"
          className="animate-in"
          style={{ marginBottom: "3rem", animationDelay: "0.25s" }}
        >
          <div
            className="glass"
            style={{
              padding: "3.5rem 2rem",
              textAlign: "center",
              maxWidth: "720px",
              margin: "0 auto",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle inner glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-40%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "400px",
                height: "250px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.1) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                Ready to Enter the Arena?
              </h2>

              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "1.05rem",
                  marginBottom: "2rem",
                  lineHeight: 1.6,
                }}
              >
                Join thousands of debaters. Make your voice heard.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/login"
                  className="btn-ghost"
                  style={{
                    padding: "0.7rem 1.75rem",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{
                    padding: "0.7rem 1.75rem",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer
          style={{
            textAlign: "center",
            padding: "2rem 0 1rem",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
          }}
        >
          © 2025 Internet Debate Arena. All rights reserved.
        </footer>
      </div>
    </div>
  );
}