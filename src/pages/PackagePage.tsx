import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import type { PackageTier } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

const PACKAGES: { tier: PackageTier; emoji: string; name: string; price: string; priceNote: string; features: string[] }[] = [
  {
    tier: 'normal', emoji: '📋', name: 'Normal', price: '₹499', priceNote: 'Demo price — service fee',
    features: [
      'AI destination recommendations',
      'Basic day-wise itinerary',
      'Estimated transport costs',
      'Destination information & history',
      'Budget calculator',
      'External booking links',
      'Email trip summary',
    ],
  },
  {
    tier: 'silver', emoji: '🥈', name: 'Silver', price: '₹999', priceNote: 'Demo price — service fee',
    features: [
      'Everything in Normal, plus:',
      'Detailed day-wise scheduling',
      'Accommodation suggestions',
      'Local transportation estimates',
      'Detailed expense breakdown',
      'Alternative destination combinations',
      'Enhanced itinerary customization',
    ],
  },
  {
    tier: 'premium', emoji: '💎', name: 'Premium', price: '₹1,999', priceNote: 'Demo price — service fee',
    features: [
      'Everything in Silver, plus:',
      'Advanced itinerary customization',
      'Multiple route comparisons',
      'Premium accommodation suggestions',
      'Detailed trip planning & alternatives',
      'Comprehensive travel report',
      'Enhanced saved-plan management',
    ],
  },
];

export default function PackagePage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep, prevStep } = useTrip();
  const navigate = useNavigate();

  const selectPackage = (tier: PackageTier) => {
    dispatch({ type: 'SET_PACKAGE', payload: tier });
  };

  const handleContinue = () => {
    if (!trip.selectedPackage) return;
    nextStep();
    navigate('/plan/transport');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>📦 {t('packages.title')}</h1>
          <p>{t('packages.subtitle')}</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
            <span className="demo-badge">⚡ Demo prices — configure in production</span>
          </p>
          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-8)' }}>
            Service fee is separate from estimated travel expenses (transport, accommodation, food).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {PACKAGES.map((pkg, i) => (
              <motion.div key={pkg.tier}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}>
                <div className={`selection-card ${trip.selectedPackage === pkg.tier ? 'selection-card--selected' : ''}`}
                  onClick={() => selectPackage(pkg.tier)}
                  style={pkg.tier === 'silver' ? { border: '2px solid var(--color-gold)', position: 'relative' } : {}}>
                  {pkg.tier === 'silver' && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '2px 16px', background: 'var(--color-gold)', color: 'var(--color-white)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)' }}>
                      RECOMMENDED
                    </div>
                  )}
                  <div className="selection-card__header">
                    <div>
                      <span style={{ fontSize: '2rem' }}>{pkg.emoji}</span>
                      <h3 className="selection-card__title">{pkg.name}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="selection-card__price">{pkg.price}</span>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{pkg.priceNote}</p>
                    </div>
                  </div>
                  <ul className="selection-card__features">
                    {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
                  </ul>
                  <button className={`btn ${trip.selectedPackage === pkg.tier ? 'btn--primary' : 'btn--outline'}`}
                    style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                    {trip.selectedPackage === pkg.tier ? '✓ Selected' : 'Select Package'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => { prevStep(); navigate('/plan/recommendations'); }}>
              ← {t('common.back')}
            </button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}
              disabled={!trip.selectedPackage}>
              {t('common.continue')} →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
