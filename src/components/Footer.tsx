import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';
import './Footer.css';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span>🧭</span>
              <span className="footer__logo-text">SiriPayana</span>
            </div>
            <p className="footer__tagline">{t('footer.tagline')}</p>
            <p className="footer__acknowledgements">{t('footer.acknowledgements')}</p>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t('footer.explore')}</h4>
            <Link to="/explore" className="footer__link">{t('nav.explore')}</Link>
            <Link to="/explore?region=north" className="footer__link">{t('compass.north')}</Link>
            <Link to="/explore?region=south" className="footer__link">{t('compass.south')}</Link>
            <Link to="/explore?region=west" className="footer__link">{t('compass.west')}</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t('footer.aboutUs')}</h4>
            <button className="footer__link" onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}>{t('nav.about')}</button>
            <Link to="/privacy" className="footer__link">{t('footer.privacy')}</Link>
            <Link to="/terms" className="footer__link">{t('footer.terms')}</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t('footer.language')}</h4>
            <div className="footer__lang-grid">
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  className={`footer__lang-btn ${lang.code === i18n.language ? 'footer__lang-btn--active' : ''}`}
                  onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('siripayana-lang', lang.code); }}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>{t('footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
