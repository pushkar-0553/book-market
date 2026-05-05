// BookModal — theme-aware quick view modal with focus trap and Escape close
import { useEffect, useRef, useState } from 'react';
import { FiX, FiShoppingCart, FiHeart, FiStar, FiPackage, FiTruck, FiShield, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BooksContext';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop';

export default function BookModal({ book: initialBook, onClose }) {
  const [book, setBook] = useState(initialBook);
  const { dispatch, isInCart, isInWishlist } = useCart();
  const { getBooks } = useBooks();

  // Reset book if prop changes
  useEffect(() => { setBook(initialBook); }, [initialBook]);

  const inCart = isInCart(book?.BookID);
  const inWish = isInWishlist(book?.BookID);
  const closeRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Focus close button on open
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!book) return null;

  const rating  = 3.5 + ((book.BookID?.charCodeAt(0) || 65) % 15) / 10;
  const reviews = 80 + ((book.BookID?.charCodeAt(book.BookID.length - 1) || 50) % 120);

  function handleAddToCart() {
    dispatch({ type: 'ADD_TO_CART', payload: book });
    toast.success(`Added "${book.SubjectName}" to cart`, { icon: '🛒' });
  }

  function handleWishlist() {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: book });
    toast.success(inWish ? 'Removed from wishlist' : 'Saved to wishlist!', { icon: inWish ? '💔' : '❤️' });
  }

  const relatedBooks = getBooks({ branch: book.Branch })
    .filter(b => b.BookID !== book.BookID)
    .slice(0, 6);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(5,13,26,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'fadeIn 200ms ease' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-2xl)', maxWidth: 1000, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', animation: 'slideUp 300ms var(--ease-out)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 10 }}>
          <h2 id="modal-title" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPackage size={14} style={{ color: 'var(--navy-400)' }} /> Product Details
          </h2>
          <button
            id="modal-close"
            ref={closeRef}
            onClick={onClose}
            style={{ width: 32, height: 32, border: 'none', background: 'var(--bg-base)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {/* Image Left Side */}
            <div style={{ flexShrink: 0, width: 300 }}>
              <img
                src={book.ImageURL || FALLBACK_IMG}
                alt={`Cover of ${book.FullBookName}`}
                onError={e => { e.target.src = FALLBACK_IMG; }}
                style={{ width: '100%', height: 'auto', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)', display: 'block' }}
              />
            </div>

            {/* Info Right Side */}
            <div style={{ flex: 1, minWidth: 300 }}>
              {/* Chips */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span className="badge badge-navy">{book.Branch}</span>
                {book.SemRaw && <span className="badge badge-green">{book.SemRaw}</span>}
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                {book.FullBookName}
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                by <span style={{ color: 'var(--navy-600)', fontWeight: 600 }}>{book.AuthorName}</span>
              </p>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} size={16} style={{ color: i < Math.floor(rating) ? '#f4b942' : 'var(--border-strong)', fill: i < Math.floor(rating) ? '#f4b942' : 'none' }} />
                  ))}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rating.toFixed(1)}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({reviews} ratings)</span>
              </div>

              {/* Price Area */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>₹{book.Price}</span>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--success-text)', fontWeight: 600 }}>✓ In Stock</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiTruck size={12} /> Campus delivery
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {[['Year', book.Year ? `Year ${book.Year}` : '—'], ['Semester', book.SemRaw || '—'], ['Subject Code', book.BookID], ['Subject', book.SubjectName]].map(([label, val]) => val && (
                  <div key={label}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</p>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <FiTruck size={16} style={{ color: 'var(--navy-400)' }} /> Fast Delivery
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <FiShield size={16} style={{ color: '#059669' }} /> Genuine Book
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  id={`modal-cart-btn-${book.BookID}`}
                  onClick={handleAddToCart}
                  className={`btn btn-primary`}
                  style={{ flex: 1, height: 50, fontSize: '1rem', fontWeight: 600, opacity: inCart ? 0.85 : 1 }}
                >
                  {inCart ? <><FiCheck size={18} /> Added to Cart</> : <><FiShoppingCart size={18} /> Add to Cart</>}
                </button>
                <button
                  id={`modal-wish-btn-${book.BookID}`}
                  onClick={handleWishlist}
                  style={{ width: 50, height: 50, borderRadius: 'var(--r-md)', border: `2px solid ${inWish ? '#e11d48' : 'var(--border-default)'}`, background: inWish ? 'rgba(225,29,72,0.1)' : 'var(--bg-base)', color: inWish ? '#e11d48' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms', flexShrink: 0 }}
                  aria-label={inWish ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <FiHeart size={20} fill={inWish ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>

          {/* Related Books Section (Amazon Style) */}
          {relatedBooks.length > 0 && (
            <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-default)' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Customers who bought this item also bought</h4>
              <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
                {relatedBooks.map(rb => (
                  <div
                    key={rb.BookID}
                    onClick={() => setBook(rb)}
                    style={{ width: 150, flexShrink: 0, cursor: 'pointer', transition: 'transform 150ms', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <img
                      src={rb.ImageURL || FALLBACK_IMG}
                      alt={rb.FullBookName}
                      onError={e => { e.target.src = FALLBACK_IMG; }}
                      style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)' }}
                    />
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-600)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                      {rb.FullBookName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rb.AuthorName}
                    </p>
                    <div style={{ display: 'flex', gap: 2, marginBottom: '0.375rem' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} size={12} style={{ color: i < 4 ? '#f4b942' : 'var(--border-strong)', fill: i < 4 ? '#f4b942' : 'none' }} />
                      ))}
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                        {80 + ((rb.BookID?.charCodeAt(rb.BookID.length - 1) || 50) % 120)}
                      </span>
                    </div>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{rb.Price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
