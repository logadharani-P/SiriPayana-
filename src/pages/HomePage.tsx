import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { destinations, getCategoryIcon } from '../data/destinations';
import type { DestinationCategory } from '../data/destinations';
import { DESTINATION_IMAGES, KARNATAKA_FALLBACK_IMAGE } from '../data/destinationImages';
import './HomePage.css';

// Animation wrapper
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: { key: string; label: string }[] = [
    { key: 'all', label: t('discover.filterAll') },
    { key: 'heritage', label: t('discover.filterHeritage') },
    { key: 'hills', label: t('discover.filterHills') },
    { key: 'nature', label: t('discover.filterNature') },
    { key: 'beaches', label: t('discover.filterBeaches') },
    { key: 'waterfalls', label: t('discover.filterWaterfalls') },
    { key: 'wildlife', label: t('discover.filterWildlife') },
  ];

  const filteredDestinations = destinations.filter(d => {
    if (activeFilter !== 'all' && d.category !== activeFilter) return false;
    return true;
  }).slice(0, 8);

  const compassDirections = [
    { key: 'north', label: t('compass.north'), desc: t('compass.northDesc'), angle: 0, emoji: '🏛️' },
    { key: 'east', label: t('compass.east'), desc: t('compass.eastDesc'), angle: 90, emoji: '⛰️' },
    { key: 'south', label: t('compass.south'), desc: t('compass.southDesc'), angle: 180, emoji: '🏰' },
    { key: 'west', label: t('compass.west'), desc: t('compass.westDesc'), angle: 270, emoji: '🏖️' },
  ];

  const steps = [
    { icon: '👤', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { icon: '⚙️', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { icon: '🧭', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
    { icon: '🗺️', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') },
    { icon: '🚆', title: t('howItWorks.step5Title'), desc: t('howItWorks.step5Desc') },
    { icon: '💰', title: t('howItWorks.step6Title'), desc: t('howItWorks.step6Desc') },
    { icon: '📋', title: t('howItWorks.step7Title'), desc: t('howItWorks.step7Desc') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.pexels.com/photos/38605003/pexels-photo-38605003.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
            alt="Karnataka landscape - Hampi ruins"
            loading="eager"
          />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content container">
          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.form
            className="hero__search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <input
              type="text"
              className="hero__search-input"
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label={t('hero.searchPlaceholder')}
            />
            <button type="submit" className="hero__search-btn">{t('common.search')}</button>
          </motion.form>
          <motion.div
            className="hero__buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Link to="/explore" className="btn btn--primary btn--lg">{t('hero.explore')}</Link>
            <Link to="/dashboard" className="btn btn--secondary btn--lg">{t('hero.planJourney')}</Link>
          </motion.div>
          <motion.div
            className="hero__scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <span>{t('hero.scrollDown')}</span>
            <motion.div
              className="hero__scroll-arrow"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >↓</motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== PURPOSE ===== */}
      <section className="section purpose">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('purpose.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-12)' }}>
              {t('purpose.description')}
            </p>
          </FadeInSection>
          <div className="purpose__grid">
            {[
              { icon: '📍', title: t('purpose.feature1Title'), desc: t('purpose.feature1Desc') },
              { icon: '✓', title: t('purpose.feature2Title'), desc: t('purpose.feature2Desc') },
              { icon: '🌐', title: t('purpose.feature3Title'), desc: t('purpose.feature3Desc') },
              { icon: '🤖', title: t('purpose.feature4Title'), desc: t('purpose.feature4Desc') },
            ].map((f, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="purpose__card">
                  <div className="purpose__icon">{f.icon}</div>
                  <h3 className="purpose__card-title">{f.title}</h3>
                  <p className="purpose__card-desc">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPASS ===== */}
      <section className="section compass-section" id="compass">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('compass.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-12)' }}>
              {t('compass.subtitle')}
            </p>
          </FadeInSection>
          <div className="compass">
            <div className="compass__ring">
              <div className="compass__center">
                <span className="compass__center-icon">🧭</span>
                <span className="compass__center-text">Karnataka</span>
              </div>
              {compassDirections.map((dir, i) => (
                <FadeInSection key={dir.key} delay={i * 0.15}>
                  <button
                    className={`compass__direction compass__direction--${dir.key}`}
                    onClick={() => navigate(`/explore?region=${dir.key}`)}
                    aria-label={t('compass.explore', { direction: dir.label })}
                  >
                    <span className="compass__dir-emoji">{dir.emoji}</span>
                    <span className="compass__dir-label">{dir.label}</span>
                    <span className="compass__dir-desc">{dir.desc}</span>
                  </button>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DISCOVER ===== */}
      <section className="section discover" id="discover">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('discover.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-8)' }}>
              {t('discover.subtitle')}
            </p>
          </FadeInSection>
          <FadeInSection>
            <div className="discover__filters">
              {filters.map(f => (
                <button
                  key={f.key}
                  className={`discover__filter-btn ${activeFilter === f.key ? 'discover__filter-btn--active' : ''}`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.key !== 'all' && <span>{getCategoryIcon(f.key as DestinationCategory)}</span>}
                  {f.label}
                </button>
              ))}
            </div>
          </FadeInSection>
          <div className="discover__grid">
            {filteredDestinations.map((dest, i) => {
              const img = DESTINATION_IMAGES[dest.id]?.url || dest.imageUrl || KARNATAKA_FALLBACK_IMAGE;
              return (
                <FadeInSection key={dest.id} delay={i * 0.08}>
                  <Link to={`/destinations/${dest.slug}`} className="dest-card">
                    <div className="dest-card__image">
                      <img
                        src={img}
                        alt={dest.name}
                        loading="lazy"
                        onError={e => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = KARNATAKA_FALLBACK_IMAGE;
                        }}
                      />
                      <span className="dest-card__badge">{getCategoryIcon(dest.category)} {dest.category}</span>
                    </div>
                    <div className="dest-card__body">
                      <h3 className="dest-card__title">{dest.name}</h3>
                      <p className="dest-card__meta">📍 {dest.district} • {dest.recommendedDuration}</p>
                      <p className="dest-card__desc">{dest.shortDescription}</p>
                      <span className="dest-card__action">{t('discover.explorePlace')} →</span>
                    </div>
                  </Link>
                </FadeInSection>
              );
            })}
          </div>
          <FadeInSection className="text-center" delay={0.2}>
            <Link to="/explore" className="btn btn--outline" style={{ marginTop: 'var(--space-8)' }}>
              {t('discover.viewAll')}
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ===== STORIES ===== */}
      <section className="section stories" id="stories">
        <div className="container">
          <div className="stories__layout">
            <FadeInSection className="stories__text">
              <h2 className="section-title">{t('stories.title')}</h2>
              <p className="section-subtitle">{t('stories.subtitle')}</p>
              <div className="stories__features">
                {[
                  { icon: '📜', label: t('stories.history') },
                  { icon: '🏛️', label: t('stories.culture') },
                  { icon: 'ℹ️', label: t('stories.visitor') },
                  { icon: '📍', label: t('stories.nearby') },
                  { icon: '🗺️', label: t('stories.travel') },
                ].map((f, i) => (
                  <div key={i} className="stories__feature-item">
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>
            <FadeInSection className="stories__preview" delay={0.2}>
              <div className="stories__card">
                <img src="https://images.pexels.com/photos/39543753/pexels-photo-39543753.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop" alt="Mysuru Palace" loading="lazy" />
                <div className="stories__card-content">
                  <h3>Mysuru Palace</h3>
                  <p>Built in 1912, the Indo-Saracenic palace blends Hindu, Muslim, Rajput, and Gothic architecture...</p>
                  <Link to="/destinations/mysuru-palace" className="btn btn--sm btn--primary">{t('discover.explorePlace')}</Link>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ===== BUDGET ===== */}
      <section className="section budget-section">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('budget.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-10)' }}>
              {t('budget.subtitle')}
            </p>
          </FadeInSection>
          <FadeInSection>
            <div className="budget-preview">
              <div className="budget-preview__modes">
                {[
                  { icon: '🚆', label: t('budget.train'), est: '₹350–800' },
                  { icon: '🚌', label: t('budget.bus'), est: '₹200–600' },
                  { icon: '✈️', label: t('budget.flight'), est: '₹2,500–8,000' },
                  { icon: '🚗', label: t('budget.car'), est: '₹1,500–5,000' },
                ].map((mode, i) => (
                  <div key={i} className="budget-preview__mode">
                    <span className="budget-preview__mode-icon">{mode.icon}</span>
                    <span className="budget-preview__mode-label">{mode.label}</span>
                    <span className="budget-preview__mode-est">{mode.est}</span>
                    <span className="budget-preview__mode-note">{t('budget.perPerson')}</span>
                  </div>
                ))}
              </div>
              <p className="budget-preview__disclaimer">
                <em>* {t('transport.note')}</em>
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== AI ASSISTANT ===== */}
      <section className="section ai-section" id="ai-assistant">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('ai.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-10)' }}>
              {t('ai.subtitle')}
            </p>
          </FadeInSection>
          <FadeInSection>
            <div className="ai-preview">
              <div className="ai-preview__chat">
                <div className="ai-preview__messages">
                  <div className="ai-preview__msg ai-preview__msg--user">
                    <p>{t('ai.sampleQ1')}</p>
                  </div>
                  <div className="ai-preview__msg ai-preview__msg--ai">
                    <div className="ai-preview__ai-avatar">🧭</div>
                    <p>Hampi was the capital of the Vijayanagara Empire (1336–1565 CE), one of the richest and largest empires in the world. At its peak, it had a population of around 500,000. The ruins spread over 26 sq km and became a UNESCO World Heritage Site in 1986.</p>
                  </div>
                </div>
              </div>
              <div className="ai-preview__samples">
                <span className="ai-preview__samples-label">{t('ai.askSiriPayana')}:</span>
                <div className="ai-preview__sample-btns">
                  {[t('ai.sampleQ2'), t('ai.sampleQ3'), t('ai.sampleQ4'), t('ai.sampleQ5')].map((q, i) => (
                    <Link key={i} to={`/chat?q=${encodeURIComponent(q)}`} className="ai-preview__sample-btn">{q}</Link>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('howItWorks.title')}</h2>
            <p className="section-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-12)' }}>
              {t('howItWorks.subtitle')}
            </p>
          </FadeInSection>
          <div className="steps">
            {steps.map((step, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <div className="steps__item">
                  <div className="steps__number">{i + 1}</div>
                  <div className="steps__icon">{step.icon}</div>
                  <h3 className="steps__title">{step.title}</h3>
                  <p className="steps__desc">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section about" id="about">
        <div className="container container--narrow">
          <FadeInSection className="text-center">
            <h2 className="section-title">{t('aboutSection.title')}</h2>
            <p className="about__subtitle">{t('aboutSection.subtitle')}</p>
            <p className="about__description">{t('aboutSection.description')}</p>
            <div className="about__mission">
              <h3>{t('aboutSection.mission')}</h3>
              <p>{t('aboutSection.missionText')}</p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section cta-section">
        <div className="container text-center">
          <FadeInSection>
            <h2 className="cta-section__title">{t('cta.title')}</h2>
            <p className="cta-section__subtitle">{t('cta.subtitle')}</p>
            <div className="cta-section__buttons">
              <Link to="/explore" className="btn btn--primary btn--lg">{t('cta.startExploring')}</Link>
              <Link to="/dashboard" className="btn btn--outline btn--lg">{t('cta.planJourney')}</Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
