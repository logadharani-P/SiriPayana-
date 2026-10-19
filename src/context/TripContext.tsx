import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ==================== TYPES ====================

export type InterestType = 'heritage' | 'nature' | 'hills' | 'beaches' | 'waterfalls' | 'wildlife' | 'food' | 'adventure' | 'mixed';
export type TravelStyle = 'budget' | 'comfortable' | 'premium';
export type TransportMode = 'train' | 'bus' | 'flight' | 'car' | 'personal';
export type PackageTier = 'normal' | 'silver' | 'premium';

export interface TripPreferences {
  startingCity: string;
  startDate: string;
  endDate: string;
  duration: number;
  adults: number;
  children: number;
  interests: InterestType[];
  totalBudget: number;
  preferredTransport: TransportMode[];
  travelStyle: TravelStyle;
  accessibility: string;
  dietaryPreferences: string;
  packedOrRelaxed: 'relaxed' | 'packed' | 'balanced';
}

export interface SelectedDestination {
  destinationId: string;
  slug: string;
  name: string;
  imageUrl: string;
  duration: string;
  reason: string;
  day?: number;
}

export interface TransportOption {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  operator: string;
  duration: string;
  farePerPerson: number;
  groupFare: number;
  bookingUrl: string;
  source: string;
  lastChecked: string;
  isEstimate: boolean;
  selected: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  destinationId: string;
  destinationName: string;
  activities: ItineraryActivity[];
  transport: string;
  accommodation: string;
  dailyBudget: number;
  notes: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: string;
  cost: number;
  type: 'sightseeing' | 'food' | 'travel' | 'rest' | 'activity';
}

export interface BudgetBreakdown {
  outboundTransport: number;
  returnTransport: number;
  localTransport: number;
  accommodation: number;
  food: number;
  entryFees: number;
  activities: number;
  packageFee: number;
  miscellaneous: number;
  contingency: number;
  total: number;
  perPerson: number;
}

export interface TripState {
  currentStep: number;
  preferences: TripPreferences;
  selectedDestinations: SelectedDestination[];
  selectedPackage: PackageTier | null;
  transportOptions: TransportOption[];
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  tripName: string;
  tripId: string | null;
  isComplete: boolean;
  lastSaved: string | null;
}

// ==================== DEFAULTS ====================

const defaultPreferences: TripPreferences = {
  startingCity: 'Bengaluru',
  startDate: '',
  endDate: '',
  duration: 3,
  adults: 2,
  children: 0,
  interests: [],
  totalBudget: 15000,
  preferredTransport: ['train'],
  travelStyle: 'comfortable',
  accessibility: '',
  dietaryPreferences: '',
  packedOrRelaxed: 'balanced',
};

const defaultBudget: BudgetBreakdown = {
  outboundTransport: 0,
  returnTransport: 0,
  localTransport: 0,
  accommodation: 0,
  food: 0,
  entryFees: 0,
  activities: 0,
  packageFee: 0,
  miscellaneous: 0,
  contingency: 0,
  total: 0,
  perPerson: 0,
};

const initialState: TripState = {
  currentStep: 0,
  preferences: defaultPreferences,
  selectedDestinations: [],
  selectedPackage: null,
  transportOptions: [],
  itinerary: [],
  budget: defaultBudget,
  tripName: '',
  tripId: null,
  isComplete: false,
  lastSaved: null,
};

// ==================== ACTIONS ====================

type TripAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PREFERENCES'; payload: Partial<TripPreferences> }
  | { type: 'ADD_DESTINATION'; payload: SelectedDestination }
  | { type: 'REMOVE_DESTINATION'; payload: string }
  | { type: 'SET_DESTINATIONS'; payload: SelectedDestination[] }
  | { type: 'SET_PACKAGE'; payload: PackageTier }
  | { type: 'SET_TRANSPORT_OPTIONS'; payload: TransportOption[] }
  | { type: 'TOGGLE_TRANSPORT'; payload: string }
  | { type: 'SET_ITINERARY'; payload: ItineraryDay[] }
  | { type: 'UPDATE_ITINERARY_DAY'; payload: { day: number; data: Partial<ItineraryDay> } }
  | { type: 'SET_BUDGET'; payload: BudgetBreakdown }
  | { type: 'SET_TRIP_NAME'; payload: string }
  | { type: 'SET_TRIP_ID'; payload: string }
  | { type: 'MARK_COMPLETE' }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_TRIP' }
  | { type: 'LOAD_TRIP'; payload: TripState };

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'ADD_DESTINATION':
      if (state.selectedDestinations.find(d => d.destinationId === action.payload.destinationId)) return state;
      return { ...state, selectedDestinations: [...state.selectedDestinations, action.payload] };
    case 'REMOVE_DESTINATION':
      return { ...state, selectedDestinations: state.selectedDestinations.filter(d => d.destinationId !== action.payload) };
    case 'SET_DESTINATIONS':
      return { ...state, selectedDestinations: action.payload };
    case 'SET_PACKAGE':
      return { ...state, selectedPackage: action.payload };
    case 'SET_TRANSPORT_OPTIONS':
      return { ...state, transportOptions: action.payload };
    case 'TOGGLE_TRANSPORT':
      return {
        ...state,
        transportOptions: state.transportOptions.map(t =>
          t.id === action.payload ? { ...t, selected: !t.selected } : t
        ),
      };
    case 'SET_ITINERARY':
      return { ...state, itinerary: action.payload };
    case 'UPDATE_ITINERARY_DAY':
      return {
        ...state,
        itinerary: state.itinerary.map(d =>
          d.day === action.payload.day ? { ...d, ...action.payload.data } : d
        ),
      };
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_TRIP_NAME':
      return { ...state, tripName: action.payload };
    case 'SET_TRIP_ID':
      return { ...state, tripId: action.payload };
    case 'MARK_COMPLETE':
      return { ...state, isComplete: true };
    case 'MARK_SAVED':
      return { ...state, lastSaved: new Date().toISOString() };
    case 'RESET_TRIP':
      return { ...initialState };
    case 'LOAD_TRIP':
      return { ...action.payload };
    default:
      return state;
  }
}

// ==================== PERSISTENCE ====================

const TRIP_STORAGE_KEY = 'siripayana_draft_trip';

function loadDraftTrip(): TripState {
  try {
    const saved = localStorage.getItem(TRIP_STORAGE_KEY);
    if (saved) return { ...initialState, ...JSON.parse(saved) };
  } catch {}
  return initialState;
}

function saveDraftTrip(state: TripState) {
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ==================== CONTEXT ====================

interface TripContextType {
  trip: TripState;
  dispatch: React.Dispatch<TripAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetTrip: () => void;
}

const TripContext = createContext<TripContextType | null>(null);

export const PLAN_STEPS = [
  { path: '/plan/preferences', label: 'Preferences' },
  { path: '/plan/compass', label: 'Compass' },
  { path: '/plan/recommendations', label: 'Destinations' },
  { path: '/plan/package', label: 'Package' },
  { path: '/plan/transport', label: 'Transport' },
  { path: '/plan/itinerary', label: 'Itinerary' },
  { path: '/plan/summary', label: 'Summary' },
  { path: '/plan/confirmation', label: 'Confirmation' },
];

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, dispatch] = useReducer(tripReducer, initialState, loadDraftTrip);

  useEffect(() => {
    saveDraftTrip(trip);
  }, [trip]);

  const nextStep = () => {
    const next = Math.min(trip.currentStep + 1, PLAN_STEPS.length - 1);
    dispatch({ type: 'SET_STEP', payload: next });
  };

  const prevStep = () => {
    const prev = Math.max(trip.currentStep - 1, 0);
    dispatch({ type: 'SET_STEP', payload: prev });
  };

  const goToStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: Math.max(0, Math.min(step, PLAN_STEPS.length - 1)) });
  };

  const resetTrip = () => {
    dispatch({ type: 'RESET_TRIP' });
    localStorage.removeItem(TRIP_STORAGE_KEY);
  };

  return (
    <TripContext.Provider value={{ trip, dispatch, nextStep, prevStep, goToStep, resetTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
