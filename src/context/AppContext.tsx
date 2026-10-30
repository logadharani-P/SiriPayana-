import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  isDemo?: boolean;
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

interface AppState {
  user: AppUser | null;
  profileName: string;
  preferences: UserPreferences;
  favorites: string[];
  savedDestinations: SavedDestination[];
  isAuthenticated: boolean;
  isDemoSession: boolean;
  isLoadingAuth: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: { user: AppUser | null; profileName: string; isDemo?: boolean } }
  | { type: 'LOGIN'; payload: AppUser }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SAVE_DESTINATION'; payload: SavedDestination }
  | { type: 'REMOVE_SAVED_DESTINATION'; payload: string }
  | { type: 'SET_TOAST'; payload: AppState['toast'] }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const defaultPreferences: UserPreferences = {
  startingLocation: 'Bengaluru',
  language: 'en',
  interests: [],
  budgetRange: 'mid',
  travellers: 2,
  travelPurpose: 'leisure',
};

const initialState: AppState = {
  user: null,
  profileName: '',
  preferences: defaultPreferences,
  favorites: [],
  savedDestinations: [],
  isAuthenticated: false,
  isDemoSession: false,
  isLoadingAuth: true,
  toast: null,
};

const DEMO_USER_KEY = 'siripayana_demo_session';
const LOCAL_KEY = 'siripayana-app-local';

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profileName: action.payload.profileName,
        isAuthenticated: !!action.payload.user,
        isDemoSession: !!action.payload.isDemo,
        isLoadingAuth: false,
      };
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        profileName: action.payload.name,
        isAuthenticated: true,
        isDemoSession: !!action.payload.isDemo,
        isLoadingAuth: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        profileName: '',
        isAuthenticated: false,
        isDemoSession: false,
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
      const savedDestinations = [
        ...state.savedDestinations.filter(s => s.destinationId !== action.payload.destinationId),
        action.payload,
      ];
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

function convertSupabaseUser(user: User): AppUser {
  const meta = user.user_metadata as Record<string, unknown> | null;
  const name =
    (meta?.full_name as string) ||
    (meta?.name as string) ||
    user.email?.split('@')[0] ||
    'Karnataka Explorer';
  return {
    id: user.id,
    name,
    email: user.email || '',
    createdAt: user.created_at,
    isDemo: false,
  };
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  loginDemoUser: (name?: string, email?: string) => void;
  signOut: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
      // 1. If Supabase is configured, check real session
      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase auth session check returned error:', error.message);
          }
          if (session?.user) {
            const appUser = convertSupabaseUser(session.user);
            dispatch({
              type: 'SET_USER',
              payload: { user: appUser, profileName: appUser.name, isDemo: false },
            });
            return;
          }
        } catch (e) {
          console.warn('Could not retrieve Supabase session:', e);
        }
      }

      // 2. Check for saved demo session in localStorage
      try {
        const storedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (storedDemo) {
          const demoUser: AppUser = JSON.parse(storedDemo);
          dispatch({
            type: 'SET_USER',
            payload: { user: demoUser, profileName: demoUser.name, isDemo: true },
          });
          return;
        }
      } catch {}

      // 3. No active session
      dispatch({ type: 'SET_LOADING', payload: false });
    })();

    // Listen to Supabase auth changes if configured
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const appUser = convertSupabaseUser(session.user);
          dispatch({
            type: 'SET_USER',
            payload: { user: appUser, profileName: appUser.name, isDemo: false },
          });
        } else {
          // If Supabase signed out, check if a demo session exists
          const storedDemo = localStorage.getItem(DEMO_USER_KEY);
          if (storedDemo) {
            try {
              const demoUser = JSON.parse(storedDemo);
              dispatch({
                type: 'SET_USER',
                payload: { user: demoUser, profileName: demoUser.name, isDemo: true },
              });
              return;
            } catch {}
          }
          dispatch({ type: 'LOGOUT' });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000);
  };

  const loginDemoUser = (name = 'Karnataka Explorer', email = 'explorer@siripayana.karnataka.gov.in') => {
    const demoUser: AppUser = {
      id: 'demo-user-1',
      name,
      email,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    } catch {}
    dispatch({
      type: 'SET_USER',
      payload: { user: demoUser, profileName: demoUser.name, isDemo: true },
    });
    showToast(`Signed in as Demo Guest (${name})`, 'success');
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      // In demo mode without Supabase credentials, sign in as Demo Guest
      loginDemoUser('Karnataka Explorer', email || 'explorer@siripayana.karnataka.gov.in');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication request failed.';
      return { error: msg };
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      // In demo mode without Supabase credentials, register as Demo Guest
      loginDemoUser(name || 'Karnataka Explorer', email || 'explorer@siripayana.karnataka.gov.in');
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return { error: error.message };
      if (data.user && !data.session) {
        return { error: 'Please check your email to confirm your account before signing in.' };
      }
      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(DEMO_USER_KEY);
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }

    dispatch({ type: 'LOGOUT' });
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AppContext.Provider value={{ state, dispatch, signIn, signUp, loginDemoUser, signOut, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
