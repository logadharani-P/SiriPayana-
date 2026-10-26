import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getDestinationBySlug, getCategoryIcon, getRegionLabel, destinations } from '../data/destinations';
import { DESTINATION_IMAGES } from '../data/destinationImages';
import { useApp } from '../context/AppContext';
import { useTrip, SelectedDestination } from '../context/TripContext';
import './DestinationPage.css';

export default function DestinationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { state, dispatch: appDispatch, showToast } = useApp();
  const { trip, dispatch: tripDispatch } = useTrip();
  const navigate = useNavigate();
  const dest = getDestinationBySlug(slug || '');

  if (!dest) {
    return (
      <div className="dest-page">
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-10))' }}>
          <div className="empty-state">
            <div className="empty-state__icon">🗺️</div>
            <h2 className="empty-state__title">{t('common.noResults')}</h2>
            <Link to="/explore" className="btn btn--primary">{t('nav.explore')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const isFavorite = state.favorites.includes(dest.id);
  const isInTrip = trip.selectedDestinations.some(d => d.destinationId === dest.id);

  const toggleFavorite = () => {
    appDispatch({ type: 'TOGGLE_FAVORITE', payload: dest.id });
    showToast(isFavorite ? 'Removed from favourites' : 'Added to favourites!', 'success');
  };

  const toggleTripSelection = () => {
    if (isInTrip) {
      tripDispatch({ type: 'REMOVE_DESTINATION', payload: dest.id });
      showToast(`Removed ${dest.name} from your trip`, 'info');
    } else {
      const sel: SelectedDestination = {
        destinationId: dest.id,
        slug: dest.slug,
        name: dest.name,
        imageUrl: DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl,
        duration: dest.recommendedDuration,
        reason: `${dest.category.toUpperCase()} • ${dest.district}`,
      };
      tripDispatch({ type: 'ADD_DESTINATION', payload: sel });
      showToast(`Added ${dest.name} to your trip plan!`, 'success');
    }
  };

  const nearby = dest.nearbyAttractions
    .map(name => destinations.find(d => d.name.toLowerCase().includes(name.toLowerCase().split(' ')[0])))
    .filter(Boolean)
    .slice(0, 4);

  const formatFee = (amount: number | null) => {
    if (amount === null) return t('destination.notAvailable');
    if (amount === 0) return t('destination.free');
    return `₹${amount}`;
  };

  const authenticImage = DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl;

  return (
    <div className="dest-page">
      {/* Hero */}
      <div className="dest-page__hero">
        <img
          src={authenticImage}
          alt={dest.name}
          loading="eager"
          onError={e => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1600100561600-44d5e3cba921?w=1200&q=80`;
          }}
        />
        <div className="dest-page__hero-overlay">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="dest-page__badge">{getCategoryIcon(dest.category)} {dest.category}</span>
              <h1 className="dest-page__title">{dest.name}</h1>
              <p className="dest-page__meta">
                📍 {dest.district} • {getRegionLabel(dest.region)} • ⏱️ {dest.recommendedDuration}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container dest-page__content">
        {/* Actions bar */}
        <div className="dest-page__actions" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to 4-Direction Dashboard
          </button>

          <button
            className={`btn ${isInTrip ? 'btn--primary' : 'btn--outline'} btn--sm`}
            onClick={toggleTripSelection}
          >
            {isInTrip ? '✓ Selected in Trip' : '+ Add to Trip Plan'}
          </button>

          <button
            className={`btn ${isFavorite ? 'btn--primary' : 'btn--outline'} btn--sm`}
            onClick={toggleFavorite}
          >
            {isFavorite ? '❤️ In Favourites' : '🤍 Save Favourite'}
          </button>

          <Link to={`/chat?dest=${dest.slug}`} className="btn btn--outline btn--sm">
            🤖 {t('destination.askAI')}
          </Link>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline btn--sm"
          >
            📍 {t('destination.getDirections')}
          </a>

          {trip.selectedDestinations.length > 0 && (
            <Link
              to="/plan/transport"
              className="btn btn--primary btn--sm"
              style={{ marginLeft: 'auto', background: 'var(--color-gold)', color: 'var(--color-forest-dark)', fontWeight: 'bold' }}
            >
              Continue with {trip.selectedDestinations.length} Places →
            </Link>
          )}
        </div>

        <div className="dest-page__grid">
          {/* Main content */}
          <div className="dest-page__main">
            {/* Overview */}
            <section className="dest-page__section">
              <h2>{t('destination.overview')}</h2>
              <p>{dest.shortDescription}</p>
            </section>

            {/* History */}
            <section className="dest-page__section">
              <h2>{t('destination.history')}</h2>
              <p>{dest.detailedHistory}</p>
            </section>

            {/* Cultural Significance */}
            <section className="dest-page__section">
              <h2>{t('destination.culturalSignificance')}</h2>
              <p>{dest.culturalSignificance}</p>
            </section>

            {/* Special Attractions */}
            <section className="dest-page__section">
              <h2>{t('destination.specialAttractions')}</h2>
              <ul className="dest-page__attractions-list">
                {dest.specialAttractions.map((attr, i) => (
                  <li key={i}>⭐ {attr}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="dest-page__sidebar">
            {/* Visitor Info */}
            <div className="dest-page__info-card">
              <h3>{t('destination.visitorInfo')}</h3>
              <div className="dest-page__info-grid">
                {dest.openingHours.open && (
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">🕐 {t('destination.openingHours')}</span>
                    <span>{dest.openingHours.open} – {dest.openingHours.close}</span>
                  </div>
                )}
                {dest.openingHours.closedOn && (
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">🚫 {t('destination.closedOn')}</span>
                    <span>{dest.openingHours.closedOn}</span>
                  </div>
                )}
                <div className="dest-page__info-row">
                  <span className="dest-page__info-label">🌤️ {t('destination.bestSeason')}</span>
                  <span>{dest.bestSeason}</span>
                </div>
                <div className="dest-page__info-row">
                  <span className="dest-page__info-label">⏱️ {t('destination.duration')}</span>
                  <span>{dest.recommendedDuration}</span>
                </div>
                {dest.accessibility && (
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">♿ {t('destination.accessibility')}</span>
                    <span>{dest.accessibility}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Entry Fees */}
            {(dest.entryFee.indianAdult !== null || dest.entryFee.foreignAdult !== null) && (
              <div className="dest-page__info-card">
                <h3>🎫 {t('destination.entryFee')}</h3>
                <div className="dest-page__info-grid">
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">{t('destination.indianAdult')}</span>
                    <span className="dest-page__fee">{formatFee(dest.entryFee.indianAdult)}</span>
                  </div>
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">{t('destination.indianChild')}</span>
                    <span className="dest-page__fee">{formatFee(dest.entryFee.indianChild)}</span>
                  </div>
                  <div className="dest-page__info-row">
                    <span className="dest-page__info-label">{t('destination.foreignAdult')}</span>
                    <span className="dest-page__fee">{formatFee(dest.entryFee.foreignAdult)}</span>
                  </div>
                  {dest.entryFee.camera !== null && (
                    <div className="dest-page__info-row">
                      <span className="dest-page__info-label">{t('destination.camera')}</span>
                      <span className="dest-page__fee">{formatFee(dest.entryFee.camera)}</span>
                    </div>
                  )}
                  {dest.entryFee.parking !== null && (
                    <div className="dest-page__info-row">
                      <span className="dest-page__info-label">{t('destination.parking')}</span>
                      <span className="dest-page__fee">{formatFee(dest.entryFee.parking)}</span>
                    </div>
                  )}
                  {dest.entryFee.notes && <p className="dest-page__fee-note">{dest.entryFee.notes}</p>}
                </div>
              </div>
            )}

            {/* Source info */}
            <div className="dest-page__info-card dest-page__info-card--muted">
              <div className="dest-page__info-row">
                <span className="dest-page__info-label">{t('destination.lastVerified')}</span>
                <span>{dest.lastVerified || t('destination.notAvailable')}</span>
              </div>
              {dest.sourceUrls.length > 0 && (
                <div className="dest-page__info-row">
                  <span className="dest-page__info-label">{t('destination.source')}</span>
                  <span>{dest.sourceUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>Source {i + 1} ↗</a>
                  ))}</span>
                </div>
              )}
              <p className="dest-page__verify-note">⚠️ {t('destination.verifyNote')}</p>
            </div>
          </aside>
        </div>

        {/* Nearby Attractions */}
        {dest.nearbyAttractions.length > 0 && (
          <section className="dest-page__nearby">
            <h2>{t('destination.nearbyAttractions')}</h2>
            <div className="dest-page__nearby-list">
              {dest.nearbyAttractions.map((name, i) => {
                const linked = destinations.find(d => d.name.toLowerCase().includes(name.toLowerCase().split(',')[0].split(' ')[0]));
                return linked ? (
                  <Link key={i} to={`/destinations/${linked.slug}`} className="dest-page__nearby-item dest-page__nearby-item--link">
                    📍 {name}
                  </Link>
                ) : (
                  <span key={i} className="dest-page__nearby-item">📍 {name}</span>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
