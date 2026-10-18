import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import type { InterestType, TravelStyle, TransportMode } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

const INTEREST_OPTIONS: { key: InterestType; emoji: string }[] = [
  { key: 'heritage', emoji: '🏛️' },
  { key: 'nature', emoji: '🌿' },
  { key: 'hills', emoji: '⛰️' },
  { key: 'beaches', emoji: '🏖️' },
  { key: 'waterfalls', emoji: '💧' },
  { key: 'wildlife', emoji: '🐾' },
  { key: 'food', emoji: '🍽️' },
  { key: 'adventure', emoji: '🧗' },
  { key: 'mixed', emoji: '✨' },
];

const TRANSPORT_OPTIONS: { key: TransportMode; emoji: string; label: string }[] = [
  { key: 'train', emoji: '🚆', label: 'Train' },
  { key: 'bus', emoji: '🚌', label: 'Bus' },
  { key: 'flight', emoji: '✈️', label: 'Flight' },
  { key: 'car', emoji: '🚗', label: 'Car/Taxi' },
  { key: 'personal', emoji: '🚙', label: 'Personal Vehicle' },
];

export default function PreferencesPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep } = useTrip();
  const navigate = useNavigate();
  const p = trip.preferences;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (data: Record<string, any>) => dispatch({ type: 'SET_PREFERENCES', payload: data });

  const toggleInterest = (key: InterestType) => {
    const current = p.interests;
    const updated = current.includes(key) ? current.filter(i => i !== key) : [...current, key];
    update({ interests: updated });
  };

  const toggleTransport = (key: TransportMode) => {
    const current = p.preferredTransport;
    const updated = current.includes(key) ? current.filter(t => t !== key) : [...current, key];
    update({ preferredTransport: updated });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!p.startingCity.trim()) errs.startingCity = 'Starting city is required';
    if (!p.startDate) errs.startDate = 'Start date is required';
    if (!p.endDate) errs.endDate = 'End date is required';
    if (p.startDate && p.endDate && new Date(p.endDate) <= new Date(p.startDate)) errs.endDate = 'End date must be after start date';
    if (p.adults < 1) errs.adults = 'At least 1 adult required';
    if (p.interests.length === 0) errs.interests = 'Select at least one interest';
    if (p.totalBudget < 1000) errs.totalBudget = 'Budget must be at least ₹1,000';
    if (p.preferredTransport.length === 0) errs.transport = 'Select at least one transport mode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    // Calculate duration
    if (p.startDate && p.endDate) {
      const days = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      update({ duration: days });
    }
    nextStep();
    navigate('/plan/recommendations');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>📋 {t('questionnaire.title')}</h1>
          <p>{t('questionnaire.subtitle')}</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Starting City */}
          <div className="form-section">
            <h2 className="form-section__title">🚩 {t('questionnaire.startingCity')}</h2>
            <div className="form-group">
              <input type="text" className={`form-input ${errors.startingCity ? 'form-input--error' : ''}`}
                value={p.startingCity} onChange={e => update({ startingCity: e.target.value })}
                placeholder="e.g. Bengaluru, Chennai, Mumbai" />
              {errors.startingCity && <p className="form-error">{errors.startingCity}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="form-section">
            <h2 className="form-section__title">📅 {t('questionnaire.travelDates')}</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('questionnaire.startDate')}</label>
                <input type="date" className={`form-input ${errors.startDate ? 'form-input--error' : ''}`}
                  value={p.startDate} onChange={e => update({ startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} />
                {errors.startDate && <p className="form-error">{errors.startDate}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('questionnaire.endDate')}</label>
                <input type="date" className={`form-input ${errors.endDate ? 'form-input--error' : ''}`}
                  value={p.endDate} onChange={e => update({ endDate: e.target.value })}
                  min={p.startDate || new Date().toISOString().split('T')[0]} />
                {errors.endDate && <p className="form-error">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div className="form-section">
            <h2 className="form-section__title">👥 {t('questionnaire.travelers')}</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('questionnaire.adults')}</label>
                <input type="number" className={`form-input ${errors.adults ? 'form-input--error' : ''}`}
                  value={p.adults} onChange={e => update({ adults: parseInt(e.target.value) || 0 })} min={1} max={20} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('questionnaire.children')}</label>
                <input type="number" className="form-input"
                  value={p.children} onChange={e => update({ children: parseInt(e.target.value) || 0 })} min={0} max={10} />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <h2 className="form-section__title">❤️ {t('questionnaire.interests')}</h2>
            <div className="chips">
              {INTEREST_OPTIONS.map(opt => (
                <button key={opt.key} className={`chip ${p.interests.includes(opt.key) ? 'chip--selected' : ''}`}
                  onClick={() => toggleInterest(opt.key)}>
                  {opt.emoji} {opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}
                </button>
              ))}
            </div>
            {errors.interests && <p className="form-error">{errors.interests}</p>}
          </div>

          {/* Budget */}
          <div className="form-section">
            <h2 className="form-section__title">💰 {t('questionnaire.budget')}</h2>
            <div className="form-group">
              <label className="form-label">{t('questionnaire.totalBudget')} (₹)</label>
              <input type="number" className={`form-input ${errors.totalBudget ? 'form-input--error' : ''}`}
                value={p.totalBudget} onChange={e => update({ totalBudget: parseInt(e.target.value) || 0 })}
                min={1000} step={1000} placeholder="15000" />
              {errors.totalBudget && <p className="form-error">{errors.totalBudget}</p>}
            </div>
          </div>

          {/* Transport */}
          <div className="form-section">
            <h2 className="form-section__title">🚆 {t('questionnaire.transport')}</h2>
            <div className="chips">
              {TRANSPORT_OPTIONS.map(opt => (
                <button key={opt.key} className={`chip ${p.preferredTransport.includes(opt.key) ? 'chip--selected' : ''}`}
                  onClick={() => toggleTransport(opt.key)}>
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
            {errors.transport && <p className="form-error">{errors.transport}</p>}
          </div>

          {/* Travel Style */}
          <div className="form-section">
            <h2 className="form-section__title">🎯 {t('questionnaire.travelStyle')}</h2>
            <div className="chips">
              {(['budget', 'comfortable', 'premium'] as TravelStyle[]).map(style => (
                <button key={style} className={`chip ${p.travelStyle === style ? 'chip--selected' : ''}`}
                  onClick={() => update({ travelStyle: style })}>
                  {style === 'budget' ? '💸' : style === 'comfortable' ? '🛋️' : '💎'} {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="form-section">
            <h2 className="form-section__title">⏱️ {t('questionnaire.pace')}</h2>
            <div className="chips">
              {(['relaxed', 'balanced', 'packed'] as const).map(pace => (
                <button key={pace} className={`chip ${p.packedOrRelaxed === pace ? 'chip--selected' : ''}`}
                  onClick={() => update({ packedOrRelaxed: pace })}>
                  {pace === 'relaxed' ? '🌴' : pace === 'balanced' ? '⚖️' : '🏃'} {pace.charAt(0).toUpperCase() + pace.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="form-section">
            <h2 className="form-section__title">♿ {t('questionnaire.accessibility')}</h2>
            <textarea className="form-input" rows={3} value={p.accessibility}
              onChange={e => update({ accessibility: e.target.value })}
              placeholder={t('questionnaire.accessibilityPlaceholder')} />
          </div>

          {/* Actions */}
          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => navigate('/')}>← {t('common.back')}</button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}>
              {t('common.continue')} →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
