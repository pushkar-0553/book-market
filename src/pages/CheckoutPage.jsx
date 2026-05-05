// CheckoutPage - with promo from CartContext, step indicator, user name pre-fill
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiChevronLeft, FiMapPin, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PROMO_CODES } from './CartPage';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

const PAYMENT_OPTIONS = [
  { id: 'cod',  label: 'Cash on Delivery',    icon: FiDollarSign, desc: 'Pay when your books arrive' },
  { id: 'upi',  label: 'UPI Payment',          icon: FiSmartphone, desc: 'GPay, PhonePe, BHIM, Paytm' },
  { id: 'card', label: 'Credit / Debit Card',  icon: FiCreditCard, desc: 'Visa, Mastercard, Rupay' },
];

/** Detect card network from first few digits */
function getCardNetwork(rawNumber) {
  const n = rawNumber.replace(/\s/g, '');
  if (/^4/.test(n))                          return { name: 'Visa',       color: '#1a1f71', logo: '💳 VISA' };
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return { name: 'Mastercard', color: '#eb001b', logo: '🔴 Mastercard' };
  if (/^6/.test(n))                          return { name: 'RuPay',      color: '#0a6e31', logo: '🟢 RuPay' };
  if (/^3[47]/.test(n))                      return { name: 'Amex',       color: '#007bc1', logo: '🔵 Amex' };
  return null;
}

const DELIVERY_FEE = 49;

const STEPS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const { items, promo, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const selectedItems = items.filter(i => i.selected);
  const subtotal  = selectedItems.reduce((s, i) => s + Number(i.Price) * i.quantity, 0);
  const discount  = promo ? Math.round(subtotal * (PROMO_CODES[promo.code] / 100)) : 0;
  const total     = subtotal + (selectedItems.length > 0 ? DELIVERY_FEE : 0) - discount;

  const [step, setStep]         = useState(0); // 0=address, 1=payment
  const [form, setForm]         = useState(() => {
    try {
      const saved = localStorage.getItem('bm_address');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: user?.name || '', address: '', city: '', state: '', pincode: '', phone: '' };
  });
  const [payment, setPayment]   = useState('cod');
  const [card, setCard]         = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId]       = useState('');
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ordered, setOrdered]   = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  function validateAddress() {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim())    e.city    = 'City is required';
    if (!form.state)          e.state   = 'Please select a state';
    if (!/^\d{6}$/.test(form.pincode))         e.pincode = 'Enter a valid 6-digit pincode';
    if (!/^[6-9]\d{9}$/.test(form.phone))      e.phone   = 'Enter a valid 10-digit phone number';
    return e;
  }

  function validatePayment() {
    const e = {};
    if (payment === 'upi' && !/\S+@\S+/.test(upiId)) e.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
    if (payment === 'card') {
      if (!/^\d{16}$/.test(card.number.replace(/\s/g, ''))) e.cardNumber = 'Enter a valid 16-digit card number';
      if (!card.name.trim())                                 e.cardName   = 'Cardholder name is required';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry))              e.cardExpiry = 'Enter expiry as MM/YY';
      if (!/^\d{3,4}$/.test(card.cvv))                      e.cardCvv    = 'Enter a valid CVV';
    }
    return e;
  }

  function handleNextStep(e) {
    e.preventDefault();
    const errs = validateAddress();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(1);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const errs = validatePayment();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const id = 'ORD' + Date.now().toString().slice(-8);
    const order = { id, orderTime: Date.now(), items: selectedItems, total, subtotal, discount, promo, address: form, payment };
    const prev = JSON.parse(localStorage.getItem('bm_orders') || '[]');
    localStorage.setItem('bm_orders', JSON.stringify([...prev, order]));

    setPlacedOrder(order);
    localStorage.setItem('bm_address', JSON.stringify(form));

    dispatch({ type: 'CLEAR_CART' });
    setSubmitting(false);
    setOrdered(true);
    toast.success('Order placed successfully! 🎉');
  }

  if (ordered && placedOrder) {
    return (
      <div className="animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ padding: '2.5rem', maxWidth: 450, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FiCheckCircle size={40} style={{ color: 'var(--success-text)' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Order Confirmed! 🎉</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>Your books are being packed and will be delivered in 10 minutes.</p>
          <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order ID</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>{placedOrder.id}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem', marginBottom: '2rem' }}>
            {placedOrder.discount > 0 && <p style={{ fontSize: '0.8125rem', color: 'var(--success-text)', fontWeight: 600, marginBottom: '0.5rem' }}>Saved ₹{placedOrder.discount} with {placedOrder.promo?.code}</p>}
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Total: ₹{placedOrder.total.toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/orders" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Track Order</Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="empty-state animate-fade-in" style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: '1.5rem', fontSize: '1.125rem' }}>No items selected for checkout.</p>
        <Link to="/cart" className="btn btn-primary btn-lg">Go to Cart</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--navbar-h))', background: 'var(--bg-base)', padding: '2rem' }} className="animate-fade-in">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Back button + title */}
        <div className="page-header">
          <button onClick={() => step === 0 ? navigate('/cart') : setStep(0)} className="page-back-btn" aria-label="Back">
            <FiChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Checkout</h1>
            <p className="page-subtitle">Step {step + 1} of 2 — {STEPS[step]}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="stepper" style={{ marginBottom: '2rem' }}>
          {STEPS.slice(0, 2).map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div className={`stepper-num ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="stepper-label" style={{ color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 500 }}>{label}</span>
              </div>
              {i < 1 && <div className={`stepper-line ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="checkout-grid">

          {/* Left: form */}
          <div>
            {step === 0 && (
              <form onSubmit={handleNextStep} noValidate>
                <section className="card" style={{ padding: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--navy-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiMapPin style={{ color: 'var(--navy-600)' }} size={16} />
                    </span>
                    Delivery Address
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Field id="name" label="Full Name" error={errors.name} required>
                      <input id="name" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`input-field ${errors.name ? 'error' : ''}`} placeholder="Your full name" />
                    </Field>
                    <Field id="address" label="Street Address" error={errors.address} required>
                      <textarea id="address" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={`input-field ${errors.address ? 'error' : ''}`} style={{ height: 'auto', padding: '0.75rem 1rem', resize: 'none' }} placeholder="House no., Street, Locality" />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-row">
                      <Field id="city" label="City" error={errors.city} required>
                        <input id="city" type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={`input-field ${errors.city ? 'error' : ''}`} placeholder="City" />
                      </Field>
                      <Field id="state" label="State" error={errors.state} required>
                        <select id="state" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={`input-field ${errors.state ? 'error' : ''}`}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-row">
                      <Field id="pincode" label="Pincode" error={errors.pincode} required>
                        <input id="pincode" type="text" maxLength={6} value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))} className={`input-field ${errors.pincode ? 'error' : ''}`} placeholder="6-digit pincode" inputMode="numeric" />
                      </Field>
                      <Field id="phone" label="Phone" error={errors.phone} required>
                        <input id="phone" type="tel" maxLength={10} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="10-digit mobile" inputMode="numeric" />
                      </Field>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', height: 50, fontSize: '1rem' }}>
                    Continue to Payment →
                  </button>
                </section>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handlePlaceOrder} noValidate>
                <section className="card" style={{ padding: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Payment Method</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} role="radiogroup">
                    {PAYMENT_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isActive = payment === opt.id;
                      return (
                        <label key={opt.id} htmlFor={`pay-${opt.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--r-md)', border: `1.5px solid ${isActive ? 'var(--navy-400)' : 'var(--border-default)'}`, background: isActive ? 'var(--navy-50)' : 'var(--bg-surface)', cursor: 'pointer', transition: 'all 200ms' }}>
                          <input id={`pay-${opt.id}`} type="radio" name="payment" value={opt.id} checked={isActive} onChange={() => setPayment(opt.id)} style={{ width: 16, height: 16, accentColor: 'var(--navy-600)', cursor: 'pointer' }} />
                          <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'var(--navy-600)' : 'var(--bg-base)', color: isActive ? 'white' : 'var(--text-muted)', transition: 'all 200ms' }}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{opt.label}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {payment === 'upi' && (
                    <div className="animate-slide-up" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)' }}>
                      <Field id="upi-id" label="UPI ID" error={errors.upiId} required>
                        <input id="upi-id" type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className={`input-field ${errors.upiId ? 'error' : ''}`} placeholder="yourname@upi" />
                      </Field>
                    </div>
                  )}

                  {payment === 'card' && (
                    <div className="animate-slide-up" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Field id="card-number" label="Card Number" error={errors.cardNumber} required>
                        <input id="card-number" type="text" maxLength={19} value={card.number} onChange={e => { const raw = e.target.value.replace(/\D/g, '').slice(0, 16); setCard(c => ({ ...c, number: raw.replace(/(.{4})/g, '$1 ').trim() })); }} className={`input-field ${errors.cardNumber ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                      </Field>
                      <Field id="card-name" label="Cardholder Name" error={errors.cardName} required>
                        <input id="card-name" type="text" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} className={`input-field ${errors.cardName ? 'error' : ''}`} style={{ textTransform: 'uppercase' }} placeholder="AS ON CARD" />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <Field id="card-expiry" label="Expiry (MM/YY)" error={errors.cardExpiry} required>
                          <input id="card-expiry" type="text" maxLength={5} value={card.expiry} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCard(c => ({ ...c, expiry: v })); }} className={`input-field ${errors.cardExpiry ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace" }} placeholder="MM/YY" inputMode="numeric" />
                        </Field>
                        <Field id="card-cvv" label="CVV" error={errors.cardCvv} required>
                          <input id="card-cvv" type="password" maxLength={4} value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '') }))} className={`input-field ${errors.cardCvv ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em' }} placeholder="•••" inputMode="numeric" />
                        </Field>
                      </div>

                      {/* Card network detection */}
                      {(() => {
                        const network = getCardNetwork(card.number);
                        return network ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: `${network.color}12`,
                            border: `1px solid ${network.color}30`,
                            marginTop: 4,
                          }}>
                            <span style={{ fontSize: '1.1rem' }}>{network.logo.split(' ')[0]}</span>
                            <div>
                              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: network.color }}>{network.name} detected</p>
                              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>Your {network.name} card is accepted and secured</p>
                            </div>
                            <span style={{
                              marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 700,
                              padding: '2px 8px', borderRadius: 99,
                              background: network.color, color: 'white',
                            }}>{network.name.toUpperCase()}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <button id="place-order-btn" type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', height: 50, fontSize: '1rem' }} aria-busy={submitting}>
                    {submitting ? (<><svg style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Processing…</>) : 'Place Order Now'}
                  </button>
                </section>
              </form>
            )}
          </div>

          {/* Right: order summary (sticky) */}
          <aside>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 'calc(var(--navbar-h) + 1.5rem)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Order Summary</h2>
              <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {selectedItems.map(item => (
                  <div key={item.BookID} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={item.ImageURL || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=60'} alt="" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=60'; }} style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.SubjectName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{Number(item.Price) * item.quantity}</span>
                  </div>
                ))}
              </div>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', borderTop: '1px solid var(--border-default)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <dt style={{ color: 'var(--text-muted)' }}>Subtotal</dt>
                  <dd style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{subtotal.toLocaleString()}</dd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <dt style={{ color: 'var(--text-muted)' }}>Delivery Fee</dt>
                  <dd style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{DELIVERY_FEE}</dd>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <dt style={{ color: 'var(--success-text)', fontWeight: 600 }}>Promo ({promo.code})</dt>
                    <dd style={{ color: 'var(--success-text)', fontWeight: 700 }}>−₹{discount}</dd>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                  <dt style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</dt>
                  <dd style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>₹{total.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({ id, label, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="input-label">
        {label} {required && <span style={{ color: 'var(--error-text)' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error-text)', marginTop: '0.375rem' }} role="alert">{error}</p>}
    </div>
  );
}
