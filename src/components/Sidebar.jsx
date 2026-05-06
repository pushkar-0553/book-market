// Sidebar — Deep Navy + Gold | Premium e-commerce navigation
import { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiLock, FiX } from 'react-icons/fi';

const BRANCHES = ['Common', 'CSE', 'Civil', 'Mechanical', 'EEE', 'ECE', 'Metallurgy', 'Aeronautical'];

const BRANCH_META = {
  Common:       { icon: '📚', gradient: 'linear-gradient(135deg, #c47c1a, #f4b942)' },
  CSE:          { icon: '💻', gradient: 'linear-gradient(135deg, #0f2040, #2952a3)' },
  Civil:        { icon: '🏗️', gradient: 'linear-gradient(135deg, #44403c, #78716c)' },
  Mechanical:   { icon: '⚙️', gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
  EEE:          { icon: '⚡', gradient: 'linear-gradient(135deg, #92400e, #f59e0b)' },
  ECE:          { icon: '📡', gradient: 'linear-gradient(135deg, #4c1d95, #8b5cf6)' },
  Metallurgy:   { icon: '🔩', gradient: 'linear-gradient(135deg, #374151, #6b7280)' },
  Aeronautical: { icon: '✈️', gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)' },
};

const CATEGORIES = [
  { id: 'BTEC',  label: 'B.Tech', emoji: '🎓', enabled: true },
  { id: 'MTECH', label: 'M.Tech', emoji: '🔬', enabled: false },
  { id: 'MBR',   label: 'MBA',    emoji: '💼', enabled: false },
];

function SidebarContent({ selectedBranch, onSelectBranch, onClose }) {
  const [openCategory, setOpenCategory] = useState('BTEC');

  function handleBranchClick(branch) {
    onSelectBranch(branch);
    onClose?.();
  }

  return (
    <div className="sidebar-inner">

      {/* Close btn on mobile — shows only when sidebar is a drawer */}
      {onClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }} className="sidebar-close-row">
          <button onClick={onClose} className="btn btn-ghost btn-icon-sm" aria-label="Close sidebar">
            <FiX size={18} />
          </button>
        </div>
      )}

      <div className="sidebar-section-label" style={{ marginBottom: '0.875rem' }}>Browse</div>

      {CATEGORIES.map(cat => (
        <div key={cat.id} style={{ marginBottom: '0.25rem' }}>
          <button
            id={`sidebar-cat-${cat.id}`}
            onClick={() => cat.enabled && setOpenCategory(openCategory === cat.id ? null : cat.id)}
            disabled={!cat.enabled}
            className={`sidebar-cat-btn ${openCategory === cat.id && cat.enabled ? 'active' : ''}`}
            aria-expanded={openCategory === cat.id}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
              <span>{cat.label}</span>
              {!cat.enabled && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: '0.625rem', fontWeight: 700,
                  background: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: 99,
                }}>
                  <FiLock size={8} /> Soon
                </span>
              )}
            </span>
            {cat.enabled && (
              openCategory === cat.id
                ? <FiChevronDown size={14} />
                : <FiChevronRight size={14} />
            )}
          </button>

          {cat.enabled && openCategory === cat.id && (
            <div className="sidebar-branch-list" role="list">
              {BRANCHES.map(branch => {
                const meta = BRANCH_META[branch];
                const isActive = selectedBranch === branch;

                return (
                  <button
                    key={branch}
                    id={`sidebar-branch-${branch.toLowerCase()}`}
                    onClick={() => handleBranchClick(branch)}
                    className={`sidebar-branch-btn ${isActive ? 'active' : ''}`}
                    role="listitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className="sidebar-branch-icon"
                      style={isActive ? { background: meta.gradient } : {}}
                    >
                      {meta.icon}
                    </span>
                    <span style={{ flex: 1 }}>{branch}</span>
                    {isActive && <span className="active-dot" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Promo card */}
      <div className="sidebar-promo">
        <div className="sidebar-promo-title">🎉 Semester Sale</div>
        <div className="sidebar-promo-body">
          Save on your first order
        </div>
        <div className="sidebar-promo-code">STUDENT10</div>
        <div style={{ fontSize: '0.6875rem', color: 'rgba(244,185,66,0.6)', marginTop: '0.375rem' }}>
          10% off • Applies at checkout
        </div>
      </div>

    </div>
  );
}

export default function Sidebar({ selectedBranch, onSelectBranch, isOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <aside
        id="sidebar-desktop"
        className="sidebar"
        aria-label="Course navigation"
      >
        <SidebarContent selectedBranch={selectedBranch} onSelectBranch={onSelectBranch} />
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(5, 13, 26, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 30,
          }}
          onClick={onClose}
        />
      )}

      {/* Mobile drawer — slides in from left */}
      <aside
        id="sidebar-mobile"
        aria-hidden={!isOpen}
        style={{
          position: 'fixed',
          top: 0, left: 0, height: '100%',
          width: 'var(--sidebar-w)',
          zIndex: 40,
          paddingTop: 'var(--navbar-h)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen ? 'var(--shadow-xl)' : 'none',
          overflowY: 'auto',
        }}
      >
        <SidebarContent selectedBranch={selectedBranch} onSelectBranch={onSelectBranch} onClose={onClose} />
      </aside>
    </>
  );
}