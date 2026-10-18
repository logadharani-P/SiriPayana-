import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserPreferences {
  startingLocation: string;
  language: string;
  interests: string[];
  budgetRange: 'economy' | 'mid' | 'premium';
  travellers: number;
  travelPurpose: string;
}

export interface SavedDestination {
  destinationId: string;
  savedAt: string;
}

export interface Itinerary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destinations: ItineraryStop[];
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryStop {
  destinationId: string;
  day: number;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  duration: string;
  notes: string;
}

interface AppState {
  user: User | null;
  preferences: UserPreferences;
  favorites: string[];
  savedDestinations: SavedDestination[];
  itineraries: Itinerary[];
  isAuthenticated: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SAVE_DESTINATION'; payload: SavedDestination }
  | { type: 'REMOVE_SAVED_DESTINATION'; payload: string }
  | { type: 'ADD_ITINERARY'; payload: Itinerary }
  | { type: 'UPDATE_ITINERARY'; payload: Itinerary }
  | { type: 'DELETE_ITINERARY'; payload: string }
  | { type: 'SET_TOAST'; payload: AppState['toast'] }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const defaultPreferences: UserPreferences = {
  startingLocation: '',
  language: 'en',
  interests: [],
  budgetRange: 'mid',
  travellers: 1,
  travelPurpose: 'leisure',
};

const initialState: AppState = {
  user: null,
  preferences: defaultPreferences,
  favorites: [],
  savedDestinations: [],
  itineraries: [],
  isAuthenticated: false,
  toast: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter(f => f !== id)
        : [...state.favorites, id];
      return { ...state, favorites };
    }
    case 'SAVE_DESTINATION':
      return {
        ...state,
        savedDestinations: [...state.savedDestinations.filter(s => s.destinationId !== action.payload.destinationId), action.payload],
      };
    case 'REMOVE_SAVED_DESTINATION':
      return {
        ...state,
        savedDestinations: state.savedDestinations.filter(s => s.destinationId !== action.payload),
      };
    case 'ADD_ITINERARY':
      return { ...state, itineraries: [...state.itineraries, action.payload] };
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.map(it => it.id === action.payload.id ? action.payload : it),
      };
    case 'DELETE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.filter(it => it.id !== action.payload),
      };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (name: string, email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'siripayana-app-state';
const USERS_KEY = 'siripayana-users';

function loadState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveState(state: AppState) {
  try {
    const { toast, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {}
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function getUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash function for demo purposes (NOT production-grade)
async function hashPassword(pw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + 'siripayana-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved && Object.keys(saved).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    if (state.user || state.favorites.length || state.itineraries.length || state.savedDestinations.length) {
      saveState(state);
    }
  }, [state.user, state.favorites, state.savedDestinations, state.itineraries, state.preferences]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000);
  };

  const login = (name: string, email: string, password: string): boolean => {
    const users = getUsers();
    // For demo: find by email
    hashPassword(password).then(hash => {
      const user = users.find(u => u.email === email.toLowerCase());
      if (user && user.passwordHash === hash) {
        dispatch({ type: 'LOGIN', payload: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
        showToast('Signed in successfully!', 'success');
      } else if (user) {
        showToast('Invalid password.', 'error');
      } else {
        showToast('No account found with this email.', 'error');
      }
    });
    return true;
  };

  const register = (name: string, email: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      showToast('An account with this email already exists.', 'error');
      return false;
    }
    hashPassword(password).then(hash => {
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
      dispatch({ type: 'LOGIN', payload: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt } });
      showToast('Account created successfully!', 'success');
    });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem(STORAGE_KEY);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AppContext.Provider value={{ state, dispatch, login, register, logout, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
