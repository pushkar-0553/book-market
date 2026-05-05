// BookCard — Deep Navy + Gold premium card design
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiCheck, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop';

const CARD_BG_LIGHT = [
  'linear-gradient(135deg, #ddeafb 0%, #b8d0f0 100%)',
  'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
  'linear-gradient(135deg, #fef4de 0%, #fce8bc 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
  'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
];

const CARD_BG_DARK = [
  'linear-gradient(135deg, #0c2040 0%, #0f2a52 100%)',
  'linear-gradient(135deg, #052e16 0%, #064e20 100%)',
  'linear-gradient(135deg, #431407 0%, #6b2106 100%)',
  'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
  'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
  'linear-gradient(135deg, #082f49 0%, #0c4a6e 100%)',
];

const TOAST_STYLE = {
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(10,22,40,0.15)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
};

export default function BookCard({ book, theme, viewMode }) {
  const navigate = useNavigate();
  const { dispatch, isInCart, isInWishlist, addToCart, items } = useCart();
  const [imgError, setImgError] = useState(false);
  const inCart = isInCart(book.BookID);
  const cartItem = items.find(i => i.BookID === book.BookID);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const inWish = isInWishlist(book.BookID);
  const isDark = theme === 'dark';

  const gradIdx = book.BookID
    ? book.BookID.charCodeAt(book.BookID.length - 1) % CARD_BG_LIGHT.length
    : 0;

  const cardBg = isDark ? CARD_BG_DARK[gradIdx] : CARD_BG_LIGHT[gradIdx];

  const rating = 3.5 + ((book.BookID?.charCodeAt(0) || 65) % 15) / 10;

  function handleAddToCart(e) {
    e.stopPropagation();
    const res = addToCart(book);
    if (res.success) {
      toast.success(`"${book.SubjectName}" added to cart`, { icon: '🛒', style: TOAST_STYLE });
    } else {
      toast.error(res.error, { style: TOAST_STYLE });
    }
  }

  function handleWishlist(e) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: book });
    toast.success(inWish ? 'Removed from wishlist' : 'Saved to wishlist!', {
      icon: inWish ? '💔' : '❤️', style: TOAST_STYLE,
    });
  }

  const imgSrc = imgError || !book.ImageURL ? FALLBACK_IMG : book.ImageURL;

  return (
    <article
      className={`book-card animate-fade-in${viewMode === 'list' ? ' book-card--list' : ''}`}
      aria-label={`Book: ${book.FullBookName}`}
    >
      {/* Image area */}
      <div
        className="book-card-image"
        style={{ background: cardBg }}
        onClick={() => navigate(`/book/${book.BookID}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/book/${book.BookID}`)}
        aria-label={`View details of ${book.FullBookName}`}
      >
        <img
          src={imgSrc}
          alt={`Cover of ${book.FullBookName}`}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="book-card-overlay">
          <button className="book-card-quick-view">
            <FiEye size={13} /> View Details
          </button>
        </div>

        {/* Sem badge */}
        {book.SemRaw && (
          <span className="book-card-sem-badge">{book.SemRaw}</span>
        )}

        {/* Wishlist btn */}
        <button
          id={`wish-${book.BookID}`}
          onClick={handleWishlist}
          className={`book-card-wish-btn ${inWish ? 'active' : ''}`}
          aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWish}
        >
          <FiHeart size={13} fill={inWish ? 'currentColor' : 'none'} />
        </button>

        {/* Quantity badge when in cart */}
        {inCart && cartQty > 0 && (
          <span style={{
            position: 'absolute', bottom: 8, left: 8,
            background: '#16a34a', color: 'white',
            fontSize: '0.6875rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: 99,
            boxShadow: '0 2px 8px rgba(22,163,74,0.4)',
            pointerEvents: 'none',
            lineHeight: 1.6,
          }}>
            {cartQty} in cart
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="book-card-body">
        {/* Branch / Year chips */}
        <div className="book-card-meta">
          <span className="badge badge-navy">{book.Branch}</span>
          {book.Year && <span className="badge" style={{
            background: 'var(--bg-base)',
            color: 'var(--text-muted)',
          }}>Yr {book.Year}</span>}
        </div>

        {/* Title */}
        <h3 className="book-card-title" title={book.FullBookName}>
          {book.SubjectName || book.FullBookName}
        </h3>

        {/* Author */}
        <p className="book-card-author">by {book.AuthorName}</p>

        {/* Stars */}
        <div className="book-card-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              size={11}
              style={{
                color: i < Math.floor(rating) ? '#f4b942' : 'var(--border-strong)',
                fill: i < Math.floor(rating) ? '#f4b942' : 'none',
              }}
            />
          ))}
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 3 }}>
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="book-card-footer">
          <div className="book-card-price">
            <span className="book-card-price-main">  {`₹${book.Price}`}</span>
            <span className="book-card-price-free">Campus delivery</span>
          </div>

          {inCart ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={e => { e.stopPropagation(); dispatch({ type: 'UPDATE_QUANTITY', payload: { id: book.BookID, qty: cartQty - 1 } }); if (cartQty === 1) dispatch({ type: 'REMOVE_FROM_CART', payload: book.BookID }); }}
                style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid #16a34a', background: 'transparent', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}
                aria-label="Decrease quantity"
              >−</button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16a34a', minWidth: 18, textAlign: 'center' }}>{cartQty}</span>
              <button
                onClick={handleAddToCart}
                style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}
                aria-label="Increase quantity"
              >+</button>
            </div>
          ) : (
            <button
              id={`cart-btn-${book.BookID}`}
              onClick={handleAddToCart}
              className="book-card-add-btn default"
              aria-label={`Add ${book.SubjectName} to cart`}
            >
              <FiShoppingCart size={13} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
