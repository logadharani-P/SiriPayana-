import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip, InterestType } from '../context/TripContext';
import { ONBOARDING_IMAGES } from '../data/destinationImages';
import { supportedLanguages } from '../i18n';
import './OnboardingPage.css';

const KARNATAKA_CITIES = [
  'Bengaluru',
  'Mysuru',
  'Hubballi-Dharwad',
  'Mangaluru',
  'Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Ballari',
  'Vijayapura',
  'Hassan',
  'Udupi',
  'Davangere',
];

const PURPOSE_OPTIONS: { id: InterestType; label: string; icon: string; desc: string }[] = [
  { id: 'heritage', label: 'Heritage & Dynasties', icon: '🏛️', desc: 'Ancient monuments, UNESCO sites & royal palaces' },
  { id: 'hills', label: 'Hills & Western Ghats', icon: '⛰️', desc: 'Misty peaks, coffee valleys & scenic viewpoints' },
  { id: 'beaches', label: 'Coastal Karavali & Beaches', icon: '🏖️', desc: 'Pristine shores, sea temples & water sports' },
  { id: 'wildlife', label: 'Wildlife & Safaris', icon: '🐾', desc: 'Tiger reserves, elephants & bird sanctuaries' },
  { id: 'waterfalls', label: 'Waterfalls & Nature', icon: '💧', desc: 'Spectacular cascades & rainforest trails' },
  { id: 'adventure', label: 'Adventure & Trekking', icon: '🧗', desc: 'River rafting, rock climbing & high-altitude treks' },
];

const BUDGET_PRESETS = [
  { value: 12000, label: 'Economy', icon: '🎒', desc: 'Budget-conscious travel with comfortable basics' },
  { value: 28000, label: 'Comfortable', icon: '✨', desc: 'Popular choice with quality stays & transport' },
  { value: 60000, label: 'Premium / Luxury', icon: '💎', desc: 'Heritage resorts, private cabs & premier dining' },
];

export default function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const { trip, dispatch, goToStep } = useTrip();
  const navigate = useNavigate();

  // 1 to 6
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const p = trip.preferences;

  const updatePrefs = (data: Partial<typeof p>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: data });
    setErrorMsg('');
  };

  const handleNext = () => {
    // Validation for current question
    if (currentQuestion === 1) {
      if (!p.startingCity.trim()) {
        setErrorMsg('Please select or enter your departure city.');
        return;
      }
    } else if (currentQuestion === 2) {
      if (!p.startDate) {
        setErrorMsg('Please pick a start date for your journey.');
        return;
      }
      if (!p.endDate) {
        setErrorMsg('Please pick an end date for your journey.');
        return;
      }
      if (new Date(p.endDate) < new Date(p.startDate)) {
        setErrorMsg('End date cannot be earlier than start date.');
        return;
      }
      // Re-calculate duration
      const diffMs = new Date(p.endDate).getTime() - new Date(p.startDate).getTime();
      const calcDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
      updatePrefs({ duration: calcDays });
    } else if (currentQuestion === 3) {
      if (p.interests.length === 0) {
        setErrorMsg('Please select at least one travel experience.');
        return;
      }
    } else if (currentQuestion === 4) {
      if (!p.totalBudget || p.totalBudget < 2000) {
        setErrorMsg('Please enter an estimated budget of at least ₹2,000.');
        return;
      }
    } else if (currentQuestion === 5) {
      if (p.adults < 1) {
        setErrorMsg('At least 1 adult traveller is required.');
        return;
      }
    }

    if (currentQuestion < 6) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Completed onboarding! Go to Step 2: Four-direction Karnataka dashboard
      goToStep(1);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setErrorMsg('');
    } else {
      navigate('/signin');
    }
  };

  const toggleInterest = (id: InterestType) => {
    const exists = p.interests.includes(id);
    const updated = exists ? p.interests.filter(item => item !== id) : [...p.interests, id];
    updatePrefs({ interests: updated });
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('siripayana-lang', langCode);
    updatePrefs({ preferredLanguage: langCode });
  };

  const currentImageInfo = ONBOARDING_IMAGES[currentQuestion] || ONBOARDING_IMAGES[1];

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="onboarding-progress-wrapper">
          <div className="onboarding-progress-header">
            <span className="onboarding-step-count">
              {t('common.step', 'Step')} {currentQuestion} / 6
            </span>
            <span className="onboarding-step-badge">
              {currentQuestion === 1 && '📍 Departure City'}
              {currentQuestion === 2 && '📅 Travel Dates'}
              {currentQuestion === 3 && '🎯 Travel Purpose'}
              {currentQuestion === 4 && '💰 Trip Budget'}
              {currentQuestion === 5 && '👥 Travellers'}
              {currentQuestion === 6 && '🌐 Preferred Language'}
            </span>
          </div>
          <div className="onboarding-progress-track">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${(currentQuestion / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* 2-Column Split: Image on Desktop, Question Form on the other */}
        <div className="onboarding-card">
          {/* Side Image Column */}
          <div className="onboarding-media-col">
            <img
              src={currentImageInfo.image}
              alt={currentImageInfo.caption}
              className="onboarding-media-img"
              loading="lazy"
            />
            <div className="onboarding-media-overlay">
              <span className="onboarding-media-tag">Karnataka Exploration</span>
              <p className="onboarding-media-caption">{currentImageInfo.caption}</p>
            </div>
          </div>

          {/* Form Column */}
          <div className="onboarding-form-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="onboarding-question-block"
              >
                {/* QUESTION 1: Starting Location */}
                {currentQuestion === 1 && (
                  <div>
                    <h2 className="onboarding-title">Where will your journey begin?</h2>
                    <p className="onboarding-subtitle">
                      Choose your departure city or enter any town in or around Karnataka to help us optimize your transport route.
                    </p>

                    <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                      <label className="form-label">Departure City</label>
                      <input
                        type="text"
                        className="form-input form-input--lg"
                        placeholder="e.g. Bengaluru, Mysuru, Hubballi..."
                        value={p.startingCity}
                        onChange={e => updatePrefs({ startingCity: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <span className="onboarding-hint">Or choose a major departure hub:</span>
                      <div className="chips" style={{ marginTop: 'var(--space-2)' }}>
                        {KARNATAKA_CITIES.map(city => (
                          <button
                            key={city}
                            type="button"
                            className={`chip ${p.startingCity === city ? 'chip--selected' : ''}`}
                            onClick={() => updatePrefs({ startingCity: city })}
                          >
                            📍 {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION 2: Travel Dates & Trip Duration */}
                {currentQuestion === 2 && (
                  <div>
                    <h2 className="onboarding-title">When are you planning to travel?</h2>
                    <p className="onboarding-subtitle">
                      Select your travel dates. We will automatically calculate the optimal nights, itinerary pacing, and seasonal recommendations.
                    </p>

                    <div className="form-row" style={{ marginTop: 'var(--space-6)' }}>
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-input form-input--lg"
                          value={p.startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => updatePrefs({ startDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-input form-input--lg"
                          value={p.endDate}
                          min={p.startDate || new Date().toISOString().split('T')[0]}
                          onChange={e => updatePrefs({ endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="onboarding-calculated-badge">
                      <span>⏱️ Trip Duration:</span>
                      <strong>{p.duration || 3} Days ({Math.max(1, (p.duration || 3) - 1)} Nights)</strong>
                    </div>

                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <span className="onboarding-hint">Or adjust duration directly:</span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        {[2, 3, 4, 5, 7, 10].map(days => (
                          <button
                            key={days}
                            type="button"
                            className={`chip ${p.duration === days ? 'chip--selected' : ''}`}
                            onClick={() => {
                              const start = p.startDate ? new Date(p.startDate) : new Date();
                              const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
                              updatePrefs({
                                duration: days,
                                startDate: start.toISOString().split('T')[0],
                                endDate: end.toISOString().split('T')[0],
                              });
                            }}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION 3: Travel Purpose */}
                {currentQuestion === 3 && (
                  <div>
                    <h2 className="onboarding-title">What is your travel focus?</h2>
                    <p className="onboarding-subtitle">
                      Choose one or more travel styles that excite you. We will prioritize these categories across all regions.
                    </p>

                    <div className="onboarding-purpose-grid" style={{ marginTop: 'var(--space-6)' }}>
                      {PURPOSE_OPTIONS.map(opt => {
                        const isSelected = p.interests.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`onboarding-purpose-card ${isSelected ? 'onboarding-purpose-card--selected' : ''}`}
                            onClick={() => toggleInterest(opt.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="onboarding-purpose-icon">{opt.icon}</span>
                            <div>
                              <h4>{opt.label}</h4>
                              <p>{opt.desc}</p>
                            </div>
                            <span className="onboarding-purpose-check">{isSelected ? '✓' : '+'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 4: Budget */}
                {currentQuestion === 4 && (
                  <div>
                    <h2 className="onboarding-title">What is your estimated trip budget?</h2>
                    <p className="onboarding-subtitle">
                      This helps us recommend suitable hotels, transportation options, and daily activities without surprise costs.
                    </p>

                    <div className="onboarding-budget-presets" style={{ marginTop: 'var(--space-6)' }}>
                      {BUDGET_PRESETS.map(preset => (
                        <div
                          key={preset.value}
                          className={`onboarding-budget-card ${p.totalBudget === preset.value ? 'onboarding-budget-card--selected' : ''}`}
                          onClick={() => {
                            updatePrefs({
                              totalBudget: preset.value,
                              travelStyle: preset.label === 'Economy' ? 'budget' : preset.label === 'Comfortable' ? 'comfortable' : 'premium',
                            });
                          }}
                        >
                          <span style={{ fontSize: '1.8rem' }}>{preset.icon}</span>
                          <h3>{preset.label}</h3>
                          <div className="onboarding-budget-amount">₹{preset.value.toLocaleString()}</div>
                          <p>{preset.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                      <label className="form-label">Or enter custom total budget (₹)</label>
                      <input
                        type="number"
                        className="form-input form-input--lg"
                        min="2000"
                        step="1000"
                        value={p.totalBudget || ''}
                        onChange={e => updatePrefs({ totalBudget: parseInt(e.target.value) || 0 })}
                        placeholder="e.g. 35000"
                      />
                    </div>
                  </div>
                )}

                {/* QUESTION 5: Traveller Count */}
                {currentQuestion === 5 && (
                  <div>
                    <h2 className="onboarding-title">Who is joining you on this journey?</h2>
                    <p className="onboarding-subtitle">
                      Specify the number of adults and children so we can accurately compute entry tickets, room counts, and fares.
                    </p>

                    <div className="onboarding-travellers-box" style={{ marginTop: 'var(--space-6)' }}>
                      <div className="onboarding-traveller-row">
                        <div>
                          <strong>Adults</strong>
                          <p>Age 12 and above</p>
                        </div>
                        <div className="onboarding-counter">
                          <button
                            type="button"
                            className="counter-btn"
                            disabled={p.adults <= 1}
                            onClick={() => updatePrefs({ adults: p.adults - 1 })}
                          >
                            -
                          </button>
                          <span className="counter-val">{p.adults}</span>
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => updatePrefs({ adults: p.adults + 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="onboarding-traveller-row">
                        <div>
                          <strong>Children</strong>
                          <p>Age 11 and under (reduced or free entry)</p>
                        </div>
                        <div className="onboarding-counter">
                          <button
                            type="button"
                            className="counter-btn"
                            disabled={p.children <= 0}
                            onClick={() => updatePrefs({ children: Math.max(0, p.children - 1) })}
                          >
                            -
                          </button>
                          <span className="counter-val">{p.children}</span>
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => updatePrefs({ children: p.children + 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="onboarding-traveller-summary">
                      <span>Total Group Size:</span>
                      <strong>{p.adults + p.children} Travellers</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginLeft: 'var(--space-2)' }}>
                        (Requires approximately {Math.ceil((p.adults + p.children) / 2)} hotel rooms)
                      </span>
                    </div>
                  </div>
                )}

                {/* QUESTION 6: Preferred Language */}
                {currentQuestion === 6 && (
                  <div>
                    <h2 className="onboarding-title">Which language do you prefer?</h2>
                    <p className="onboarding-subtitle">
                      SiriPayana provides end-to-end guidance in your chosen language, including destination history, directions, and the generated PDF travel pass.
                    </p>

                    <div className="onboarding-lang-grid" style={{ marginTop: 'var(--space-6)' }}>
                      {supportedLanguages.map(lang => {
                        const isCurrent = i18n.language === lang.code;
                        return (
                          <div
                            key={lang.code}
                            className={`onboarding-lang-card ${isCurrent ? 'onboarding-lang-card--selected' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="onboarding-lang-native">{lang.nativeName}</span>
                            <span className="onboarding-lang-name">{lang.name}</span>
                            {isCurrent && <span className="onboarding-lang-badge">Active</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div className="onboarding-error-banner">
                    ⚠️ {errorMsg}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Actions Bar */}
            <div className="onboarding-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleBack}
              >
                ← {currentQuestion === 1 ? 'Back to Sign-in' : t('common.back', 'Back')}
              </button>

              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={handleNext}
              >
                {currentQuestion === 6
                  ? 'Explore Karnataka Dashboard (Step 2) →'
                  : `${t('common.next', 'Next Question')} →`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
