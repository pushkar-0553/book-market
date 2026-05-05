// Cart Context - manages cart items, wishlist, and active promo — persisted in localStorage
import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const MAX_QTY = 10;

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const exists = state.items.find(i => i.BookID === action.payload.BookID);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.BookID === action.payload.BookID
              ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QTY) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1, selected: true }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, items: state.items.filter(i => i.BookID !== action.payload) };
    case 'REMOVE_SELECTED':
      return { ...state, items: state.items.filter(i => !i.selected) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.BookID === action.payload.id
            ? { ...i, quantity: Math.min(Math.max(1, action.payload.qty), MAX_QTY) }
            : i
        ),
      };
    case 'TOGGLE_SELECT':
      return {
        ...state,
        items: state.items.map(i =>
          i.BookID === action.payload ? { ...i, selected: !i.selected } : i
        ),
      };
    case 'SELECT_ALL':
      return { ...state, items: state.items.map(i => ({ ...i, selected: action.payload })) };
    case 'CLEAR_CART':
      return { ...state, items: [], promo: null };
    case 'TOGGLE_WISHLIST': {
      const inWish = state.wishlist.find(w => w.BookID === action.payload.BookID);
      if (inWish) {
        return { ...state, wishlist: state.wishlist.filter(w => w.BookID !== action.payload.BookID) };
      }
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    }
    case 'MOVE_WISHLIST_TO_CART': {
      // Move all wishlist items into cart, respecting branch constraints
      let newItems = [...state.items];
      let activeBranch = newItems.length > 0 ? newItems[0].Branch : null;
      let remainingWishlist = [];

      state.wishlist.forEach(book => {
        if (!activeBranch) activeBranch = book.Branch;
        
        if (book.Branch === activeBranch) {
          if (!newItems.find(i => i.BookID === book.BookID)) {
            newItems.push({ ...book, quantity: 1, selected: true });
          }
        } else {
          remainingWishlist.push(book);
        }
      });
      return { ...state, items: newItems, wishlist: remainingWishlist };
    }
    case 'SET_PROMO':
      return { ...state, promo: action.payload };
    case 'CLEAR_PROMO':
      return { ...state, promo: null };
    default:
      return state;
  }
}

const initialState = { items: [], wishlist: [], promo: null };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const saved = localStorage.getItem('bm_cart');
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem('bm_cart', JSON.stringify(state));
  }, [state]);

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items
    .filter(i => i.selected)
    .reduce((sum, i) => sum + Number(i.Price) * i.quantity, 0);
  const isInWishlist = (id) => state.wishlist.some(w => w.BookID === id);
  const isInCart = (id) => state.items.some(i => i.BookID === id);

  const addToCart = (book) => {
    if (state.items.length > 0) {
      const cartBranch = state.items[0].Branch;
      if (cartBranch && book.Branch && cartBranch !== book.Branch) {
        return { success: false, error: `Your cart contains ${cartBranch} books. Please clear your cart to add ${book.Branch} books.` };
      }
    }
    dispatch({ type: 'ADD_TO_CART', payload: book });
    return { success: true };
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      wishlist: state.wishlist,
      promo: state.promo,
      cartCount,
      subtotal,
      isInWishlist,
      isInCart,
      dispatch,
      addToCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
