// Home page — tabbed debate feed with URL-persisted category/page state
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getDebates,
  getMyDebates,
  searchDebates,
  getTrendingDebates,
} from "../services/api";
import DebateCard from "../components/DebateCard";
import CategoryFilter from "../components/CategoryFilter";
import Pagination from "../components/Pagination";
import { PageSkeleton } from "../components/SkeletonLoader";

const TABS = [
  { key: "all", label: "All Debates", icon: "📚" },
  { key: "my", label: "My Debates", icon: "👤" },
  { key: "newest", label: "Newest", icon: "🆕" },
  { key: "trending", label: "Trending", icon: "🔥" },
  { key: "most_voted", label: "Most Voted", icon: "🗳️" },
];

const VALID_TABS = new Set(TABS.map((t) => t.key));

export default function Home() {
  const { tab: rawTab } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Validate tab — default to 'all' if invalid
  const tab = VALID_TABS.has(rawTab) ? rawTab : "all";
  useEffect(() => {
    if (!VALID_TABS.has(rawTab)) {
      navigate("/debates/all", { replace: true });
    }
  }, [rawTab, navigate]);

  // Helper to update search params without losing existing ones
  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([k, v]) => {
            if (v === undefined || v === "" || v === null) {
              next.delete(k);
            } else {
              next.set(k, v);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Read state from URL
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const urlQuery = searchParams.get("q") || "";

  // Local search input state (debounced)
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);

  // Sync search input when URL query changes externally (e.g. back navigation)
  useEffect(() => {
    setSearchInput(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [urlQuery]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== debouncedQuery) {
        setDebouncedQuery(searchInput);
        updateParams({ q: searchInput || undefined, page: undefined });
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-tab category memory (not persisted across refreshes — URL handles that)
  const [tabCategories, setTabCategories] = useState({});

  // Tab switch — navigate to new tab, restore that tab's remembered category
  const handleTabChange = useCallback(
    (newTab) => {
      // Save current tab's category
      setTabCategories((prev) => ({ ...prev, [tab]: category }));

      const rememberedCategory = tabCategories[newTab] || "";
      const params = new URLSearchParams();
      if (rememberedCategory) params.set("category", rememberedCategory);
      navigate(`/debates/${newTab}?${params.toString()}`, { replace: true });
    },
    [tab, category, tabCategories, navigate],
  );

  const handleCategoryChange = useCallback(
    (cat) => {
      setTabCategories((prev) => ({ ...prev, [tab]: cat }));
      updateParams({
        category: cat || undefined,
        page: undefined,
        q: undefined,
      });
      setSearchInput("");
      setDebouncedQuery("");
    },
    [tab, updateParams],
  );

  const handlePageChange = useCallback(
    (p) => {
      updateParams({ page: p > 1 ? String(p) : undefined });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateParams],
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      setDebouncedQuery(searchInput);
      updateParams({ q: searchInput || undefined, page: undefined });
    },
    [searchInput, updateParams],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setDebouncedQuery("");
    updateParams({ q: undefined, page: undefined });
  }, [updateParams]);

  // ── React Query ──
  const queryKey = useMemo(
    () => ["debates", tab, category, page, debouncedQuery],
    [tab, category, page, debouncedQuery],
  );

  const { data: debatesData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      // Search mode — use search endpoint regardless of tab
      if (debouncedQuery) {
        const res = await searchDebates({
          q: debouncedQuery,
          page,
          limit: 10,
          category: category || undefined,
        });
        return res.data;
      }

      // Tab-specific fetching
      switch (tab) {
        case "my": {
          const res = await getMyDebates({
            page,
            limit: 10,
            category: category || undefined,
          });
          return res.data;
        }
        case "trending": {
          const res = await getTrendingDebates(20);
          // Trending endpoint returns array, not paginated object
          const items = Array.isArray(res.data)
            ? res.data
            : res.data?.debates || [];
          // Client-side category filter for trending (trending endpoint doesn't support category param)
          const filtered = category
            ? items.filter((d) => d.category === category)
            : items;
          return {
            debates: filtered,
            totalPages: 1,
            page: 1,
            total: filtered.length,
          };
        }
        case "newest": {
          const res = await getDebates({
            page,
            limit: 10,
            category: category || undefined,
            sort: "newest",
          });
          return res.data;
        }
        case "most_voted": {
          const res = await getDebates({
            page,
            limit: 10,
            category: category || undefined,
            sort: "most_voted",
          });
          return res.data;
        }
        default: {
          // 'all'
          const res = await getDebates({
            page,
            limit: 10,
            category: category || undefined,
            sort: "newest",
          });
          return res.data;
        }
      }
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const debates = debatesData?.debates ?? [];
  const totalPages = debatesData?.totalPages ?? 1;
  const showTrending = tab === "trending";

  // Section title
  const sectionTitle = useMemo(() => {
    if (debouncedQuery) return `Results for "${debouncedQuery}"`;
    const found = TABS.find((t) => t.key === tab);
    return found ? `${found.icon} ${found.label}` : "All Debates";
  }, [tab, debouncedQuery]);

  if (isLoading && debates.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      {/* Header */}
      <div
        style={{ textAlign: "center", marginBottom: "2rem" }}
        className="animate-in"
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "0.75rem",
            background: "linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⚔️ Internet Debate Arena
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.05rem",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Structured debates on topics that matter. Pick a side, make your case,
          and let the votes decide.
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          maxWidth: "500px",
          margin: "0 auto 1.5rem",
        }}
      >
        <input
          className="input-field"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search debates..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
        {debouncedQuery && (
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        )}
      </form>

      {/* Feed Tabs */}
      <div
        id="feed-tabs"
        style={{
          display: "flex",
          gap: "0.35rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0",
        }}
      >
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              style={{
                padding: "0.6rem 1.1rem",
                fontSize: "0.85rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--primary-light)" : "var(--text-muted)",
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
              }}
            >
              {t.icon} {t.label}
            </button>
          );
        })}
      </div>

      {/* Category filter */}
      <CategoryFilter selected={category} onSelect={handleCategoryChange} />

      {/* Section heading */}
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {sectionTitle}
        {category && (
          <span
            className="badge badge-category"
            style={{ fontSize: "0.75rem" }}
          >
            {category}
          </span>
        )}
      </h2>

      {/* Debates grid */}
      {isLoading ? (
        <PageSkeleton />
      ) : debates.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>
            {debouncedQuery
              ? "No debates match your search."
              : tab === "my"
                ? "You haven't created any debates yet. Start one!"
                : "No debates yet. Be the first to start one!"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1rem",
          }}
        >
          {debates.map((d) => (
            <DebateCard key={d._id} debate={d} showTrending={showTrending} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}