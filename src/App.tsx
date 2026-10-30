import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
  if (state.isLoadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }
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

          {/* Authentication (with demo fallback) */}
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Complete 8-Step Travel Planning Workflow */}
          {/* Step 1: Onboarding Questionnaire (1 question per page) */}
          <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/plan/preferences" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

          {/* Step 2 & 3: Four-Direction Karnataka Dashboard & Multi-Destination Selection */}
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/dashboard/preferences" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/plan/compass" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/plan/recommendations" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/plan/package" element={<Navigate to="/dashboard" replace />} />

          {/* Step 4: Transportation Booking */}
          <Route path="/plan/transport" element={<RequireAuth><TransportPage /></RequireAuth>} />

          {/* Step 5: Hotel Booking */}
          <Route path="/plan/hotels" element={<RequireAuth><HotelPage /></RequireAuth>} />

          {/* Step 6: Itemized Trip Budget Summary with Mandatory Working Next Button */}
          <Route path="/plan/budget" element={<RequireAuth><BudgetPage /></RequireAuth>} />
          <Route path="/plan/summary" element={<RequireAuth><BudgetPage /></RequireAuth>} />
          <Route path="/plan/itinerary" element={<Navigate to="/plan/budget" replace />} />

          {/* Step 7: Payment & Review (Demo simulation vs Production mode) */}
          <Route path="/plan/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />

          {/* Step 8: Thank You Page with Downloadable PDF Travel Pass */}
          <Route path="/plan/confirmation" element={<RequireAuth><ConfirmationPage /></RequireAuth>} />

          {/* AI Travel Assistant Chat */}
          <Route path="/chat" element={<ChatPage />} />

          {/* Catch-all */}
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
