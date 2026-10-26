<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useApp } from '../context/AppContext';
<<<<<<< HEAD
import { supabase } from '../lib/supabaseClient';
=======
import { generateTravelPassPDF } from '../utils/travelPassPdf';
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
import StepIndicator from '../components/StepIndicator';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const { t } = useTranslation();
<<<<<<< HEAD
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
=======
  const { trip, resetTrip, goToStep } = useTrip();
  const { state, showToast } = useApp();
  const navigate = useNavigate();

  const [pdfDownloading, setPdfDownloading] = useState(false);

  const travelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);
  const selectedTransport = trip.transportOptions.filter(t => t.selected);

  const handleDownloadPDF = () => {
    try {
      setPdfDownloading(true);
      generateTravelPassPDF(trip, state.user?.name || 'Valued Traveller');
      showToast('SiriPayana Travel Pass PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setTimeout(() => setPdfDownloading(false), 1000);
    }
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
  };

  const handleNewTrip = () => {
    resetTrip();
    navigate('/onboarding');
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
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            Step 8 • Journey Confirmed
          </span>
          <h1>🎉 Karnataka Travel Pass Issued!</h1>
          <p>
            Your travel itinerary reference is ready. Download your pass and start your journey across Karnataka.
          </p>
        </div>
      </div>

      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="pass-container"
        >
          {/* Main Printable / Digital Travel Pass Card */}
          <div className="travel-pass-card">
            {/* Top Pass Header */}
            <div className="travel-pass-card__header">
              <div className="pass-brand">
                <span className="pass-logo">🧭</span>
                <div>
                  <h2>SiriPayana Travel Pass</h2>
                  <span>Official Karnataka Tourism Itinerary Companion</span>
                </div>
              </div>
              <div className="pass-ref-badge">
                <span className="demo-tag">DEMO PASS</span>
                <strong>{trip.bookingReference || 'SP-KA-2026-DEMO-9482'}</strong>
              </div>
            </div>

            {/* Traveler & Route Matrix */}
            <div className="pass-meta-grid">
              <div className="pass-meta-cell">
                <span className="pass-meta-label">Primary Traveller</span>
                <strong className="pass-meta-val">{state.user?.name || 'Karnataka Explorer'}</strong>
                <span className="pass-meta-sub">{trip.preferences.adults} Adults{trip.preferences.children > 0 ? `, ${trip.preferences.children} Children` : ''}</span>
              </div>
              <div className="pass-meta-cell">
                <span className="pass-meta-label">Dates & Pacing</span>
                <strong className="pass-meta-val">{trip.preferences.startDate} → {trip.preferences.endDate}</strong>
                <span className="pass-meta-sub">{trip.preferences.duration} Days ({Math.max(1, trip.preferences.duration - 1)} Nights)</span>
              </div>
              <div className="pass-meta-cell">
                <span className="pass-meta-label">Starting Point</span>
                <strong className="pass-meta-val">{trip.preferences.startingCity || 'Bengaluru'}</strong>
                <span className="pass-meta-sub">Origin Transit Hub</span>
              </div>
              <div className="pass-meta-cell">
                <span className="pass-meta-label">Estimated Budget</span>
                <strong className="pass-meta-val" style={{ color: 'var(--color-forest-dark)' }}>₹{trip.budget.total.toLocaleString()}</strong>
                <span className="pass-meta-sub">≈ ₹{trip.budget.perPerson.toLocaleString()} / person</span>
              </div>
            </div>

            {/* Selected Destinations Section */}
            <div className="pass-section">
              <h3 className="pass-section-title">
                📍 Confirmed Destinations ({trip.selectedDestinations.length} Places)
              </h3>
              <div className="pass-dests-grid">
                {trip.selectedDestinations.map((d, idx) => (
                  <div key={d.destinationId} className="pass-dest-item">
                    <span className="pass-dest-num">{idx + 1}</span>
                    <img src={d.imageUrl} alt={d.name} className="pass-dest-img" />
                    <div>
                      <strong>{d.name}</strong>
                      <p>{d.reason} • Duration: {d.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transit & Accommodation Grid */}
            <div className="pass-two-col">
              {/* Transport */}
              <div className="pass-section">
                <h3 className="pass-section-title">🚆 Transportation Schedule</h3>
                {selectedTransport.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {selectedTransport.map(t => (
                      <div key={t.id} className="pass-list-item">
                        <span>{t.mode === 'train' ? '🚆' : t.mode === 'bus' ? '🚌' : '🚗'} {t.operator}</span>
                        <strong>₹{t.groupFare.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                    Self-arranged or standard road transit estimate.
                  </p>
                )}
              </div>

              {/* Hotels */}
              <div className="pass-section">
                <h3 className="pass-section-title">🏨 Accommodation Stays</h3>
                {trip.selectedHotels.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {trip.selectedHotels.map(h => (
                      <div key={h.hotelId} className="pass-list-item">
                        <span>🏨 {h.hotelName} ({h.rooms} Rm, {h.nights} N)</span>
                        <strong>₹{h.totalCost.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                    Standard tourist accommodations recommended.
                  </p>
                )}
              </div>
            </div>

            {/* Official Notice & Disclaimer Box */}
            <div className="pass-disclaimer-box">
              <strong>⚠️ Important Notice (Demo Itinerary Pass)</strong>
              <p>
                This SiriPayana Travel Pass is an itinerary planning pass generated for demonstration purposes. It does <strong>not</strong> serve as an official train, bus, flight, or ASI monument entry ticket. Official tickets must be booked through the respective operators using the direct provider links in your trip summary.
              </p>
<<<<<<< HEAD
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
=======
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pass-actions-row">
            <button
              type="button"
              className="btn btn--primary btn--lg pass-download-btn"
              onClick={handleDownloadPDF}
              disabled={pdfDownloading}
            >
              📥 {pdfDownloading ? 'Generating PDF...' : 'Download PDF Travel Pass'}
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
            </button>

            <button
              type="button"
              className="btn btn--outline btn--lg"
              onClick={() => {
                goToStep(4);
                navigate('/plan/budget');
              }}
            >
              📊 Return to Budget Breakdown
            </button>

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleNewTrip}
            >
              🗺️ Plan Another Journey
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
