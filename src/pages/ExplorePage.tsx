import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { destinations, getCategoryIcon, getRegionLabel, searchDestinations } from '../data/destinations';
import type { DestinationCategory, Region } from '../data/destinations';
import './ExplorePage.css';

export default function ExplorePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all');
  const [region, setRegion] = useState<string>(searchParams.get('region') || 'all');

  const filtered = useMemo(() => {
    let result = destinations;
    if (search.trim()) result = searchDestinations(search);
    if (category !== 'all') result = result.filter(d => d.category === category);
    if (region !== 'all') result = result.filter(d => d.region === region);
    return result;
  }, [search, category, region]);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t('discover.filterAll') },
    { key: 'heritage', label: t('discover.filterHeritage') },
    { key: 'hills', label: t('discover.filterHills') },
    { key: 'nature', label: t('discover.filterNature') },
    { key: 'beaches', label: t('discover.filterBeaches') },
    { key: 'waterfalls', label: t('discover.filterWaterfalls') },
    { key: 'wildlife', label: t('discover.filterWildlife') },
  ];

  const regions: { key: string; label: string }[] = [
    { key: 'all', label: t('discover.filterAll') },
    { key: 'north', label: t('compass.north') },
    { key: 'south', label: t('compass.south') },
    { key: 'east', label: t('compass.east') },
    { key: 'west', label: t('compass.west') },
  ];

  return (
    <div className="explore-page">
      <div className="explore-page__header">
        <div className="container">
          <h1 className="explore-page__title">{t('nav.explore')}</h1>
          <p className="explore-page__subtitle">{t('discover.subtitle')}</p>
        </div>
      </div>
      <div className="container">
        <div className="explore-page__controls">
          <input
            type="text"
            className="form-input explore-page__search"
            placeholder={t('hero.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label={t('common.search')}
          />
          <div className="explore-page__filters">
            <div className="explore-page__filter-group">
              <label className="explore-page__filter-label">{t('destination.category')}</label>
              <div className="explore-page__filter-btns">
                {categories.map(c => (
                  <button
                    key={c.key}
                    className={`discover__filter-btn ${category === c.key ? 'discover__filter-btn--active' : ''}`}
                    onClick={() => setCategory(c.key)}
                  >
                    {c.key !== 'all' && <span>{getCategoryIcon(c.key as DestinationCategory)}</span>}
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="explore-page__filter-group">
              <label className="explore-page__filter-label">{t('destination.region')}</label>
              <div className="explore-page__filter-btns">
                {regions.map(r => (
                  <button
                    key={r.key}
                    className={`discover__filter-btn ${region === r.key ? 'discover__filter-btn--active' : ''}`}
                    onClick={() => setRegion(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="explore-page__count">
            {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h3 className="empty-state__title">{t('common.noResults')}</h3>
            <p className="empty-state__description">{t('common.error')}</p>
          </div>
        ) : (
          <div className="explore-page__grid">
            {filtered.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link to={`/destinations/${dest.slug}`} className="dest-card">
                  <div className="dest-card__image">
                    <img src={dest.imageUrl} alt={dest.name} loading="lazy" onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/600x400/2D5A3D/FAF7F2?text=${encodeURIComponent(dest.name)}`; }} />
                    <span className="dest-card__badge">{getCategoryIcon(dest.category)} {dest.category}</span>
                  </div>
                  <div className="dest-card__body">
                    <h3 className="dest-card__title">{dest.name}</h3>
                    <p className="dest-card__meta">📍 {dest.district} • {getRegionLabel(dest.region)} • {dest.recommendedDuration}</p>
                    <p className="dest-card__desc">{dest.shortDescription}</p>
                    <span className="dest-card__action">{t('discover.explorePlace')} →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
