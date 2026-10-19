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
import DashboardPage from './pages/DashboardPage';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<AuthPage />} />
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
