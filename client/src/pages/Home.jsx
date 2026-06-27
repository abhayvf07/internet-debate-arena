// Home page — debates feed, search, category filter, and sorting

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDebates, searchDebates } from '../services/api';
import DebateCard from '../components/DebateCard';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import { PageSkeleton } from '../components/SkeletonLoader';

const SORT_OPTIONS = [
    { label: '📚 All Debates', value: 'all' },
    { label: '🆕 Newest', value: 'newest' },
    { label: '🔥 Trending', value: 'trending' },
    { label: '🗳️ Most Voted', value: 'most_voted' },
];

export default function Home() {
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';

    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [searchInput, setSearchInput] = useState(urlQuery);
    const [sortBy, setSortBy] = useState('all');

    // Sync state with URL if it changes (e.g. back navigation)
    if (urlQuery !== prevUrlQuery) {
        setPrevUrlQuery(urlQuery);
        if (urlQuery) {
            setSearchQuery(urlQuery);
            setSearchInput(urlQuery);
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput);
                setPage(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchInput, searchQuery]);

    const { data: debatesData, isLoading: loadingDebates } = useQuery({
        queryKey: ['debates', page, category, searchQuery, sortBy],
        queryFn: async () => {
            if (searchQuery) {
                const res = await searchDebates({ q: searchQuery, page, limit: 10 });
                return res.data;
            } else {
                const res = await getDebates({
                    page,
                    limit: 10,
                    category: category || undefined,
                    sort: sortBy === 'all' ? 'newest' : sortBy,
                });
                return res.data;
            }
        },
        initialData: { debates: [], totalPages: 1 },
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setPage(1);
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        setSearchQuery('');
        setSearchInput('');
        setPage(1);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setPage(1);
    };

    const debates = debatesData?.debates ?? [];
    const totalPages = debatesData?.totalPages ?? 1;

    if (loadingDebates && debates.length === 0) {
        return <PageSkeleton />;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="animate-in">
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem',
                    background: 'linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    ⚔️ Internet Debate Arena
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
                    Structured debates on topics that matter. Pick a side, make your case, and let the votes decide.
                </p>
            </div>

            <form onSubmit={handleSearch} style={{
                display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem',
            }}>
                <input
                    className="input-field"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search debates..."
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary">Search</button>
                {searchQuery && (
                    <button type="button" className="btn-ghost" onClick={() => {
                        setSearchQuery('');
                        setSearchInput('');
                        setPage(1);
                    }}>
                        Clear
                    </button>
                )}
            </form>

            <CategoryFilter selected={category} onSelect={handleCategoryChange} />

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {SORT_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid',
                            borderColor: sortBy === opt.value ? 'var(--primary)' : 'var(--border)',
                            background: sortBy === opt.value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            color: sortBy === opt.value ? 'var(--primary-light)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <h2 style={{
                fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem',
            }}>
                {searchQuery ? `Results for "${searchQuery}"` :
                    sortBy === 'newest' ? 'Newest Debates' :
                        sortBy === 'trending' ? 'Trending Debates' :
                            sortBy === 'most_voted' ? 'Most Voted Debates' :
                                'All Debates'}
            </h2>

            {loadingDebates ? (
                <PageSkeleton />
            ) : debates.length === 0 ? (
                <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        {searchQuery ? 'No debates match your search.' : 'No debates yet. Be the first to start one!'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '1rem',
                }}>
                    {debates.map((d) => (
                        <DebateCard key={d._id} debate={d} showTrending={sortBy === 'trending'} />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
