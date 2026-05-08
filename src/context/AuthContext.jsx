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
      return { ...state, isAuthenticated: false, user: null, error: null }; // Don't reset wallet to 0 here
    case 'UPDATE_WALLET':
      return { ...state, wallet: state.wallet + action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

const getSavedWallet = () => {
  const saved = localStorage.getItem('bm_wallet');
  return saved !== null ? Number(saved) : 500;
};

const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
  wallet: getSavedWallet(),
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const savedAuth = localStorage.getItem('bm_auth') || sessionStorage.getItem('bm_auth_session');
      const wallet = getSavedWallet();
      
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return { 
          isAuthenticated: true, 
          user: parsed, 
          error: null, 
          wallet 
        };
      }
      return { ...initialState, wallet };
    } catch {
      return initialState;
    }
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

  function updateProfile(data) {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateWallet, clearError, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
