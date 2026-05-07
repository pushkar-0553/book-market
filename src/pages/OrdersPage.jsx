import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBooks } from '../context/BooksContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiClock, FiMinus, FiPlus, FiTrash2, FiSearch, FiPackage, FiBriefcase } from 'react-icons/fi';

const PACKING_MINS  = 3;
const DELIVERY_MINS = 10;
const MS_PER_MIN    = 60 * 1000;

const COVER_THEMES = {
  CSE:          { from: '#0a1628', to: '#2952a3' },
  ECE:          { from: '#2e1065', to: '#7c3aed' },
  Mechanical:   { from: '#1e3a5f', to: '#3b82f6' },
  Civil:        { from: '#292524', to: '#78716c' },
  EEE:          { from: '#451a03', to: '#d97706' },
  Common:       { from: '#0a1628', to: '#f4b942' },
  Metallurgy:   { from: '#1c1917', to: '#78716c' },
  Aeronautical: { from: '#082f49', to: '#0ea5e9' },
};

const TOAST_STYLE = {
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: '14px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '1rem',
};

function formatDate(timestamp) {
  const d = new Date(Number(timestamp));
  if (isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timestamp) {
  const d = new Date(Number(timestamp));
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function MiniCover({ branch, id, width = 42, height = 56, imageURL }) {
  if (imageURL) {
    return <img src={imageURL} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  const theme = COVER_THEMES[branch] ?? COVER_THEMES.Common;
  const gid   = `mc-${id}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to}   />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${gid})`} />
      <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    </svg>
  );
}

function Countdown({ secsLeft }) {
  const m = Math.max(0, Math.floor(secsLeft / 60));
  const s = Math.max(0, secsLeft % 60);
  const expired = secsLeft <= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.875rem', fontWeight: 700,
      color: expired ? '#A32D2D' : '#633806',
      background: expired ? '#FCEBEB' : '#FAEEDA',
      border: `0.5px solid ${expired ? '#F7C1C1' : '#FAC775'}`,
      padding: '4px 10px', borderRadius: 20,
    }}>
      <FiClock size={11} />
      {expired ? 'Window closed' : `${m}:${String(s).padStart(2, '0')} left`}
    </span>
  );
}

function EditPanel({ session, secsLeft, searchQuery, onSearchChange, recommendations, onQtyChange, onRemove, onAddBook, onSave, onCancel }) {
  const subtotal = session.items.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  let discount = 0;
  if (session.promo) {
    if (session.promo.type === 'PERCENT') discount = subtotal * (session.promo.value / 100);
    else if (session.promo.type === 'FIXED') discount = session.promo.value;
  }
  const total = Math.max(0, subtotal - discount);

  return (
    <div style={{
      borderTop: '0.5px solid var(--border-default)',
      background: 'var(--bg-base)',
      padding: '1.25rem 1.5rem',
      animation: 'editSlideDown 250ms ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Mode
        </p>
        <Countdown secsLeft={secsLeft} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Items in order
          </p>
          {session.items.length === 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No items — add some books →</p>
          )}
          {session.items.map(item => (
            <div
              key={item.BookID}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', marginBottom: 6,
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-subtle)',
                borderRadius: 10,
              }}
            >
              <div style={{ width: 22, height: 30, borderRadius: 3, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                <MiniCover branch={item.Branch} id={`ep-${item.BookID}`} width={22} height={30} imageURL={item.ImageURL || item.image} />
              </div>
              <span style={{ flex: 1, minWidth: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.SubjectName || item.FullBookName}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button onClick={() => onQtyChange(item.BookID, -1)} style={{ width: 20, height: 20, borderRadius: 4, border: '0.5px solid var(--border-default)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <FiMinus size={10} />
                </button>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 14, textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button onClick={() => onQtyChange(item.BookID, 1)} style={{ width: 20, height: 20, borderRadius: 4, border: '0.5px solid var(--border-default)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <FiPlus size={10} />
                </button>
              </div>
              <button onClick={() => onRemove(item.BookID)} style={{ width: 20, height: 20, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E24B4A', flexShrink: 0 }}>
                <FiTrash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Add more books
          </p>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <FiSearch size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px 7px 28px',
                border: '0.5px solid var(--border-default)',
                borderRadius: 8, background: 'var(--bg-surface)',
                fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto', paddingRight: 2 }}>
            {recommendations.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No results</p>
            )}
            {recommendations.map(book => (
              <div
                key={book.BookID}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 8,
                  border: '0.5px solid transparent',
                  transition: 'background 150ms, border-color 150ms',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div style={{ width: 22, height: 30, borderRadius: 3, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <MiniCover branch={book.Branch} id={`rec-${book.BookID}`} width={22} height={30} imageURL={book.ImageURL || book.image} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.SubjectName || book.FullBookName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>₹{book.Price}</p>
                </div>
                <button
                  onClick={() => onAddBook(book)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: '0.5px solid #185FA5', background: 'transparent',
                    color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#185FA5'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#185FA5'; }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1rem', background: 'var(--bg-surface)', border: '0.5px solid var(--border-subtle)', borderRadius: 10, padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Subtotal ({session.items.length} items)</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        {session.promo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: '#3B6D11', fontWeight: 600, marginBottom: 4 }}>
            <span>Promo {session.promo.code}</span>
            <span>−₹{Math.round(discount).toLocaleString()}</span>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)',
          borderTop: '0.5px dashed var(--border-default)',
          paddingTop: 8, marginTop: 6,
        }}>
          <span>Total</span>
          <span>₹{Math.round(total).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={onCancel}
          style={{ padding: '9px 16px', borderRadius: 9, border: '0.5px solid var(--border-default)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: '#0C447C', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#185FA5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0C447C'; }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ── Cancel Order Confirmation Dialog ─────────────────────────── */
function CancelDialog({ order, onConfirm, onClose }) {
  if (!order) return null;
  return (
    <div className="cdlg-backdrop" onClick={onClose}>
      <div className="cdlg" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cdlg-title">
        {/* Icon */}
        <div className="cdlg-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        {/* Heading */}
        <h2 id="cdlg-title" className="cdlg-title">Cancel Order?</h2>
        <p className="cdlg-body">This action is permanent and cannot be undone. Your order will be removed immediately.</p>

        {/* Order summary chip */}
        <div className="cdlg-order-chip">
          <div className="cdlg-chip-row">
            <span className="cdlg-chip-label">Order ID</span>
            <span className="cdlg-chip-val">{order.id}</span>
          </div>
          <div className="cdlg-chip-row">
            <span className="cdlg-chip-label">Items</span>
            <span className="cdlg-chip-val">{order.items.length} book{order.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="cdlg-chip-row">
            <span className="cdlg-chip-label">Total paid</span>
            <span className="cdlg-chip-val">₹{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="cdlg-actions">
          <button className="cdlg-btn-keep" onClick={onClose}>Keep Order</button>
          <button className="cdlg-btn-cancel" onClick={onConfirm}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pay Difference Dialog ────────────────────────────────────── */
function PayDifferenceDialog({ diff, onConfirm, onCancel }) {
  const [method, setMethod] = useState('online');
  return (
    <div className="cdlg-backdrop" onClick={onCancel}>
      <div className="cdlg" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cdlg-icon-wrap" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h2 className="cdlg-title">Additional Payment</h2>
        <p className="cdlg-body">Your order total has increased. Please choose a payment method for the difference.</p>
        
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '12px 16px', margin: '16px 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Difference to pay</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-primary)' }}>₹{diff.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, border: `1px solid ${method === 'online' ? '#185FA5' : 'var(--border-default)'}`, background: method === 'online' ? '#F0F7FF' : 'transparent', cursor: 'pointer' }}>
            <input type="radio" name="payDiff" checked={method === 'online'} onChange={() => setMethod('online')} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Pay Online Now</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI, Card, or Net Banking</p>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, border: `1px solid ${method === 'cod' ? '#185FA5' : 'var(--border-default)'}`, background: method === 'cod' ? '#F0F7FF' : 'transparent', cursor: 'pointer' }}>
            <input type="radio" name="payDiff" checked={method === 'cod'} onChange={() => setMethod('cod')} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Cash on Delivery</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay the difference at your doorstep</p>
            </div>
          </label>
        </div>

        <div className="cdlg-actions">
          <button className="cdlg-btn-keep" onClick={onCancel}>Cancel Edit</button>
          <button className="cdlg-btn-cancel" style={{ background: '#0C447C', borderColor: '#0C447C' }} onClick={() => onConfirm(method)}>
            Proceed to Pay ₹{diff.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order, now, isEditing, editSession, searchQuery,
  recommendations, updatedId, updatedInfo,
  onModify, onCancelEdit, onSaveChanges,
  onQtyChange, onRemove, onAddBook, onSearchChange, onCancelOrder,
}) {
  const elapsedMs   = now - order.orderTime;
  const elapsedMins = elapsedMs / MS_PER_MIN;

  let status   = 'DELIVERED';
  if (elapsedMins < PACKING_MINS) {
    status   = 'PACKING';
  } else if (elapsedMins < DELIVERY_MINS) {
    status   = 'DELIVERING';
  }

  const secsLeft = status === 'PACKING'
    ? Math.ceil((PACKING_MINS - elapsedMins) * 60)
    : Math.ceil((DELIVERY_MINS - elapsedMins) * 60);

  const timeLeftMins = Math.ceil(secsLeft / 60);
  const isUpdated = updatedId === order.id;

  const isPacking   = status === 'PACKING';
  const isActive    = status === 'PACKING' || status === 'DELIVERING';

  // Compute a 0-100 progress value for the live progress bar
  const progressPct = isActive
    ? Math.min(100, Math.round((elapsedMins / DELIVERY_MINS) * 100))
    : 100;

  return (
    <div className={`order-card ${isActive ? 'active-card' : ''} ${isPacking ? 'packing-card' : ''}`}>
      {isUpdated && updatedInfo && (
        <div style={{
          background: '#EAF3DE', borderBottom: '0.5px solid #C0DD97',
          padding: '8px 16px',
          fontSize: '0.9375rem', fontWeight: 700, color: '#27500A',
          display: 'flex', alignItems: 'center', gap: 6,
          animation: 'editSlideDown 300ms ease both',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Order updated — {updatedInfo.items} items · ₹{updatedInfo.total.toLocaleString()}
        </div>
      )}

      <div className="oc-hdr">
        <div className="oc-hdr-cell">
          <p className="oc-label">Order placed</p>
          <p className="oc-val">{formatDate(order.orderTime)}</p>
        </div>
        <div className="oc-hdr-cell">
          <p className="oc-label">Total</p>
          <p className="oc-val">₹{order.total.toLocaleString()}</p>
        </div>
        <div className="oc-hdr-cell">
          <p className="oc-label">Ship to</p>
          <p className="oc-val">{typeof order.address === 'object' ? (order.address?.address || 'Campus Hostel A') : (order.address || 'Campus Hostel A')}</p>
        </div>
        <div className="oc-hdr-cell">
          <p className="oc-label">Order ID</p>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <p className="oc-val blue">{order.id}</p>
            {isActive && (
              <span className="live-badge">
                <span className="live-badge-dot" />
                LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="oc-body">
        <div className="oc-items">
          {status === 'PACKING' && (
            <div className="status-strip strip-pack" style={{marginBottom: '10px'}}>
              <div>
                <p className="strip-text">Packing your books now</p>
                <p style={{fontSize: '12px', color: '#185FA5', marginTop: '2px'}}>Modify window closes in {timeLeftMins} min</p>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="modify-btn" onClick={() => onModify(order)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Modify
                </button>
                <button className="cancel-order-btn" onClick={() => onCancelOrder(order.id)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Cancel Order
                </button>
              </div>
            </div>
          )}
          {status === 'DELIVERING' && (
            <div className="status-strip strip-delivering" style={{marginBottom: '10px'}}>
              <div>
                <p className="strip-text">Order is out for delivery</p>
                <p style={{fontSize: '12px', color: '#854F0B', marginTop: '2px'}}>Arriving in ~{timeLeftMins} min</p>
              </div>
            </div>
          )}
          {status === 'DELIVERED' && (
             <div className="status-strip strip-done" style={{marginBottom: '10px'}}>
              <div>
                <p className="strip-text">Delivered on {formatDate(order.orderTime)}, {formatTime(order.orderTime)}</p>
                <p style={{fontSize: '12px', color: '#3B6D11', marginTop: '2px'}}>All {order.items.length} item{order.items.length !== 1 ? 's' : ''} delivered to your location</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          )}

          {order.items.map(item => (
            <div className="item-row" key={item.BookID}>
              <div className="item-thumb">
                <MiniCover branch={item.Branch} id={`item-${item.BookID}-${order.id}`} imageURL={item.ImageURL || item.image} />
              </div>
              <div className="item-details">
                <p className="item-name">{item.SubjectName || item.FullBookName}</p>
                <p className="item-meta">by {item.AuthorName} · {item.Branch}</p>
                <p className="item-meta" style={{marginTop: '3px'}}>Qty: {item.quantity}</p>
              </div>
              <p className="item-price">₹{(Number(item.Price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="oc-sidebar">
          <p className="track-title">Tracking</p>

          {/* Live progress bar for active orders */}
          {isActive && (
            <div style={{marginBottom: 14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <span style={{fontSize:11,color:'#185FA5',fontWeight:600}}>LIVE</span>
                <span style={{fontSize:11,color:'var(--text-muted)'}}>{progressPct}% complete</span>
              </div>
              <div style={{height:6,background:'var(--bg-elevated)',borderRadius:99,overflow:'hidden'}}>
                <div className="live-progress-bar" style={{width:`${progressPct}%`,height:'100%',borderRadius:99,background:'linear-gradient(90deg,#378ADD,#185FA5)',transition:'width 1s linear'}} />
              </div>
            </div>
          )}

          <div className="track-steps">
            <div className="tstep">
              <div className="tstep-dot dot-done">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="tstep-body">
                <p className="tstep-label">Order confirmed</p>
                <p className="tstep-sub">{formatDate(order.orderTime)}, {formatTime(order.orderTime)}</p>
              </div>
            </div>

            <div className="tstep">
              <div className={`tstep-dot ${status === 'PACKING' ? 'dot-active dot-pulse' : 'dot-done'}`}>
                {status === 'PACKING' ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div className="tstep-body">
                <p className="tstep-label" style={status === 'PACKING' ? {color: '#185FA5',fontWeight:600} : {}}>Packing</p>
                <p className="tstep-sub">{status === 'PACKING' ? `Est. ${timeLeftMins} min remaining` : 'Complete'}</p>
              </div>
            </div>

            <div className="tstep">
              <div className={`tstep-dot ${status === 'PACKING' ? 'dot-pending' : status === 'DELIVERING' ? 'dot-active dot-pulse' : 'dot-done'}`}>
                {status === 'PACKING' ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h5l2 5v5h-7V8z"/></svg>
                ) : status === 'DELIVERING' ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h5l2 5v5h-7V8z"/></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div className="tstep-body">
                <p className="tstep-label" style={status === 'PACKING' ? {color: 'var(--text-muted)'} : status === 'DELIVERING' ? {color: '#185FA5',fontWeight:600} : {}}>Out for delivery</p>
                <p className="tstep-sub">{status === 'PACKING' ? 'Est. 10 min' : status === 'DELIVERING' ? `Est. ${timeLeftMins} min` : 'Complete'}</p>
              </div>
            </div>

            <div className="tstep">
              <div className={`tstep-dot ${status === 'DELIVERED' ? 'dot-done' : 'dot-pending'}`}>
                 {status === 'DELIVERED' ? (
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                 ) : (
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                 )}
              </div>
              <div className="tstep-body" style={{paddingBottom: 0}}>
                <p className="tstep-label" style={status !== 'DELIVERED' ? {color: 'var(--text-muted)'} : {}}>Delivered</p>
                <p className="tstep-sub">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && editSession && (
        <EditPanel
          session={editSession}
          secsLeft={secsLeft}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          recommendations={recommendations}
          onQtyChange={onQtyChange}
          onRemove={onRemove}
          onAddBook={onAddBook}
          onSave={onSaveChanges}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders,         setOrders]         = useState([]);
  const [now,            setNow]            = useState(Date.now());
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editSession,    setEditSession]    = useState(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [updatedOrderId, setUpdatedOrderId] = useState(null);
  const [updatedInfo,    setUpdatedInfo]    = useState(null);
  const [cancelTarget,   setCancelTarget]   = useState(null); // order object to cancel
  const [payDiffTarget,  setPayDiffTarget]  = useState(null); // { diff, orderId, method }

  const { allBooks } = useBooks();
  const { user, wallet, updateWallet } = useAuth();
  const navigate     = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bm_orders') || '[]');
    saved.sort((a, b) => b.orderTime - a.orderTime);
    setOrders(saved);
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const totalSpent  = orders.reduce((s, o) => s + o.total, 0);
  const totalBooks  = orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0);

  function handleModify(order) {
    setEditingOrderId(order.id);
    setEditSession(JSON.parse(JSON.stringify(order)));
    setSearchQuery('');
    toast('Entered Edit Mode', { icon: '📝', style: TOAST_STYLE });
  }

  function handleCancelEdit() {
    setEditingOrderId(null);
    setEditSession(null);
  }

  function handleSaveChanges() {
    if (!editSession.items.length) { toast.error('Order cannot be empty!', { style: TOAST_STYLE }); return; }
    
    const originalOrder = orders.find(o => o.id === editSession.id);
    const diff = editSession.total - originalOrder.total;

    if (diff > 0) {
      // Price increased, need extra payment
      setPayDiffTarget({ diff, session: { ...editSession } });
      return;
    }

    finalizeOrderSave(editSession, diff);
  }

  function finalizeOrderSave(session, diff) {
    const originalOrder = orders.find(o => o.id === session.id);
    
    // If price decreased and it was paid online, refund to wallet
    if (diff < 0 && (originalOrder.payment === 'upi' || originalOrder.payment === 'card')) {
      const refundAmount = Math.abs(diff);
      updateWallet(refundAmount);
      toast.success(`₹${refundAmount} refunded to your wallet!`, { icon: '💰', style: TOAST_STYLE });
    }

    const updated = orders.map(o => o.id === session.id ? session : o);
    setOrders(updated);
    localStorage.setItem('bm_orders', JSON.stringify(updated));
    setUpdatedOrderId(session.id);
    setUpdatedInfo({ items: session.items.length, total: session.total });
    setEditingOrderId(null);
    setEditSession(null);
    setPayDiffTarget(null);
    toast.success('Order updated!', { style: TOAST_STYLE });
    setTimeout(() => { setUpdatedOrderId(null); setUpdatedInfo(null); }, 4000);
  }

  function handleCancelOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) setCancelTarget(order);
  }

  function confirmCancelOrder() {
    if (!cancelTarget) return;
    
    // Refund logic for cancellations
    if (cancelTarget.payment === 'upi' || cancelTarget.payment === 'card') {
      updateWallet(cancelTarget.total);
      toast.success(`Full refund of ₹${cancelTarget.total.toLocaleString()} added to your wallet!`, { icon: '💰', style: TOAST_STYLE });
    } else {
      toast.success('Order cancelled successfully.');
    }

    const updated = orders.filter(o => o.id !== cancelTarget.id);
    setOrders(updated);
    localStorage.setItem('bm_orders', JSON.stringify(updated));
    setCancelTarget(null);
  }

  function updateItemQty(bookId, delta) {
    setEditSession(prev => {
      const next = { ...prev };
      next.items = next.items.map(item =>
        item.BookID === bookId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      recalc(next);
      return next;
    });
  }

  function removeItem(bookId) {
    setEditSession(prev => {
      const next = { ...prev, items: prev.items.filter(i => i.BookID !== bookId) };
      recalc(next);
      return next;
    });
  }

  function addBookToOrder(book) {
    setEditSession(prev => {
      const next = { ...prev };
      const ex = next.items.find(i => i.BookID === book.BookID);
      if (ex) { ex.quantity += 1; }
      else { next.items.push({ ...book, quantity: 1 }); }
      recalc(next);
      return next;
    });
    toast.success(`Added ${book.SubjectName}`, { style: TOAST_STYLE });
  }

  function recalc(session) {
    const sub = session.items.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
    let disc = 0;
    if (session.promo) {
      if (session.promo.type === 'PERCENT') disc = sub * (session.promo.value / 100);
      else if (session.promo.type === 'FIXED') disc = session.promo.value;
    }
    session.total = Math.max(0, sub - disc);
  }

  const recommendations = useMemo(() => {
    if (!editSession) return [];
    const branch = editSession.branch || editSession.items[0]?.Branch;
    let pool = allBooks.filter(b => b.Branch === branch);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(b =>
        b.SubjectName?.toLowerCase().includes(q) ||
        b.FullBookName?.toLowerCase().includes(q)
      );
    }
    pool = pool.filter(b => !editSession.items.some(i => i.BookID === b.BookID));
    return pool.slice(0, 6);
  }, [allBooks, editSession, searchQuery]);

  const discoverBooks = useMemo(() => {
    if (!orders.length) return [];
    const latest = orders[0];
    const branch = latest.branch || latest.items[0]?.Branch;
    return allBooks
      .filter(b => b.Branch === branch && !latest.items.some(oi => oi.BookID === b.BookID))
      .slice(0, 4);
  }, [allBooks, orders]);

  if (orders.length === 0) {
    return (
      <div className="empty-state animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state-icon" style={{ background: 'var(--navy-100)', color: 'var(--navy-600)', padding: 20, borderRadius: '50%', marginBottom: 20 }}>
          <FiPackage size={40} />
        </div>
        <h1 className="empty-state-title" style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>No Orders Yet</h1>
        <p className="empty-state-body" style={{ color: 'var(--text-muted)', marginBottom: 20 }}>You haven't placed any orders. Start shopping!</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-hdr">
        <button className="back-btn" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div>
          <p className="pg-title">My Orders</p>
          <p className="pg-sub">{orders.length} orders · ₹{totalSpent.toLocaleString()} spent</p>
        </div>
        <div className="hdr-right">
          <button className="filter-pill active">All Orders</button>
          <button className="filter-pill">Delivered</button>
          <button className="filter-pill">Active</button>
          <button
            className="filter-pill"
            onClick={() => navigate('/dashboard')}
            style={{ background: 'var(--navy-100)', color: 'var(--navy-700)', borderColor: 'var(--navy-300)' }}
          >
            🛒 Continue Shopping
          </button>
        </div>
      </div>

      <div className="layout">
        <div className="left">
          {orders.map((order, idx) => {
            const ems = now - order.orderTime;
            const emins = ems / MS_PER_MIN;
            const orderIsActive = emins < DELIVERY_MINS;
            return (
             <div key={order.id} style={{ animation: `cardReveal 350ms ease both`, animationDelay: `${Math.min(idx * 60, 300)}ms` }}>
                <OrderCard
                  order={order}
                  now={now}
                  isEditing={editingOrderId === order.id}
                  editSession={editingOrderId === order.id ? editSession : null}
                  searchQuery={searchQuery}
                  recommendations={recommendations}
                  updatedId={updatedOrderId}
                  updatedInfo={updatedInfo}
                  onModify={handleModify}
                  onCancelEdit={handleCancelEdit}
                  onSaveChanges={handleSaveChanges}
                  onQtyChange={updateItemQty}
                  onRemove={removeItem}
                  onAddBook={addBookToOrder}
                  onSearchChange={setSearchQuery}
                  onCancelOrder={handleCancelOrder}
                />
             </div>
            );
          })}
        </div>

        <div className="right">
          {/* Wallet Card */}
          <div className="sidebar-card wallet-card" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', color: 'white', border: 'none' }}>
            <div className="sc-hdr" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
              <p className="sc-title" style={{ color: '#f4b942', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBriefcase size={14} /> My Wallet
              </p>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>PREMIUM</span>
            </div>
            <div className="sc-body">
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Available Balance</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f4b942', fontFamily: "'DM Mono', monospace" }}>₹{wallet?.toLocaleString()}</p>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => toast.success('Top-up feature coming soon!', { style: TOAST_STYLE })}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#f4b942', color: '#0a1628', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Add Money
                </button>
                <button 
                  onClick={() => toast('Transaction history is coming soon.', { icon: '📜', style: TOAST_STYLE })}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  History
                </button>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sc-hdr">
              <p className="sc-title">Account</p>
            </div>
            <div className="sc-body">
              <div className="account-row">
                <div className="avatar">{user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}</div>
                <div>
                  <p className="account-name">{user?.name || 'Student'}</p>
                  <p className="account-branch">{user?.email || 'student@bookmarket.com'}</p>
                </div>
              </div>
              <div className="stat-grid">
                <div className="mini-stat">
                  <p className="ms-label">Orders</p>
                  <p className="ms-val">{orders.length}</p>
                </div>
                <div className="mini-stat">
                  <p className="ms-label">Spent</p>
                  <p className="ms-val">₹{(totalSpent / 1000).toFixed(1)}k</p>
                </div>
                <div className="mini-stat">
                  <p className="ms-label">Books</p>
                  <p className="ms-val">{totalBooks}</p>
                </div>
                <div className="mini-stat">
                  <p className="ms-label">Wishlist</p>
                  <p className="ms-val">0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sc-hdr">
              <p className="sc-title">Delivery Address</p>
            </div>
            <div className="sc-body">
              <div className="addr-row">
                <div className="addr-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  {orders.length > 0 && typeof orders[0].address === 'object' ? (
                    <p className="addr-text">{orders[0].address.name || user?.name || 'Student'}<br/>{orders[0].address.address}<br/>{orders[0].address.city}, {orders[0].address.state} — {orders[0].address.pincode}</p>
                  ) : (
                    <p className="addr-text">{orders.length > 0 ? (orders[0].address || 'Campus Hostel A') : 'No address provided'}</p>
                  )}
                  <p className="addr-sub" style={{marginTop: '4px'}}>Campus delivery · usually 10 min</p>
                </div>
              </div>
            </div>
          </div>

          {discoverBooks.length > 0 && (
            <div className="sidebar-card">
              <div className="sc-hdr">
                <p className="sc-title">You may also like</p>
                <span className="sc-link" onClick={() => navigate('/dashboard')}>See all</span>
              </div>
              <div className="sc-body">
                {discoverBooks.map(book => (
                  <div className="disc-item" key={book.BookID} onClick={() => navigate(`/book/${book.BookID}`)} style={{cursor: 'pointer'}}>
                    <div className="disc-thumb">
                      <MiniCover branch={book.Branch} id={`disc-${book.BookID}`} width={36} height={48} imageURL={book.ImageURL || book.image} />
                    </div>
                    <div className="disc-info">
                      <p className="disc-name">{book.SubjectName || book.FullBookName}</p>
                      <p className="disc-auth">{book.AuthorName}</p>
                    </div>
                    <p className="disc-price">₹{book.Price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}



        </div>
      </div>

      {/* Dialogs */}
      <CancelDialog 
        order={cancelTarget} 
        onConfirm={confirmCancelOrder} 
        onClose={() => setCancelTarget(null)} 
      />
      
      {payDiffTarget && (
        <PayDifferenceDialog 
          diff={payDiffTarget.diff} 
          onConfirm={(method) => {
            const session = { ...payDiffTarget.session };
            if (method === 'online') {
              toast.success('Additional payment successful!', { icon: '💳' });
            } else {
              toast.success('Remaining amount will be collected as Cash on Delivery.', { icon: '💵' });
            }
            finalizeOrderSave(session, payDiffTarget.diff);
          }} 
          onCancel={() => setPayDiffTarget(null)} 
        />
      )}

      <style>{`
        .page{background:var(--bg-base);min-height:calc(100vh - var(--navbar-h));}

        /* ── Cancel Dialog ───────────────────────────────────────── */
        .cdlg-backdrop{
          position:fixed;inset:0;z-index:1000;
          background:rgba(5,12,28,0.60);
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;
          animation:cdlgFadeIn 180ms ease both;
        }
        @keyframes cdlgFadeIn{from{opacity:0}to{opacity:1}}
        .cdlg{
          background:var(--bg-surface);
          border:1px solid var(--border-subtle);
          border-radius:20px;
          padding:32px 28px 24px;
          max-width:400px;width:calc(100% - 40px);
          box-shadow:0 24px 80px rgba(5,12,28,0.40);
          animation:cdlgSlideUp 220ms cubic-bezier(.22,.68,0,1.2) both;
          text-align:center;
        }
        @keyframes cdlgSlideUp{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .cdlg-icon-wrap{
          width:60px;height:60px;border-radius:50%;
          background:#FEF2F2;border:1.5px solid #FECACA;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 18px;
        }
        .cdlg-title{font-size:18px;font-weight:700;color:var(--text-primary);margin-bottom:8px;}
        .cdlg-body{font-size:13px;color:var(--text-muted);line-height:1.6;margin-bottom:18px;}
        .cdlg-order-chip{
          background:var(--bg-elevated);
          border:0.5px solid var(--border-subtle);
          border-radius:12px;
          padding:12px 16px;
          margin-bottom:22px;
          text-align:left;
          display:flex;flex-direction:column;gap:8px;
        }
        .cdlg-chip-row{display:flex;justify-content:space-between;align-items:center;}
        .cdlg-chip-label{font-size:11px;color:var(--text-muted);font-weight:500;text-transform:uppercase;letter-spacing:.05em;}
        .cdlg-chip-val{font-size:13px;font-weight:600;color:var(--text-primary);}
        .cdlg-actions{display:flex;gap:10px;}
        .cdlg-btn-keep{
          flex:1;padding:11px;border-radius:12px;
          border:1px solid var(--border-default);
          background:transparent;
          font-size:14px;font-weight:600;color:var(--text-muted);
          cursor:pointer;transition:background 150ms,color 150ms;
        }
        .cdlg-btn-keep:hover{background:var(--bg-elevated);color:var(--text-primary);}
        .cdlg-btn-cancel{
          flex:1.4;padding:11px;border-radius:12px;
          border:none;background:#C0392B;
          font-size:14px;font-weight:700;color:white;
          cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:7px;
          transition:background 150ms,transform 100ms;
          box-shadow:0 4px 16px rgba(192,57,43,0.35);
        }
        .cdlg-btn-cancel:hover{background:#a93226;}
        .cdlg-btn-cancel:active{transform:scale(0.97);}

        .page-hdr{background:var(--bg-surface);border-bottom:0.5px solid var(--border-subtle);padding:14px 28px;display:flex;align-items:center;gap:10px;}
        .back-btn{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;border:0.5px solid var(--border-default);background:transparent;font-size:13px;font-weight:600;color:var(--text-muted);cursor:pointer;transition:background 150ms,color 150ms;}
        .back-btn:hover{background:var(--bg-base);color:var(--text-primary);}
        .pg-title{font-size:20px;font-weight:700;color:var(--text-primary);}
        .pg-sub{font-size:13px;color:var(--text-muted);margin-top:1px;}
        .hdr-right{margin-left:auto;display:flex;gap:8px;align-items:center;}
        .filter-pill{font-size:13px;padding:5px 12px;border-radius:20px;border:0.5px solid var(--border-default);background:var(--bg-surface);color:var(--text-muted);cursor:pointer;transition:background 150ms,color 150ms;}
        .filter-pill:hover{background:var(--bg-elevated);}
        .filter-pill.active{background:#0a1628;color:white;border-color:#0a1628;}

        .layout{display:grid;grid-template-columns:1fr 300px;gap:24px;padding:24px 32px;align-items:start;}

        @media (max-width: 900px) {
          .layout { grid-template-columns: 1fr; }
          .right { position: static; }
        }

        .left{display:flex;flex-direction:column;gap:20px;}

        .order-card{background:var(--bg-surface);border:0.5px solid var(--border-subtle);border-radius:var(--r-lg);overflow:hidden;transition:box-shadow 0.3s;}
        .order-card.packing-card{border-color:#378ADD;border-width:1px;}

        /* ── Active / live order highlight ── */
        .order-card.active-card{
          border:2px solid #378ADD;
          box-shadow:0 0 0 4px rgba(55,138,221,0.12), 0 8px 32px rgba(55,138,221,0.15);
          animation: activeGlow 2.5s ease-in-out infinite alternate;
        }
        @keyframes activeGlow {
          from { box-shadow: 0 0 0 3px rgba(55,138,221,0.10), 0 6px 24px rgba(55,138,221,0.12); }
          to   { box-shadow: 0 0 0 6px rgba(55,138,221,0.20), 0 12px 40px rgba(55,138,221,0.22); }
        }

        /* live BADGE in header for active order */
        .live-badge{
          display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:99px;
          background:#185FA5;color:white;font-size:10px;font-weight:700;letter-spacing:.05em;
          margin-left:auto;
        }
        .live-badge-dot{
          width:6px;height:6px;border-radius:50%;background:#7ECBFF;
          animation:livePulse 1s ease-in-out infinite;
        }
        @keyframes livePulse{
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:.4;transform:scale(0.7);}
        }

        /* pulsing ring on active dot */
        .dot-pulse{
          position:relative;
        }
        .dot-pulse::before{
          content:'';
          position:absolute;inset:-4px;
          border-radius:50%;
          border:2px solid #378ADD;
          animation:dotRing 1.4s ease-out infinite;
          pointer-events:none;
        }
        @keyframes dotRing{
          0%  {opacity:0.8;transform:scale(1);}
          100%{opacity:0;transform:scale(1.9);}
        }

        .oc-hdr{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0;border-bottom:0.5px solid var(--border-subtle);}
        .oc-hdr-cell{padding:12px 16px;border-right:0.5px solid var(--border-subtle);}
        .oc-hdr-cell:last-child{border-right:none;}
        .oc-label{font-size:11px;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px;}
        .oc-val{font-size:15px;font-weight:500;color:var(--text-primary);}
        .oc-val.blue{color:#185FA5;}
        .oc-val.green{color:#27500A;}

        .oc-body{display:grid;grid-template-columns:1fr 200px;min-height:0;}
        @media (max-width: 600px) {
          .oc-body { grid-template-columns: 1fr; }
          .oc-items { border-right: none; border-bottom: 0.5px solid var(--border-subtle); }
          .oc-hdr { grid-template-columns: 1fr 1fr; }
          .oc-hdr-cell:nth-child(2) { border-right: none; }
          .oc-hdr-cell:nth-child(3), .oc-hdr-cell:nth-child(4) { border-top: 0.5px solid var(--border-subtle); }
        }

        .oc-items{padding:14px 16px;border-right:0.5px solid var(--border-subtle);}
        .oc-sidebar{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}

        .item-row{display:flex;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--border-subtle);}
        .item-row:last-child{border-bottom:none;padding-bottom:0;}
        .item-thumb{width:42px;height:56px;border-radius:5px;overflow:hidden;position:relative;flex-shrink:0;}
        .item-details{flex:1;min-width:0;}
        .item-name{font-size:14px;font-weight:500;color:var(--text-primary);line-height:1.3;margin-bottom:3px;}
        .item-meta{font-size:12px;color:var(--text-muted);}
        .item-price{font-size:15px;font-weight:500;color:var(--text-primary);white-space:nowrap;flex-shrink:0;}

        .track-title{font-size:12px;font-weight:500;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}
        .track-steps{display:flex;flex-direction:column;gap:0;}
        .tstep{display:flex;gap:10px;align-items:flex-start;position:relative;}
        .tstep:not(:last-child)::after{content:'';position:absolute;left:10px;top:22px;bottom:-4px;width:1px;background:var(--border-default);}
        .tstep-dot{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;z-index:2;background:var(--bg-surface);}
        .dot-done{background:#EAF3DE;border:1px solid #97C459;}
        .dot-active{background:#E6F1FB;border:1.5px solid #378ADD;}
        .dot-pending{background:var(--bg-elevated);border:1px solid var(--border-default);}
        .tstep-body{padding-bottom:14px;}
        .tstep-label{font-size:13px;font-weight:500;color:var(--text-primary);}
        .tstep-sub{font-size:12px;color:var(--text-muted);margin-top:1px;}

        .status-strip{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;margin-top:4px;border-radius:var(--r-md);}
        .strip-pack{background:#E6F1FB;border:0.5px solid #B5D4F4;}
        .strip-done{background:#EAF3DE;border:0.5px solid #C0DD97;}
        .strip-delivering{background:#FAEEDA;border:0.5px solid #FAC775;}
        .strip-text{font-size:13px;font-weight:500;}
        .strip-pack .strip-text{color:#0C447C;}
        .strip-delivering .strip-text{color:#633806;}
        .strip-done .strip-text{color:#27500A;}
        .modify-btn{font-size:12px;font-weight:500;padding:5px 10px;border-radius:var(--r-md);border:0.5px solid #185FA5;background:transparent;color:#185FA5;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;}
        .cancel-order-btn{font-size:12px;font-weight:500;padding:5px 10px;border-radius:var(--r-md);border:0.5px solid #C0392B;background:transparent;color:#C0392B;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;transition:background 150ms,color 150ms;}
        .cancel-order-btn:hover{background:#C0392B;color:white;}

        .right{display:flex;flex-direction:column;gap:14px;position:sticky;top:84px;}

        .sidebar-card{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-sm);}
        .sc-hdr{padding:12px 14px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;justify-content:space-between;background:var(--bg-elevated);}
        .sc-title{font-size:14px;font-weight:700;color:var(--text-primary);}
        .sc-link{font-size:12px;color:#185FA5;cursor:pointer;font-weight:600;}
        .sc-body{padding:12px 14px;}

        .account-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
        .avatar{width:36px;height:36px;border-radius:50%;background:#0a1628;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:500;color:#f4b942;flex-shrink:0;}
        .account-name{font-size:15px;font-weight:500;color:var(--text-primary);}
        .account-branch{font-size:12px;color:var(--text-muted);margin-top:1px;}
        .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .mini-stat{background:var(--bg-elevated);border-radius:var(--r-md);padding:8px 10px;}
        .ms-label{font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;}
        .ms-val{font-size:18px;font-weight:500;color:var(--text-primary);}

        .addr-row{display:flex;gap:8px;align-items:flex-start;}
        .addr-icon{width:28px;height:28px;border-radius:7px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
        .addr-text{font-size:13px;color:var(--text-primary);line-height:1.5;}
        .addr-sub{font-size:12px;color:var(--text-muted);margin-top:2px;}

        .disc-item{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:0.5px solid var(--border-subtle);}
        .disc-item:last-child{border-bottom:none;padding-bottom:0;}
        .disc-thumb{width:36px;height:48px;border-radius:4px;overflow:hidden;position:relative;flex-shrink:0;}
        .disc-info{flex:1;min-width:0;}
        .disc-name{font-size:13px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .disc-auth{font-size:12px;color:var(--text-muted);margin-top:1px;}
        .disc-price{font-size:14px;font-weight:500;color:var(--text-primary);white-space:nowrap;}

        .support-row{display:flex;gap:8px;align-items:center;padding:7px 0;cursor:pointer;}
        .support-row:not(:last-child){border-bottom:0.5px solid var(--border-subtle);}
        .support-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .support-label{font-size:13px;color:var(--text-primary);font-weight:500;}
        .support-sub{font-size:12px;color:var(--text-muted);margin-top:1px;}
        .chev-right{color:var(--text-muted);margin-left:auto;}

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes editSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressShimmer {
          from { background-position: -200% center; }
          to   { background-position:  200% center; }
        }
        .live-progress-bar {
          background: linear-gradient(90deg,#378ADD 0%,#7ecbff 50%,#185FA5 100%);
          background-size: 200% auto;
          animation: progressShimmer 2s linear infinite;
        }
      `}
      </style>
    </div>
  );
}