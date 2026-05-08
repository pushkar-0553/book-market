import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiSmartphone, FiCreditCard, FiCheckCircle, FiLock, FiChevronLeft } from 'react-icons/fi';

const TopUpDialog = ({ isOpen, onClose, onTopUp }) => {
  const [step, setStep] = useState(1); // 1: Amount/Method, 2: Details
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi'); // 'upi' or 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Details
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');

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
    if (method === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error('Please fill all card details');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return;
      }
    }

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label className="input-label">Card Holder Name</label>
                        <input 
                          type="text" className="input-field" placeholder="John Doe"
                          value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="input-label">Card Number</label>
                        <div className="input-wrap">
                          <FiCreditCard className="input-icon input-icon-left" />
                          <input 
                            type="text" className="input-field has-icon-left" placeholder="0000 0000 0000 0000"
                            value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="input-label">Expiry Date</label>
                          <input 
                            type="text" className="input-field" placeholder="MM/YY"
                            value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="input-label">CVV</label>
                          <input 
                            type="password" className="input-field" placeholder="***" maxLength="3"
                            value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="input-label">UPI ID</label>
                      <div className="input-wrap">
                        <FiSmartphone className="input-icon input-icon-left" />
                        <input 
                          type="text" className="input-field has-icon-left" placeholder="username@bank"
                          value={upiId} onChange={e => setUpiId(e.target.value)}
                        />
                      </div>
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

export default TopUpDialog;
