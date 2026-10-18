import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { destinations } from '../data/destinations';
import './DashboardPage.css';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();

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
          <p className="dashboard__welcome">Welcome back, {state.user?.name}!</p>
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
            <span className="dashboard__stat-number">{state.itineraries.length}</span>
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

        {/* Itineraries */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>{t('dashboard.itineraries')}</h2>
          </div>
          {state.itineraries.length === 0 ? (
            <div className="dashboard__empty-block">
              <p>{t('itinerary.noItineraries')}</p>
              <p>Save destinations first, then create an itinerary.</p>
            </div>
          ) : (
            <div className="dashboard__itinerary-list">
              {state.itineraries.map(itin => (
                <div key={itin.id} className="dashboard__itinerary-card">
                  <div className="dashboard__itinerary-header">
                    <h4>{itin.name}</h4>
                    <span className="dashboard__itinerary-dates">{itin.startDate} → {itin.endDate}</span>
                  </div>
                  <p className="dashboard__itinerary-stops">{itin.destinations.length} stops • ₹{itin.totalBudget.toLocaleString()}</p>
                  <div className="dashboard__itinerary-actions">
                    <button className="btn btn--outline btn--sm" onClick={() => {
                      dispatch({ type: 'DELETE_ITINERARY', payload: itin.id });
                      showToast('Itinerary deleted', 'info');
                    }}>
                      {t('itinerary.delete')}
                    </button>
                  </div>
                </div>
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
