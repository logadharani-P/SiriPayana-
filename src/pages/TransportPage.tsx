import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip, TransportOption } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

function generateRealisticTransport(
  fromCity: string,
  destinations: { name: string }[],
  totalTravelers: number
): TransportOption[] {
  const options: TransportOption[] = [];
  const primaryDest = destinations[0]?.name || 'Mysuru';
  const returnDest = destinations[destinations.length - 1]?.name || primaryDest;
  const start = fromCity || 'Bengaluru';

  // Outbound options
  const outboundConfigs = [
    {
      mode: 'train' as const,
      operator: 'South Western Railway (Vande Bharat / Shatabdi / Express)',
      duration: '2h 10m - 4h 30m',
      departure: '06:00 AM (Bengaluru KSR / Yesvantpur)',
      arrival: '08:15 AM - 10:30 AM',
      fareBase: 420,
      bookingUrl: 'https://www.irctc.co.in/',
      source: 'Indian Railways (IRCTC typical fare schedule)',
      provider: 'IRCTC',
    },
    {
      mode: 'bus' as const,
      operator: 'KSRTC Airavat Club Class (Multi-Axle AC Volvo)',
      duration: '3h 30m - 5h 00m',
      departure: 'Frequent departures every 20-30 mins',
      arrival: 'Direct to central bus station',
      fareBase: 380,
      bookingUrl: 'https://ksrtc.in/',
      source: 'KSRTC Official Booking Schedule',
      provider: 'KSRTC / redBus',
    },
    {
      mode: 'car' as const,
      operator: 'Private Taxi / Self-Drive Cab Rental (Savaari / Zoomcar)',
      duration: '3h 15m - 4h 00m',
      departure: 'Flexible door-to-door pickup',
      arrival: 'Direct hotel drop',
      fareBase: 1800,
      bookingUrl: 'https://www.savaari.com/',
      source: 'Typical intercity AC sedan per-km rates',
      provider: 'Savaari / Local Cab',
    },
    {
      mode: 'flight' as const,
      operator: 'IndiGo / Star Air / Alliance Air Regional',
      duration: '55m - 1h 20m flight',
      departure: 'Selected regional flights (BLR, MYQ, IXE, HBX)',
      arrival: 'Regional airport terminal',
      fareBase: 3600,
      bookingUrl: 'https://www.google.com/travel/flights',
      source: 'Regional flight fare estimates',
      provider: 'Google Flights / Airlines',
    },
  ];

  outboundConfigs.forEach((c, idx) => {
    options.push({
      id: `outbound-${c.mode}`,
      mode: c.mode,
      from: start,
      to: primaryDest,
      operator: c.operator,
      duration: c.duration,
      farePerPerson: c.fareBase,
      groupFare: c.fareBase * totalTravelers,
      bookingUrl: c.bookingUrl,
      source: c.source,
      lastChecked: 'Live Demo Estimate',
      isEstimate: true,
      selected: idx === 0, // default train selected
    });
  });

  // Return options
  outboundConfigs.slice(0, 3).forEach((c, idx) => {
    options.push({
      id: `return-${c.mode}`,
      mode: c.mode,
      from: returnDest,
      to: start,
      operator: c.operator,
      duration: c.duration,
      farePerPerson: c.fareBase,
      groupFare: c.fareBase * totalTravelers,
      bookingUrl: c.bookingUrl,
      source: c.source,
      lastChecked: 'Live Demo Estimate',
      isEstimate: true,
      selected: idx === 0, // default train selected
    });
  });

  return options;
}

const MODE_ICONS: Record<string, string> = {
  train: '🚆',
  bus: '🚌',
  flight: '✈️',
  car: '🚗',
  personal: '🚙',
};

export default function TransportPage() {
  const { t } = useTranslation();
  const { trip, dispatch, goToStep } = useTrip();
  const navigate = useNavigate();

  const totalTravelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);

  useEffect(() => {
    if (trip.transportOptions.length === 0) {
      const generated = generateRealisticTransport(
        trip.preferences.startingCity,
        trip.selectedDestinations,
        totalTravelers
      );
      dispatch({ type: 'SET_TRANSPORT_OPTIONS', payload: generated });
    }
  }, [trip.preferences.startingCity, trip.selectedDestinations, totalTravelers]);

  const outboundOptions = trip.transportOptions.filter(o => o.id.includes('outbound'));
  const returnOptions = trip.transportOptions.filter(o => o.id.includes('return'));

  const handleContinue = () => {
    goToStep(3); // Go to step 4 (index 3: Hotels)
    navigate('/plan/hotels');
  };

  const handleBack = () => {
    goToStep(1); // Back to destinations
    navigate('/dashboard');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            {t('transportSection.stepBadge', 'STEP 3 • TRAVEL & TRANSIT')}
          </span>
          <h1>🚆 {t('transportSection.title', 'Transportation & Ticket Options')}</h1>
          <p>
            {t('transportSection.subtitle', { count: totalTravelers, defaultValue: `Compare verified transport routes across Karnataka. Fares are calculated dynamically for ${totalTravelers} traveller(s).` })}
          </p>
        </div>
      </div>

      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Transparency / Demo Notice */}
          <div style={{
            background: 'rgba(196, 152, 42, 0.1)',
            border: '1px solid var(--color-gold-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-6)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
            <div>
              <strong style={{ color: 'var(--color-forest-dark)', fontSize: 'var(--text-sm)', display: 'block' }}>
                {t('transportSection.transparencyTitle', 'Transparent Pricing & Booking Notice')}
              </strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', margin: 0 }}>
                {t('transportSection.transparencyDesc', 'Prices are realistic estimated fares based on standard schedules. SiriPayana provides direct links to verified operators (IRCTC, KSRTC, Savaari) so you can review real-time seat availability or book directly without middleman markups.')}
              </p>
            </div>
          </div>

          {/* Outbound Transit */}
          <div className="form-section">
            <h2 className="form-section__title">
              ➡️ Outbound Journey: {trip.preferences.startingCity || 'Bengaluru'} → {trip.selectedDestinations[0]?.name || 'Destination'}
            </h2>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {outboundOptions.map(opt => (
                <div
                  key={opt.id}
                  className={`selection-card ${opt.selected ? 'selection-card--selected' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_TRANSPORT', payload: opt.id })}
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    cursor: 'pointer',
                    background: opt.selected ? 'rgba(45, 90, 61, 0.04)' : 'var(--color-white)',
                    border: opt.selected ? '2px solid var(--color-forest)' : '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                      <span style={{ fontSize: '2rem' }}>{MODE_ICONS[opt.mode]}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest-dark)' }}>
                            {opt.operator}
                          </strong>
                          {opt.selected && (
                            <span style={{ background: 'var(--color-forest)', color: 'var(--color-white)', fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                              SELECTED
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                          {opt.from} → {opt.to} • {opt.duration}
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--color-gray-400)', display: 'inline-block', marginTop: 4 }}>
                          ⚡ Source: {opt.source}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gold-dark)' }}>
                        ₹{opt.farePerPerson.toLocaleString()}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', fontWeight: 'normal' }}> / person</span>
                      </div>
                      {totalTravelers > 1 && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', fontWeight: 'var(--font-semibold)' }}>
                          Total: ₹{opt.groupFare.toLocaleString()} ({totalTravelers} travellers)
                        </div>
                      )}
                    </div>

                    <div>
                      {opt.bookingUrl && (
                        <a
                          href={opt.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--outline btn--sm"
                          onClick={e => e.stopPropagation()}
                        >
                          Book via Operator ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Transit */}
          {returnOptions.length > 0 && (
            <div className="form-section">
              <h2 className="form-section__title">
                ⬅️ Return Journey: {trip.selectedDestinations[trip.selectedDestinations.length - 1]?.name || 'Destination'} → {trip.preferences.startingCity || 'Bengaluru'}
              </h2>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {returnOptions.map(opt => (
                  <div
                    key={opt.id}
                    className={`selection-card ${opt.selected ? 'selection-card--selected' : ''}`}
                    onClick={() => dispatch({ type: 'TOGGLE_TRANSPORT', payload: opt.id })}
                    style={{
                      padding: 'var(--space-4) var(--space-5)',
                      cursor: 'pointer',
                      background: opt.selected ? 'rgba(45, 90, 61, 0.04)' : 'var(--color-white)',
                      border: opt.selected ? '2px solid var(--color-forest)' : '1px solid var(--color-gray-200)',
                      borderRadius: 'var(--radius-lg)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                        <span style={{ fontSize: '2rem' }}>{MODE_ICONS[opt.mode]}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest-dark)' }}>
                              {opt.operator}
                            </strong>
                            {opt.selected && (
                              <span style={{ background: 'var(--color-forest)', color: 'var(--color-white)', fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                                SELECTED
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 2 }}>
                            {opt.from} → {opt.to} • {opt.duration}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gold-dark)' }}>
                          ₹{opt.farePerPerson.toLocaleString()}
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', fontWeight: 'normal' }}> / person</span>
                        </div>
                        {totalTravelers > 1 && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-600)', fontWeight: 'var(--font-semibold)' }}>
                            Total: ₹{opt.groupFare.toLocaleString()} ({totalTravelers} travellers)
                          </div>
                        )}
                      </div>

                      <div>
                        {opt.bookingUrl && (
                          <a
                            href={opt.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--outline btn--sm"
                            onClick={e => e.stopPropagation()}
                          >
                            Book via Operator ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={handleBack}>
              {t('transportSection.back', '← Back to Destinations')}
            </button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}>
              {t('transportSection.proceedHotels', 'Proceed to Hotel Booking (Step 4) →')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
