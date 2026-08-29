// Admin Dashboard — tools for moderation, ban user, role management, and site stats
import { useState, useEffect, useMemo } from "react";
import {
  adminGetReports,
  resolveReport,
  adminGetUsers,
  adminDeleteArgument,
  adminBanUser,
  adminGetStats,
  adminDeleteDebate,
  getDebates,
  adminChangeUserRole,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [debates, setDebates] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDebates: 0,
    pendingReports: 0,
    totalArguments: 0,
    totalBannedUsers: 0,
    topReportedUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reports");

  // Reports pagination
  const [reportPage, setReportPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);

  // Users search & filter
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Ban reason modal
  const [banModal, setBanModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });
  const [banReason, setBanReason] = useState("");

  const fetchReports = async (page = 1) => {
    try {
      const res = await adminGetReports({ page, limit: 10 });
      setReports(res.data.reports || []);
      setReportPage(res.data.page || 1);
      setReportTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminGetUsers({ limit: 200 });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchDebates = async () => {
    try {
      const res = await getDebates({ limit: 100 });
      setDebates(res.data.debates || res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch debates:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminGetStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchReports(),
        fetchUsers(),
        fetchDebates(),
        fetchStats(),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const handleResolve = async (reportId) => {
    try {
      await resolveReport(reportId);
      toast.success("Report resolved");
      fetchReports(reportPage);
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resolve report";
      toast.error(msg);
    }
  };

  const handleDeleteArgument = async (argId) => {
    if (!window.confirm("Delete this argument?")) return;
    try {
      await adminDeleteArgument(argId);
      toast.success("Argument deleted");
      fetchReports(reportPage);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete argument";
      toast.error(msg);
    }
  };

  const handleBanUser = (userId, userName, isBanned) => {
    if (isBanned) {
      // Unbanning — simple confirm
      if (!window.confirm(`Unban ${userName}?`)) return;
      performBan(userId, null);
    } else {
      // Banning — show reason modal
      setBanModal({ open: true, userId, userName });
      setBanReason("");
    }
  };

  const performBan = async (userId, reason) => {
    try {
      const res = await adminBanUser(userId, reason);
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
      setBanModal({ open: false, userId: null, userName: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban user");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const action = newRole === "admin" ? "Promote to Admin" : "Demote to User";
    if (!window.confirm(`${action}?`)) return;
    try {
      const res = await adminChangeUserRole(userId, newRole);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleDeleteDebate = async (debateId) => {
    if (!window.confirm("Delete this debate and all its data?")) return;
    try {
      await adminDeleteDebate(debateId);
      toast.success("Debate deleted");
      fetchDebates();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete debate");
    }
  };

  // Client-side user filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "banned" && u.isBanned) ||
        (userStatusFilter === "active" && !u.isBanned);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const tabStyle = (active) => ({
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: active ? "var(--primary)" : "var(--border)",
    background: active ? "rgba(99, 102, 241, 0.15)" : "transparent",
    color: active ? "var(--primary-light)" : "var(--text-muted)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  });

  const statCardStyle = {
    flex: 1,
    minWidth: "150px",
    padding: "1.5rem",
    borderRadius: "12px",
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    textAlign: "center",
  };

  const inputStyle = {
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "rgba(0, 0, 0, 0.2)",
    color: "var(--text)",
    fontSize: "0.85rem",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  return (
    <div
      style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      <h1
        style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}
        className="animate-in"
      >
        🛡️ Admin Dashboard
      </h1>
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "2rem",
          fontSize: "0.9rem",
        }}
      >
        Manage users, reports, debates, and content.
      </p>

      {/* Stat Cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--primary-light)",
            }}
          >
            {stats.totalUsers}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Total Users
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399" }}>
            {stats.totalDebates}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Total Debates
          </div>
        </div>
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: stats.pendingReports > 0 ? "#f87171" : "var(--text-muted)",
            }}
          >
            {stats.pendingReports}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Pending Reports
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#60a5fa" }}>
            {stats.totalArguments || 0}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Total Arguments
          </div>
        </div>
        <div style={statCardStyle}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color:
                stats.totalBannedUsers > 0 ? "#fb923c" : "var(--text-muted)",
            }}
          >
            {stats.totalBannedUsers || 0}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Banned Users
          </div>
        </div>
      </div>

      {/* Top Reported Users */}
      {stats.topReportedUsers?.length > 0 && (
        <div
          className="glass"
          style={{ padding: "1rem 1.5rem", marginBottom: "2rem" }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "#f87171",
            }}
          >
            🚨 Top Reported Users
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {stats.topReportedUsers.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  background: "rgba(248, 113, 113, 0.08)",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>{u.name}</span>
                <span
                  style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}
                >
                  {u.reportCount} report{u.reportCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          style={tabStyle(tab === "reports")}
          onClick={() => setTab("reports")}
        >
          🚩 Reports ({stats.pendingReports || 0})
        </button>
        <button
          style={tabStyle(tab === "users")}
          onClick={() => setTab("users")}
        >
          👥 Users ({users.length})
        </button>
        <button
          style={tabStyle(tab === "debates")}
          onClick={() => setTab("debates")}
        >
          💬 Debates ({debates.length})
        </button>
      </div>

      {/* Reports Tab */}
      {tab === "reports" && (
        <>
          {reports.length === 0 ? (
            <div
              className="glass"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                ✅ No pending reports. All clear!
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="glass animate-in"
                  style={{ padding: "1.5rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Reported argument:
                        </span>
                        <p
                          style={{
                            fontSize: "0.95rem",
                            lineHeight: 1.5,
                            marginTop: "0.25rem",
                            padding: "0.75rem",
                            background: "rgba(0,0,0,0.2)",
                            borderRadius: "8px",
                            borderLeft: "3px solid var(--con-color)",
                          }}
                        >
                          "{report.argumentId?.text || "Deleted argument"}"
                        </p>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          by {report.argumentId?.author?.name || "Unknown"}
                        </span>
                      </div>

                      <div style={{ marginBottom: "0.5rem" }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          Reason:
                        </span>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#f87171",
                            marginTop: "0.15rem",
                          }}
                        >
                          {report.reason}
                        </p>
                      </div>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Reported by {report.userId?.name} ·{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexDirection: "column",
                      }}
                    >
                      <button
                        onClick={() => handleResolve(report._id)}
                        className="btn-primary"
                        style={{ fontSize: "0.85rem" }}
                      >
                        ✓ Resolve
                      </button>
                      {report.argumentId && (
                        <button
                          onClick={() =>
                            handleDeleteArgument(report.argumentId._id)
                          }
                          className="btn-ghost"
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--con-color)",
                          }}
                        >
                          🗑️ Delete Arg
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            page={reportPage}
            totalPages={reportTotalPages}
            onPageChange={(p) => fetchReports(p)}
          />
        </>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="glass" style={{ padding: "1.5rem" }}>
          {/* Search & Filters */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: "180px" }}
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "0.75rem",
            }}
          >
            Showing {filteredUsers.length} of {users.length} users
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  opacity: u.isBanned ? 0.6 : 1,
                }}
              >
                {u.avatar ? (
                  <img
                    src={u.avatar}
                    alt=""
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      filter: u.isBanned ? "grayscale(1)" : "none",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: u.isBanned
                        ? "#475569"
                        : "linear-gradient(135deg, var(--primary), #a78bfa)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {u.name}
                    {u.isBanned && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#f87171",
                          border: "1px solid #f87171",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "4px",
                        }}
                      >
                        BANNED
                      </span>
                    )}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    {u.email}
                  </div>
                  {u.isBanned && u.banReason && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#fb923c",
                        marginTop: "0.15rem",
                      }}
                    >
                      Reason: {u.banReason}
                    </div>
                  )}
                </div>
                <span
                  className={`badge ${u.role === "admin" ? "badge-category" : "badge-tag"}`}
                >
                  {u.role}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--primary-light)",
                    fontSize: "0.9rem",
                    marginRight: "0.5rem",
                  }}
                >
                  {u.points} pts
                </span>
                {u.role !== "admin" ? (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => handleChangeRole(u._id, "admin")}
                      className="btn-ghost"
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.3rem 0.6rem",
                        color: "#60a5fa",
                        borderColor: "#60a5fa",
                      }}
                      title="Promote to admin"
                    >
                      ⬆ Admin
                    </button>
                    <button
                      onClick={() => handleBanUser(u._id, u.name, u.isBanned)}
                      className="btn-ghost"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                        color: u.isBanned ? "#34d399" : "#f87171",
                        borderColor: u.isBanned ? "#34d399" : "#f87171",
                      }}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleChangeRole(u._id, "user")}
                    className="btn-ghost"
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.3rem 0.6rem",
                      color: "#fb923c",
                      borderColor: "#fb923c",
                    }}
                    title="Demote to user"
                  >
                    ⬇ User
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debates Tab */}
      {tab === "debates" && (
        <div className="glass" style={{ padding: "1.5rem" }}>
          {debates.length === 0 ? (
            <p
              style={{
                color: "var(--text-muted)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              No debates found.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {debates.map((d) => (
                <div
                  key={d._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {d.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className="badge badge-category"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {d.category}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        💬 {d.argumentsCount || 0} · 👁️ {d.views || 0}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDebate(d._id)}
                    className="btn-ghost"
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.8rem",
                      color: "#f87171",
                      borderColor: "#f87171",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ban Reason Modal */}
      {banModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() =>
            setBanModal({ open: false, userId: null, userName: "" })
          }
        >
          <div
            className="glass"
            style={{
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
              borderRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              🚫 Ban {banModal.userName}
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              Provide a reason for banning this user (optional).
            </p>
            <textarea
              className="input-field"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ban reason..."
              rows={3}
              style={{
                marginBottom: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn-ghost"
                onClick={() =>
                  setBanModal({ open: false, userId: null, userName: "" })
                }
                style={{ fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => performBan(banModal.userId, banReason || null)}
                style={{
                  fontSize: "0.85rem",
                  background: "#f87171",
                  borderColor: "#f87171",
                }}
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}