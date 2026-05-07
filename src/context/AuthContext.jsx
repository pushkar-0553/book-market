// Auth Context - manages login/logout state persisted in localStorage
import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

const VALID_EMAIL = 'student@bookmarket.com';
const VALID_PASSWORD = 'password123';

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload, error: null };
    case 'LOGOUT':
      return { isAuthenticated: false, user: null, error: null, wallet: 0 };
    case 'UPDATE_WALLET':
      return { ...state, wallet: state.wallet + action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
  wallet: 500, // Initial balance for demo
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('bm_auth') || sessionStorage.getItem('bm_auth_session');
      const savedWallet = localStorage.getItem('bm_wallet');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          isAuthenticated: true, 
          user: parsed, 
          error: null, 
          wallet: savedWallet ? Number(savedWallet) : 500 
        };
      }
    } catch {}
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('bm_wallet', state.wallet.toString());
  }, [state.wallet]);

  // Persist auth state to the correct storage based on remember flag
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (state.user.remember) {
        localStorage.setItem('bm_auth', JSON.stringify(state.user));
        sessionStorage.removeItem('bm_auth_session');
      } else {
        sessionStorage.setItem('bm_auth_session', JSON.stringify(state.user));
        localStorage.removeItem('bm_auth');
      }
    } else {
      localStorage.removeItem('bm_auth');
      sessionStorage.removeItem('bm_auth_session');
    }
  }, [state.isAuthenticated, state.user]);

  function login(email, password, remember) {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      const user = { email, name: 'Engineering Student', avatar: null, remember };
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid credentials. Use student@bookmarket.com / password123' });
      return false;
    }
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
    try { sessionStorage.removeItem('bm_from_path'); } catch {}
  }

  function updateWallet(amount) {
    dispatch({ type: 'UPDATE_WALLET', payload: amount });
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateWallet, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
