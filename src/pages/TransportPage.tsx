import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import type { TransportOption } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

function generateTransportOptions(from: string, destinations: { name: string }[], adults: number): TransportOption[] {
  const options: TransportOption[] = [];
  const mainDest = destinations[0]?.name || 'Mysuru';

  const modes = [
    { mode: 'train' as const, emoji: '🚆', operator: 'Indian Railways', durationH: 4, fareBase: 450, bookingUrl: 'https://www.irctc.co.in/' },
    { mode: 'bus' as const, emoji: '🚌', operator: 'KSRTC / redBus', durationH: 5, fareBase: 350, bookingUrl: 'https://www.redbus.in/' },
    { mode: 'flight' as const, emoji: '✈️', operator: 'Various Airlines', durationH: 1.5, fareBase: 3500, bookingUrl: 'https://www.google.com/travel/flights' },
    { mode: 'car' as const, emoji: '🚗', operator: 'Taxi / Car Rental', durationH: 4.5, fareBase: 2500, bookingUrl: '' },
  ];

  modes.forEach((m, i) => {
    options.push({
      id: `${m.mode}-outbound`,
      mode: m.mode,
      from: from || 'Bengaluru',
      to: mainDest,
      operator: m.operator,
      duration: `~${m.durationH} hours`,
      farePerPerson: m.fareBase,
      groupFare: m.fareBase * adults,
      bookingUrl: m.bookingUrl,
      source: 'Estimate based on typical fares',
      lastChecked: 'Demo data',
      isEstimate: true,
      selected: i === 0,
    });
  });

  // Return journey
  modes.slice(0, 2).forEach(m => {
    options.push({
      id: `${m.mode}-return`,
      mode: m.mode,
      from: destinations[destinations.length - 1]?.name || mainDest,
      to: from || 'Bengaluru',
      operator: m.operator,
      duration: `~${m.durationH} hours`,
      farePerPerson: m.fareBase,
      groupFare: m.fareBase * adults,
      bookingUrl: m.bookingUrl,
      source: 'Estimate based on typical fares',
      lastChecked: 'Demo data',
      isEstimate: true,
      selected: false,
    });
  });

  return options;
}

const MODE_ICONS: Record<string, string> = { train: '🚆', bus: '🚌', flight: '✈️', car: '🚗', personal: '🚙' };

export default function TransportPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep, prevStep } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    if (trip.transportOptions.length === 0) {
      const options = generateTransportOptions(
        trip.preferences.startingCity,
        trip.selectedDestinations,
        trip.preferences.adults + trip.preferences.children,
      );
      dispatch({ type: 'SET_TRANSPORT_OPTIONS', payload: options });
    }
  }, []);

  const outbound = trip.transportOptions.filter(o => o.id.includes('outbound'));
  const returnOpts = trip.transportOptions.filter(o => o.id.includes('return'));

  const handleContinue = () => {
    nextStep();
    navigate('/plan/itinerary');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>🚆 {t('transport.title')}</h1>
          <p>{t('transport.subtitle')}</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span className="demo-badge">⚠️ Estimated fares — verify before booking</span>
          </p>

          {/* Outbound */}
          <div className="form-section">
            <h2 className="form-section__title">➡️ Outbound Journey</h2>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {outbound.map(opt => (
                <div key={opt.id} className={`selection-card ${opt.selected ? 'selection-card--selected' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_TRANSPORT', payload: opt.id })}
                  style={{ padding: 'var(--space-4)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                      <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-2)' }}>{MODE_ICONS[opt.mode]}</span>
                      <strong style={{ color: 'var(--color-forest-dark)' }}>{opt.mode.charAt(0).toUpperCase() + opt.mode.slice(1)}</strong>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                        {opt.from} → {opt.to} • {opt.duration} • {opt.operator}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gold-dark)' }}>
                        ₹{opt.farePerPerson.toLocaleString()}<span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>/person</span>
                      </p>
                      {(trip.preferences.adults + trip.preferences.children) > 1 && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>Group: ₹{opt.groupFare.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      {opt.bookingUrl && (
                        <a href={opt.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm"
                          onClick={e => e.stopPropagation()}>
                          Book ↗
                        </a>
                      )}
                    </div>
                  </div>
                  {opt.isEstimate && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginTop: 'var(--space-2)' }}>⚠️ Estimated fare — {opt.source}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Return */}
          {returnOpts.length > 0 && (
            <div className="form-section">
              <h2 className="form-section__title">⬅️ Return Journey</h2>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {returnOpts.map(opt => (
                  <div key={opt.id} className={`selection-card ${opt.selected ? 'selection-card--selected' : ''}`}
                    onClick={() => dispatch({ type: 'TOGGLE_TRANSPORT', payload: opt.id })}
                    style={{ padding: 'var(--space-4)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      <div>
                        <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-2)' }}>{MODE_ICONS[opt.mode]}</span>
                        <strong>{opt.mode.charAt(0).toUpperCase() + opt.mode.slice(1)}</strong>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{opt.from} → {opt.to} • {opt.duration}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gold-dark)' }}>
                          ₹{opt.farePerPerson.toLocaleString()}/person
                        </p>
                      </div>
                      {opt.bookingUrl && (
                        <a href={opt.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline btn--sm" onClick={e => e.stopPropagation()}>Book ↗</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => { prevStep(); navigate('/plan/package'); }}>← {t('common.back')}</button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}>{t('common.continue')} →</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
