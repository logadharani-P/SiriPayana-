import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import StepIndicator from '../components/StepIndicator';
import './BudgetPage.css';

export default function BudgetPage() {
  const { t } = useTranslation();
  const { trip, goToStep } = useTrip();
  const navigate = useNavigate();

  const b = trip.budget;
  const travelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);
  const selectedTransport = trip.transportOptions.filter(t => t.selected);

  const handleNextToPayment = () => {
    goToStep(5); // index 5: Payment
    navigate('/plan/payment');
  };

  const handleBackToHotels = () => {
    goToStep(3); // index 3: Hotels
    navigate('/plan/hotels');
  };

  const totalTransport = b.outboundTransport + b.returnTransport + b.localTransport;
  const otherExpenses = b.food + b.activities + b.packageFee + b.taxes + b.miscellaneous;

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            {t('budgetSection.stepBadge', 'STEP 5 • EXPENSE & BUDGET ANALYSIS')}
          </span>
          <h1>💰 {t('budgetSection.title', 'Itemized Trip Budget')}</h1>
          <p>
            {t('budgetSection.subtitle', 'Comprehensive financial breakdown for your entire group across all journey legs.')}
          </p>
        </div>
      </div>

      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Top 5 Key Financial Summary Cards */}
          <div className="budget-kpi-grid">
            <div className="budget-kpi-card">
              <span className="budget-kpi-icon">🚆</span>
              <span className="budget-kpi-label">{t('budgetSection.transportTotal', 'Transport Total')}</span>
              <strong className="budget-kpi-val">₹{totalTransport.toLocaleString()}</strong>
              <span className="budget-status-pill budget-status-pill--est">{t('budgetSection.estFare', 'Estimated Fare')}</span>
            </div>

            <div className="budget-kpi-card">
              <span className="budget-kpi-icon">🏨</span>
              <span className="budget-kpi-label">{t('budgetSection.accommodationTotal', 'Accommodation Total')}</span>
              <strong className="budget-kpi-val">₹{b.accommodation.toLocaleString()}</strong>
              <span className="budget-status-pill budget-status-pill--est">{t('budgetSection.roomEstimate', 'Room Estimate')}</span>
            </div>

            <div className="budget-kpi-card">
              <span className="budget-kpi-icon">🎟️</span>
              <span className="budget-kpi-label">{t('budgetSection.entryFeesTotal', 'Entry Fees Total')}</span>
              <strong className="budget-kpi-val">₹{b.entryFees.toLocaleString()}</strong>
              <span className="budget-status-pill budget-status-pill--direct">{t('budgetSection.payAtCounter', 'Pay at Counter')}</span>
            </div>

            <div className="budget-kpi-card">
              <span className="budget-kpi-icon">🍽️</span>
              <span className="budget-kpi-label">{t('budgetSection.otherExpenses', 'Other Expenses')}</span>
              <strong className="budget-kpi-val">₹{otherExpenses.toLocaleString()}</strong>
              <span className="budget-status-pill budget-status-pill--est">{t('budgetSection.foodTaxesGuide', 'Food, Taxes & Guide')}</span>
            </div>

            <div className="budget-kpi-card budget-kpi-card--total">
              <span className="budget-kpi-icon">🏷️</span>
              <span className="budget-kpi-label" style={{ color: 'var(--color-gold-light)' }}>{t('budgetSection.grandTotal', 'Grand Total Budget')}</span>
              <strong className="budget-kpi-val" style={{ color: 'var(--color-white)', fontSize: 'var(--text-3xl)' }}>
                ₹{b.total.toLocaleString()}
              </strong>
              {travelers > 1 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('budgetSection.perPerson', { cost: b.perPerson.toLocaleString(), count: travelers, defaultValue: `≈ ₹${b.perPerson.toLocaleString()} per person (${travelers} travellers)` })}
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Transportation Breakdown */}
          <div className="budget-block">
            <div className="budget-block__header">
              <h3>🚆 1. Transportation Costs</h3>
              <span className="budget-subtotal">Subtotal: ₹{totalTransport.toLocaleString()}</span>
            </div>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Route & Journey</th>
                  <th>Mode / Operator</th>
                  <th>Pricing Basis</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Outbound Journey</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {trip.preferences.startingCity || 'Bengaluru'} → {trip.selectedDestinations[0]?.name || 'Destination'}
                    </p>
                  </td>
                  <td>
                    {selectedTransport.find(t => t.id.includes('outbound'))?.operator || 'Selected Transit Option'}
                  </td>
                  <td>{travelers} traveller(s)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{b.outboundTransport.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Return Journey</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      {trip.selectedDestinations[trip.selectedDestinations.length - 1]?.name || 'Destination'} → {trip.preferences.startingCity || 'Bengaluru'}
                    </p>
                  </td>
                  <td>
                    {selectedTransport.find(t => t.id.includes('return'))?.operator || 'Selected Return Transit'}
                  </td>
                  <td>{travelers} traveller(s)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{b.returnTransport.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Local Transfers & Transit</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      Local auto, taxi & inter-attraction connections
                    </p>
                  </td>
                  <td>Local Cabs / KSRTC Regional</td>
                  <td>{trip.preferences.duration} days estimated</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{b.localTransport.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Accommodation Breakdown */}
          <div className="budget-block">
            <div className="budget-block__header">
              <h3>🏨 2. Accommodation & Stays</h3>
              <span className="budget-subtotal">Subtotal: ₹{b.accommodation.toLocaleString()}</span>
            </div>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Stay Property</th>
                  <th>Destination / Region</th>
                  <th>Rooms & Nights</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {trip.selectedHotels.length > 0 ? (
                  trip.selectedHotels.map(h => (
                    <tr key={h.hotelId}>
                      <td>
                        <strong>{h.hotelName}</strong>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                          ₹{h.pricePerNight.toLocaleString()} per room/night
                        </p>
                      </td>
                      <td>{h.destinationName}</td>
                      <td>{h.rooms} room(s) × {h.nights} night(s)</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        ₹{h.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>
                      <strong>Recommended Karnataka Tourist Stay</strong>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                        Standard comfortable double room
                      </p>
                    </td>
                    <td>Near selected itinerary route</td>
                    <td>{Math.ceil(travelers / 2)} room(s) × {Math.max(1, trip.preferences.duration - 1)} night(s)</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      ₹{b.accommodation.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 3: Itemized Entry Fees for Every Destination */}
          <div className="budget-block">
            <div className="budget-block__header">
              <h3>🎟️ 3. Destination Entry Fees (Itemized per Place)</h3>
              <span className="budget-subtotal">Subtotal: ₹{b.entryFees.toLocaleString()}</span>
            </div>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Destination Name</th>
                  <th>Adults (Rate)</th>
                  <th>Children (Rate)</th>
                  <th style={{ textAlign: 'right' }}>Total Fee</th>
                </tr>
              </thead>
              <tbody>
                {b.destinationFeesBreakdown.length > 0 ? (
                  b.destinationFeesBreakdown.map(item => (
                    <tr key={item.destinationId}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>
                        {item.adultsCount} × {item.adultRate === 0 ? 'Free' : `₹${item.adultRate}`}
                      </td>
                      <td>
                        {item.childrenCount > 0 ? `${item.childrenCount} × ₹${item.childRate}` : '0 children'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        {item.totalFee === 0 ? 'Free' : `₹${item.totalFee.toLocaleString()}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      No destinations selected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 4: Other Living & Service Expenses */}
          <div className="budget-block">
            <div className="budget-block__header">
              <h3>🍽️ 4. Other Included Expenses & Taxes</h3>
              <span className="budget-subtotal">Subtotal: ₹{otherExpenses.toLocaleString()}</span>
            </div>

            <table className="budget-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th>Basis of Estimate</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Food & Regional Dining</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      Breakfast, lunch, dinner & authentic Karnataka snacks
                    </p>
                  </td>
                  <td>₹650/person/day × {trip.preferences.duration} days × {travelers} travellers</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{b.food.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Activities & Certified Guides</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      Coracle rides, safari vehicles & local guides
                    </p>
                  </td>
                  <td>Estimated for {trip.preferences.duration} days</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{b.activities.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Taxes & Regulatory Fees (5% GST)</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      Applicable GST on hospitality & travel bookings
                    </p>
                  </td>
                  <td>Standard 5% on taxable services</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{b.taxes.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Contingency & Miscellaneous</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
                      Water, tips, souvenirs & emergency buffer
                    </p>
                  </td>
                  <td>5% buffer estimate</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{b.miscellaneous.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Bar */}
          <div className="budget-grand-total-banner">
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', display: 'block' }}>
                Total Estimated Karnataka Trip Budget
              </span>
              <strong style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>
                ₹{b.total.toLocaleString()}
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold-light)', display: 'block', fontWeight: 'bold' }}>
                ₹{b.perPerson.toLocaleString()} per person
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255, 255, 255, 0.7)' }}>
                {travelers} Travellers • {trip.preferences.duration} Days
              </span>
            </div>
          </div>

          {/* ================= MANDATORY DEMO NEXT BUTTON ================= */}
          <div className="budget-actions-bar">
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleBackToHotels}
            >
              {t('budgetSection.backHotels', '← Back to Hotel Booking')}
            </button>

            {/* Prominently visible and working Next button */}
            <button
              type="button"
              id="budget-next-button"
              className="btn btn--primary btn--lg budget-next-btn"
              onClick={handleNextToPayment}
            >
              {t('budgetSection.proceedPayment', 'Proceed to Payment & Review (Step 6) →')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
