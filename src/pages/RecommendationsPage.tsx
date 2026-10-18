import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { destinations, getCategoryIcon } from '../data/destinations';
import type { SelectedDestination } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep, prevStep } = useTrip();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);

  // Generate recommendations based on preferences
  const recommended = useMemo(() => {
    const prefs = trip.preferences;
    return destinations
      .map(dest => {
        let score = 0;
        if (prefs.interests.includes(dest.category as any)) score += 10;
        if (prefs.interests.includes('mixed')) score += 5;
        if (prefs.travelStyle === 'budget' && (dest.localExpenseEstimate || 0) < 2000) score += 3;
        if (prefs.travelStyle === 'premium' && (dest.localExpenseEstimate || 0) > 2000) score += 3;
        // Duration match
        const durationDays = parseInt(dest.recommendedDuration) || 1;
        if (durationDays <= prefs.duration) score += 2;
        return { dest, score, reason: getReasonText(dest, prefs) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [trip.preferences]);

  const isSelected = (id: string) => trip.selectedDestinations.some(d => d.destinationId === id);

  const toggleDestination = (dest: typeof destinations[0], reason: string) => {
    if (isSelected(dest.id)) {
      dispatch({ type: 'REMOVE_DESTINATION', payload: dest.id });
    } else {
      const sel: SelectedDestination = {
        destinationId: dest.id, slug: dest.slug, name: dest.name,
        imageUrl: dest.imageUrl, duration: dest.recommendedDuration, reason,
      };
      dispatch({ type: 'ADD_DESTINATION', payload: sel });
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    // Demo AI response
    setTimeout(() => {
      const response = getDemoResponse(q);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 600);
  };

  const handleContinue = () => {
    if (trip.selectedDestinations.length === 0) return;
    nextStep();
    navigate('/plan/package');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>🤖 {t('ai.title')}</h1>
          <p>{t('ai.subtitle')}</p>
          <span className="demo-badge">⚡ {t('ai.demoMode')}</span>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Selected summary */}
          {trip.selectedDestinations.length > 0 && (
            <div className="reco-selected">
              <h3>✅ Selected Destinations ({trip.selectedDestinations.length})</h3>
              <div className="reco-selected__chips">
                {trip.selectedDestinations.map(d => (
                  <span key={d.destinationId} className="reco-selected__chip">
                    {d.name}
                    <button onClick={() => dispatch({ type: 'REMOVE_DESTINATION', payload: d.destinationId })} aria-label={`Remove ${d.name}`}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations grid */}
          <h2 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)' }}>
            🎯 Recommended for You
          </h2>
          <div className="reco-grid">
            {recommended.map(({ dest, reason }, i) => (
              <motion.div key={dest.id} className={`reco-card ${isSelected(dest.id) ? 'reco-card--selected' : ''}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="reco-card__img">
                  <img src={dest.imageUrl} alt={dest.name} loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x250/2D5A3D/FAF7F2?text=${encodeURIComponent(dest.name)}`; }} />
                  <span className="reco-card__badge">{getCategoryIcon(dest.category)} {dest.category}</span>
                </div>
                <div className="reco-card__body">
                  <h3>{dest.name}</h3>
                  <p className="reco-card__meta">📍 {dest.district} • ⏱️ {dest.recommendedDuration}</p>
                  <p className="reco-card__reason">{reason}</p>
                  <div className="reco-card__actions">
                    <button className={`btn btn--sm ${isSelected(dest.id) ? 'btn--outline' : 'btn--primary'}`}
                      onClick={() => toggleDestination(dest, reason)}>
                      {isSelected(dest.id) ? '✓ Selected' : '+ Add'}
                    </button>
                    <Link to={`/destinations/${dest.slug}`} className="btn btn--sm btn--outline" target="_blank">View Details ↗</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat section */}
          <div className="reco-chat" style={{ marginTop: 'var(--space-10)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)' }}>
              💬 Ask the AI Assistant
            </h2>
            <div className="reco-chat__messages">
              {chatMessages.length === 0 && (
                <p style={{ color: 'var(--color-gray-400)', textAlign: 'center', padding: 'var(--space-6)' }}>
                  Ask about destinations, activities, best times to visit, or get personalized suggestions...
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`reco-chat__msg reco-chat__msg--${msg.role}`}>
                  {msg.role === 'ai' && <span className="reco-chat__avatar">🧭</span>}
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <form className="reco-chat__input" onSubmit={e => { e.preventDefault(); handleChatSend(); }}>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about Karnataka destinations..." className="form-input" />
              <button type="submit" className="btn btn--primary btn--sm" disabled={!chatInput.trim()}>Send</button>
            </form>
          </div>

          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => { prevStep(); navigate('/plan/preferences'); }}>
              ← {t('common.back')}
            </button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}
              disabled={trip.selectedDestinations.length === 0}>
              {t('common.continue')} → ({trip.selectedDestinations.length} selected)
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .reco-selected { background: rgba(45,90,61,0.04); border: 1px solid var(--color-forest-light); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-6); }
        .reco-selected h3 { font-size: var(--text-sm); color: var(--color-forest-dark); margin-bottom: var(--space-2); }
        .reco-selected__chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .reco-selected__chip { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-1) var(--space-3); background: var(--color-forest); color: var(--color-white); border-radius: var(--radius-full); font-size: var(--text-xs); }
        .reco-selected__chip button { background: none; border: none; color: var(--color-white); cursor: pointer; font-size: var(--text-base); line-height: 1; }
        .reco-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-5); }
        .reco-card { border: 2px solid var(--color-gray-100); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-white); transition: all var(--transition-base); }
        .reco-card:hover { box-shadow: var(--shadow-md); }
        .reco-card--selected { border-color: var(--color-forest); }
        .reco-card__img { position: relative; aspect-ratio: 16/10; overflow: hidden; }
        .reco-card__img img { width: 100%; height: 100%; object-fit: cover; }
        .reco-card__badge { position: absolute; top: var(--space-2); left: var(--space-2); padding: 2px var(--space-2); background: rgba(30,61,42,0.85); color: var(--color-white); font-size: var(--text-xs); border-radius: var(--radius-full); text-transform: capitalize; }
        .reco-card__body { padding: var(--space-4); }
        .reco-card__body h3 { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-forest-dark); margin-bottom: var(--space-1); }
        .reco-card__meta { font-size: var(--text-xs); color: var(--color-gray-500); margin-bottom: var(--space-2); }
        .reco-card__reason { font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-3); line-height: var(--leading-relaxed); }
        .reco-card__actions { display: flex; gap: var(--space-2); }
        .reco-chat__messages { background: var(--color-ivory); border-radius: var(--radius-lg); padding: var(--space-4); min-height: 120px; max-height: 300px; overflow-y: auto; margin-bottom: var(--space-3); display: flex; flex-direction: column; gap: var(--space-3); }
        .reco-chat__msg { max-width: 80%; padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); line-height: var(--leading-relaxed); }
        .reco-chat__msg--user { align-self: flex-end; background: var(--color-forest); color: var(--color-white); }
        .reco-chat__msg--ai { align-self: flex-start; background: var(--color-white); display: flex; gap: var(--space-2); }
        .reco-chat__avatar { font-size: 1.2rem; }
        .reco-chat__input { display: flex; gap: var(--space-2); }
        .reco-chat__input .form-input { flex: 1; }
      `}</style>
    </div>
  );
}

function getReasonText(dest: typeof destinations[0], prefs: any): string {
  const reasons: string[] = [];
  if (prefs.interests.includes(dest.category)) reasons.push(`Matches your interest in ${dest.category}`);
  if (prefs.travelStyle === 'budget' && (dest.localExpenseEstimate || 0) < 2000) reasons.push('Budget-friendly');
  if (prefs.travelStyle === 'premium') reasons.push('Premium experience');
  if (reasons.length === 0) reasons.push('Popular Karnataka destination');
  return reasons.join(' • ');
}

function getDemoResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('hampi')) return '🏛️ Hampi is perfect for heritage lovers! It was the capital of the Vijayanagara Empire. I recommend spending 2-3 days here. Best visited October-February.';
  if (q.includes('beach') || q.includes('gokarna')) return '🏖️ For beaches, I recommend Gokarna (Om Beach, Kudle Beach) for a quieter experience, or Murudeshwar for the famous Shiva statue. Both are on the west coast.';
  if (q.includes('hill') || q.includes('coorg') || q.includes('chikmagalur')) return '⛰️ Coorg and Chikmagalur are excellent hill station choices! Coorg offers coffee plantations and Abbey Falls, while Chikmagalur has Mullayanagiri peak.';
  if (q.includes('waterfall') || q.includes('jog')) return '💧 Jog Falls is Indias second-highest waterfall — most spectacular during monsoon (July-Oct). Abbey Falls in Coorg is beautiful year-round.';
  if (q.includes('budget')) return '💰 For a budget trip, consider: Hampi (₹1,500/day), Gokarna (₹1,800/day), or Nandi Hills (day trip from Bangalore, ₹500).';
  return `🧭 Great question! Based on your preferences, I'd suggest exploring Karnataka's ${query.includes('nature') ? 'Western Ghats region' : 'diverse attractions'}. Would you like specific destination suggestions?`;
}
