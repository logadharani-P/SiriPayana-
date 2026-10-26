import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supportedLanguages } from '../i18n';
import './Navbar.css';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { state, signOut } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('siripayana-lang', code);
    setLangOpen(false);
  };

  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/dashboard', label: '🧭 Four Directions' },
    { to: '/explore', label: t('nav.explore') },
    { to: '/onboarding', label: '📋 Plan Trip' },
    { to: '/#how-it-works', label: t('nav.howItWorks'), isAnchor: true },
    { to: '/#about', label: t('nav.about'), isAnchor: true },
  ];

  const handleAnchorClick = (hash: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(hash.replace('/#', '#'));
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(hash.replace('/#', '#'));
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'}`} role="navigation" aria-label="Main navigation">
        <div className="navbar__container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="SiriPayana Home">
            <span className="navbar__logo-icon">🧭</span>
            <span className="navbar__logo-text">SiriPayana</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar__links">
            {navLinks.map(link => (
              link.isAnchor ? (
                <button
                  key={link.to}
                  className="navbar__link"
                  onClick={() => handleAnchorClick(link.to)}
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.to} to={link.to} className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}>
                  {link.label}
                </Link>
              )
            ))}
            {state.isAuthenticated && (
              <Link to="/dashboard" className={`navbar__link ${location.pathname === '/dashboard' ? 'navbar__link--active' : ''}`}>
                {t('nav.myTrips')}
              </Link>
            )}
          </div>

          {/* Right side controls */}
          <div className="navbar__controls">
            {/* Language Selector */}
            <div className="navbar__dropdown" ref={langRef}>
              <button
                className="navbar__lang-btn"
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Select language"
                aria-expanded={langOpen}
              >
                <span className="navbar__lang-icon">🌐</span>
                <span className="navbar__lang-name">{currentLang.nativeName}</span>
                <span className={`navbar__chevron ${langOpen ? 'navbar__chevron--up' : ''}`}>▾</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    className="navbar__dropdown-menu navbar__lang-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {supportedLanguages.map(lang => (
                      <button
                        key={lang.code}
                        className={`navbar__dropdown-item ${lang.code === i18n.language ? 'navbar__dropdown-item--active' : ''}`}
                        onClick={() => changeLanguage(lang.code)}
                      >
                        <span className="navbar__lang-native">{lang.nativeName}</span>
                        <span className="navbar__lang-english">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth buttons */}
            {state.isAuthenticated ? (
              <div className="navbar__dropdown" ref={profileRef}>
                <button
                  className="navbar__profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                >
                  <span className="navbar__avatar">{state.user?.name?.charAt(0).toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="navbar__dropdown-menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="navbar__dropdown-header">
                        <strong>{state.user?.name}</strong>
                        <small>{state.user?.email}</small>
                      </div>
                      <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/dashboard/preferences" className="navbar__dropdown-item" onClick={() => setProfileOpen(false)}>
                        {t('nav.profile')}
                      </Link>
                      <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={() => { signOut(); setProfileOpen(false); navigate('/'); }}>
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/signin" className="navbar__signin-btn">{t('nav.signIn')}</Link>
                <Link to="/register" className="btn btn--primary btn--sm">{t('nav.createAccount')}</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="navbar__mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="navbar__mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="navbar__mobile-header">
                <span className="navbar__logo-text">SiriPayana</span>
                <button className="navbar__mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
              </div>
              <div className="navbar__mobile-links">
                {navLinks.map(link => (
                  link.isAnchor ? (
                    <button key={link.to} className="navbar__mobile-link" onClick={() => handleAnchorClick(link.to)}>
                      {link.label}
                    </button>
                  ) : (
                    <Link key={link.to} to={link.to} className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  )
                ))}
                {state.isAuthenticated && (
                  <Link to="/dashboard" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
                    {t('nav.myTrips')}
                  </Link>
                )}
              </div>
              <div className="navbar__mobile-lang">
                <span className="navbar__mobile-lang-label">{t('footer.language')}</span>
                <div className="navbar__mobile-lang-grid">
                  {supportedLanguages.map(lang => (
                    <button
                      key={lang.code}
                      className={`navbar__mobile-lang-btn ${lang.code === i18n.language ? 'navbar__mobile-lang-btn--active' : ''}`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>
              <div className="navbar__mobile-auth">
                {state.isAuthenticated ? (
                  <button className="btn btn--outline" style={{ width: '100%' }} onClick={() => { signOut(); setMobileOpen(false); navigate('/'); }}>
                    {t('nav.logout')}
                  </button>
                ) : (
                  <>
                    <Link to="/signin" className="btn btn--outline" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
                      {t('nav.signIn')}
                    </Link>
                    <Link to="/register" className="btn btn--primary" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
                      {t('nav.createAccount')}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
