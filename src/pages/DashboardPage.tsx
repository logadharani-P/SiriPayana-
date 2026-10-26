<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { destinations } from '../data/destinations';
import { useTrip } from '../context/TripContext';
import type { TripState } from '../context/TripContext';
=======
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip, SelectedDestination } from '../context/TripContext';
import { destinations, Destination, Region, getDestinationsByRegion } from '../data/destinations';
import { REGIONAL_IMAGES, DESTINATION_IMAGES } from '../data/destinationImages';
import StepIndicator from '../components/StepIndicator';
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
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
<<<<<<< HEAD
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
=======
  const { trip, dispatch, goToStep } = useTrip();
  const navigate = useNavigate();
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)

  // Active region filter ('all' for compass overview, or 'north' | 'south' | 'east' | 'west')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  // Destination for dedicated detail view
  const [activeDetailDest, setActiveDetailDest] = useState<Destination | null>(null);
  // Review selected places modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Search and category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedCount = trip.selectedDestinations.length;

  const isDestinationSelected = (id: string) => {
    return trip.selectedDestinations.some(d => d.destinationId === id);
  };

  const handleToggleDestination = (dest: Destination) => {
    if (isDestinationSelected(dest.id)) {
      dispatch({ type: 'REMOVE_DESTINATION', payload: dest.id });
    } else {
      const sel: SelectedDestination = {
        destinationId: dest.id,
        slug: dest.slug,
        name: dest.name,
        imageUrl: DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl,
        duration: dest.recommendedDuration,
        reason: `${dest.category.toUpperCase()} • ${dest.district}`,
      };
      dispatch({ type: 'ADD_DESTINATION', payload: sel });
    }
  };

  const handleProceedToTransport = () => {
    if (selectedCount === 0) return;
    goToStep(2);
    navigate('/plan/transport');
  };

  // Filter destinations
  const currentRegionDestinations = selectedRegion === 'all'
    ? destinations
    : getDestinationsByRegion(selectedRegion);

  const filteredDestinations = currentRegionDestinations.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const regionsList: { key: Region; name: string; kannadaName: string; icon: string; count: number }[] = [
    { key: 'north', name: 'North Karnataka', kannadaName: 'ಉತ್ತರ ಕರ್ನಾಟಕ', icon: '🏛️', count: getDestinationsByRegion('north').length },
    { key: 'south', name: 'South Karnataka', kannadaName: 'ದಕ್ಷಿಣ ಕರ್ನಾಟಕ', icon: '👑', count: getDestinationsByRegion('south').length },
    { key: 'west', name: 'West Karnataka', kannadaName: 'ಪಶ್ಚಿಮ ಕರ್ನಾಟಕ (ಕರಾವಳಿ)', icon: '🌊', count: getDestinationsByRegion('west').length },
    { key: 'east', name: 'East Karnataka', kannadaName: 'ಪೂರ್ವ & ಕೇಂದ್ರ ಕರ್ನಾಟಕ', icon: '🌄', count: getDestinationsByRegion('east').length },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-page__header">
        <div className="container">
<<<<<<< HEAD
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
=======
          <div className="dashboard-header-inner">
            <div>
              <span className="dashboard-eyebrow">Step 2 & 3 • Karnataka Exploration</span>
              <h1>🧭 Four Directions of Karnataka</h1>
              <p>
                Explore North, South, East, and West Karnataka. Select as many destinations as you wish—there is no limit!
              </p>
            </div>
            {trip.preferences.startingCity && (
              <div className="dashboard-trip-meta">
                <span>📍 From: <strong>{trip.preferences.startingCity}</strong></span>
                <span>📅 <strong>{trip.preferences.duration} Days</strong></span>
                <span>👥 <strong>{trip.preferences.adults + trip.preferences.children} Travellers</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)

      <div className="container dashboard-page__body">
        <StepIndicator />

        {/* ================= COMPASS / 4-DIRECTION HUB ================= */}
        {selectedRegion === 'all' ? (
          <div className="compass-section">
            <div className="compass-section__header">
              <h2>Select a Direction to Explore</h2>
              <p>Each direction features authentic heritage, nature, coastlines, and shrines.</p>
            </div>

<<<<<<< HEAD
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
=======
            <div className="compass-grid">
              {regionsList.map(reg => {
                const regInfo = REGIONAL_IMAGES[reg.key];
                return (
                  <motion.div
                    key={reg.key}
                    className="compass-card"
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedRegion(reg.key)}
                  >
                    <div className="compass-card__img-wrap">
                      <img src={regInfo.image} alt={reg.name} className="compass-card__img" />
                      <div className="compass-card__badge">
                        <span>{reg.icon}</span>
                        <span>{reg.count} Places</span>
                      </div>
                    </div>
                    <div className="compass-card__content">
                      <span className="compass-card__kannada">{reg.kannadaName}</span>
                      <h3 className="compass-card__title">{reg.name}</h3>
                      <p className="compass-card__desc">{regInfo.subtitle}</p>
                      <div className="compass-card__districts">
                        <strong>Districts: </strong>
                        <span>{regInfo.districts.join(', ')}</span>
                      </div>
                      <button className="btn btn--outline btn--sm compass-card__btn">
                        Explore {reg.name} →
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= REGION DESTINATION LISTING ================= */
          <div className="region-listing-section">
            {/* Return Bar */}
            <div className="region-listing-nav">
              <button
                className="btn btn--outline btn--sm"
                onClick={() => setSelectedRegion('all')}
              >
                ← Back to 4 Directions Dashboard
              </button>

              <div className="region-tabs">
                {regionsList.map(reg => (
                  <button
                    key={reg.key}
                    className={`region-tab-btn ${selectedRegion === reg.key ? 'region-tab-btn--active' : ''}`}
                    onClick={() => setSelectedRegion(reg.key)}
                  >
                    {reg.icon} {reg.name} ({reg.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Region Banner */}
            <div className="region-banner">
              <h2>{REGIONAL_IMAGES[selectedRegion]?.title}</h2>
              <p>{REGIONAL_IMAGES[selectedRegion]?.subtitle}</p>
            </div>

            {/* Filters Bar */}
            <div className="listing-filters-bar">
              <div className="listing-search-wrap">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search destinations, temples, waterfalls, districts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input listing-search-input"
                />
              </div>

              <div className="listing-category-chips">
                {[
                  { key: 'all', label: 'All Categories' },
                  { key: 'heritage', label: '🏛️ Heritage' },
                  { key: 'hills', label: '⛰️ Hills' },
                  { key: 'beaches', label: '🏖️ Beaches' },
                  { key: 'waterfalls', label: '💧 Waterfalls' },
                  { key: 'wildlife', label: '🐾 Wildlife' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    className={`chip ${activeCategory === cat.key ? 'chip--selected' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Cards Grid */}
            <div className="destinations-grid">
              {filteredDestinations.map(dest => {
                const selected = isDestinationSelected(dest.id);
                const authenticImage = DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl;

                return (
                  <motion.div
                    key={dest.id}
                    className={`dest-card ${selected ? 'dest-card--selected' : ''}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="dest-card__media">
                      <img
                        src={authenticImage}
                        alt={dest.name}
                        className="dest-card__img"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1600100561600-44d5e3cba921?w=600&q=80`;
                        }}
                      />
                      <span className="dest-card__category-badge">
                        {dest.category.toUpperCase()}
                      </span>
                      {selected && (
                        <span className="dest-card__selected-pill">
                          ✓ Added to Trip
                        </span>
                      )}
                    </div>

                    <div className="dest-card__body">
                      <div className="dest-card__meta">
                        <span className="dest-card__district">📍 {dest.district}</span>
                        <span className="dest-card__duration">⏱️ {dest.recommendedDuration}</span>
                      </div>

                      <h3 className="dest-card__title">{dest.name}</h3>
                      <p className="dest-card__desc">{dest.shortDescription}</p>

                      <div className="dest-card__fee-info">
                        <span>Entry: </span>
                        <strong>
                          {dest.entryFee?.indianAdult !== null && dest.entryFee?.indianAdult !== undefined
                            ? dest.entryFee.indianAdult === 0
                              ? 'Free'
                              : `₹${dest.entryFee.indianAdult} / adult`
                            : 'Nominal'}
                        </strong>
                      </div>

                      <div className="dest-card__actions">
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setActiveDetailDest(dest)}
                        >
                          📖 View Details
                        </button>
                        <button
                          type="button"
                          className={`btn btn--sm ${selected ? 'btn--danger-outline' : 'btn--primary'}`}
                          onClick={() => handleToggleDestination(dest)}
                        >
                          {selected ? '✕ Remove' : '+ Add to Trip'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredDestinations.length === 0 && (
              <div className="empty-listing">
                <p>No destinations found matching your search. Try adjusting your query or category filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= DEDICATED DESTINATION DETAIL MODAL ================= */}
        <AnimatePresence>
          {activeDetailDest && (
            <motion.div
              className="detail-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailDest(null)}
            >
              <motion.div
                className="detail-modal-card"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="detail-modal-close"
                  onClick={() => setActiveDetailDest(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="detail-modal-hero">
                  <img
                    src={DESTINATION_IMAGES[activeDetailDest.id]?.url || activeDetailDest.imageUrl}
                    alt={activeDetailDest.name}
                    className="detail-modal-hero-img"
                  />
                  <div className="detail-modal-hero-overlay">
                    <span className="dest-card__category-badge">
                      {activeDetailDest.category.toUpperCase()} • {activeDetailDest.region.toUpperCase()} KARNATAKA
                    </span>
                    <h2>{activeDetailDest.name}</h2>
                    <p>📍 {activeDetailDest.district} District</p>
                  </div>
                </div>

                <div className="detail-modal-content">
                  {/* Key Quick Facts */}
                  <div className="detail-facts-grid">
                    <div className="detail-fact-item">
                      <span>⏱️ Duration</span>
                      <strong>{activeDetailDest.recommendedDuration}</strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>🌤️ Best Season</span>
                      <strong>{activeDetailDest.bestSeason}</strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>🕒 Opening Hours</span>
                      <strong>
                        {activeDetailDest.openingHours?.open
                          ? `${activeDetailDest.openingHours.open} - ${activeDetailDest.openingHours.close || 'Closing'}`
                          : 'Open round the clock'}
                      </strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>🎟️ Indian Adult</span>
                      <strong>
                        {activeDetailDest.entryFee?.indianAdult !== null
                          ? `₹${activeDetailDest.entryFee.indianAdult}`
                          : 'Free / Included'}
                      </strong>
                    </div>
                  </div>

                  {/* History & Significance */}
                  <div className="detail-section">
                    <h3>🏛️ Historical Background</h3>
                    <p>{activeDetailDest.detailedHistory}</p>
                  </div>

                  <div className="detail-section">
                    <h3>✨ Cultural & Architectural Significance</h3>
                    <p>{activeDetailDest.culturalSignificance}</p>
                  </div>

                  {/* Key Highlights */}
                  {activeDetailDest.specialAttractions?.length > 0 && (
                    <div className="detail-section">
                      <h3>🌟 Key Highlights & Attractions</h3>
                      <ul className="detail-highlights-list">
                        {activeDetailDest.specialAttractions.map((att, i) => (
                          <li key={i}>{att}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Visitor Information */}
                  <div className="detail-section">
                    <h3>ℹ️ Practical Visitor Information</h3>
                    <p><strong>Accessibility:</strong> {activeDetailDest.accessibility || 'Standard terrain, comfortable walking shoes advised.'}</p>
                    {activeDetailDest.entryFee?.notes && (
                      <p><strong>Entry Notes:</strong> {activeDetailDest.entryFee.notes}</p>
                    )}
                    {activeDetailDest.nearbyAttractions?.length > 0 && (
                      <p><strong>Nearby Places:</strong> {activeDetailDest.nearbyAttractions.join(', ')}</p>
                    )}
                    <p><strong>Coordinates:</strong> {activeDetailDest.latitude}° N, {activeDetailDest.longitude}° E</p>
                  </div>

                  {/* Modal Action Bar */}
                  <div className="detail-modal-footer">
                    <button
                      className="btn btn--outline"
                      onClick={() => setActiveDetailDest(null)}
                    >
                      ← Back to List
                    </button>
                    <button
                      className={`btn btn--lg ${isDestinationSelected(activeDetailDest.id) ? 'btn--danger-outline' : 'btn--primary'}`}
                      onClick={() => {
                        handleToggleDestination(activeDetailDest);
                      }}
                    >
                      {isDestinationSelected(activeDetailDest.id)
                        ? '✕ Remove from My Trip'
                        : '+ Add to My Trip'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
          )}
        </AnimatePresence>

        {/* ================= REVIEW SELECTED PLACES MODAL ================= */}
        <AnimatePresence>
          {showReviewModal && (
            <motion.div
              className="detail-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                className="detail-modal-card review-modal-card"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="detail-modal-close"
                  onClick={() => setShowReviewModal(false)}
                >
                  ✕
                </button>

                <div style={{ padding: 'var(--space-6)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-2)' }}>
                    ✅ Selected Destinations ({selectedCount})
                  </h2>
                  <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                    All these destinations will be sequenced into your day-wise itinerary and itemized in your budget. You can add more than 5 places without any restrictions!
                  </p>

                  <div className="review-places-list">
                    {trip.selectedDestinations.map(d => (
                      <div key={d.destinationId} className="review-place-row">
                        <img src={d.imageUrl} alt={d.name} className="review-place-thumb" />
                        <div className="review-place-info">
                          <h4>{d.name}</h4>
                          <p>{d.reason} • {d.duration}</p>
                        </div>
                        <button
                          className="btn btn--outline btn--sm"
                          style={{ borderColor: 'var(--color-gray-300)', color: '#c2410c' }}
                          onClick={() => dispatch({ type: 'REMOVE_DESTINATION', payload: d.destinationId })}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                    <button
                      className="btn btn--outline"
                      onClick={() => setShowReviewModal(false)}
                    >
                      + Add More Destinations
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={() => {
                        setShowReviewModal(false);
                        handleProceedToTransport();
                      }}
                    >
                      Proceed to Transportation (Step 4) →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= FLOATING SELECTION DOCK ================= */}
        {selectedCount > 0 && (
          <motion.div
            className="selection-floating-dock"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="dock-left">
              <span className="dock-count-badge">{selectedCount}</span>
              <div>
                <strong>{selectedCount} Destination{selectedCount > 1 ? 's' : ''} Selected</strong>
                <p>No 5-place limit — add as many Karnataka destinations as you like</p>
              </div>
            </div>

            <div className="dock-right">
              <button
                type="button"
                className="btn btn--outline btn--sm dock-review-btn"
                onClick={() => setShowReviewModal(true)}
              >
                📋 Review Selected Places
              </button>
              <button
                type="button"
                className="btn btn--primary btn--lg dock-next-btn"
                onClick={handleProceedToTransport}
              >
                Next: Choose Transportation (Step 4) →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
