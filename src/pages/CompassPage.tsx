import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import '../styles/plan-pages.css';

const REGIONS = [
  { key: 'north', emoji: '🏛️', label: 'North Karnataka', desc: 'Heritage & monuments — Hampi, Badami, Pattadakal, Bijapur' },
  { key: 'south', emoji: '🌿', label: 'South Karnataka', desc: 'Palaces, hills & wildlife — Mysuru, Coorg, Bandipur, Kabini' },
  { key: 'west', emoji: '🏖️', label: 'Coastal Karnataka', desc: 'Beaches & waterfalls — Gokarna, Murudeshwar, Jog Falls' },
  { key: 'central', emoji: '⛰️', label: 'Malnad / Western Ghats', desc: 'Rainforests & peaks — Agumbe, Chikkamagaluru, Dandeli' },
];

export default function CompassPage() {
  const { t } = useTranslation();
  const { trip } = useTrip();
  const { state } = useApp();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const userName = state.profileName || 'traveler';

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
  };

  const handleContinue = async () => {
    if (!selectedRegion) return;
    // Navigate to recommendations filtered by the selected region
    navigate(`/plan/recommendations?region=${selectedRegion}`);
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>🧭 Karnataka Compass</h1>
          <p>Choose a direction to explore</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* AI Welcome */}
          <div className="compass-welcome">
            <div className="compass-welcome__avatar">🧭</div>
            <div className="compass-welcome__message">
              <h2>Welcome, {userName}!</h2>
              <p>Let's discover the beautiful places of Karnataka together. Based on your preferences — {trip.preferences.interests.join(', ') || 'general travel'}, {trip.preferences.duration} days — I've mapped out four regions to explore. Pick a direction to begin your journey.</p>
              <span className="demo-badge">⚡ Demo mode — AI greeting</span>
            </div>
          </div>

          {/* Compass */}
          <div className="compass-selector">
            <div className="compass-selector__ring">
              <div className="compass-selector__center">
                <span className="compass-selector__center-icon">🗺️</span>
                <span className="compass-selector__center-text">Karnataka</span>
              </div>
              {REGIONS.map((dir, i) => (
                <motion.button
                  key={dir.key}
                  className={`compass-selector__direction compass-selector__direction--${dir.key} ${selectedRegion === dir.key ? 'compass-selector__direction--selected' : ''}`}
                  onClick={() => handleSelectRegion(dir.key)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  aria-label={`Explore ${dir.label}`}
                >
                  <span className="compass-selector__dir-emoji">{dir.emoji}</span>
                  <span className="compass-selector__dir-label">{dir.label}</span>
                  <span className="compass-selector__dir-desc">{dir.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => navigate('/plan/preferences')}>
              ← Back to Questionnaire
            </button>
            <button
              className="btn btn--primary btn--lg"
              onClick={handleContinue}
              disabled={!selectedRegion}
            >
              {selectedRegion ? `Explore ${REGIONS.find(r => r.key === selectedRegion)?.label} →` : 'Select a region'}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .compass-welcome { display: flex; gap: var(--space-4); align-items: flex-start; background: var(--color-white); border: 1px solid var(--color-gray-100); border-radius: var(--radius-xl); padding: var(--space-6); margin-bottom: var(--space-8); box-shadow: var(--shadow-sm); }
        .compass-welcome__avatar { font-size: 3rem; flex-shrink: 0; }
        .compass-welcome__message h2 { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-forest-dark); margin-bottom: var(--space-2); }
        .compass-welcome__message p { font-size: var(--text-base); color: var(--color-gray-600); line-height: var(--leading-relaxed); margin-bottom: var(--space-2); }
        .compass-selector { display: flex; justify-content: center; margin: var(--space-10) 0; }
        .compass-selector__ring { position: relative; width: 100%; max-width: 700px; aspect-ratio: 1; max-height: 500px; }
        .compass-selector__center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: var(--space-1); z-index: 1; }
        .compass-selector__center-icon { font-size: 3rem; }
        .compass-selector__center-text { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-forest-dark); font-weight: 600; }
        .compass-selector__direction { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: var(--space-3); border: 2px solid var(--color-gray-100); border-radius: var(--radius-lg); background: var(--color-white); cursor: pointer; transition: all 0.3s; width: 200px; text-align: center; }
        .compass-selector__direction:hover { border-color: var(--color-forest-light); transform: scale(1.05); box-shadow: var(--shadow-md); }
        .compass-selector__direction--selected { border-color: var(--color-forest); background: rgba(45,90,61,0.05); box-shadow: var(--shadow-md); }
        .compass-selector__direction--north { top: 0; left: 50%; transform: translateX(-50%); }
        .compass-selector__direction--north:hover { transform: translateX(-50%) scale(1.05); }
        .compass-selector__direction--north.compass-selector__direction--selected { transform: translateX(-50%); }
        .compass-selector__direction--south { bottom: 0; left: 50%; transform: translateX(-50%); }
        .compass-selector__direction--south:hover { transform: translateX(-50%) scale(1.05); }
        .compass-selector__direction--south.compass-selector__direction--selected { transform: translateX(-50%); }
        .compass-selector__direction--west { top: 50%; left: 0; transform: translateY(-50%); }
        .compass-selector__direction--west:hover { transform: translateY(-50%) scale(1.05); }
        .compass-selector__direction--west.compass-selector__direction--selected { transform: translateY(-50%); }
        .compass-selector__direction--central { top: 50%; right: 0; transform: translateY(-50%); }
        .compass-selector__direction--central:hover { transform: translateY(-50%) scale(1.05); }
        .compass-selector__direction--central.compass-selector__direction--selected { transform: translateY(-50%); }
        .compass-selector__dir-emoji { font-size: 2rem; }
        .compass-selector__dir-label { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 600; color: var(--color-forest-dark); }
        .compass-selector__dir-desc { font-size: 0.7rem; color: var(--color-gray-500); line-height: 1.3; }
        @media (max-width: 768px) {
          .compass-welcome { flex-direction: column; }
          .compass-selector__ring { aspect-ratio: auto; max-height: none; display: flex; flex-direction: column; gap: var(--space-3); }
          .compass-selector__center { position: static; transform: none; margin-bottom: var(--space-2); }
          .compass-selector__direction { position: static; transform: none !important; width: 100%; }
          .compass-selector__direction--north:hover,
          .compass-selector__direction--south:hover,
          .compass-selector__direction--west:hover,
          .compass-selector__direction--central:hover { transform: scale(1.02) !important; }
        }
      `}</style>
    </div>
  );
}
