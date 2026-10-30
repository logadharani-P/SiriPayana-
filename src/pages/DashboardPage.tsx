import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip, SelectedDestination, TripState } from '../context/TripContext';
import { useApp } from '../context/AppContext';
import { destinations, Destination, Region, getDestinationsByRegion } from '../data/destinations';
import { REGIONAL_IMAGES, DESTINATION_IMAGES, KARNATAKA_FALLBACK_IMAGE } from '../data/destinationImages';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { validateTravelFeasibility } from '../utils/travelFeasibility';
import StepIndicator from '../components/StepIndicator';
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
  const { trip, dispatch, goToStep } = useTrip();
  const { state, showToast } = useApp();
  const navigate = useNavigate();

  // Active region filter ('all' or 'north' | 'south' | 'east' | 'west')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  // Destination for dedicated detail view
  const [activeDetailDest, setActiveDetailDest] = useState<Destination | null>(null);
  // Review selected places modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Search and category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Saved trips drawer / toggle
  const [showSavedTrips, setShowSavedTrips] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const selectedCount = trip.selectedDestinations.length;

  // Travel Feasibility Calculation (Requirement 8)
  const feasibility = useMemo(() => {
    return validateTravelFeasibility(
      trip.preferences.startingCity,
      trip.preferences.duration,
      trip.preferences.adults + trip.preferences.children,
      trip.selectedDestinations
    );
  }, [
    trip.preferences.startingCity,
    trip.preferences.duration,
    trip.preferences.adults,
    trip.preferences.children,
    trip.selectedDestinations,
  ]);

  const loadSavedTrips = useCallback(async () => {
    if (!state.user || !isSupabaseConfigured) return;
    setLoadingTrips(true);
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('id, trip_name, trip_data, status, total_budget, destinations_count, created_at, updated_at')
        .order('updated_at', { ascending: false });
      if (!error && data) {
        setSavedTrips(data as SavedTrip[]);
      }
    } catch (e) {
      console.warn('Could not load saved trips:', e);
    } finally {
      setLoadingTrips(false);
    }
  }, [state.user]);

  useEffect(() => {
    if (state.isAuthenticated && isSupabaseConfigured) {
      loadSavedTrips();
    }
  }, [state.isAuthenticated, loadSavedTrips]);

  const handleResumeTrip = (st: SavedTrip) => {
    if (st.trip_data) {
      dispatch({ type: 'LOAD_TRIP', payload: st.trip_data });
      showToast(`Loaded saved trip: ${st.trip_name}`, 'info');
      setShowSavedTrips(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (!error) {
      setSavedTrips(prev => prev.filter(p => p.id !== id));
      showToast('Trip deleted from account.', 'info');
    }
  };

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
        imageUrl: DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl || KARNATAKA_FALLBACK_IMAGE,
        duration: dest.recommendedDuration,
        reason: `${dest.category.toUpperCase()} • ${dest.district}`,
        coordinates: {
          lat: dest.latitude,
          lng: dest.longitude,
        },
      };
      dispatch({ type: 'ADD_DESTINATION', payload: sel });
    }
  };

  const handleProceedToTransport = () => {
    if (selectedCount === 0) {
      showToast('Please select at least one destination to proceed.', 'error');
      return;
    }
    goToStep(2); // Step 3 in 1-based indexing (Transport)
    navigate('/plan/transport');
  };

  // Comprehensive destination search across all fields
  const filteredDestinations = useMemo(() => {
    const list = selectedRegion === 'all'
      ? destinations
      : getDestinationsByRegion(selectedRegion);

    const q = searchQuery.toLowerCase().trim();

    return list.filter(d => {
      const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const nameMatch = d.name.toLowerCase().includes(q);
      const kannadaMatch = d.kannadaName ? d.kannadaName.toLowerCase().includes(q) : false;
      const districtMatch = d.district.toLowerCase().includes(q);
      const descMatch = d.shortDescription.toLowerCase().includes(q);
      const categoryMatch = d.category.toLowerCase().includes(q);
      const regionMatch = d.region.toLowerCase().includes(q);
      const highlightsMatch = d.specialAttractions?.some(a => a.toLowerCase().includes(q)) ?? false;

      return nameMatch || kannadaMatch || districtMatch || descMatch || categoryMatch || regionMatch || highlightsMatch;
    });
  }, [selectedRegion, searchQuery, activeCategory]);

  const regionsList: { key: Region; name: string; kannadaName: string; icon: string; count: number }[] = [
    { key: 'north', name: 'North Karnataka', kannadaName: 'ಉತ್ತರ ಕರ್ನಾಟಕ', icon: '🏛️', count: getDestinationsByRegion('north').length },
    { key: 'south', name: 'South Karnataka', kannadaName: 'ದಕ್ಷಿಣ ಕರ್ನಾಟಕ', icon: '👑', count: getDestinationsByRegion('south').length },
    { key: 'west', name: 'West Karnataka', kannadaName: 'ಪಶ್ಚಿಮ ಕರ್ನಾಟಕ (ಕರಾವಳಿ)', icon: '🌊', count: getDestinationsByRegion('west').length },
    { key: 'east', name: 'East Karnataka', kannadaName: 'ಪೂರ್ವ & ಕೇಂದ್ರ ಕರ್ನಾಟಕ', icon: '🌄', count: getDestinationsByRegion('east').length },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header (Requirement 5: Synchronized Heading) */}
      <div className="dashboard-page__header">
        <div className="container">
          <div className="dashboard-header-inner">
            <div>
              <span className="dashboard-eyebrow">{t('dashboardSection.eyebrow', 'STEP 2 • DESTINATION SELECTION')}</span>
              <h1>🧭 {t('dashboardSection.title', 'Destination Selection')}</h1>
              <p>
                {t('dashboardSection.subtitle', 'Explore North, South, East, and West Karnataka. Select as many destinations as you wish—there is no 5-place limit!')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
              {trip.preferences.startingCity && (
                <div className="dashboard-trip-meta">
                  <span>📍 {t('dashboardSection.origin', 'Origin')}: <strong>{trip.preferences.startingCity}</strong></span>
                  <span>📅 <strong>{trip.preferences.duration} {t('dashboardSection.days', 'Days')}</strong></span>
                  <span>👥 <strong>{trip.preferences.adults + trip.preferences.children} {t('dashboardSection.travellers', 'Travellers')}</strong></span>
                </div>
              )}
              {state.isAuthenticated && isSupabaseConfigured && savedTrips.length > 0 && (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'var(--color-gold-light)', color: '#fff' }}
                  onClick={() => setShowSavedTrips(!showSavedTrips)}
                >
                  📁 {showSavedTrips ? t('dashboardSection.returnExploration', 'Return to Exploration') : `${t('dashboardSection.savedTrips', 'Saved Trips')} (${savedTrips.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-page__body">
        {/* Step Indicator (Requirement 2) */}
        <StepIndicator />

        {/* ================= SAVED TRIPS DRAWER (IF TOGGLED) ================= */}
        {showSavedTrips && (
          <div className="saved-trips-section" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ margin: 0, color: 'var(--color-forest-dark)' }}>Saved Trips in Your Supabase Account</h3>
              <button className="btn btn--outline btn--sm" onClick={() => setShowSavedTrips(false)}>✕ Close</button>
            </div>
            {loadingTrips ? (
              <p>Loading trips from Supabase...</p>
            ) : savedTrips.length === 0 ? (
              <p>No saved trips found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {savedTrips.map(st => (
                  <div key={st.id} style={{ background: '#fff', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ margin: '0 0 var(--space-1) 0', color: 'var(--color-forest-dark)' }}>{st.trip_name}</h4>
                    <p style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                      {st.destinations_count} destinations • ₹{Number(st.total_budget).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn--primary btn--sm" onClick={() => handleResumeTrip(st)}>Load Trip</button>
                      <button className="btn btn--outline btn--sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteTrip(st.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TRAVEL FEASIBILITY ADVISORY (Requirement 8) ================= */}
        {selectedCount > 0 && (
          <div className={`feasibility-widget feasibility-widget--${feasibility.status}`}>
            <div className="feasibility-header">
              <div className="feasibility-title-wrap">
                <span className={`feasibility-badge feasibility-badge--${feasibility.status}`}>
                  {feasibility.status === 'optimal'
                    ? '✓ Well Paced'
                    : feasibility.status === 'moderate'
                    ? '⚡ Moderate Pace'
                    : feasibility.status === 'tight'
                    ? '⚠️ Tight Schedule'
                    : '⚠️ High Travel Load'}
                </span>
                <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest-dark)' }}>
                  {feasibility.title}
                </strong>
              </div>
              <div className="feasibility-stats-pills">
                <span className="feasibility-pill">📍 {selectedCount} Selected</span>
                <span className="feasibility-pill">🗺️ ~{feasibility.totalEstimatedKm} km Route</span>
                <span className="feasibility-pill">⏱️ ~{feasibility.totalEstimatedTravelHours} hrs Transit</span>
                <span className="feasibility-pill">📅 ~{feasibility.recommendedDays} Days Recommended ({trip.preferences.duration} Available)</span>
              </div>
            </div>
            <p style={{ margin: 'var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)' }}>
              {feasibility.summary}
            </p>
            {feasibility.warnings.length > 0 && (
              <div className="feasibility-warnings">
                <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Pacing Advisories:</strong>
                <ul>
                  {feasibility.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {feasibility.suggestions.length > 0 && (
              <div className="feasibility-suggestions">
                <strong style={{ display: 'block', marginBottom: '4px' }}>💡 SiriPayana Travel Advice:</strong>
                <ul>
                  {feasibility.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ================= FOUR DIRECTIONS OVERVIEW (COMPASS CARDS) ================= */}
        {selectedRegion === 'all' && (
          <div className="compass-section">
            <div className="compass-section__header">
              <h2>{t('dashboardSection.exploreDirections', 'Explore by Region or Browse All Destinations')}</h2>
              <p>{t('dashboardSection.exploreDirectionsDesc', 'Karnataka is divided into four scenic travel zones. Select a direction below to filter, or browse all 36 places directly.')}</p>
            </div>

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
                      <img
                        src={regInfo?.image}
                        alt={reg.name}
                        className="compass-card__img"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = KARNATAKA_FALLBACK_IMAGE;
                        }}
                      />
                      <div className="compass-card__badge">
                        <span>{reg.icon}</span>
                        <span>{t('dashboardSection.placesCount', { count: reg.count, defaultValue: `${reg.count} Places` })}</span>
                      </div>
                    </div>
                    <div className="compass-card__content">
                      <span className="compass-card__kannada">{reg.kannadaName}</span>
                      <h3 className="compass-card__title">{reg.name}</h3>
                      <p className="compass-card__desc">{regInfo?.subtitle}</p>
                      <div className="compass-card__districts">
                        <strong>{t('dashboardSection.districts', 'Districts')}: </strong>
                        <span>{regInfo?.districts?.join(', ')}</span>
                      </div>
                      <button className="btn btn--outline btn--sm compass-card__btn">
                        {t('dashboardSection.exploreRegion', { name: reg.name, defaultValue: `Explore ${reg.name} →` })}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= DESTINATION LISTING & FILTERS ================= */}
        <div className="region-listing-section">
          {/* Region Tabs Navigation */}
          <div className="region-listing-nav">
            <button
              className={`btn btn--sm ${selectedRegion === 'all' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setSelectedRegion('all')}
            >
              🗺️ {t('dashboardSection.allKarnataka', 'All Karnataka')} ({destinations.length})
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

          {/* Region Banner if specific region is active */}
          {selectedRegion !== 'all' && (
            <div className="region-banner">
              <h2>{REGIONAL_IMAGES[selectedRegion]?.title}</h2>
              <p>{REGIONAL_IMAGES[selectedRegion]?.subtitle}</p>
            </div>
          )}

          {/* Filters Bar: Search & Category Chips (Requirement 6) */}
          <div className="listing-filters-bar">
            <div className="listing-search-wrap">
              <span aria-hidden="true">🔍</span>
              <input
                type="text"
                placeholder={t('dashboardSection.searchPlaceholder', 'Search destinations, temples, waterfalls, districts...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input listing-search-input"
                aria-label="Search destinations"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', fontSize: '14px' }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="listing-category-chips">
              {[
                { key: 'all', label: t('dashboardSection.allCategories', 'All Categories') },
                { key: 'heritage', label: t('dashboardSection.heritage', '🏛️ Heritage') },
                { key: 'hills', label: t('dashboardSection.hills', '⛰️ Hills') },
                { key: 'nature', label: t('dashboardSection.nature', '🌿 Nature') },
                { key: 'beaches', label: t('dashboardSection.beaches', '🏖️ Beaches') },
                { key: 'waterfalls', label: t('dashboardSection.waterfalls', '💧 Waterfalls') },
                { key: 'wildlife', label: t('dashboardSection.wildlife', '🐾 Wildlife') },
              ].map(cat => (
                <button
                  key={cat.key}
                  className={`category-chip ${activeCategory === cat.key ? 'category-chip--active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Cards Grid (Requirement 1, 6) */}
          <div className="destinations-cards-grid">
            {filteredDestinations.map(dest => {
              const selected = isDestinationSelected(dest.id);
              const img = DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl || KARNATAKA_FALLBACK_IMAGE;

              return (
                <motion.div
                  key={dest.id}
                  className={`destination-card-v2 ${selected ? 'destination-card-v2--selected' : ''}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="dest-card-v2__img-wrap"
                    onClick={() => setActiveDetailDest(dest)}
                    title="Click to view destination details"
                  >
                    <img
                      src={img}
                      alt={dest.name}
                      className="dest-card-v2__img"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = KARNATAKA_FALLBACK_IMAGE;
                      }}
                    />
                    <span className="dest-card-v2__cat-badge">{dest.category.toUpperCase()}</span>
                    {selected && <div className="dest-card-v2__selected-check">{t('dashboardSection.added', '✓ Added')}</div>}
                  </div>

                  <div className="dest-card-v2__content">
                    <div className="dest-card-v2__header">
                      <div>
                        <span className="dest-card-v2__kannada">{dest.kannadaName}</span>
                        <h3 className="dest-card-v2__title">{dest.name}</h3>
                        <span className="dest-card-v2__district">📍 {dest.district} District • {dest.region.toUpperCase()}</span>
                      </div>
                    </div>

                    <p className="dest-card-v2__desc">{dest.shortDescription}</p>

                    <div className="dest-card-v2__meta-row">
                      <span>⏱️ {dest.recommendedDuration}</span>
                      <span>🎟️ ₹{dest.entryFee.indianAdult ?? 0}</span>
                      <span>🌤️ {dest.bestSeason}</span>
                    </div>

                    <div className="dest-card-v2__actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setActiveDetailDest(dest)}
                      >
                        {t('dashboardSection.detailsAndInfo', 'Details & Info')}
                      </button>
                      <button
                        type="button"
                        className={`btn btn--sm ${selected ? 'btn--danger-outline' : 'btn--primary'}`}
                        onClick={() => handleToggleDestination(dest)}
                      >
                        {selected ? t('dashboardSection.removeFromTrip', '✕ Remove') : t('dashboardSection.addToTrip', '+ Add to Trip')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="empty-search-state" style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-gray-200)', marginBottom: 'var(--space-12)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-2)' }}>🔍</span>
              <h3 style={{ color: 'var(--color-forest-dark)', marginBottom: 'var(--space-2)' }}>{t('dashboardSection.noDestinations', 'No destinations found')}</h3>
              <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
                {t('dashboardSection.noDestinationsDesc', 'No places match your search query or selected filters.')}
              </p>
              <button
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setSelectedRegion('all');
                }}
              >
                {t('dashboardSection.clearFilters', 'Clear All Filters')}
              </button>
            </div>
          )}
        </div>

        {/* ================= DESTINATION DETAILS MODAL (Requirement 6) ================= */}
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
                  aria-label="Close details"
                >
                  ✕
                </button>

                <div className="detail-modal-hero">
                  <img
                    src={DESTINATION_IMAGES[activeDetailDest.id]?.url || activeDetailDest.imageUrl || KARNATAKA_FALLBACK_IMAGE}
                    alt={activeDetailDest.name}
                    className="detail-modal-hero-img"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = KARNATAKA_FALLBACK_IMAGE;
                    }}
                  />
                  <div className="detail-modal-hero-overlay">
                    <span className="modal-kannada" style={{ color: 'var(--color-gold-light)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      {activeDetailDest.kannadaName}
                    </span>
                    <h2 style={{ color: 'var(--color-white)', margin: '4px 0' }}>{activeDetailDest.name}</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: 'var(--text-sm)' }}>
                      📍 {activeDetailDest.district} District • {activeDetailDest.region.toUpperCase()} KARNATAKA
                    </p>
                  </div>
                </div>

                <div className="detail-modal-content">
                  <div className="detail-facts-grid">
                    <div className="detail-fact-item">
                      <span>🏷️ Category</span>
                      <strong>{activeDetailDest.category.toUpperCase()}</strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>⏱️ Recommended</span>
                      <strong>{activeDetailDest.recommendedDuration}</strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>🎟️ Entry Fee</span>
                      <strong>
                        {activeDetailDest.entryFee.indianAdult
                          ? `₹${activeDetailDest.entryFee.indianAdult} (Adult)`
                          : 'Free Entry'}
                      </strong>
                    </div>
                    <div className="detail-fact-item">
                      <span>🌤️ Best Season</span>
                      <strong>{activeDetailDest.bestSeason}</strong>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>📜 History & Heritage</h3>
                    <p>{activeDetailDest.detailedHistory}</p>
                  </div>

                  <div className="detail-section">
                    <h3>🏛️ Cultural Significance</h3>
                    <p>{activeDetailDest.culturalSignificance}</p>
                  </div>

                  <div className="detail-section">
                    <h3>ℹ️ Practical Visitor Guidance</h3>
                    <p>
                      <strong>Opening Hours: </strong>
                      {activeDetailDest.openingHours.open || '06:00 AM'} to {activeDetailDest.openingHours.close || '06:00 PM'}
                      {activeDetailDest.openingHours.closedOn ? ` (Closed on ${activeDetailDest.openingHours.closedOn})` : ''}
                    </p>
                    {activeDetailDest.specialAttractions?.length > 0 && (
                      <p><strong>Highlights:</strong> {activeDetailDest.specialAttractions.join(', ')}</p>
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
          )}
        </AnimatePresence>

        {/* ================= REVIEW SELECTED PLACES MODAL (Requirement 7) ================= */}
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
                  aria-label="Close review"
                >
                  ✕
                </button>

                <div style={{ padding: 'var(--space-6)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-2)' }}>
                    ✅ {t('dashboardSection.reviewModal.title', { count: selectedCount, defaultValue: `Selected Destinations (${selectedCount})` })}
                  </h2>
                  <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    {t('dashboardSection.reviewModal.desc', 'Review your selected destinations. There is no 5-place limit—select as many as you wish. All places are automatically sequenced and budgeted into your itinerary.')}
                  </p>

                  {/* Feasibility snapshot in modal */}
                  <div style={{ background: 'rgba(45, 90, 61, 0.05)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(45, 90, 61, 0.15)', marginBottom: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ color: 'var(--color-forest-dark)', fontSize: 'var(--text-sm)' }}>
                        {t('dashboardSection.reviewModal.routeAnalysis', { km: feasibility.totalEstimatedKm, hours: feasibility.totalEstimatedTravelHours, defaultValue: `Route Analysis: ~${feasibility.totalEstimatedKm} km total • ~${feasibility.totalEstimatedTravelHours} hrs transit` })}
                      </strong>
                      <span className={`feasibility-badge feasibility-badge--${feasibility.status}`}>
                        {feasibility.status === 'optimal' ? 'Well Paced' : feasibility.status === 'moderate' ? 'Moderate' : 'Pacing Alert'}
                      </span>
                    </div>
                    {feasibility.warnings.length > 0 && (
                      <p style={{ fontSize: 'var(--text-xs)', color: '#9a3412', margin: '4px 0 0 0' }}>
                        ⚠️ {feasibility.warnings[0]}
                      </p>
                    )}
                  </div>

                  <div className="review-places-list">
                    {trip.selectedDestinations.map(d => (
                      <div key={d.destinationId} className="review-place-row">
                        <img
                          src={d.imageUrl || KARNATAKA_FALLBACK_IMAGE}
                          alt={d.name}
                          className="review-place-thumb"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = KARNATAKA_FALLBACK_IMAGE;
                          }}
                        />
                        <div className="review-place-info">
                          <h4>{d.name}</h4>
                          <p>{d.reason} • {d.duration}</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          style={{ borderColor: '#fca5a5', color: '#c2410c' }}
                          onClick={() => dispatch({ type: 'REMOVE_DESTINATION', payload: d.destinationId })}
                        >
                          {t('dashboardSection.reviewModal.remove', 'Remove')}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setShowReviewModal(false)}
                    >
                      {t('dashboardSection.reviewModal.addMore', '+ Add More Destinations')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => {
                        setShowReviewModal(false);
                        handleProceedToTransport();
                      }}
                    >
                      {t('dashboardSection.nextTransport', 'Next: Choose Transportation (Step 3) →')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= FLOATING SELECTION DOCK (Requirement 3) ================= */}
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
                <strong>{t('dashboardSection.selectedCount', { count: selectedCount, defaultValue: `${selectedCount} Destination${selectedCount > 1 ? 's' : ''} Selected` })}</strong>
                <p>{t('dashboardSection.noLimitNotice', 'No 5-destination limit — explore freely across all Karnataka regions')}</p>
              </div>
            </div>

            <div className="dock-right">
              <button
                type="button"
                className="btn btn--outline btn--sm dock-review-btn"
                onClick={() => setShowReviewModal(true)}
              >
                📋 {t('dashboardSection.reviewSelected', 'Review Selected Places')} ({selectedCount})
              </button>
              <button
                type="button"
                className="btn btn--primary btn--lg dock-next-btn"
                onClick={handleProceedToTransport}
              >
                {t('dashboardSection.nextTransport', 'Next: Choose Transportation (Step 3) →')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
