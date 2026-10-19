import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useApp } from '../context/AppContext';
import type { InterestType, TravelStyle } from '../context/TripContext';
import '../styles/plan-pages.css';

const STEP_IMAGES = [
  'https://images.pexels.com/photos/37962589/pexels-photo-37962589.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  'https://images.pexels.com/photos/37484313/pexels-photo-37484313.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  'https://images.pexels.com/photos/5104346/pexels-photo-5104346.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  'https://images.pexels.com/photos/32297486/pexels-photo-32297486.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
];

const STEP_IMAGE_ALTS = [
  'Travelers with backpacks exploring together',
  'Road trip through scenic mountain landscape in India',
  'Solo traveler admiring a mountain viewpoint',
  'Couple exploring an ancient temple in India',
];

const INTEREST_OPTIONS: { key: InterestType; emoji: string; label: string }[] = [
  { key: 'heritage', emoji: '🏛️', label: 'Heritage & Temples' },
  { key: 'nature', emoji: '🌿', label: 'Nature' },
  { key: 'hills', emoji: '⛰️', label: 'Hill Stations' },
  { key: 'beaches', emoji: '🏖️', label: 'Beaches' },
  { key: 'waterfalls', emoji: '💧', label: 'Waterfalls' },
  { key: 'wildlife', emoji: '🐾', label: 'Wildlife' },
  { key: 'adventure', emoji: '🧗', label: 'Adventure' },
  { key: 'mixed', emoji: '✨', label: 'Mix of everything' },
];

const DURATION_OPTIONS = [
  { value: 2, label: '2 days — Quick getaway' },
  { value: 3, label: '3 days — Short trip' },
  { value: 5, label: '5 days — Standard trip' },
  { value: 7, label: '7 days — Week-long' },
  { value: 10, label: '10+ days — Extended' },
];

const BUDGET_OPTIONS = [
  { value: 5000, label: '₹5,000 — Budget' },
  { value: 10000, label: '₹10,000 — Economy' },
  { value: 20000, label: '₹20,000 — Comfortable' },
  { value: 40000, label: '₹40,000 — Premium' },
  { value: 80000, label: '₹80,000+ — Luxury' },
];

const STYLE_OPTIONS: { key: TravelStyle; emoji: string; label: string; desc: string }[] = [
  { key: 'budget', emoji: '💸', label: 'Budget', desc: 'Hostels, local transport, street food' },
  { key: 'comfortable', emoji: '🛋️', label: 'Comfortable', desc: 'Mid-range hotels, mix of transport' },
  { key: 'premium', emoji: '💎', label: 'Premium', desc: 'Luxury stays, private transport' },
];

const COMPANION_OPTIONS = [
  { value: 'solo', emoji: '🧳', label: 'Solo', adults: 1, children: 0 },
  { value: 'couple', emoji: '💑', label: 'Couple', adults: 2, children: 0 },
  { value: 'family', emoji: '👨‍👩‍👧', label: 'Family', adults: 2, children: 2 },
  { value: 'friends', emoji: '👥', label: 'Friends', adults: 4, children: 0 },
];

const TOTAL_STEPS = 4;

export default function PreferencesPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep } = useTrip();
  const { state } = useApp();
  const navigate = useNavigate();
  const p = trip.preferences;
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (data: Partial<typeof p>) => dispatch({ type: 'SET_PREFERENCES', payload: data });

  const toggleInterest = (key: InterestType) => {
    const current = p.interests;
    const updated = current.includes(key) ? current.filter(i => i !== key) : [...current, key];
    update({ interests: updated });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && p.interests.length === 0) errs.interests = 'Select at least one interest';
    if (step === 1 && (!p.startDate || !p.endDate)) {
      if (!p.startDate) errs.startDate = 'Start date is required';
      if (!p.endDate) errs.endDate = 'End date is required';
    }
    if (step === 1 && p.startDate && p.endDate && new Date(p.endDate) <= new Date(p.startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (submitting) return;
    if (!validateStep()) return;
    setErrors({});
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    } else {
      navigate('/');
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    // Calculate duration from dates
    if (p.startDate && p.endDate) {
      const days = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      update({ duration: Math.max(days, 1) });
    }
    nextStep();
    navigate('/plan/compass');
    setSubmitting(false);
  };

  const imageRight = step % 2 === 0;

  return (
    <div className="questionnaire-page">
      <div className="questionnaire__progress-bar">
        <div className="questionnaire__progress-fill" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="questionnaire__container">
        <div className="questionnaire__step-indicator">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`questionnaire__dot ${i === step ? 'questionnaire__dot--active' : ''} ${i < step ? 'questionnaire__dot--done' : ''}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className={`questionnaire__layout ${imageRight ? 'questionnaire__layout--image-right' : 'questionnaire__layout--image-left'}`}
            initial={{ opacity: 0, x: imageRight ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: imageRight ? -30 : 30 }}
            transition={{ duration: 0.4 }}
          >
            {/* Image side */}
            <div className="questionnaire__image-side">
              <img
                src={STEP_IMAGES[step]}
                alt={STEP_IMAGE_ALTS[step]}
                loading="eager"
                onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/900x700/2D5A3D/FAF7F2?text=Travel`; }}
              />
            </div>

            {/* Content side */}
            <div className="questionnaire__content-side">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="questionnaire__content"
                >
                  {/* Step 0: Interests */}
                  {step === 0 && (
                    <>
                      <h1 className="questionnaire__title">What type of places do you enjoy exploring?</h1>
                      <p className="questionnaire__subtitle">Pick all that appeal to you — we'll match destinations to your interests.</p>
                      <div className="questionnaire__options-grid">
                        {INTEREST_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            className={`questionnaire__option ${p.interests.includes(opt.key) ? 'questionnaire__option--selected' : ''}`}
                            onClick={() => toggleInterest(opt.key)}
                          >
                            <span className="questionnaire__option-emoji">{opt.emoji}</span>
                            <span className="questionnaire__option-label">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors.interests && <p className="questionnaire__error">{errors.interests}</p>}
                    </>
                  )}

                  {/* Step 1: Duration & Dates */}
                  {step === 1 && (
                    <>
                      <h1 className="questionnaire__title">How long do you plan to travel?</h1>
                      <p className="questionnaire__subtitle">Choose a duration, then set your travel dates.</p>
                      <div className="questionnaire__options-list">
                        {DURATION_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`questionnaire__option-pill ${p.duration === opt.value ? 'questionnaire__option-pill--selected' : ''}`}
                            onClick={() => {
                              update({ duration: opt.value });
                              const start = p.startDate ? new Date(p.startDate) : new Date();
                              const end = new Date(start);
                              end.setDate(end.getDate() + opt.value - 1);
                              update({
                                duration: opt.value,
                                startDate: start.toISOString().split('T')[0],
                                endDate: end.toISOString().split('T')[0],
                              });
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="questionnaire__date-row">
                        <div className="form-group">
                          <label className="form-label">Start date</label>
                          <input
                            type="date"
                            className={`form-input ${errors.startDate ? 'form-input--error' : ''}`}
                            value={p.startDate}
                            onChange={e => update({ startDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                          {errors.startDate && <p className="questionnaire__error">{errors.startDate}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">End date</label>
                          <input
                            type="date"
                            className={`form-input ${errors.endDate ? 'form-input--error' : ''}`}
                            value={p.endDate}
                            onChange={e => update({ endDate: e.target.value })}
                            min={p.startDate || new Date().toISOString().split('T')[0]}
                          />
                          {errors.endDate && <p className="questionnaire__error">{errors.endDate}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Budget */}
                  {step === 2 && (
                    <>
                      <h1 className="questionnaire__title">What is your approximate total budget?</h1>
                      <p className="questionnaire__subtitle">This helps us recommend destinations and transport within your range.</p>
                      <div className="questionnaire__options-list">
                        {BUDGET_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`questionnaire__option-pill ${p.totalBudget === opt.value ? 'questionnaire__option-pill--selected' : ''}`}
                            onClick={() => update({ totalBudget: opt.value })}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                        <label className="form-label">Or enter a custom amount (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={p.totalBudget}
                          onChange={e => update({ totalBudget: parseInt(e.target.value) || 0 })}
                          min={1000}
                          step={1000}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 3: Travel style & companions */}
                  {step === 3 && (
                    <>
                      <h1 className="questionnaire__title">Who are you traveling with?</h1>
                      <p className="questionnaire__subtitle">And what is your preferred travel style?</p>
                      <div className="questionnaire__options-grid">
                        {COMPANION_OPTIONS.map(opt => {
                          const selected = p.adults === opt.adults && p.children === opt.children;
                          return (
                            <button
                              key={opt.value}
                              className={`questionnaire__option ${selected ? 'questionnaire__option--selected' : ''}`}
                              onClick={() => update({ adults: opt.adults, children: opt.children })}
                            >
                              <span className="questionnaire__option-emoji">{opt.emoji}</span>
                              <span className="questionnaire__option-label">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 'var(--space-6)' }}>
                        <h2 className="questionnaire__subtitle" style={{ marginBottom: 'var(--space-3)' }}>Travel style</h2>
                        <div className="questionnaire__options-list">
                          {STYLE_OPTIONS.map(opt => (
                            <button
                              key={opt.key}
                              className={`questionnaire__option-pill ${p.travelStyle === opt.key ? 'questionnaire__option-pill--selected' : ''}`}
                              onClick={() => update({ travelStyle: opt.key })}
                            >
                              <span style={{ marginRight: '0.5rem' }}>{opt.emoji}</span>
                              {opt.label} — <span style={{ opacity: 0.7 }}>{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="questionnaire__nav">
                <button className="btn btn--outline" onClick={handleBack} disabled={submitting}>
                  ← {step === 0 ? t('common.back') : t('common.back')}
                </button>
                <button
                  className="btn btn--primary btn--lg"
                  onClick={handleNext}
                  disabled={submitting || (step === 0 && p.interests.length === 0)}
                >
                  {step === TOTAL_STEPS - 1 ? 'Submit →' : 'Next →'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .questionnaire-page { min-height: 100vh; background: var(--color-ivory); padding-top: var(--nav-height); }
        .questionnaire__progress-bar { position: fixed; top: var(--nav-height); left: 0; right: 0; height: 4px; background: var(--color-gray-100); z-index: 50; }
        .questionnaire__progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-forest) 0%, var(--color-gold) 100%); transition: width 0.4s ease; }
        .questionnaire__container { max-width: 1200px; margin: 0 auto; padding: var(--space-8) var(--space-4); }
        .questionnaire__step-indicator { display: flex; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-6); }
        .questionnaire__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-gray-200); transition: all 0.3s; }
        .questionnaire__dot--active { background: var(--color-forest); transform: scale(1.3); }
        .questionnaire__dot--done { background: var(--color-forest-light); }
        .questionnaire__layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: center; min-height: 500px; }
        .questionnaire__layout--image-right .questionnaire__image-side { order: 2; }
        .questionnaire__layout--image-right .questionnaire__content-side { order: 1; }
        .questionnaire__layout--image-left .questionnaire__image-side { order: 1; }
        .questionnaire__layout--image-left .questionnaire__content-side { order: 2; }
        .questionnaire__image-side { border-radius: var(--radius-xl); overflow: hidden; aspect-ratio: 4/3; box-shadow: var(--shadow-lg); }
        .questionnaire__image-side img { width: 100%; height: 100%; object-fit: cover; }
        .questionnaire__content-side { display: flex; flex-direction: column; min-height: 400px; }
        .questionnaire__content { flex: 1; }
        .questionnaire__title { font-family: var(--font-display); font-size: var(--text-3xl); color: var(--color-forest-dark); line-height: 1.2; margin-bottom: var(--space-3); }
        .questionnaire__subtitle { font-size: var(--text-lg); color: var(--color-gray-600); margin-bottom: var(--space-6); line-height: var(--leading-relaxed); }
        .questionnaire__options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
        .questionnaire__option { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); border: 2px solid var(--color-gray-100); border-radius: var(--radius-lg); background: var(--color-white); cursor: pointer; transition: all 0.2s; text-align: center; }
        .questionnaire__option:hover { border-color: var(--color-forest-light); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .questionnaire__option--selected { border-color: var(--color-forest); background: rgba(45,90,61,0.05); }
        .questionnaire__option-emoji { font-size: 2rem; }
        .questionnaire__option-label { font-size: var(--text-sm); font-weight: 500; color: var(--color-gray-700); }
        .questionnaire__options-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .questionnaire__option-pill { padding: var(--space-3) var(--space-4); border: 2px solid var(--color-gray-100); border-radius: var(--radius-md); background: var(--color-white); cursor: pointer; transition: all 0.2s; text-align: left; font-size: var(--text-base); color: var(--color-gray-700); }
        .questionnaire__option-pill:hover { border-color: var(--color-forest-light); }
        .questionnaire__option-pill--selected { border-color: var(--color-forest); background: rgba(45,90,61,0.05); color: var(--color-forest-dark); }
        .questionnaire__date-row { display: flex; gap: var(--space-4); margin-top: var(--space-4); }
        .questionnaire__date-row .form-group { flex: 1; }
        .questionnaire__error { color: var(--color-error, #ef4444); font-size: var(--text-sm); margin-top: var(--space-2); }
        .questionnaire__nav { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-8); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-100); }
        @media (max-width: 768px) {
          .questionnaire__layout { grid-template-columns: 1fr; gap: var(--space-4); }
          .questionnaire__layout--image-right .questionnaire__image-side,
          .questionnaire__layout--image-left .questionnaire__image-side { order: 0; aspect-ratio: 16/9; min-height: 200px; }
          .questionnaire__image-side { display: none; }
          .questionnaire__title { font-size: var(--text-2xl); }
          .questionnaire__options-grid { grid-template-columns: 1fr; }
          .questionnaire__date-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
