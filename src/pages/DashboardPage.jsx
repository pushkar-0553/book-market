// DashboardPage — Deep Navy + Gold | Hero banner + Grid layout
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiFilter, FiGrid, FiList, FiX, FiTrendingUp, FiBookOpen, FiPackage } from 'react-icons/fi';
import { useBooks } from '../context/BooksContext';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';

const YEARS = ['All', '2nd', '3rd', '4th'];

const HERO_BANNERS = {
  CSE:          { color: 'linear-gradient(135deg, #0a1628 0%, #1e3a6e 60%, #2952a3 100%)', icon: '💻', label: 'Computer Science' },
  ECE:          { color: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 60%, #7c3aed 100%)', icon: '📡', label: 'Electronics & Comm.' },
  Mechanical:   { color: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)', icon: '⚙️', label: 'Mechanical Engg.' },
  Civil:        { color: 'linear-gradient(135deg, #292524 0%, #57534e 60%, #78716c 100%)', icon: '🏗️', label: 'Civil Engineering' },
  EEE:          { color: 'linear-gradient(135deg, #451a03 0%, #92400e 60%, #d97706 100%)', icon: '⚡', label: 'Electrical Engg.' },
  Common:       { color: 'linear-gradient(135deg, #0a1628 0%, #a36010 60%, #f4b942 100%)', icon: '📚', label: 'Common Subjects' },
  Metallurgy:   { color: 'linear-gradient(135deg, #1c1917 0%, #44403c 60%, #78716c 100%)', icon: '🔩', label: 'Metallurgy' },
  Aeronautical: { color: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 60%, #0ea5e9 100%)', icon: '✈️', label: 'Aeronautical' },
};

export default function DashboardPage() {
  const { allBooks: books, loading } = useBooks();

  const [selectedBranch, setSelectedBranch] = useState(() => {
    return sessionStorage.getItem('bm_selected_branch') || null;
  });

  useEffect(() => {
    document.title = selectedBranch ? `${selectedBranch} Books - Book Market` : 'Dashboard - Book Market';
    if (selectedBranch) {
      sessionStorage.setItem('bm_selected_branch', selectedBranch);
    }
  }, [selectedBranch]);
  const [selectedYear, setSelectedYear]     = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [viewMode, setViewMode]             = useState('grid');
  const [menuOpen, setMenuOpen]             = useState(false);

  const handleSearch = useCallback(q => setSearchQuery(q), []);
  const handleBranchSelect = useCallback(b => {
    setSelectedBranch(b);
    setSelectedYear('All');
    setSearchQuery('');
  }, []);

  const filtered = useMemo(() => {
    let result = books.filter(b => b.Branch === selectedBranch);
    if (selectedYear !== 'All') result = result.filter(b => String(b.Year) === selectedYear.replace(/[^0-9]/g, ''));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.SubjectName?.toLowerCase().includes(q) ||
        b.FullBookName?.toLowerCase().includes(q) ||
        b.AuthorName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, selectedBranch, selectedYear, searchQuery]);

  const heroBanner = HERO_BANNERS[selectedBranch] || HERO_BANNERS.Common;
  const totalBooks = filtered.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      <DashboardNavbar
        onSearch={handleSearch}
        searchValue={searchQuery}
        onMenuToggle={() => setMenuOpen(p => !p)}
        menuOpen={menuOpen}
      />

      <div style={{ display: 'flex', paddingTop: 'var(--navbar-h)' }}>
        <Sidebar
          selectedBranch={selectedBranch}
          onSelectBranch={handleBranchSelect}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <main
          id="main-content"
          className="main-content"
          style={{ padding: '0', display: 'flex', flexDirection: 'column' }}
        >
          {/* ── No branch selected landing state ────── */}
          {!selectedBranch ? (
            <div className="empty-state animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))', justifyContent: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📚</div>
              <h2 className="empty-state-title">Welcome to BookMarket</h2>
              <p className="empty-state-body" style={{ maxWidth: 380 }}>
                Select your branch from the left panel to browse semester-wise books curated for your course.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => handleBranchSelect('CSE')}
                style={{ marginTop: '0.5rem' }}
                id="btn-explore-now"
                data-testid="btn-explore-now"
              >
                Explore Now!
              </button>
            </div>
          ) : (
            <>
          {/* ── Hero Banner ───────────────────────────── */}
          <div
            className="dashboard-hero"
            style={{
              background: heroBanner.color,
              padding: '2rem 2rem 1.75rem',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 500ms ease',
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(244,185,66,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: -20, left: '40%',
              width: 300, height: 100,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{heroBanner.icon}</span>
                <div>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(244,185,66,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Currently Browsing
                  </p>
                  <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.625rem',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.2,
                  }}>
                    {heroBanner.label}
                  </h1>
                </div>
              </div>

              {/* Stats row */}
              <div className="dashboard-hero-stats" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {[
                  { icon: <FiBookOpen size={14} />, value: `${totalBooks} book${totalBooks !== 1 ? 's' : ''}`, label: 'available' },
                  { icon: <FiTrendingUp size={14} />, value: 'B.Tech', label: 'curriculum' },
                  { icon: <FiPackage size={14} />, value: 'Campus', label: 'delivery' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ color: 'rgba(244,185,66,0.8)' }}>{s.icon}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'white', fontWeight: 600 }}>{s.value}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Filter Bar ────────────────────────────── */}
          <div className="dashboard-filter-bar" style={{
            padding: '1.25rem 2rem',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            position: 'sticky',
            top: 'var(--navbar-h)',
            zIndex: 10,
          }}>
            {/* Year filter pills */}
            {selectedBranch !== 'Common' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <FiFilter size={14} /> Year
                </span>
                <div className="year-filter-bar" role="group" aria-label="Filter by year" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {YEARS.map(yr => (
                    <label key={yr} htmlFor={`year-filter-${yr}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="year-filter"
                        value={yr}
                        checked={selectedYear === yr}
                        onChange={() => setSelectedYear(yr)}
                        id={`year-filter-${yr}`}
                        data-testid={`year-filter-${yr.toLowerCase()}`}
                        style={{ accentColor: 'var(--gold-500)', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-body)', fontWeight: selectedYear === yr ? 600 : 400 }}>
                        {yr === 'All' ? 'All Years' : `${yr} Year`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Right — result count + view toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {searchQuery && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    "{searchQuery}"
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    aria-label="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>

              {/* View mode toggle */}
              <div style={{
                display: 'flex',
                border: '1px solid var(--border-default)',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                {[
                  { mode: 'grid', icon: <FiGrid size={15} />, label: 'Grid view' },
                  { mode: 'list', icon: <FiList size={15} />, label: 'List view' },
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    id={`view-mode-${mode}`}
                    data-testid={`view-mode-${mode}`}
                    onClick={() => setViewMode(mode)}
                    aria-label={label}
                    style={{
                      width: 34, height: 34,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none',
                      background: viewMode === mode ? 'var(--navy-900)' : 'transparent',
                      color: viewMode === mode ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Books Grid ────────────────────────────── */}
          <div className="dashboard-content" style={{ padding: '1.75rem 2rem 3rem', flex: 1 }}>
            {loading ? (
              <div className="books-grid" style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'list'
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.25rem',
              }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state animate-fade-in">
                <div className="empty-state-icon">📭</div>
                <h2 className="empty-state-title">No books found</h2>
                <p className="empty-state-body">
                  {searchQuery
                    ? `No results for "${searchQuery}" in ${selectedBranch} ${selectedYear !== 'All' ? `(${selectedYear} Year)` : ''}`
                    : `No books available for ${selectedBranch} ${selectedYear !== 'All' ? `— ${selectedYear} Year` : ''} yet.`}
                </p>
                <button
                  className="btn btn-navy"
                  id="btn-clear-filters"
                  data-testid="btn-clear-filters"
                  onClick={() => { setSelectedYear('All'); setSearchQuery(''); }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className="books-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'list'
                    ? '1fr'
                    : 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: viewMode === 'list' ? '0.75rem' : '1.25rem',
                }}
                role="list"
                aria-label={`${selectedBranch} books`}
              >
                {filtered.map((book, idx) => (
                  <div
                    key={book.BookID}
                    role="listitem"
                    style={{
                      animation: `cardReveal 350ms var(--ease-out) both`,
                      animationDelay: `${Math.min(idx * 40, 400)}ms`,
                    }}
                  >
                    <BookCard
                      book={book}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}