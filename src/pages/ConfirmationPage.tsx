import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip, saveTripToSupabase } from '../context/TripContext';
import { useApp } from '../context/AppContext';
import { generateTravelPassPDF } from '../utils/travelPassPdf';
import { KARNATAKA_FALLBACK_IMAGE } from '../data/destinationImages';
import StepIndicator from '../components/StepIndicator';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const { t } = useTranslation();
  const { trip, resetTrip, goToStep } = useTrip();
  const { state, showToast } = useApp();
  const navigate = useNavigate();

  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  const travelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);
  const selectedTransport = trip.transportOptions.filter(t => t.selected);

  // Background persistence if authenticated in Supabase
  useEffect(() => {
    if (state.isAuthenticated && state.user?.id && !state.isDemoSession) {
      saveTripToSupabase(trip, state.user.id).then(res => {
        if (res.success) {
          setSupabaseSaved(true);
        }
      });
    }
  }, [state.isAuthenticated, state.user?.id, state.isDemoSession, trip]);

  const handleDownloadPDF = async () => {
    try {
      setPdfDownloading(true);
      await generateTravelPassPDF(trip, state.user?.name || 'Valued Traveller');
      showToast('SiriPayana Travel Pass PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleNewTrip = () => {
    resetTrip();
    navigate('/onboarding');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header plan-page__header--success">
        <div className="container">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            {t('confirmationSection.stepBadge', 'STEP 7 • JOURNEY CONFIRMED')}
          </span>
          <h1>{t('confirmationSection.title', '🎉 Karnataka Travel Pass Issued!')}</h1>
          <p>
            {t('confirmationSection.subtitle', 'Your travel itinerary reference is ready. Download your pass and start your journey across Karnataka.')}
          </p>
          {supabaseSaved && (
            <span style={{ fontSize: 'var(--text-xs)', background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
              {t('confirmationSection.syncedSupabase', '✓ Synced to your Supabase account')}
            </span>
          )}
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
                <span className="demo-tag">{trip.paymentStatus === 'confirmed' && !state.isDemoSession ? 'VERIFIED PASS' : 'DEMO PASS'}</span>
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
                    <img
                      src={d.imageUrl || KARNATAKA_FALLBACK_IMAGE}
                      alt={d.name}
                      className="pass-dest-img"
                      onError={e => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = KARNATAKA_FALLBACK_IMAGE;
                      }}
                    />
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
              📥 {pdfDownloading ? t('confirmationSection.generatingPdf', 'Generating PDF...') : t('confirmationSection.downloadPdf', 'Download PDF Travel Pass')}
            </button>

            <button
              type="button"
              className="btn btn--outline btn--lg"
              onClick={() => {
                goToStep(4);
                navigate('/plan/budget');
              }}
            >
              📊 {t('confirmationSection.returnBudget', 'Return to Budget Breakdown')}
            </button>

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleNewTrip}
            >
              🗺️ {t('confirmationSection.planAnother', 'Plan Another Journey')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
