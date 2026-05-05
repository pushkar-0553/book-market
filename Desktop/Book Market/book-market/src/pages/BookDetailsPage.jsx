// BookDetailsPage — Redesigned: Editorial two-column layout
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiCheck,
  FiChevronRight, FiTruck, FiShield, FiClock, FiBox, FiBook,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BooksContext';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop';

const TOAST_STYLE = {
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: '14px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
};

// Branch → cover gradient + pattern
const COVER_THEMES = {
  CSE:          { from: '#0a1628', mid: '#1e3a6e', to: '#2952a3', label: 'Computer Science',    pattern: 'lines'   },
  ECE:          { from: '#2e1065', mid: '#4c1d95', to: '#7c3aed', label: 'Electronics & Comm.', pattern: 'circles' },
  Mechanical:   { from: '#1e3a5f', mid: '#1d4ed8', to: '#3b82f6', label: 'Mechanical Engg.',    pattern: 'grid'    },
  Civil:        { from: '#292524', mid: '#57534e', to: '#78716c', label: 'Civil Engineering',   pattern: 'lines'   },
  EEE:          { from: '#451a03', mid: '#92400e', to: '#d97706', label: 'Electrical Engg.',    pattern: 'circles' },
  Common:       { from: '#0a1628', mid: '#a36010', to: '#f4b942', label: 'Common Subjects',     pattern: 'grid'    },
  Metallurgy:   { from: '#1c1917', mid: '#44403c', to: '#78716c', label: 'Metallurgy',          pattern: 'lines'   },
  Aeronautical: { from: '#082f49', mid: '#0c4a6e', to: '#0ea5e9', label: 'Aeronautical',        pattern: 'grid'    },
};


function StarRow({ rating, reviews }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
          <polygon
            points="6,1 7.5,4.5 11,4.8 8.5,7 9.2,11 6,9 2.8,11 3.5,7 1,4.8 4.5,4.5"
            fill={i < Math.floor(rating) ? '#f4b942' : 'var(--border-strong, #d1d5db)'}
          />
        </svg>
      ))}
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 2 }}>
        {rating.toFixed(1)}
      </span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        · {reviews} reviews
      </span>
    </div>
  );
}


export default function BookDetailsPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { dispatch, isInCart, isInWishlist, addToCart } = useCart();
  const { allBooks, getBooks, loading }      = useBooks();

  const [book, setBook] = useState(null);

  useEffect(() => {
    if (!loading && allBooks.length > 0) {
      const found = allBooks.find(b => String(b.BookID) === String(id));
      if (found) { setBook(found); window.scrollTo(0, 0); }
      else navigate('/dashboard', { replace: true });
    }
  }, [id, allBooks, loading, navigate]);

  if (loading || !book) {
    return (
      <div className="flex-center" style={{ minHeight: 'calc(100vh - var(--navbar-h))' }}>
        <div className="loader" />
      </div>
    );
  }

  const inCart = isInCart(book.BookID);
  const inWish = isInWishlist(book.BookID);
  const rating  = 3.5 + ((book.BookID?.charCodeAt(0) || 65) % 15) / 10;
  const reviews = 80  + ((book.BookID?.charCodeAt(book.BookID.length - 1) || 50) % 120);

  const coverTheme = COVER_THEMES[book.Branch] ?? COVER_THEMES.Common;

  const relatedBooks = getBooks({ branch: book.Branch })
    .filter(b => b.BookID !== book.BookID)
    .slice(0, 4);

  function handleAddToCart() {
    const res = addToCart(book);
    if (res.success) {
      toast.success(`"${book.SubjectName}" added to cart`, { icon: '🛒', style: TOAST_STYLE });
    } else {
      toast.error(res.error, { style: TOAST_STYLE });
    }
  }

  function handleWishlist() {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: book });
    toast.success(inWish ? 'Removed from wishlist' : 'Saved to wishlist!', {
      icon: inWish ? '💔' : '❤️', style: TOAST_STYLE,
    });
  }

  // ── shared style tokens ───────────────────────────────
  const card = {
    background: 'var(--bg-surface)',
    border: '0.5px solid var(--border-subtle)',
    borderRadius: 16,
    overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>

        {/* ── Breadcrumbs ─────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}
        >
          {[
            { label: 'Dashboard', action: () => navigate('/dashboard') },
            { label: book.Branch,  action: () => navigate('/dashboard') },
          ].map(({ label, action }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                onClick={action}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8125rem', transition: 'color 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold-500)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {label}
              </button>
              <FiChevronRight size={12} style={{ opacity: 0.4 }} />
            </span>
          ))}
          <span style={{
            color: 'var(--text-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 240,
          }}>
            {book.SubjectName || book.FullBookName}
          </span>
        </nav>

        {/* ── Main two-column layout ───────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}>

          {/* ─── LEFT: Cover + trust strip ─────────────── */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 2rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Cover card */}
            <div style={card}>
              {/* Actual Image Cover */}
              <div style={{ height: 440, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 16 }}>
                <img
                  src={book.ImageURL || FALLBACK_IMG}
                  alt={`Cover of ${book.FullBookName}`}
                  onError={e => { e.target.src = FALLBACK_IMG; }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.85) 100%)' }} />

                {/* Top row: sem badge + wishlist */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {book.SemRaw && (
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px',
                      borderRadius: 20, background: 'rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.95)', letterSpacing: '0.06em',
                      border: '0.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
                      textTransform: 'uppercase',
                    }}>
                      {book.SemRaw}
                    </span>
                  )}
                  <button
                    onClick={handleWishlist}
                    aria-label={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-pressed={inWish}
                    style={{
                      marginLeft: 'auto', width: 32, height: 32, borderRadius: '50%',
                      border: 'none', cursor: 'pointer',
                      background: inWish ? 'rgba(248,113,113,0.22)' : 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: inWish ? '#f87171' : 'rgba(255,255,255,0.85)',
                      transition: 'background 150ms',
                    }}
                  >
                    <FiHeart size={15} fill={inWish ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Bottom: branch label + title */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'rgba(244,185,66,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                    {coverTheme.label}
                  </p>
                  <p style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontSize: '1.125rem', fontWeight: 700, color: 'white', lineHeight: 1.25,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {book.SubjectName || book.FullBookName}
                  </p>
                </div>
              </div>

              {/* Rating row */}
              <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border-subtle)' }}>
                <StarRow rating={rating} reviews={reviews} />
              </div>
            </div>

            {/* Trust strip */}
            {[
              { icon: <FiCheck size={11} />, label: '100% Genuine Quality', bg: '#dcfce7', color: '#166534' },
              { icon: <FiTruck size={11} />, label: 'Campus Delivery',       bg: '#dbeafe', color: '#1e40af' },
              { icon: <FiShield size={11} />, label: 'In Stock · Ready to Ship', bg: '#fef3c7', color: '#92400e' },
            ].map(({ icon, label, bg, color }) => (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)',
                  borderRadius: 10, padding: '9px 12px', fontSize: '0.8125rem', color: 'var(--text-muted)',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 7,
                  background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {icon}
                </div>
                {label}
              </div>
            ))}
          </div>

          {/* ─── RIGHT: Details ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Title block */}
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fef3c7', color: '#92400e', letterSpacing: '0.04em' }}>
                  Bestseller
                </span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#dbeafe', color: '#1e40af', letterSpacing: '0.04em' }}>
                  {book.Branch}
                </span>
                {book.SemRaw && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#166534', letterSpacing: '0.04em' }}>
                    {book.SemRaw}
                  </span>
                )}
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: 'clamp(1.75rem, 3vw, 2.625rem)',
                fontWeight: 700, color: 'var(--text-primary)',
                lineHeight: 1.15, letterSpacing: '-0.01em',
                marginBottom: '0.75rem',
              }}>
                {book.FullBookName}
              </h1>

              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                by{' '}
                <span style={{ color: 'var(--gold-500, #b45309)', fontWeight: 600 }}>
                  {book.AuthorName}
                </span>
              </p>
            </div>

            {/* Purchase card */}
            <div style={{
              ...card,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              {/* Price */}
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Special Price
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', paddingTop: 4 }}>₹</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {book.Price}
                  </span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', fontWeight: 600, color: '#166534', marginTop: 6 }}>
                  <FiCheck size={14} /> In Stock &amp; Ready to Ship
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: '0.5px', background: 'var(--border-subtle)' }} />

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleAddToCart}
                  aria-label={inCart ? 'Already in cart' : `Add ${book.SubjectName} to cart`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: inCart ? '#dcfce7' : 'var(--navy-900, #0a1628)',
                    color: inCart ? '#166534' : 'white',
                    fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 200ms', letterSpacing: '0.01em',
                  }}
                >
                  {inCart
                    ? <><FiCheck size={17} /> Added to Cart</>
                    : <><FiShoppingCart size={17} /> Add to Cart</>
                  }
                </button>
                <button
                  onClick={handleWishlist}
                  aria-label={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    width: '100%', padding: '11px', borderRadius: 10,
                    border: '0.5px solid var(--border-default)',
                    background: inWish ? '#fff1f2' : 'transparent',
                    color: inWish ? '#be123c' : 'var(--text-primary)',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  <FiHeart size={15} fill={inWish ? 'currentColor' : 'none'} />
                  {inWish ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem',
              }}>
                Specifications
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                {[
                  { icon: <FiClock size={14} />,  label: 'Academic Year', val: book.Year ? `Year ${book.Year}` : null },
                  { icon: <FiBox size={14} />,   label: 'Semester',      val: book.SemRaw               },
                  { icon: <FiBook size={14} />,   label: 'Subject',       val: book.SubjectName          },
                  { icon: <FiShield size={14} />, label: 'Subject Code',  val: book.BookID               },
                ].filter(s => s.val).map(spec => (
                  <div
                    key={spec.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)',
                      borderRadius: 12, padding: '12px 14px',
                      transition: 'transform 200ms',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: 'var(--navy-900, #0a1628)',
                      color: 'var(--gold-500, #f4b942)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {spec.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>
                        {spec.label}
                      </p>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {spec.val}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Books ────────────────────────────── */}
        {relatedBooks.length > 0 && (
          <section style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '0.5px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Related in {book.Branch}
              </h2>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}
              >
                View all →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {relatedBooks.map(rb => {
                const rbRating = (3.5 + ((rb.BookID?.charCodeAt(0) || 65) % 15) / 10).toFixed(1);
                return (
                  <article
                    key={rb.BookID}
                    onClick={() => navigate(`/book/${rb.BookID}`)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border-subtle)',
                      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                      transition: 'transform 200ms ease, box-shadow 200ms ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,22,40,0.10)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label={`View ${rb.FullBookName}`}
                  >
                    {/* Mini cover */}
                    <div style={{ height: 180, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 10 }}>
                      <img
                        src={rb.ImageURL || FALLBACK_IMG}
                        alt={`Cover of ${rb.FullBookName}`}
                        onError={e => { e.target.src = FALLBACK_IMG; }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                      <p style={{
                        position: 'relative', zIndex: 2,
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.9375rem', color: 'white', lineHeight: 1.2, fontWeight: 700,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {rb.SubjectName || rb.FullBookName}
                      </p>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '10px 12px 12px' }}>
                      <p style={{
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                        lineHeight: 1.35, marginBottom: 3,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {rb.FullBookName}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rb.AuthorName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{rb.Price}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                            <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.2,11 6,9 2.8,11 3.5,7 1,4.8 4.5,4.5" fill="#f4b942" />
                          </svg>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rbRating}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}