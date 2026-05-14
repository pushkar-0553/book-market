import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSmartphone, FiCreditCard, FiCheckCircle, FiLock, FiChevronLeft } from 'react-icons/fi';

/** Detect card network from first few digits */
function getCardNetwork(rawNumber) {
  const n = rawNumber.replace(/\s/g, '');
  if (/^4/.test(n))                          return { name: 'Visa',       color: '#1a1f71', logo: '💳 VISA' };
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return { name: 'Mastercard', color: '#eb001b', logo: '🔴 Mastercard' };
  if (/^6/.test(n))                          return { name: 'RuPay',      color: '#0a6e31', logo: '🟢 RuPay' };
  if (/^3[47]/.test(n))                      return { name: 'Amex',       color: '#007bc1', logo: '🔵 Amex' };
  return null;
}

const TopUpDialog = ({ isOpen, onClose, onTopUp }) => {
  const [step, setStep] = useState(1); // 1: Amount/Method, 2: Details
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi'); // 'upi' or 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Details
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleNext = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numAmount > 50000) {
      toast.error('Maximum top-up limit is ₹50,000');
      return;
    }
    setStep(2);
  };

  const handleProcess = () => {
    const newErrors = {};
    if (method === 'card') {
      const rawNum = cardDetails.number.replace(/\s/g, '');
      if (!/^\d{16}$/.test(rawNum)) newErrors.cardNumber = 'Enter a valid 16-digit card number';
      if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';
      
      // Expiry validation: MM/YY, future date
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.cardExpiry = 'Enter expiry as MM/YY';
      } else {
        const [m, y] = cardDetails.expiry.split('/').map(Number);
        const now = new Date();
        const currMonth = now.getMonth() + 1;
        const currYear = Number(now.getFullYear().toString().slice(-2));
        if (m < 1 || m > 12) {
          newErrors.cardExpiry = 'Invalid month (01-12)';
        } else if (y < currYear || (y === currYear && m < currMonth)) {
          newErrors.cardExpiry = 'Card has expired';
        }
      }

      if (!/^\d{3}$/.test(cardDetails.cvv)) newErrors.cardCvv = 'Enter a valid 3-digit CVV';
    } else {
      if (!upiId || !/\S+@\S+/.test(upiId)) {
        newErrors.upiId = 'Enter a valid UPI ID (e.g. name@upi)';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsProcessing(true);
    // Simulate payment processing delay (5 seconds as requested)
    setTimeout(() => {
      const numAmount = Number(amount);
      onTopUp(numAmount);
      setIsProcessing(false);
      handleClose();
      toast.success(`₹${numAmount.toLocaleString()} added to your wallet!`, {
        icon: '💰',
        style: {
          background: '#065f46',
          color: '#fff',
          borderRadius: '12px'
        }
      });
    }, 5000);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
    setUpiId('');
    setErrors({});
    onClose();
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <div className="modal-backdrop" onClick={handleClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-panel animate-slide-up" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '420px', borderRadius: '24px', overflow: 'hidden' }}
      >
        <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step === 2 && !isProcessing && (
              <button 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FiChevronLeft size={20} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {step === 1 ? 'Top-up Wallet' : 'Secure Payment'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {step === 1 ? 'Add funds to your account instantly' : `Paying ₹${Number(amount).toLocaleString()}`}
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button className="modal-close-btn" onClick={handleClose}>
              <FiX size={20} />
            </button>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {step === 1 ? (
            <>
              {/* Amount Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Enter Amount</label>
                <div className="input-wrap">
                  <span style={{ 
                    position: 'absolute', left: '1.25rem', top: '50%', 
                    transform: 'translateY(-50%)', fontWeight: 700, 
                    color: 'var(--navy-900)', fontSize: '1.125rem' 
                  }}>₹</span>
                  <input 
                    type="number" 
                    className="input-field num" 
                    style={{ paddingLeft: '2.5rem', fontSize: '1.25rem', fontWeight: 700, height: '56px' }}
                    placeholder="0.00" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {/* Quick Select */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {quickAmounts.map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: '8px',
                        border: '1px solid var(--border-default)', background: 'white',
                        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.target.style.borderColor = 'var(--accent-primary)'}
                      onMouseOut={e => e.target.style.borderColor = 'var(--border-default)'}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="input-label">Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button 
                    onClick={() => setMethod('upi')}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                      padding: '1.25rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                      border: method === 'upi' ? '2px solid var(--navy-600)' : '1px solid var(--border-default)',
                      background: method === 'upi' ? 'var(--navy-50)' : 'white',
                    }}
                  >
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: method === 'upi' ? 'var(--navy-600)' : 'var(--bg-base)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: method === 'upi' ? 'white' : 'var(--text-secondary)'
                    }}>
                      <FiSmartphone size={20} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)' }}>UPI / QR</span>
                  </button>

                  <button 
                    onClick={() => setMethod('card')}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                      padding: '1.25rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                      border: method === 'card' ? '2px solid var(--navy-600)' : '1px solid var(--border-default)',
                      background: method === 'card' ? 'var(--navy-50)' : 'white',
                    }}
                  >
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: method === 'card' ? 'var(--navy-600)' : 'var(--bg-base)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: method === 'card' ? 'white' : 'var(--text-secondary)'
                    }}>
                      <FiCreditCard size={20} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--navy-900)' }}>Card</span>
                  </button>
                </div>
              </div>

              <button 
                className="btn btn-navy" 
                style={{ width: '100%', height: '56px', borderRadius: '16px' }}
                onClick={handleNext}
                disabled={!amount}
              >
                Continue
              </button>
            </>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {isProcessing ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className="payment-loader" style={{ 
                    width: '64px', height: '64px', border: '4px solid var(--navy-100)', 
                    borderTopColor: 'var(--navy-600)', borderRadius: '50%', 
                    margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite'
                  }}></div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Processing Payment</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Please do not close the window or click back.</p>
                </div>
              ) : (
                <>
                  {method === 'card' ? (
                    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <Field id="topup-card-number" label="Card Number" error={errors.cardNumber} required>
                        <input id="topup-card-number" type="text" maxLength={19} value={cardDetails.number} onChange={e => { const raw = e.target.value.replace(/\D/g, '').slice(0, 16); setCardDetails(c => ({ ...c, number: raw.replace(/(.{4})/g, '$1 ').trim() })); }} className={`input-field ${errors.cardNumber ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                      </Field>
                      <Field id="topup-card-name" label="Cardholder Name" error={errors.cardName} required>
                        <input id="topup-card-name" type="text" value={cardDetails.name} onChange={e => setCardDetails(c => ({ ...c, name: e.target.value }))} className={`input-field ${errors.cardName ? 'error' : ''}`} style={{ textTransform: 'uppercase' }} placeholder="AS ON CARD" />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <Field id="topup-card-expiry" label="Expiry (MM/YY)" error={errors.cardExpiry} required>
                          <input id="topup-card-expiry" type="text" maxLength={5} value={cardDetails.expiry} onChange={e => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCardDetails(c => ({ ...c, expiry: v })); }} className={`input-field ${errors.cardExpiry ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace" }} placeholder="MM/YY" inputMode="numeric" />
                        </Field>
                        <Field id="topup-card-cvv" label="CVV" error={errors.cardCvv} required>
                          <input id="topup-card-cvv" type="password" maxLength={3} value={cardDetails.cvv} onChange={e => setCardDetails(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} className={`input-field ${errors.cardCvv ? 'error' : ''}`} style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.2em' }} placeholder="•••" inputMode="numeric" />
                        </Field>
                      </div>

                      {/* Card network detection */}
                      {(() => {
                        const network = getCardNetwork(cardDetails.number);
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
                  ) : (
                    <div className="animate-slide-up">
                      <Field id="topup-upi-id" label="UPI ID" error={errors.upiId} required>
                        <div className="input-wrap">
                          <FiSmartphone className="input-icon input-icon-left" />
                          <input 
                            id="topup-upi-id"
                            type="text" className={`input-field has-icon-left ${errors.upiId ? 'error' : ''}`} placeholder="username@bank"
                            value={upiId} onChange={e => setUpiId(e.target.value)}
                          />
                        </div>
                      </Field>
                      <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan QR code on your mobile to pay</p>
                        <div style={{ width: '120px', height: '120px', background: '#eee', margin: '1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#999' }}>[QR CODE MOCK]</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn btn-navy" 
                    style={{ width: '100%', height: '56px', borderRadius: '16px', marginTop: '2rem' }}
                    onClick={handleProcess}
                  >
                    Pay ₹{Number(amount).toLocaleString()} Securely
                  </button>
                </>
              )}
            </div>
          )}
          
          <div style={{ 
            textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', 
            marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' 
          }}>
            <FiLock size={12} /> SSL Secured & Encrypted · <FiCheckCircle size={12} /> PCI DSS Compliant
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

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

export default TopUpDialog;
