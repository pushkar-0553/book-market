// CartPage — Deep Navy + Gold | Premium e-commerce cart
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag,
  FiArrowRight, FiChevronLeft, FiCheck, FiArrowLeft,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 49;
export const PROMO_CODES = { STUDENT10: 10, NEWUSER: 15, BOOK20: 20 };

const TOAST_STYLE = {
  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
  border: '1px solid var(--border-default)', borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(10,22,40,0.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
};

export default function CartPage() {
  const { items, promo: savedPromo, dispatch } = useCart();
  const navigate = useNavigate();

  // Restore promo from context (persisted across navigation)
  const [promoCode, setPromoCode]       = useState(savedPromo?.code || '');
  const [promoApplied, setPromoApplied] = useState(savedPromo?.code || null);
  const [promoError, setPromoError]     = useState('');

  const selectedItems = items.filter(i => i.selected);
  const selectedSubtotal = selectedItems.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  const discount = promoApplied ? Math.round(selectedSubtotal * (PROMO_CODES[promoApplied] / 100)) : 0;
  const total    = Math.max(0, selectedSubtotal + (selectedItems.length > 0 ? DELIVERY_FEE : 0) - discount);

  function handlePromoApply() {
    const code = promoCode.trim().toUpperCase();
    if (!code) { setPromoError('Please enter a promo code.'); return; }
    if (PROMO_CODES[code]) {
      setPromoApplied(code);
      setPromoError('');
      // Save to context so Checkout can read it
      dispatch({ type: 'SET_PROMO', payload: { code, pct: PROMO_CODES[code] } });
      toast.success(`"${code}" applied — ${PROMO_CODES[code]}% off! 🎉`, { icon: '🏷️', style: TOAST_STYLE });
    } else {
      setPromoError('Invalid code. Try STUDENT10, NEWUSER, or BOOK20.');
    }
  }

  function handlePromoRemove() {
    setPromoApplied(null);
    setPromoCode('');
    dispatch({ type: 'CLEAR_PROMO' });
  }

  function handleSelectAll(checked) { dispatch({ type: 'SELECT_ALL', payload: checked }); }

  function handleRemoveSelected() {
    if (selectedItems.length === 0) {
      toast.error('No items selected!', { style: TOAST_STYLE }); return;
    }
    dispatch({ type: 'REMOVE_SELECTED' });
    toast.success('Selected items removed.', { style: TOAST_STYLE });
  }

  if (items.length === 0) {
    return (
      <div className="empty-state animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))' }}>
        <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>🛒</div>
        <h1 className="empty-state-title">Your cart is empty</h1>
        <p className="empty-state-body">
          You haven't added any books yet. Browse your semester catalog and add the books you need!
        </p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          <FiShoppingBag size={18} /> Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', padding: '2rem' }} className="animate-fade-in">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        <div className="page-header">
          <button onClick={() => navigate('/dashboard')} className="page-back-btn" aria-label="Back to dashboard">
            <FiChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Shopping Cart</h1>
            <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.75rem', alignItems: 'start' }}
          className="cart-grid">

          {/* ── Left: Cart items ──────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Select all bar */}
            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1.25rem',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }} htmlFor="select-all">
                <input
                  id="select-all"
                  type="checkbox"
                  checked={items.length > 0 && items.every(i => i.selected)}
                  onChange={e => handleSelectAll(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--navy-800)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Select All ({items.length})
                </span>
              </label>
              <button
                id="remove-selected"
                onClick={handleRemoveSelected}
                className="btn btn-danger btn-sm"
                aria-label="Remove selected items"
              >
                <FiTrash2 size={13} /> Remove Selected
              </button>
            </div>

            {/* Items */}
            {items.map((item, idx) => (
              <CartItem
                key={item.BookID}
                item={item}
                dispatch={dispatch}
                style={{ animationDelay: `${idx * 60}ms` }}
              />
            ))}

            {/* Continue shopping link */}
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.5rem 0',
                transition: 'color 150ms',
                width: 'fit-content',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <FiArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>

          {/* ── Right: Order Summary ──────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Promo code card */}
            <div className="card" style={{ padding: '1.375rem' }}>
              <h2 style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}>
                <FiTag size={15} style={{ color: 'var(--accent-primary)' }} /> Promo Code
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="promo-input"
                  type="text"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                  placeholder="Enter code"
                  disabled={!!promoApplied}
                  className="input-field"
                  style={{
                    flex: 1, height: 40,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  aria-label="Promo code"
                  aria-describedby={promoError ? 'promo-error' : undefined}
                  onKeyDown={e => e.key === 'Enter' && !promoApplied && handlePromoApply()}
                />
                <button
                  id="apply-promo"
                  onClick={handlePromoApply}
                  disabled={!!promoApplied}
                  className="btn btn-navy btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {promoApplied ? <><FiCheck size={14} /> Applied</> : 'Apply'}
                </button>
              </div>

              {promoError && (
                <p id="promo-error" role="alert" style={{ fontSize: '0.75rem', color: 'var(--error-text)', marginTop: '0.375rem', fontWeight: 600 }}>
                  {promoError}
                </p>
              )}

              {promoApplied && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success-text)' }}>
                    "{promoApplied}" — {PROMO_CODES[promoApplied]}% off
                  </span>
                  <button
                    onClick={handlePromoRemove}
                    style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error-text)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Quick-apply chips */}
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {Object.keys(PROMO_CODES).map(code => (
                  <button
                    key={code}
                    onClick={() => { if (!promoApplied) { setPromoCode(code); setPromoError(''); } }}
                    disabled={!!promoApplied}
                    style={{
                      fontSize: '0.6875rem', fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-base)',
                      color: 'var(--text-muted)',
                      cursor: promoApplied ? 'default' : 'pointer',
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: '0.03em',
                      transition: 'all 150ms',
                      opacity: promoApplied ? 0.5 : 1,
                    }}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="card" style={{ padding: '1.375rem' }}>
              {/* Gold top accent bar */}
              <div style={{
                height: 3,
                background: 'linear-gradient(90deg, var(--navy-900), var(--accent-primary))',
                borderRadius: 'var(--r-full)',
                marginBottom: '1.25rem',
              }} />

              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Order Summary
              </h2>

              <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <SummaryRow
                  label={`Subtotal (${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''})`}
                  value={`₹${selectedSubtotal.toLocaleString()}`}
                />
                <SummaryRow
                  label="Delivery"
                  value={selectedItems.length > 0 ? `₹${DELIVERY_FEE}` : '—'}
                />
                {discount > 0 && (
                  <SummaryRow
                    label={`Promo (${promoApplied})`}
                    value={`−₹${discount.toLocaleString()}`}
                    accent="success"
                  />
                )}
                <div style={{ height: 1, background: 'var(--border-default)', margin: '0.25rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <dt style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</dt>
                  <dd style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    ₹{total.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <button
                id="proceed-checkout"
                onClick={() => navigate('/checkout')}
                disabled={selectedItems.length === 0}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  height: 50,
                  fontSize: '1rem',
                  letterSpacing: '0.01em',
                }}
              >
                Proceed to Checkout <FiArrowRight size={18} />
              </button>

              {selectedItems.length === 0 && (
                <p style={{
                  marginTop: '0.625rem',
                  padding: '0.625rem',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  color: 'var(--warning-text)',
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  Select at least one item to proceed
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryRow({ label, value, accent }) {
  const isSuccess = accent === 'success';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <dt style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</dt>
      <dd style={{
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: isSuccess ? 'var(--success-text)' : 'var(--text-primary)',
      }}>{value}</dd>
    </div>
  );
}

function CartItem({ item, dispatch }) {
  const [imgError, setImgError] = useState(false);
  const isSelected = !!item.selected;

  return (
    <article
      className="card animate-slide-up"
      aria-label={`Cart item: ${item.FullBookName}`}
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderColor: isSelected ? 'var(--navy-300)' : undefined,
        boxShadow: isSelected ? '0 0 0 3px rgba(41,82,163,0.08)' : undefined,
        alignItems: 'flex-start',
      }}
    >
      {/* Checkbox */}
      <label style={{ paddingTop: '0.25rem', flexShrink: 0 }} htmlFor={`cart-sel-${item.BookID}`}>
        <input
          id={`cart-sel-${item.BookID}`}
          type="checkbox"
          checked={isSelected}
          onChange={() => dispatch({ type: 'TOGGLE_SELECT', payload: item.BookID })}
          style={{ width: 16, height: 16, accentColor: 'var(--navy-800)', cursor: 'pointer' }}
          aria-label={`Select ${item.FullBookName}`}
        />
      </label>

      {/* Book cover */}
      <img
        src={imgError || !item.ImageURL
          ? 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=100'
          : item.ImageURL}
        alt={`Cover of ${item.FullBookName}`}
        onError={() => setImgError(true)}
        style={{
          width: 60, height: 84,
          objectFit: 'cover',
          borderRadius: 10,
          flexShrink: 0,
          border: '1px solid var(--border-default)',
        }}
        loading="lazy"
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Chips */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
          <span className="badge badge-navy">{item.Branch}</span>
          {item.SemRaw && <span className="badge badge-green">{item.SemRaw}</span>}
        </div>

        <h3 style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          marginBottom: '0.125rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.SubjectName || item.FullBookName}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          by {item.AuthorName}
        </p>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Qty stepper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--bg-base)',
            }}
            role="group"
            aria-label="Quantity controls"
          >
            <button
              id={`qty-dec-${item.BookID}`}
              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.BookID, qty: item.quantity - 1 } })}
              disabled={item.quantity <= 1}
              style={{
                width: 32, height: 32,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
              aria-label="Decrease quantity"
            >
              <FiMinus size={13} />
            </button>
            <input
              id={`qty-${item.BookID}`}
              type="number"
              min={1} max={10}
              value={item.quantity}
              onChange={e => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.BookID, qty: Number(e.target.value) } })}
              style={{
                width: 36, height: 32,
                textAlign: 'center',
                border: 'none',
                borderLeft: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              aria-label={`Quantity for ${item.SubjectName}`}
            />
            <button
              id={`qty-inc-${item.BookID}`}
              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.BookID, qty: item.quantity + 1 } })}
              disabled={item.quantity >= 10}
              style={{
                width: 32, height: 32,
                border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
              aria-label="Increase quantity"
            >
              <FiPlus size={13} />
            </button>
          </div>

          {/* Price + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              ₹{(Number(item.Price) * item.quantity).toLocaleString()}
            </span>
            <button
              id={`remove-${item.BookID}`}
              onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.BookID })}
              style={{
                width: 34, height: 34,
                border: 'none',
                background: 'var(--bg-base)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-bg)'; e.currentTarget.style.color = 'var(--error-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label={`Remove ${item.SubjectName} from cart`}
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}