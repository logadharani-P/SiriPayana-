import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { destinations } from '../data/destinations';
import { useTrip } from '../context/TripContext';
import type { TripState } from '../context/TripContext';
import './DashboardPage.css';

interface SavedTrip {
  id: string;
  trip_name: string;
  trip_data: TripState;
  status: string;
  total_budget: number;
  destinations_count: number;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { state, showToast } = useApp();
  const { resetTrip, dispatch } = useTrip();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!state.user) return;
    setLoadingTrips(true);
    const { data, error } = await supabase
      .from('travel_plans')
      .select('id, trip_name, trip_data, status, total_budget, destinations_count, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      showToast('Could not load saved trips.', 'error');
    } else {
      setSavedTrips((data || []) as SavedTrip[]);
    }
    setLoadingTrips(false);
  }, [state.user, showToast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDeleteTrip = async (id: string) => {
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (error) {
      showToast('Could not delete trip.', 'error');
    } else {
      showToast('Trip deleted.', 'info');
      setSavedTrips(prev => prev.filter(trip => trip.id !== id));
    }
  };

  const handleResumeTrip = (trip: SavedTrip) => {
    const tripData = trip.trip_data;
    if (tripData) {
      dispatch({ type: 'LOAD_TRIP', payload: tripData });
      if (trip.status === 'complete') {
        showToast('Loaded saved trip — review and continue from preferences.', 'info');
      }
    }
    window.location.href = '/plan/preferences';
  };

  if (state.isLoadingAuth) {
    return (
      <div className="dashboard">
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-10))' }}>
          <div className="empty-state">
            <div className="empty-state__icon">⏳</div>
            <h2 className="empty-state__title">Loading…</h2>
            <p className="empty-state__description">Checking your session.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="dashboard">
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-10))' }}>
          <div className="empty-state">
            <div className="empty-state__icon">🔐</div>
            <h2 className="empty-state__title">{t('auth.signIn')}</h2>
            <p className="empty-state__description">Sign in to access your saved destinations and trip plans.</p>
            <Link to="/signin" className="btn btn--primary">{t('auth.signIn')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const favoriteDestinations = destinations.filter(d => state.favorites.includes(d.id));
  const savedDests = state.savedDestinations.map(s => destinations.find(d => d.id === s.destinationId)).filter(Boolean);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="container">
          <h1 className="dashboard__title">{t('dashboard.title')}</h1>
          <p className="dashboard__welcome">Welcome back, {state.profileName}!</p>
        </div>
      </div>
      <div className="container">
        {/* Stats */}
        <div className="dashboard__stats">
          <div className="dashboard__stat-card">
            <span className="dashboard__stat-icon">❤️</span>
            <span className="dashboard__stat-number">{state.favorites.length}</span>
            <span className="dashboard__stat-label">{t('dashboard.favorites')}</span>
          </div>
          <div className="dashboard__stat-card">
            <span className="dashboard__stat-icon">📍</span>
            <span className="dashboard__stat-number">{state.savedDestinations.length}</span>
            <span className="dashboard__stat-label">{t('dashboard.savedDestinations')}</span>
          </div>
          <div className="dashboard__stat-card">
            <span className="dashboard__stat-icon">📋</span>
            <span className="dashboard__stat-number">{savedTrips.length}</span>
            <span className="dashboard__stat-label">{t('dashboard.itineraries')}</span>
          </div>
        </div>

        {/* Favourites */}
        <section className="dashboard__section">
          <h2>{t('dashboard.favorites')}</h2>
          {favoriteDestinations.length === 0 ? (
            <div className="dashboard__empty-block">
              <p>No favourites yet. <Link to="/explore">Explore destinations</Link> to add some!</p>
            </div>
          ) : (
            <div className="dashboard__dest-grid">
              {favoriteDestinations.map(dest => (
                <Link key={dest.id} to={`/destinations/${dest.slug}`} className="dashboard__dest-card">
                  <img src={dest.imageUrl} alt={dest.name} onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x200/2D5A3D/FAF7F2?text=${encodeURIComponent(dest.name)}`; }} />
                  <div className="dashboard__dest-info">
                    <h4>{dest.name}</h4>
                    <p>{dest.district}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Saved Destinations */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>{t('dashboard.savedDestinations')}</h2>
          </div>
          {savedDests.length === 0 ? (
            <div className="dashboard__empty-block">
              <p>No saved destinations yet. Visit a <Link to="/explore">destination page</Link> and click "Add to My Trip".</p>
            </div>
          ) : (
            <div className="dashboard__dest-grid">
              {savedDests.map(dest => dest && (
                <Link key={dest.id} to={`/destinations/${dest.slug}`} className="dashboard__dest-card">
                  <img src={dest.imageUrl} alt={dest.name} onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x200/2D5A3D/FAF7F2?text=${encodeURIComponent(dest.name)}`; }} />
                  <div className="dashboard__dest-info">
                    <h4>{dest.name}</h4>
                    <p>{dest.district} • {dest.recommendedDuration}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Saved Trips */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>{t('dashboard.itineraries')}</h2>
            <Link to="/plan/preferences" className="btn btn--primary btn--sm" onClick={() => resetTrip()}>+ New Trip</Link>
          </div>
          {loadingTrips ? (
            <div className="dashboard__empty-block">
              <p>Loading your saved trips…</p>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="dashboard__empty-block">
              <p>{t('itinerary.noItineraries')}</p>
              <p>Start planning a trip to see it here.</p>
            </div>
          ) : (
            <div className="dashboard__itinerary-list">
              {savedTrips.map(trip => (
                <motion.div
                  key={trip.id}
                  className="dashboard__itinerary-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="dashboard__itinerary-header">
                    <h4>{trip.trip_name}</h4>
                    <span className="dashboard__itinerary-dates">
                      {trip.trip_data?.preferences?.startDate || '—'} → {trip.trip_data?.preferences?.endDate || '—'}
                    </span>
                  </div>
                  <p className="dashboard__itinerary-stops">
                    {trip.destinations_count} stops • ₹{Number(trip.total_budget).toLocaleString()}
                    {trip.status === 'draft' && <span style={{ marginLeft: '0.5rem', color: 'var(--color-gold)' }}>(Draft)</span>}
                  </p>
                  <div className="dashboard__itinerary-actions">
                    <button className="btn btn--outline btn--sm" onClick={() => handleResumeTrip(trip)}>
                      Resume / View
                    </button>
                    <button className="btn btn--outline btn--sm" onClick={() => handleDeleteTrip(trip.id)}>
                      {t('itinerary.delete')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="dashboard__quick-actions">
          <Link to="/explore" className="btn btn--primary">{t('cta.startExploring')}</Link>
          <Link to="/chat" className="btn btn--outline">{t('ai.askSiriPayana')}</Link>
        </section>
      </div>
    </div>
  );
}
