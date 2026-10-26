import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './AuthPage.css';

export default function AuthPage() {
  const { t } = useTranslation();
<<<<<<< HEAD
  const { signIn, signUp, showToast } = useApp();
=======
  const { login, register, dispatch, showToast } = useApp();
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/signin' || location.pathname === '/login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!isLogin && !name.trim()) errs.name = t('auth.nameRequired') || 'Full name is required';
    if (!email.trim()) errs.email = t('auth.emailRequired') || 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t('auth.invalidEmail') || 'Please enter a valid email';
    if (!password) errs.password = t('auth.passwordRequired') || 'Password is required';
    else if (password.length < 6) errs.password = t('auth.passwordMin') || 'Password must be at least 6 characters';
    if (!isLogin && password !== confirmPw) errs.confirmPw = t('auth.passwordMatch') || 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setErrors({ form: error });
          showToast(error, 'error');
          return;
        }
        showToast('Signed in successfully!', 'success');
        navigate('/plan/preferences');
      } else {
        const { error } = await signUp(name, email, password);
        if (error) {
          setErrors({ form: error });
          showToast(error, 'error');
          return;
        }
        showToast('Account created successfully!', 'success');
        navigate('/plan/preferences');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
=======
    setTimeout(() => navigate('/onboarding'), 400);
  };

  const handleDemoGuestLogin = () => {
    dispatch({
      type: 'LOGIN',
      payload: {
        id: 'demo-user-1',
        name: 'Karnataka Explorer',
        email: 'explorer@siripayana.karnataka.gov.in',
        createdAt: new Date().toISOString(),
      },
    });
    showToast('Signed in with Demo Guest session', 'success');
    navigate('/onboarding');
>>>>>>> 8c2d4d8 (Enhancement of SiriPayana)
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="auth-card__header">
          <span className="auth-card__logo">🧭</span>
          <h1>{isLogin ? t('auth.welcomeBack') : t('auth.joinUs')}</h1>
          <p>{isLogin ? t('auth.signIn') : t('auth.createAccount')}</p>
        </div>

        {/* Demo Fast Login Banner */}
        <div style={{
          background: 'rgba(196, 152, 42, 0.12)',
          border: '1px solid var(--color-gold)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-forest-dark)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
            ⚡ Presenter / Evaluation Demo Mode
          </p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            style={{ width: '100%', borderColor: 'var(--color-forest)', color: 'var(--color-forest-dark)' }}
            onClick={handleDemoGuestLogin}
          >
            🚀 Continue Demo as Guest →
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-card__form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')}</label>
              <input type="text" className={`form-input ${errors.name ? 'form-input--error' : ''}`} value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.fullName')} disabled={loading} />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} disabled={loading} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className={`form-input ${errors.password ? 'form-input--error' : ''}`} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} disabled={loading} style={{ paddingRight: '3rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-gray-500)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword')}</label>
              <input type={showPassword ? 'text' : 'password'} className={`form-input ${errors.confirmPw ? 'form-input--error' : ''}`} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder={t('auth.confirmPassword')} disabled={loading} />
              {errors.confirmPw && <p className="form-error">{errors.confirmPw}</p>}
            </div>
          )}
          {errors.form && <div className="form-error" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-error-light, #fef2f2)', border: '1px solid var(--color-error, #ef4444)' }}>{errors.form}</div>}
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait…' : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
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
