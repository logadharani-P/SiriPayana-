import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
<<<<<<< HEAD
import { AppProvider, useApp } from './context/AppContext';
=======
import { AppProvider } from './context/AppContext';
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
import { TripProvider } from './context/TripContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import DestinationPage from './pages/DestinationPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TransportPage from './pages/TransportPage';
import HotelPage from './pages/HotelPage';
import BudgetPage from './pages/BudgetPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import ChatPage from './pages/ChatPage';
import PreferencesPage from './pages/PreferencesPage';
import CompassPage from './pages/CompassPage';
import RecommendationsPage from './pages/RecommendationsPage';
import PackagePage from './pages/PackagePage';
import TransportPage from './pages/TransportPage';
import ItineraryPage from './pages/ItineraryPage';
import SummaryPage from './pages/SummaryPage';
import ConfirmationPage from './pages/ConfirmationPage';

import './i18n';
import './styles/design-system.css';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          {/* Main Landing & Exploration */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />

          {/* Authentication */}
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<AuthPage />} />
<<<<<<< HEAD
=======

          {/* Complete 8-Step Travel Planning Workflow */}
          {/* Step 1: Onboarding Questionnaire (1 question per page) */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/plan/preferences" element={<OnboardingPage />} />

          {/* Step 2 & 3: Four-Direction Karnataka Dashboard & Multi-Destination Selection */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/preferences" element={<DashboardPage />} />
          <Route path="/plan/recommendations" element={<DashboardPage />} />

          {/* Step 4: Transportation Booking */}
          <Route path="/plan/transport" element={<TransportPage />} />

          {/* Step 5: Hotel Booking */}
          <Route path="/plan/hotels" element={<HotelPage />} />

          {/* Step 6: Itemized Trip Budget Summary with Mandatory Working Next Button */}
          <Route path="/plan/budget" element={<BudgetPage />} />
          <Route path="/plan/summary" element={<BudgetPage />} />

          {/* Step 7: Payment & Review (Demo mode simulation vs Production mode) */}
          <Route path="/plan/payment" element={<PaymentPage />} />

          {/* Step 8: Thank You Page with Downloadable PDF Travel Pass */}
          <Route path="/plan/confirmation" element={<ConfirmationPage />} />

          {/* AI Travel Assistant Chat */}
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/dashboard/preferences" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/plan/preferences" element={<RequireAuth><PreferencesPage /></RequireAuth>} />
          <Route path="/plan/compass" element={<RequireAuth><CompassPage /></RequireAuth>} />
          <Route path="/plan/recommendations" element={<RequireAuth><RecommendationsPage /></RequireAuth>} />
          <Route path="/plan/package" element={<RequireAuth><PackagePage /></RequireAuth>} />
          <Route path="/plan/transport" element={<RequireAuth><TransportPage /></RequireAuth>} />
          <Route path="/plan/itinerary" element={<RequireAuth><ItineraryPage /></RequireAuth>} />
          <Route path="/plan/summary" element={<RequireAuth><SummaryPage /></RequireAuth>} />
          <Route path="/plan/confirmation" element={<RequireAuth><ConfirmationPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <TripProvider>
          <AppContent />
        </TripProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
