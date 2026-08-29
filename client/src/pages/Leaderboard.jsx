// Leaderboard page — podium top 3, ranked list with enriched stats
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Skeleton loader for the leaderboard ──
function LeaderboardSkeleton() {
  return (
    <div
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            width: "250px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(51,65,85,0.4)",
            margin: "0 auto 0.75rem",
          }}
        />
        <div
          style={{
            width: "300px",
            height: "18px",
            borderRadius: "6px",
            background: "rgba(51,65,85,0.3)",
            margin: "0 auto",
          }}
        />
      </div>
      {/* Podium skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "2.5rem",
          alignItems: "flex-end",
        }}
      >
        {[140, 170, 140].map((h, i) => (
          <div
            key={i}
            className="glass"
            style={{
              width: "180px",
              height: `${h}px`,
              borderRadius: "16px",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      {/* List skeleton */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            height: "64px",
            borderRadius: "12px",
            background: "rgba(51,65,85,0.2)",
            marginBottom: "0.5rem",
          }}
        />
      ))}
    </div>
  );
}

// ── Avatar component ──
function Avatar({ user: u, size = 48 }) {
  if (u.avatar) {
    return (
      <img
        src={u.avatar}
        alt=""
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), #a78bfa)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${size * 0.4}px`,
        fontWeight: 700,
        color: "white",
        border: "2px solid rgba(255,255,255,0.1)",
      }}
    >
      {u.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

// ── Stat pill ──
function StatPill({ icon, value, label }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0.35rem 0.6rem",
        borderRadius: "10px",
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255,255,255,0.05)",
        minWidth: "60px",
      }}
    >
      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
        {icon} {label}
      </span>
      <span
        style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Podium card for top 3 ──
const RANK_CONFIG = {
  0: {
    emoji: "🥇",
    gradient:
      "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))",
    border: "rgba(245,158,11,0.35)",
    color: "#f59e0b",
    order: 2,
  },
  1: {
    emoji: "🥈",
    gradient:
      "linear-gradient(135deg, rgba(148,163,184,0.12), rgba(203,213,225,0.06))",
    border: "rgba(148,163,184,0.3)",
    color: "#94a3b8",
    order: 1,
  },
  2: {
    emoji: "🥉",
    gradient:
      "linear-gradient(135deg, rgba(205,127,50,0.12), rgba(180,83,9,0.06))",
    border: "rgba(205,127,50,0.3)",
    color: "#cd7f32",
    order: 3,
  },
};

function PodiumCard({ leader, rank, isCurrentUser }) {
  const config = RANK_CONFIG[rank];
  const isFirst = rank === 0;

  return (
    <div
      className="glass animate-in"
      style={{
        padding: isFirst ? "2rem 1.5rem" : "1.5rem 1.25rem",
        textAlign: "center",
        flex: "1 1 0",
        maxWidth: "220px",
        minWidth: "160px",
        background: config.gradient,
        border: `1px solid ${config.border}`,
        borderRadius: "20px",
        position: "relative",
        order: config.order,
        transform: isFirst ? "scale(1.05)" : "none",
        zIndex: isFirst ? 2 : 1,
        animationDelay: `${rank * 0.1}s`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = isFirst
          ? "scale(1.08)"
          : "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isFirst ? "scale(1.05)" : "none";
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          fontSize: isFirst ? "2.5rem" : "2rem",
          marginBottom: "0.75rem",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
        }}
      >
        {config.emoji}
      </div>

      {/* Avatar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "0.75rem",
        }}
      >
        <Avatar user={leader} size={isFirst ? 64 : 52} />
      </div>

      {/* Name */}
      <div
        style={{
          fontWeight: 700,
          fontSize: isFirst ? "1.1rem" : "0.95rem",
          marginBottom: "0.25rem",
          color: "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {leader.name}
        {isCurrentUser && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--primary-light)",
              marginLeft: "0.35rem",
            }}
          >
            (You)
          </span>
        )}
      </div>

      {/* Points */}
      <div
        style={{
          fontSize: isFirst ? "1.5rem" : "1.25rem",
          fontWeight: 800,
          color: config.color,
          marginBottom: "0.75rem",
        }}
      >
        {leader.points.toLocaleString()}
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            marginLeft: "0.25rem",
          }}
        >
          pts
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        <StatPill
          icon="⚔️"
          value={leader.debatesCreated ?? 0}
          label="Debates"
        />
        <StatPill icon="🗳️" value={leader.totalVotes ?? 0} label="Votes" />
      </div>
    </div>
  );
}

// ── Rank row for positions 4+ ──
function RankRow({ leader, rank, isCurrentUser }) {
  return (
    <div
      className="animate-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.85rem 1.25rem",
        borderRadius: "12px",
        background: isCurrentUser ? "rgba(99, 102, 241, 0.1)" : "transparent",
        border: "1px solid",
        borderColor: isCurrentUser
          ? "rgba(99, 102, 241, 0.25)"
          : "var(--border)",
        animationDelay: `${(rank - 3) * 0.04}s`,
        transition: "background 0.2s ease, transform 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isCurrentUser
          ? "rgba(99, 102, 241, 0.15)"
          : "rgba(51, 65, 85, 0.15)";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isCurrentUser
          ? "rgba(99, 102, 241, 0.1)"
          : "transparent";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Rank number */}
      <span
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          minWidth: "2.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        #{rank + 1}
      </span>

      {/* Avatar */}
      <Avatar user={leader} size={40} />

      {/* Name & date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {leader.name}
          {isCurrentUser && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--primary-light)",
                marginLeft: "0.4rem",
              }}
            >
              (You)
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Joined {new Date(leader.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
        }}
      >
        <span title="Debates created">⚔️ {leader.debatesCreated ?? 0}</span>
        <span title="Votes cast">🗳️ {leader.totalVotes ?? 0}</span>
      </div>

      {/* Points */}
      <div style={{ textAlign: "right", minWidth: "70px" }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "var(--primary-light)",
          }}
        >
          {leader.points.toLocaleString()}
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
          points
        </div>
      </div>
    </div>
  );
}

// ── Main component ──
export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await getLeaderboard(50);
      return res.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) return <LeaderboardSkeleton />;

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      {/* Header */}
      <div
        style={{ textAlign: "center", marginBottom: "2.5rem" }}
        className="animate-in"
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #f59e0b, #ef4444, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🏆 Leaderboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Top debaters ranked by reputation points
        </p>
      </div>

      {/* Empty state */}
      {leaders.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏟️</div>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            No debaters yet. Be the first to enter the arena!
          </p>
        </div>
      ) : (
        <>
          {/* Podium section — top 3 */}
          {top3.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                marginBottom: "2.5rem",
                alignItems: "flex-end",
                flexWrap: "wrap",
                padding: "0 0.5rem",
              }}
            >
              {top3.map((leader, idx) => (
                <PodiumCard
                  key={leader._id}
                  leader={leader}
                  rank={idx}
                  isCurrentUser={leader._id === user?._id}
                />
              ))}
            </div>
          )}

          {/* Rankings list — positions 4+ */}
          {rest.length > 0 && (
            <div className="glass" style={{ padding: "1rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  padding: "0.5rem 0.75rem",
                  marginBottom: "0.5rem",
                  color: "var(--text-muted)",
                }}
              >
                Rankings
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {rest.map((leader, idx) => (
                  <RankRow
                    key={leader._id}
                    leader={leader}
                    rank={idx + 3}
                    isCurrentUser={leader._id === user?._id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}