import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import './PaymentPage.css';

export default function PaymentPage() {
  const { t } = useTranslation();
  const { trip, dispatch, goToStep } = useTrip();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'demo' | 'production'>('demo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  const b = trip.budget;
  const travelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);
  const selectedTransport = trip.transportOptions.filter(t => t.selected);

  const handleSimulateDemoPayment = () => {
    setIsProcessing(true);
    setProcessingStage('Verifying itinerary with SiriPayana Demo Registry...');

    setTimeout(() => {
      setProcessingStage('Simulating demo booking reservations for transport & stays...');
    }, 800);

    setTimeout(() => {
      setProcessingStage('Generating authentic demo travel reference and QR signature...');
    }, 1600);

    setTimeout(() => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const reference = `SP-KA-2026-DEMO-${randomSuffix}`;
      dispatch({ type: 'CONFIRM_DEMO_PAYMENT', payload: { reference } });
      setIsProcessing(false);
      goToStep(6); // index 6: Travel Pass
      navigate('/plan/confirmation');
    }, 2400);
  };

  const handleBackToBudget = () => {
    goToStep(4); // index 4: Budget
    navigate('/plan/budget');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            {t('paymentSection.stepBadge', 'STEP 6 • BOOKING & FINAL VERIFICATION')}
          </span>
          <h1>💳 {t('paymentSection.title', 'Payment & Reservation Review')}</h1>
          <p>
            {t('paymentSection.subtitle', 'Review all trip components before confirming. Use Demo Mode for testing and presentations without real payments.')}
          </p>
        </div>
      </div>

      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Mode Switcher Pill */}
          <div className="payment-mode-tabs">
            <button
              type="button"
              className={`payment-mode-tab ${mode === 'demo' ? 'payment-mode-tab--active' : ''}`}
              onClick={() => setMode('demo')}
            >
              {t('paymentSection.demoMode', '⚡ Demo Mode (No Card Required)')}
            </button>
            <button
              type="button"
              className={`payment-mode-tab ${mode === 'production' ? 'payment-mode-tab--active' : ''}`}
              onClick={() => setMode('production')}
            >
              {t('paymentSection.prodMode', '🔒 Production Mode (Gateway Integration)')}
            </button>
          </div>

          <div className="payment-split-layout">
            {/* Left Column: Itinerary Review Summary */}
            <div className="payment-review-col">
              <div className="review-card">
                <h3 className="review-card__title">📍 Selected Destinations ({trip.selectedDestinations.length})</h3>
                <div className="review-dest-pills">
                  {trip.selectedDestinations.map(d => (
                    <span key={d.destinationId} className="review-dest-pill">
                      ✓ {d.name} ({d.duration})
                    </span>
                  ))}
                </div>
              </div>

              <div className="review-card">
                <h3 className="review-card__title">🚆 Transportation Selections</h3>
                {selectedTransport.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {selectedTransport.map(t => (
                      <div key={t.id} className="review-item-row">
                        <span>{t.mode.toUpperCase()}: {t.operator} ({t.from} → {t.to})</span>
                        <strong>₹{t.groupFare.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)' }}>Standard transport estimation included in budget</p>
                )}
              </div>

              <div className="review-card">
                <h3 className="review-card__title">🏨 Accommodation Stays</h3>
                {trip.selectedHotels.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {trip.selectedHotels.map(h => (
                      <div key={h.hotelId} className="review-item-row">
                        <span>{h.hotelName} ({h.rooms} room(s) × {h.nights} night(s))</span>
                        <strong>₹{h.totalCost.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)' }}>Standard hotel accommodation estimate included</p>
                )}
              </div>

              <div className="review-card">
                <h3 className="review-card__title">🎟️ Destination Entry Fees</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span>Total for {trip.selectedDestinations.length} destination(s) ({travelers} travellers)</span>
                  <strong style={{ color: 'var(--color-forest-dark)' }}>₹{b.entryFees.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout / Demo Action Box */}
            <div className="payment-checkout-col">
              <div className="checkout-box">
                <div className="checkout-box__header">
                  <span>Total Amount Due</span>
                  <div className="checkout-box__amount">₹{b.total.toLocaleString()}</div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                    All inclusive: transit, hotel, entrance tickets, and 5% GST
                  </span>
                </div>

                <div className="checkout-box__body">
                  {mode === 'demo' ? (
                    <div>
                      <div className="demo-callout">
                        <span className="demo-callout__badge">DEMO SIMULATION</span>
                        <h4>Presentation Mode Active</h4>
                        <p>
                          No real payment credentials or external bookings will be executed. All generated travel passes will be clearly marked as <strong>DEMO</strong>.
                        </p>
                      </div>

                      {isProcessing ? (
                        <div className="processing-indicator">
                          <div className="spinner" />
                          <p style={{ fontWeight: 'bold', color: 'var(--color-forest-dark)', marginTop: 'var(--space-2)' }}>
                            {processingStage}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--primary btn--lg"
                          style={{ width: '100%', marginTop: 'var(--space-4)', background: 'var(--color-forest)' }}
                          onClick={handleSimulateDemoPayment}
                        >
                          {t('paymentSection.confirmDemoBtn', '✓ Confirm Demo Booking & Issue Travel Pass')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="prod-callout">
                        <span className="prod-callout__badge">PRODUCTION SECURITY</span>
                        <h4>Payment Gateway Integration</h4>
                        <p>
                          In production mode, SiriPayana securely integrates with authorized payment partners (Razorpay / Stripe / UPI). Raw credit card numbers are never collected or stored in localStorage.
                        </p>
                      </div>

                      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)' }}>
                        ℹ️ For testing and demonstration, please switch to <strong>Demo Mode</strong> above to generate the travel pass.
                      </div>
                    </div>
                  )}
                </div>

                <div className="checkout-box__footer">
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-400)', display: 'block', textAlign: 'center' }}>
                    SiriPayana AI Travel Companion • Karnataka Tourism Demo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="plan-page__actions" style={{ marginTop: 'var(--space-8)' }}>
            <button className="btn btn--outline" onClick={handleBackToBudget}>
              {t('paymentSection.backBudget', '← Back to Budget Breakdown')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
