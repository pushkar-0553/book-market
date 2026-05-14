import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

const PACKING_MINS = 3;
const DELIVERY_MINS = 10;
const MS_PER_MIN = 60 * 1000;

const LiveOrderTracker = () => {
  const [liveOrder, setLiveOrder] = useState(null);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { getAgentForOrder } = useDelivery();

  useEffect(() => {
    const checkOrders = () => {
      const raw = JSON.parse(localStorage.getItem('bm_orders') || '[]');
      const currentTime = Date.now();
      
      // Prune orders older than 5 days
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const saved = raw.filter(o => (currentTime - o.orderTime) < FIVE_DAYS_MS);
      
      if (saved.length !== raw.length) {
        localStorage.setItem('bm_orders', JSON.stringify(saved));
      }

      const active = saved.find(order => {
        const elapsedMins = (currentTime - order.orderTime) / MS_PER_MIN;
        return elapsedMins < DELIVERY_MINS;
      });

      if (active) {
        setLiveOrder(active);
      } else {
        setLiveOrder(null);
      }
    };

    checkOrders();
    const iv = setInterval(() => {
      setNow(Date.now());
      checkOrders();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(iv);
  }, [location.pathname]); // Re-check on navigation

  if (!isAuthenticated || !liveOrder || location.pathname === '/orders') return null;

  const elapsedMs = now - liveOrder.orderTime;
  const elapsedMins = elapsedMs / MS_PER_MIN;
  
  let statusText = '';
  let timeLeftMins = 0;

  if (elapsedMins < PACKING_MINS) {
    statusText = 'Packing your books';
    timeLeftMins = Math.ceil(PACKING_MINS - elapsedMins);
  } else {
    statusText = 'Out for delivery';
    timeLeftMins = Math.ceil(DELIVERY_MINS - elapsedMins);
  }

  // Final check to hide if elapsed >= DELIVERY_MINS
  if (elapsedMins >= DELIVERY_MINS) return null;

  const agent = getAgentForOrder(liveOrder.id);

  return (
    <div 
      className="live-order-toast"
      onClick={() => navigate('/orders')}
      id="live-order-tracker"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 1000,
        background: 'var(--navy-900)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        animation: 'slideInUp 0.4s var(--ease-out)',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '340px'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--gold-400)'
      }}>
        <FiClock size={20} className="animate-pulse" />
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {statusText}
          {agent && (
            <span style={{fontSize: '10px', background: 'var(--gold-400)', color: 'var(--navy-900)', padding: '1px 6px', borderRadius: 10, fontWeight: 800}}>
              {agent.name.split(' ')[0]}
            </span>
          )}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
          {timeLeftMins} {timeLeftMins === 1 ? 'min' : 'mins'} left · <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Track Agent</span>
        </p>
      </div>

      <FiArrowRight size={18} style={{ opacity: 0.5 }} />
      
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .live-order-toast:hover {
          background: var(--navy-800);
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default LiveOrderTracker;
