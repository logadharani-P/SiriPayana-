import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

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

interface AppState {
  user: User | null;
  profileName: string;
  preferences: UserPreferences;
  favorites: string[];
  savedDestinations: SavedDestination[];
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: { user: User | null; profileName: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SAVE_DESTINATION'; payload: SavedDestination }
  | { type: 'REMOVE_SAVED_DESTINATION'; payload: string }
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
  profileName: '',
  preferences: defaultPreferences,
  favorites: [],
  savedDestinations: [],
  isAuthenticated: false,
  isLoadingAuth: true,
  toast: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profileName: action.payload.profileName,
        isAuthenticated: !!action.payload.user,
        isLoadingAuth: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoadingAuth: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter(f => f !== id)
        : [...state.favorites, id];
      persistLocalState({ ...state, favorites });
      return { ...state, favorites };
    }
    case 'SAVE_DESTINATION': {
      const savedDestinations = [...state.savedDestinations.filter(s => s.destinationId !== action.payload.destinationId), action.payload];
      const next = { ...state, savedDestinations };
      persistLocalState(next);
      return next;
    }
    case 'REMOVE_SAVED_DESTINATION': {
      const savedDestinations = state.savedDestinations.filter(s => s.destinationId !== action.payload);
      const next = { ...state, savedDestinations };
      persistLocalState(next);
      return next;
    }
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
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_KEY = 'siripayana-app-local';

interface LocalPersistState {
  favorites: string[];
  savedDestinations: SavedDestination[];
  preferences: UserPreferences;
}

function loadLocalState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function persistLocalState(state: AppState) {
  try {
    const subset: LocalPersistState = {
      favorites: state.favorites,
      savedDestinations: state.savedDestinations,
      preferences: state.preferences,
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(subset));
  } catch {}
}

function getProfileName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | null;
  if (meta?.full_name && typeof meta.full_name === 'string') return meta.full_name;
  if (meta?.name && typeof meta.name === 'string') return meta.name;
  return user.email?.split('@')[0] || 'Traveler';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = loadLocalState();
    if (saved && Object.keys(saved).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  useEffect(() => {
    // Restore session on mount
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: { user: session.user, profileName: getProfileName(session.user) } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          dispatch({ type: 'SET_USER', payload: { user: session.user, profileName: getProfileName(session.user) } });
        } else {
          dispatch({ type: 'SET_USER', payload: { user: null, profileName: '' } });
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000);
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return { error: 'Check your email to confirm your account before signing in.' };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AppContext.Provider value={{ state, dispatch, signIn, signUp, signOut, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
