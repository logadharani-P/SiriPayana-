import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PLAN_STEPS, useTrip } from '../context/TripContext';
import './StepIndicator.css';

export default function StepIndicator() {
  const { t } = useTranslation();
  const { trip, goToStep } = useTrip();
  const location = useLocation();
  const navigate = useNavigate();

  // Route-based active step determination
  const routeIndex = PLAN_STEPS.findIndex(step => {
    if (step.path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/destinations');
    }
    return location.pathname === step.path;
  });

  const activeStep = routeIndex >= 0 ? routeIndex : Math.min(trip.currentStep, PLAN_STEPS.length - 1);

  const handleStepClick = (index: number, path: string) => {
    if (index <= activeStep) {
      goToStep(index);
      navigate(path);
    }
  };

  const getStepLabel = (step: typeof PLAN_STEPS[0]) => {
    return t(`planSteps.${step.key}`, step.label);
  };

  const currentLabel = getStepLabel(PLAN_STEPS[activeStep] || PLAN_STEPS[0]);

  return (
    <nav className="step-indicator" aria-label="Trip planning progress">
      <ol className="step-indicator__track">
        {PLAN_STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const label = getStepLabel(step);

          return (
            <li
              key={step.path}
              className={`step-indicator__item ${isActive ? 'step-indicator__item--active' : ''} ${isDone ? 'step-indicator__item--done' : ''}`}
            >
              {i < PLAN_STEPS.length - 1 && (
                <div
                  className={`step-indicator__line ${isDone ? 'step-indicator__line--done' : ''}`}
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                className="step-indicator__dot"
                onClick={() => handleStepClick(i, step.path)}
                disabled={i > activeStep}
                aria-label={`Step ${i + 1}: ${label} (${isActive ? 'Current' : isDone ? 'Completed' : 'Upcoming'})`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? (
                  <span className="step-indicator__check" aria-hidden="true">✓</span>
                ) : (
                  <span className="step-indicator__num">{i + 1}</span>
                )}
              </button>

              <div className="step-indicator__label-wrap">
                <span className="step-indicator__step-num">Step {i + 1}</span>
                <span className="step-indicator__label">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile active step banner for 375px/425px screens */}
      <div className="step-indicator__mobile-summary" aria-live="polite">
        <span className="step-indicator__mobile-pill">Step {activeStep + 1} of {PLAN_STEPS.length}</span>
        <span className="step-indicator__mobile-title">{currentLabel}</span>
      </div>
    </nav>
  );
}
