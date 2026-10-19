import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

export default function ConfirmationPage() {
  const { t } = useTranslation();
  const { trip, resetTrip, dispatch } = useTrip();
  const { state, showToast } = useApp();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!state.user) {
        setSaving(false);
        setError('You must be signed in to save your trip.');
        return;
      }

      const tripName = trip.tripName || `${trip.selectedDestinations.length} destination trip`;
      const { error: saveError } = await supabase.from('travel_plans').insert({
        trip_name: tripName,
        trip_data: trip,
        status: 'complete',
        total_budget: trip.budget.total,
        destinations_count: trip.selectedDestinations.length,
      });

      if (cancelled) return;

      if (saveError) {
        setError(saveError.message);
        setSaving(false);
        return;
      }

      dispatch({ type: 'MARK_SAVED' });
      setSaved(true);
      setSaving(false);
    })();

    return () => { cancelled = true; };
  }, []);

  const handleRetry = () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    (async () => {
      if (!state.user) {
        setSaving(false);
        setError('You must be signed in to save your trip.');
        return;
      }
      const tripName = trip.tripName || `${trip.selectedDestinations.length} destination trip`;
      const { error: saveError } = await supabase.from('travel_plans').insert({
        trip_name: tripName,
        trip_data: trip,
        status: 'complete',
        total_budget: trip.budget.total,
        destinations_count: trip.selectedDestinations.length,
      });
      if (saveError) {
        setError(saveError.message);
        setSaving(false);
        return;
      }
      dispatch({ type: 'MARK_SAVED' });
      setSaved(true);
      setSaving(false);
    })();
  };

  const handleNewTrip = () => {
    resetTrip();
    navigate('/plan/preferences');
  };

  if (saving) {
    return (
      <div className="plan-page">
        <div className="container plan-page__body" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-10))' }}>
          <StepIndicator />
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>💾</div>
            <h2>Saving your trip…</h2>
            <p style={{ color: 'var(--color-gray-500)' }}>Please wait while we save your travel plan.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plan-page">
        <div className="container plan-page__body" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-10))' }}>
          <StepIndicator />
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0', maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
            <h2>Could not save your trip</h2>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>{error}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary btn--lg" onClick={handleRetry}>Retry</button>
              <button className="btn btn--outline btn--lg" onClick={() => navigate('/plan/summary')}>Back to Summary</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-page">
      <div className="plan-page__header plan-page__header--success">
        <div className="container">
          <h1>🎉 {t('confirmation.title')}</h1>
          <p>{t('confirmation.subtitle')}</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="confirmation"
        >
          <div className="confirmation__hero">
            <motion.div
              className="confirmation__check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              ✅
            </motion.div>
            <h2 className="confirmation__title">{t('confirmation.thankYou')}</h2>
            <p className="confirmation__subtitle">{t('confirmation.tripSaved')}</p>
            {trip.lastSaved && (
              <p className="confirmation__saved-time">
                Saved at {new Date(trip.lastSaved).toLocaleString()}
              </p>
            )}
            {saved && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-2)' }}>
                Your trip plan has been saved to your account. This is a travel plan, not a booking.
              </p>
            )}
          </div>

          {/* Trip Quick Summary */}
          <div className="confirmation__summary">
            <div className="confirmation__summary-card">
              <span className="confirmation__summary-icon">📍</span>
              <div>
                <strong>{trip.selectedDestinations.length} Destination{trip.selectedDestinations.length !== 1 ? 's' : ''}</strong>
                <p>{trip.selectedDestinations.map(d => d.name).join(', ') || 'None selected'}</p>
              </div>
            </div>
            <div className="confirmation__summary-card">
              <span className="confirmation__summary-icon">📅</span>
              <div>
                <strong>{trip.preferences.duration} Days</strong>
                <p>{trip.preferences.startDate} → {trip.preferences.endDate}</p>
              </div>
            </div>
            <div className="confirmation__summary-card">
              <span className="confirmation__summary-icon">💰</span>
              <div>
                <strong>₹{trip.budget.total.toLocaleString()}</strong>
                <p>Total estimated budget</p>
              </div>
            </div>
            <div className="confirmation__summary-card">
              <span className="confirmation__summary-icon">👥</span>
              <div>
                <strong>{trip.preferences.adults + trip.preferences.children} Traveler{(trip.preferences.adults + trip.preferences.children) !== 1 ? 's' : ''}</strong>
                <p>{trip.preferences.adults} adults{trip.preferences.children > 0 ? `, ${trip.preferences.children} children` : ''}</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="confirmation__next">
            <h3>{t('confirmation.whatNext')}</h3>
            <div className="confirmation__steps">
              {[
                { icon: '💾', text: 'Your trip plan is saved to your dashboard.' },
                { icon: '🚆', text: 'Use the transport booking links to reserve tickets separately.' },
                { icon: '📋', text: 'View your saved trip anytime from the dashboard.' },
                { icon: '🗺️', text: 'Start a new trip whenever you are ready.' },
              ].map((step, i) => (
                <motion.div key={i} className="confirmation__step"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}>
                  <span className="confirmation__step-icon">{step.icon}</span>
                  <span>{step.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="confirmation__actions">
            <button className="btn btn--primary btn--lg" onClick={handleNewTrip}>
              🗺️ {t('confirmation.newTrip')}
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => navigate('/dashboard')}>
              📋 {t('confirmation.viewDashboard')}
            </button>
            <button className="btn btn--outline" onClick={() => navigate('/')}>
              🏠 {t('confirmation.goHome')}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .plan-page__header--success { background: linear-gradient(135deg, var(--color-forest) 0%, var(--color-forest-light) 100%); }
        .confirmation { max-width: 720px; margin: 0 auto; }
        .confirmation__hero { text-align: center; padding: var(--space-10) 0 var(--space-8); }
        .confirmation__check { font-size: 4rem; margin-bottom: var(--space-4); }
        .confirmation__title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-forest-dark); margin-bottom: var(--space-2); }
        .confirmation__subtitle { font-size: var(--text-lg); color: var(--color-gray-600); }
        .confirmation__saved-time { font-size: var(--text-xs); color: var(--color-gray-400); margin-top: var(--space-2); }
        .confirmation__summary { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-8); }
        .confirmation__summary-card { display: flex; gap: var(--space-3); align-items: flex-start; background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-lg); padding: var(--space-4); }
        .confirmation__summary-icon { font-size: 1.5rem; }
        .confirmation__summary-card strong { display: block; font-family: var(--font-display); color: var(--color-forest-dark); font-size: var(--text-base); }
        .confirmation__summary-card p { font-size: var(--text-xs); color: var(--color-gray-500); margin-top: 2px; }
        .confirmation__next { background: var(--color-ivory); border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-8); }
        .confirmation__next h3 { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-forest-dark); margin-bottom: var(--space-4); }
        .confirmation__steps { display: flex; flex-direction: column; gap: var(--space-3); }
        .confirmation__step { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); color: var(--color-gray-700); padding: var(--space-2) 0; }
        .confirmation__step-icon { font-size: 1.2rem; min-width: 28px; }
        .confirmation__actions { display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: center; padding-bottom: var(--space-10); }
        @media (max-width: 640px) {
          .confirmation__summary { grid-template-columns: 1fr; }
          .confirmation__actions { flex-direction: column; }
          .confirmation__actions .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
