// Reply section — nested replies with add/delete for an argument
import { useState } from "react";
import { replyToArgument, deleteArgument } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ReplySection({
  argumentId,
  replies = [],
  onReplyAdded,
  parentSide = "Pro",
}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [side, setSide] = useState(parentSide);
  const [loading, setLoading] = useState(false);

  // Submit a reply
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await replyToArgument({ parentId: argumentId, text, side });
      setText("");
      setSide(parentSide);
      setShowForm(false);
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      const msg = err.response?.data?.message || "Reply failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete own reply
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await deleteArgument(replyId);
      toast.success("Reply deleted");
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      toast.error("Failed to delete reply");
      console.error(err);
    }
  };

  const sideBtnStyle = (s) => ({
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid",
    borderColor:
      side === s
        ? s === "Pro"
          ? "var(--pro-color)"
          : "var(--con-color)"
        : "var(--border)",
    background:
      side === s
        ? s === "Pro"
          ? "var(--pro-bg)"
          : "var(--con-bg)"
        : "transparent",
    color:
      side === s
        ? s === "Pro"
          ? "var(--pro-color)"
          : "var(--con-color)"
        : "var(--text-muted)",
    fontWeight: 600,
    fontSize: "0.75rem",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ marginTop: "0.75rem" }}>
      {/* Replies list */}
      {replies.length > 0 && (
        <div
          style={{
            borderLeft: "2px solid var(--border)",
            paddingLeft: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          {replies.map((reply) => (
            <div
              key={reply._id}
              style={{
                padding: "0.5rem 0",
                fontSize: "0.85rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p style={{ color: "var(--text)", lineHeight: 1.4 }}>
                  {reply.text}
                </p>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  — {reply.author?.name || "Unknown"} ·{" "}
                  {new Date(reply.createdAt).toLocaleDateString()}
                  {reply.side && (
                    <span
                      className={`badge ${reply.side === "Pro" ? "badge-pro" : "badge-con"}`}
                      style={{ marginLeft: "0.4rem", fontSize: "0.65rem" }}
                    >
                      {reply.side}
                    </span>
                  )}
                </span>
              </div>

              {user && user._id === reply.author?._id && (
                <button
                  onClick={() => handleDeleteReply(reply._id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    padding: 0,
                    marginLeft: "0.5rem",
                  }}
                  title="Delete reply"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply toggle + form */}
      {user && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary-light)",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: 0,
            }}
          >
            {showForm ? "Cancel" : "↩ Reply"}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.35rem",
                  marginBottom: "0.4rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSide("Pro")}
                  style={sideBtnStyle("Pro")}
                >
                  👍 Pro
                </button>
                <button
                  type="button"
                  onClick={() => setSide("Con")}
                  style={sideBtnStyle("Con")}
                >
                  👎 Con
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="input-field"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a reply..."
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.85rem",
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}