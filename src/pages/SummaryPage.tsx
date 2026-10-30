import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { destinations as allDests } from '../data/destinations';
import { KARNATAKA_FALLBACK_IMAGE } from '../data/destinationImages';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

export default function SummaryPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep, prevStep } = useTrip();
  const navigate = useNavigate();
  const travelers = trip.preferences.adults + trip.preferences.children;
  const b = trip.budget;

  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleConfirm = () => {
    dispatch({ type: 'MARK_COMPLETE' });
    dispatch({ type: 'MARK_SAVED' });
    nextStep();
    navigate('/plan/confirmation');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>📄 {t('summary.title')}</h1>
          <p>{t('summary.subtitle')}</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Trip Overview */}
          <div className="summary-section">
            <h2 className="summary-section__title">🗺️ {t('summary.tripOverview')}</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-item__label">Starting City</span>
                <span className="summary-item__value">{trip.preferences.startingCity || 'Not set'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Travel Dates</span>
                <span className="summary-item__value">{trip.preferences.startDate} → {trip.preferences.endDate}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Duration</span>
                <span className="summary-item__value">{trip.preferences.duration} days</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Travelers</span>
                <span className="summary-item__value">{trip.preferences.adults} adults{trip.preferences.children > 0 ? `, ${trip.preferences.children} children` : ''}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Travel Style</span>
                <span className="summary-item__value">{trip.preferences.travelStyle.charAt(0).toUpperCase() + trip.preferences.travelStyle.slice(1)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">{t('summary.package')}</span>
                <span className="summary-item__value">{(trip.selectedPackage || 'normal').charAt(0).toUpperCase() + (trip.selectedPackage || 'normal').slice(1)}</span>
              </div>
            </div>
          </div>

          {/* Selected Destinations */}
          <div className="summary-section">
            <h2 className="summary-section__title">📍 {t('summary.destinations')} ({trip.selectedDestinations.length})</h2>
            <div className="summary-dest-list">
              {trip.selectedDestinations.map((d, i) => {
                const full = allDests.find(dd => dd.id === d.destinationId);
                return (
                  <motion.div key={d.destinationId} className="summary-dest"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <img
                      src={d.imageUrl || KARNATAKA_FALLBACK_IMAGE}
                      alt={d.name}
                      className="summary-dest__img"
                      onError={e => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = KARNATAKA_FALLBACK_IMAGE;
                      }}
                    />
                    <div className="summary-dest__info">
                      <h4>{d.name}</h4>
                      <p>{full?.district || ''} • {d.duration}</p>
                      <p className="summary-dest__reason">{d.reason}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Itinerary Overview */}
          <div className="summary-section">
            <h2 className="summary-section__title">📅 {t('summary.itinerary')}</h2>
            <div className="summary-itinerary">
              {trip.itinerary.map(day => (
                <div key={day.day} className="summary-day">
                  <div className="summary-day__header">
                    <span className="summary-day__badge">Day {day.day}</span>
                    <span className="summary-day__name">{day.destinationName}</span>
                    <span className="summary-day__date">{day.date}</span>
                  </div>
                  <ul className="summary-day__activities">
                    {day.activities.map(act => (
                      <li key={act.id}>
                        <span className="summary-act__time">{act.time}</span>
                        <span>{act.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Summary */}
          <div className="summary-section">
            <h2 className="summary-section__title">🚆 {t('summary.transport')}</h2>
            <div className="summary-transport">
              {trip.transportOptions.filter(o => o.selected).map(opt => (
                <div key={opt.id} className="summary-transport__item">
                  <span>{opt.mode === 'train' ? '🚆' : opt.mode === 'bus' ? '🚌' : opt.mode === 'flight' ? '✈️' : '🚗'}</span>
                  <span>{opt.from} → {opt.to}</span>
                  <span>₹{opt.farePerPerson.toLocaleString()}/person</span>
                  {opt.bookingUrl && <a href={opt.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm">Book ↗</a>}
                </div>
              ))}
              {trip.transportOptions.filter(o => o.selected).length === 0 && (
                <p style={{ color: 'var(--color-gray-500)', fontStyle: 'italic' }}>No transport selected</p>
              )}
            </div>
          </div>

          {/* Budget Summary */}
          <div className="summary-section">
            <h2 className="summary-section__title">💰 {t('summary.budgetBreakdown')}</h2>
            <div className="summary-budget">
              {[
                ['Outbound Transport', b.outboundTransport],
                ['Return Transport', b.returnTransport],
                ['Local Transport', b.localTransport],
                ['Accommodation', b.accommodation],
                ['Food', b.food],
                ['Entry Fees', b.entryFees],
                ['Activities', b.activities],
                ['Package Fee', b.packageFee],
                ['Miscellaneous', b.miscellaneous],
                ['Contingency (10%)', b.contingency],
              ].map(([label, amount]) => (
                <div key={label as string} className="summary-budget__row">
                  <span>{label as string}</span>
                  <span>₹{(amount as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="summary-budget__total">
                <strong>Total Estimated Cost</strong>
                <strong>₹{b.total.toLocaleString()}</strong>
              </div>
              {travelers > 1 && (
                <p className="summary-budget__per-person">₹{b.perPerson.toLocaleString()} per person ({travelers} travelers)</p>
              )}
            </div>
          </div>

          {/* Email trip (demo) */}
          <div className="summary-section">
            <h2 className="summary-section__title">📧 {t('summary.emailTrip')}</h2>
            <div className="summary-email">
              <input type="email" className="form-input" placeholder="Enter your email address"
                value={emailInput} onChange={e => setEmailInput(e.target.value)} />
              <button className="btn btn--outline" disabled={!emailInput.trim() || emailSent}
                onClick={() => { setEmailSent(true); }}>
                {emailSent ? '✓ Sent (Demo)' : 'Send Summary'}
              </button>
              <span className="demo-badge" style={{ marginLeft: 'var(--space-2)' }}>⚡ Demo — Configure email service in production</span>
            </div>
          </div>

          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => { prevStep(); navigate('/plan/itinerary'); }}>
              ← {t('common.back')}
            </button>
            <button className="btn btn--primary btn--lg" onClick={handleConfirm}>
              ✓ {t('summary.confirm')}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .summary-section { margin-bottom: var(--space-8); }
        .summary-section__title { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-forest-dark); margin-bottom: var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--color-gold-light); }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
        .summary-item { background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-md); padding: var(--space-4); }
        .summary-item__label { font-size: var(--text-xs); color: var(--color-gray-500); text-transform: uppercase; letter-spacing: var(--tracking-wide); display: block; margin-bottom: var(--space-1); }
        .summary-item__value { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--color-forest-dark); }
        .summary-dest-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .summary-dest { display: flex; gap: var(--space-4); background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-lg); padding: var(--space-3); align-items: center; }
        .summary-dest__img { width: 100px; height: 68px; object-fit: cover; border-radius: var(--radius-md); flex-shrink: 0; }
        .summary-dest__info h4 { font-family: var(--font-display); font-size: var(--text-base); color: var(--color-forest-dark); }
        .summary-dest__info p { font-size: var(--text-xs); color: var(--color-gray-500); }
        .summary-dest__reason { font-size: var(--text-xs); color: var(--color-gray-400); margin-top: var(--space-1); }
        .summary-itinerary { display: flex; flex-direction: column; gap: var(--space-3); }
        .summary-day { background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-lg); padding: var(--space-4); }
        .summary-day__header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); flex-wrap: wrap; }
        .summary-day__badge { background: var(--color-forest); color: var(--color-white); padding: 2px var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-bold); }
        .summary-day__name { font-family: var(--font-display); font-weight: var(--font-semibold); color: var(--color-forest-dark); }
        .summary-day__date { font-size: var(--text-xs); color: var(--color-gray-400); margin-left: auto; }
        .summary-day__activities { list-style: none; display: flex; flex-direction: column; gap: var(--space-1); }
        .summary-day__activities li { display: flex; gap: var(--space-3); font-size: var(--text-sm); color: var(--color-gray-600); padding: var(--space-1) 0; }
        .summary-act__time { color: var(--color-gray-400); min-width: 70px; font-size: var(--text-xs); }
        .summary-transport { display: flex; flex-direction: column; gap: var(--space-3); }
        .summary-transport__item { display: flex; align-items: center; gap: var(--space-4); background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); font-size: var(--text-sm); }
        .summary-budget { background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-lg); padding: var(--space-5); }
        .summary-budget__row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-gray-50); font-size: var(--text-sm); }
        .summary-budget__row span:first-child { color: var(--color-gray-600); }
        .summary-budget__row span:last-child { font-weight: var(--font-semibold); }
        .summary-budget__total { display: flex; justify-content: space-between; padding: var(--space-4) 0; margin-top: var(--space-2); border-top: 2px solid var(--color-forest); font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-forest-dark); }
        .summary-budget__per-person { text-align: right; font-size: var(--text-sm); color: var(--color-gray-500); margin-top: var(--space-2); }
        .summary-email { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
        .summary-email .form-input { max-width: 320px; }
        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr 1fr; }
          .summary-dest { flex-direction: column; text-align: center; }
          .summary-dest__img { width: 100%; height: 120px; }
        }
      `}</style>
    </div>
  );
}
