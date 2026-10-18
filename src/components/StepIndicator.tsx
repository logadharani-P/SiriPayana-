import { PLAN_STEPS, useTrip } from '../context/TripContext';
import { useTranslation } from 'react-i18next';
import './StepIndicator.css';

export default function StepIndicator() {
  const { trip, goToStep } = useTrip();
  const { t } = useTranslation();

  return (
    <div className="step-indicator">
      <div className="step-indicator__track">
        {PLAN_STEPS.map((step, i) => (
          <div key={i} className={`step-indicator__item ${i === trip.currentStep ? 'step-indicator__item--active' : ''} ${i < trip.currentStep ? 'step-indicator__item--done' : ''}`}>
            <button
              className="step-indicator__dot"
              onClick={() => i <= trip.currentStep && goToStep(i)}
              disabled={i > trip.currentStep}
              aria-label={`Step ${i + 1}: ${step.label}`}
            >
              {i < trip.currentStep ? '✓' : i + 1}
            </button>
            <span className="step-indicator__label">{step.label}</span>
            {i < PLAN_STEPS.length - 1 && <div className={`step-indicator__line ${i < trip.currentStep ? 'step-indicator__line--done' : ''}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}
