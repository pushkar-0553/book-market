// WishlistPage — consistent card design + Move All to Cart
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiChevronLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop';
const TOAST_STYLE = { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: '14px' };

export default function WishlistPage() {
  useEffect(() => {
    document.title = 'Wishlist - Book Market';
  }, []);

  const { wishlist, dispatch, isInCart, addToCart: contextAddToCart } = useCart();
  const navigate = useNavigate();

  function removeFromWishlist(book) {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: book });
    toast.success('Removed from wishlist', { icon: '💔', style: TOAST_STYLE });
  }

  function handleAddToCart(book) {
    const res = contextAddToCart(book);
    if (res.success) {
      toast.success(`"${book.SubjectName}" added to cart!`, { icon: '🛒', style: TOAST_STYLE });
    } else {
      toast.error(res.error, { style: TOAST_STYLE });
    }
  }

  function moveAllToCart() {
    dispatch({ type: 'MOVE_WISHLIST_TO_CART' });
    toast.success('Moved applicable wishlist items to cart!', { icon: '🛒', style: TOAST_STYLE });
  }

  if (wishlist.length === 0) {
    return (
      <div className="empty-state animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)' }}>
        <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>💔</div>
        <h1 className="empty-state-title">Your wishlist is empty</h1>
        <p className="empty-state-body">Save books you like for later and keep track of what you need for the semester!</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">Browse Books</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', padding: '2rem' }} className="animate-fade-in">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div className="page-header">
          <button onClick={() => navigate('/dashboard')} className="page-back-btn" aria-label="Back to dashboard">
            <FiChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="page-title">My Wishlist</h1>
            <p className="page-subtitle">{wishlist.length} saved book{wishlist.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Move all to cart */}
          {wishlist.length > 1 && (
            <button onClick={moveAllToCart} className="btn btn-navy btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <FiShoppingBag size={14} /> Move All to Cart
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }} role="list">
          {wishlist.map((book, idx) => (
            <article
              key={book.BookID}
              className="book-card animate-fade-in"
              role="listitem"
              aria-label={`Wishlisted: ${book.FullBookName}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Image area — matches BookCard style */}
              <div className="book-card-image" style={{ background: 'linear-gradient(135deg, var(--navy-100) 0%, var(--navy-200) 100%)' }}>
                <img
                  src={book.ImageURL || FALLBACK_IMG}
                  alt={`Cover of ${book.FullBookName}`}
                  onError={e => { e.target.src = FALLBACK_IMG; }}
                  loading="lazy"
                />
                {/* Sem badge */}
                {book.SemRaw && <span className="book-card-sem-badge">{book.SemRaw}</span>}
                {/* Remove button */}
                <button
                  id={`wish-remove-${book.BookID}`}
                  onClick={() => removeFromWishlist(book)}
                  className="book-card-wish-btn active"
                  aria-label={`Remove ${book.SubjectName} from wishlist`}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>

              {/* Body — matches BookCard body layout */}
              <div className="book-card-body">
                <div className="book-card-meta">
                  <span className="badge badge-navy">{book.Branch}</span>
                  {book.Year && <span className="badge" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>Yr {book.Year}</span>}
                </div>
                <h3 className="book-card-title" title={book.FullBookName}>{book.SubjectName || book.FullBookName}</h3>
                <p className="book-card-author">by {book.AuthorName}</p>

                <div className="book-card-footer">
                  <div className="book-card-price">
                    <span className="book-card-price-main">₹{book.Price}</span>
                  </div>
                  <button
                    id={`wish-cart-${book.BookID}`}
                    onClick={() => handleAddToCart(book)}
                    className={`book-card-add-btn ${isInCart(book.BookID) ? 'in-cart' : 'default'}`}
                    aria-label={isInCart(book.BookID) ? 'Already in cart' : `Add ${book.SubjectName} to cart`}
                  >
                    <FiShoppingCart size={13} />
                    {isInCart(book.BookID) ? 'In Cart' : 'Add'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
