import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { destinations as allDestinations } from '../data/destinations';

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
  preferredLanguage: string;
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

export interface SelectedHotelBooking {
  hotelId: string;
  destinationId: string;
  destinationName: string;
  hotelName: string;
  pricePerNight: number;
  nights: number;
  rooms: number;
  totalCost: number;
  imageUrl?: string;
}

export interface DestinationFeeBreakdown {
  destinationId: string;
  name: string;
  adultsCount: number;
  childrenCount: number;
  adultRate: number;
  childRate: number;
  totalFee: number;
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
  destinationFeesBreakdown: DestinationFeeBreakdown[];
  activities: number;
  packageFee: number;
  miscellaneous: number;
  taxes: number;
  total: number;
  perPerson: number;
}

export interface TripState {
  currentStep: number;
  preferences: TripPreferences;
  selectedDestinations: SelectedDestination[];
  selectedPackage: PackageTier | null;
  transportOptions: TransportOption[];
  selectedHotels: SelectedHotelBooking[];
  itinerary: ItineraryDay[];
  budget: BudgetBreakdown;
  tripName: string;
  tripId: string | null;
  bookingReference: string;
  paymentStatus: 'pending' | 'demo_confirmed' | 'confirmed';
  isComplete: boolean;
  lastSaved: string | null;
}

// ==================== DEFAULTS ====================

const defaultPreferences: TripPreferences = {
  startingCity: 'Bengaluru',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  duration: 4,
  adults: 2,
  children: 0,
  interests: ['heritage', 'nature'],
  totalBudget: 25000,
  preferredTransport: ['train'],
  travelStyle: 'comfortable',
  accessibility: '',
  dietaryPreferences: '',
  packedOrRelaxed: 'balanced',
  preferredLanguage: 'en',
};

const defaultBudget: BudgetBreakdown = {
  outboundTransport: 0,
  returnTransport: 0,
  localTransport: 0,
  accommodation: 0,
  food: 0,
  entryFees: 0,
  destinationFeesBreakdown: [],
  activities: 0,
  packageFee: 0,
  miscellaneous: 0,
  taxes: 0,
  total: 0,
  perPerson: 0,
};

const initialState: TripState = {
  currentStep: 0,
  preferences: defaultPreferences,
  selectedDestinations: [],
  selectedPackage: 'silver',
  transportOptions: [],
  selectedHotels: [],
  itinerary: [],
  budget: defaultBudget,
  tripName: 'My Karnataka Discovery',
  tripId: null,
  bookingReference: 'SP-KA-2026-DEMO-0001',
  paymentStatus: 'pending',
  isComplete: false,
  lastSaved: null,
};

// ==================== CALCULATION HELPER ====================

export function calculateTripBudget(
  preferences: TripPreferences,
  selectedDestinations: SelectedDestination[],
  transportOptions: TransportOption[],
  selectedHotels: SelectedHotelBooking[],
  selectedPackage: PackageTier | null = 'silver'
): BudgetBreakdown {
  const travelers = Math.max(preferences.adults + preferences.children, 1);
  const adults = Math.max(preferences.adults, 1);
  const children = preferences.children || 0;
  const days = Math.max(preferences.duration || 3, 1);
  const nights = Math.max(days - 1, 1);
  const style = preferences.travelStyle;

  // 1. Transport costs
  const selectedTransport = transportOptions.filter(t => t.selected);
  let outbound = selectedTransport.find(t => t.id.includes('outbound'))?.groupFare;
  let returnFare = selectedTransport.find(t => t.id.includes('return'))?.groupFare;

  if (outbound === undefined) {
    outbound = (style === 'premium' ? 2500 : style === 'comfortable' ? 850 : 450) * travelers;
  }
  if (returnFare === undefined) {
    returnFare = (style === 'premium' ? 2500 : style === 'comfortable' ? 850 : 450) * travelers;
  }

  // 2. Local transport estimate
  const localDailyRate = style === 'premium' ? 900 : style === 'comfortable' ? 500 : 250;
  const localTransport = localDailyRate * days;

  // 3. Accommodation costs
  let accommodation = 0;
  if (selectedHotels.length > 0) {
    accommodation = selectedHotels.reduce((sum, h) => sum + h.totalCost, 0);
  } else {
    const defaultRoomRate = style === 'premium' ? 4500 : style === 'comfortable' ? 2400 : 1200;
    const roomsCount = Math.ceil(travelers / 2);
    accommodation = defaultRoomRate * nights * roomsCount;
  }

  // 4. Destination entry fees calculation
  const destinationFeesBreakdown: DestinationFeeBreakdown[] = selectedDestinations.map(sd => {
    const full = allDestinations.find(d => d.id === sd.destinationId);
    const adultRate = full?.entryFee?.indianAdult ?? 30;
    const childRate = full?.entryFee?.indianChild ?? Math.floor(adultRate / 2);
    const totalFee = (adultRate * adults) + (childRate * children);
    return {
      destinationId: sd.destinationId,
      name: sd.name,
      adultsCount: adults,
      childrenCount: children,
      adultRate,
      childRate,
      totalFee,
    };
  });

  const entryFees = destinationFeesBreakdown.reduce((sum, item) => sum + item.totalFee, 0);

  // 5. Food estimates
  const foodDailyRate = style === 'premium' ? 1200 : style === 'comfortable' ? 650 : 350;
  const food = foodDailyRate * days * travelers;

  // 6. Activities & guides
  const activities = (style === 'premium' ? 400 : style === 'comfortable' ? 200 : 100) * days * travelers;

  // 7. Package fee
  const packageFees: Record<string, number> = { normal: 499, silver: 999, premium: 1999 };
  const packageFee = packageFees[selectedPackage || 'normal'] || 0;

  // 8. Taxes (5% GST on services)
  const taxableServices = accommodation + outbound + returnFare + localTransport + packageFee;
  const taxes = Math.round(taxableServices * 0.05);

  const miscellaneous = Math.round((food + entryFees) * 0.05);

  const total = outbound + returnFare + localTransport + accommodation + food + entryFees + activities + packageFee + taxes + miscellaneous;

  return {
    outboundTransport: outbound,
    returnTransport: returnFare,
    localTransport,
    accommodation,
    food,
    entryFees,
    destinationFeesBreakdown,
    activities,
    packageFee,
    miscellaneous,
    taxes,
    total,
    perPerson: Math.round(total / travelers),
  };
}

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
  | { type: 'SELECT_HOTEL'; payload: SelectedHotelBooking }
  | { type: 'REMOVE_HOTEL'; payload: string }
  | { type: 'SET_HOTELS'; payload: SelectedHotelBooking[] }
  | { type: 'SET_ITINERARY'; payload: ItineraryDay[] }
  | { type: 'UPDATE_ITINERARY_DAY'; payload: { day: number; data: Partial<ItineraryDay> } }
  | { type: 'SET_BUDGET'; payload: BudgetBreakdown }
  | { type: 'SET_TRIP_NAME'; payload: string }
  | { type: 'SET_TRIP_ID'; payload: string }
  | { type: 'CONFIRM_DEMO_PAYMENT'; payload?: { reference?: string } }
  | { type: 'MARK_COMPLETE' }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET_TRIP' }
  | { type: 'LOAD_TRIP'; payload: TripState };

function tripReducer(state: TripState, action: TripAction): TripState {
  let newState = state;

  switch (action.type) {
    case 'SET_STEP':
      newState = { ...state, currentStep: action.payload };
      break;

    case 'SET_PREFERENCES': {
      const updatedPrefs = { ...state.preferences, ...action.payload };
      newState = {
        ...state,
        preferences: updatedPrefs,
        budget: calculateTripBudget(updatedPrefs, state.selectedDestinations, state.transportOptions, state.selectedHotels, state.selectedPackage),
      };
      break;
    }

    case 'ADD_DESTINATION': {
      if (state.selectedDestinations.find(d => d.destinationId === action.payload.destinationId)) {
        return state;
      }
      const updatedDests = [...state.selectedDestinations, action.payload];
      newState = {
        ...state,
        selectedDestinations: updatedDests,
        budget: calculateTripBudget(state.preferences, updatedDests, state.transportOptions, state.selectedHotels, state.selectedPackage),
      };
      break;
    }

    case 'REMOVE_DESTINATION': {
      const updatedDests = state.selectedDestinations.filter(d => d.destinationId !== action.payload);
      const updatedHotels = state.selectedHotels.filter(h => h.destinationId !== action.payload);
      newState = {
        ...state,
        selectedDestinations: updatedDests,
        selectedHotels: updatedHotels,
        budget: calculateTripBudget(state.preferences, updatedDests, state.transportOptions, updatedHotels, state.selectedPackage),
      };
      break;
    }

    case 'SET_DESTINATIONS': {
      newState = {
        ...state,
        selectedDestinations: action.payload,
        budget: calculateTripBudget(state.preferences, action.payload, state.transportOptions, state.selectedHotels, state.selectedPackage),
      };
      break;
    }

    case 'SET_PACKAGE': {
      newState = {
        ...state,
        selectedPackage: action.payload,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, state.transportOptions, state.selectedHotels, action.payload),
      };
      break;
    }

    case 'SET_TRANSPORT_OPTIONS': {
      newState = {
        ...state,
        transportOptions: action.payload,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, action.payload, state.selectedHotels, state.selectedPackage),
      };
      break;
    }

    case 'TOGGLE_TRANSPORT': {
      const updatedTransport = state.transportOptions.map(t =>
        t.id === action.payload ? { ...t, selected: !t.selected } : t
      );
      newState = {
        ...state,
        transportOptions: updatedTransport,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, updatedTransport, state.selectedHotels, state.selectedPackage),
      };
      break;
    }

    case 'SELECT_HOTEL': {
      const filtered = state.selectedHotels.filter(h => h.destinationId !== action.payload.destinationId);
      const updatedHotels = [...filtered, action.payload];
      newState = {
        ...state,
        selectedHotels: updatedHotels,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, state.transportOptions, updatedHotels, state.selectedPackage),
      };
      break;
    }

    case 'REMOVE_HOTEL': {
      const updatedHotels = state.selectedHotels.filter(h => h.hotelId !== action.payload && h.destinationId !== action.payload);
      newState = {
        ...state,
        selectedHotels: updatedHotels,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, state.transportOptions, updatedHotels, state.selectedPackage),
      };
      break;
    }

    case 'SET_HOTELS': {
      newState = {
        ...state,
        selectedHotels: action.payload,
        budget: calculateTripBudget(state.preferences, state.selectedDestinations, state.transportOptions, action.payload, state.selectedPackage),
      };
      break;
    }

    case 'SET_ITINERARY':
      newState = { ...state, itinerary: action.payload };
      break;

    case 'UPDATE_ITINERARY_DAY':
      newState = {
        ...state,
        itinerary: state.itinerary.map(d =>
          d.day === action.payload.day ? { ...d, ...action.payload.data } : d
        ),
      };
      break;

    case 'SET_BUDGET':
      newState = { ...state, budget: action.payload };
      break;

    case 'SET_TRIP_NAME':
      newState = { ...state, tripName: action.payload };
      break;

    case 'SET_TRIP_ID':
      newState = { ...state, tripId: action.payload };
      break;

    case 'CONFIRM_DEMO_PAYMENT': {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const ref = action.payload?.reference || `SP-KA-2026-DEMO-${randomSuffix}`;
      newState = {
        ...state,
        paymentStatus: 'demo_confirmed',
        bookingReference: ref,
        isComplete: true,
        lastSaved: new Date().toISOString(),
      };
      break;
    }

    case 'MARK_COMPLETE':
      newState = { ...state, isComplete: true };
      break;

    case 'MARK_SAVED':
      newState = { ...state, lastSaved: new Date().toISOString() };
      break;

    case 'RESET_TRIP':
      newState = { ...initialState };
      break;

    case 'LOAD_TRIP':
      newState = { ...action.payload };
      break;

    default:
      return state;
  }

  return newState;
}

// ==================== PERSISTENCE ====================

const TRIP_STORAGE_KEY = 'siripayana_draft_trip';

function loadDraftTrip(): TripState {
  try {
    const saved = localStorage.getItem(TRIP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        ...parsed,
        // Ensure budget recalculation so formulas and counts are fresh
        budget: calculateTripBudget(
          parsed.preferences || defaultPreferences,
          parsed.selectedDestinations || [],
          parsed.transportOptions || [],
          parsed.selectedHotels || [],
          parsed.selectedPackage || 'silver'
        ),
      };
    }
  } catch {}
  return initialState;
}

function saveDraftTrip(state: TripState) {
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ==================== CONTEXT & WORKFLOW STEPS ====================

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
<<<<<<< HEAD
  { path: '/plan/preferences', label: 'Preferences' },
  { path: '/plan/compass', label: 'Compass' },
  { path: '/plan/recommendations', label: 'Destinations' },
  { path: '/plan/package', label: 'Package' },
=======
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/dashboard', label: 'Destinations' },
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
  { path: '/plan/transport', label: 'Transport' },
  { path: '/plan/hotels', label: 'Hotels' },
  { path: '/plan/budget', label: 'Budget' },
  { path: '/plan/payment', label: 'Payment' },
  { path: '/plan/confirmation', label: 'Travel Pass' },
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
