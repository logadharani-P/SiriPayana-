import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './AuthPage.css';

export default function AuthPage() {
  const { t } = useTranslation();
  const { login, register } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/signin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isLogin && !name.trim()) errs.name = t('auth.nameRequired');
    if (!email.trim()) errs.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t('auth.invalidEmail');
    if (!password) errs.password = t('auth.passwordRequired');
    else if (password.length < 8) errs.password = t('auth.passwordMin');
    if (!isLogin && password !== confirmPw) errs.confirmPw = t('auth.passwordMatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isLogin) {
      login(name, email, password);
    } else {
      register(name, email, password);
    }
    setTimeout(() => navigate('/dashboard'), 500);
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="auth-card__header">
          <span className="auth-card__logo">🧭</span>
          <h1>{isLogin ? t('auth.welcomeBack') : t('auth.joinUs')}</h1>
          <p>{isLogin ? t('auth.signIn') : t('auth.createAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card__form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')}</label>
              <input type="text" className={`form-input ${errors.name ? 'form-input--error' : ''}`} value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.fullName')} />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input type="password" className={`form-input ${errors.password ? 'form-input--error' : ''}`} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword')}</label>
              <input type="password" className={`form-input ${errors.confirmPw ? 'form-input--error' : ''}`} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder={t('auth.confirmPassword')} />
              {errors.confirmPw && <p className="form-error">{errors.confirmPw}</p>}
            </div>
          )}
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
            {isLogin ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <div className="auth-card__footer">
          {isLogin ? (
            <p>{t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link></p>
          ) : (
            <p>{t('auth.hasAccount')} <Link to="/signin">{t('auth.signIn')}</Link></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
