import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import type { ItineraryDay, BudgetBreakdown } from '../context/TripContext';
import { destinations as allDests } from '../data/destinations';
import StepIndicator from '../components/StepIndicator';
import '../components/StepIndicator.css';

function generateItinerary(trip: ReturnType<typeof useTrip>['trip']): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const startDate = trip.preferences.startDate ? new Date(trip.preferences.startDate) : new Date();
  const dests = trip.selectedDestinations;
  const numDays = trip.preferences.duration || 3;

  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const destIdx = Math.min(i, dests.length - 1);
    const dest = dests[destIdx];
    const fullDest = dest ? allDests.find(d => d.id === dest.destinationId) : null;

    days.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      destinationId: dest?.destinationId || '',
      destinationName: dest?.name || 'Free Day',
      activities: [
        { id: `${i}-1`, time: '08:00 AM', title: i === 0 ? `Travel from ${trip.preferences.startingCity}` : 'Morning Activities', description: fullDest ? `Explore ${fullDest.name}` : 'Leisure time', duration: '3 hours', cost: fullDest?.entryFee?.indianAdult || 0, type: i === 0 ? 'travel' : 'sightseeing' },
        { id: `${i}-2`, time: '12:00 PM', title: 'Lunch', description: 'Local cuisine', duration: '1 hour', cost: 300, type: 'food' },
        { id: `${i}-3`, time: '02:00 PM', title: fullDest ? (fullDest.specialAttractions[0] || 'Afternoon Exploration') : 'Afternoon Exploration', description: fullDest ? fullDest.shortDescription.slice(0, 100) + '...' : 'Explore the area', duration: '3 hours', cost: 0, type: 'sightseeing' },
        { id: `${i}-4`, time: '07:00 PM', title: 'Dinner & Rest', description: 'Evening meal and accommodation', duration: '2 hours', cost: 500, type: 'food' },
      ],
      transport: i === 0 ? `From ${trip.preferences.startingCity}` : 'Local transport',
      accommodation: trip.preferences.travelStyle === 'premium' ? 'Premium Hotel' : trip.preferences.travelStyle === 'comfortable' ? 'Mid-range Hotel' : 'Budget Stay',
      dailyBudget: trip.preferences.travelStyle === 'premium' ? 5000 : trip.preferences.travelStyle === 'comfortable' ? 3000 : 1800,
      notes: '',
    });
  }
  return days;
}

function calculateBudget(trip: ReturnType<typeof useTrip>['trip']): BudgetBreakdown {
  const travelers = trip.preferences.adults + trip.preferences.children;
  const days = trip.preferences.duration || 3;
  const style = trip.preferences.travelStyle;
  const selectedTransport = trip.transportOptions.filter(t => t.selected);

  const outbound = selectedTransport.find(t => t.id.includes('outbound'))?.groupFare || 800 * travelers;
  const returnFare = selectedTransport.find(t => t.id.includes('return'))?.groupFare || 800 * travelers;
  const localPerDay = style === 'premium' ? 800 : style === 'comfortable' ? 400 : 200;
  const accomPerNight = style === 'premium' ? 4000 : style === 'comfortable' ? 2000 : 800;
  const foodPerDay = style === 'premium' ? 1500 : style === 'comfortable' ? 800 : 400;

  const entryFees = trip.selectedDestinations.reduce((sum, d) => {
    const full = allDests.find(dd => dd.id === d.destinationId);
    return sum + (full?.entryFee?.indianAdult || 0) * travelers;
  }, 0);

  const packageFees: Record<string, number> = { normal: 499, silver: 999, premium: 1999 };
  const pkgFee = packageFees[trip.selectedPackage || 'normal'] || 0;

  const accommodation = accomPerNight * (days - 1);
  const food = foodPerDay * days * travelers;
  const local = localPerDay * days;
  const activities = 500 * days;
  const misc = Math.round((outbound + returnFare + accommodation + food) * 0.05);
  const contingency = Math.round((outbound + returnFare + accommodation + food) * 0.1);

  const total = outbound + returnFare + local + accommodation + food + entryFees + activities + pkgFee + misc + contingency;

  return {
    outboundTransport: outbound,
    returnTransport: returnFare,
    localTransport: local,
    accommodation,
    food,
    entryFees,
    destinationFeesBreakdown: [],
    activities,
    packageFee: pkgFee,
    miscellaneous: misc,
    contingency,
    taxes: Math.round((accommodation + outbound + returnFare + local + pkgFee) * 0.05),
    total,
    perPerson: Math.round(total / Math.max(travelers, 1)),
  };
}

export default function ItineraryPage() {
  const { t } = useTranslation();
  const { trip, dispatch, nextStep, prevStep } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    if (trip.itinerary.length === 0 && trip.selectedDestinations.length > 0) {
      dispatch({ type: 'SET_ITINERARY', payload: generateItinerary(trip) });
    }
    dispatch({ type: 'SET_BUDGET', payload: calculateBudget(trip) });
  }, [trip.selectedDestinations, trip.preferences, trip.transportOptions, trip.selectedPackage]);

  const budget = trip.budget;
  const travelers = trip.preferences.adults + trip.preferences.children;

  const handleRegenerate = () => {
    dispatch({ type: 'SET_ITINERARY', payload: generateItinerary(trip) });
  };

  const removeDay = (day: number) => {
    dispatch({ type: 'SET_ITINERARY', payload: trip.itinerary.filter(d => d.day !== day).map((d, i) => ({ ...d, day: i + 1 })) });
  };

  const handleContinue = () => {
    nextStep();
    navigate('/plan/summary');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <h1>📋 Itinerary & Budget</h1>
          <p>Your day-by-day plan and cost breakdown</p>
        </div>
      </div>
      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)', alignItems: 'start' }}>
            {/* Itinerary */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)' }}>📅 Day-by-Day Plan</h2>
                <button className="btn btn--outline btn--sm" onClick={handleRegenerate}>🔄 Regenerate</button>
              </div>

              {trip.itinerary.map(day => (
                <div key={day.day} style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)', fontSize: 'var(--text-lg)' }}>
                        Day {day.day} — {day.destinationName}
                      </h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{day.date} • {day.accommodation} • ₹{day.dailyBudget.toLocaleString()}/day</p>
                    </div>
                    {trip.itinerary.length > 1 && (
                      <button className="btn btn--outline btn--sm" onClick={() => removeDay(day.day)} style={{ color: 'var(--color-error)' }}>✕</button>
                    )}
                  </div>
                  {day.activities.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-50)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', minWidth: 70 }}>{act.time}</span>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-800)' }}>{act.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{act.description} • {act.duration}{act.cost > 0 ? ` • ₹${act.cost}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Budget sidebar */}
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', position: 'sticky', top: 'calc(var(--nav-height) + var(--space-4))' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-forest-dark)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: '2px solid var(--color-gold-light)' }}>
                💰 Budget Breakdown
              </h3>
              {[
                ['Outbound Transport', budget.outboundTransport],
                ['Return Transport', budget.returnTransport],
                ['Local Transport', budget.localTransport],
                ['Accommodation', budget.accommodation],
                ['Food', budget.food],
                ['Entry Fees', budget.entryFees],
                ['Activities', budget.activities],
                ['Package Fee', budget.packageFee],
                ['Miscellaneous', budget.miscellaneous],
                ['Contingency (10%)', budget.contingency],
              ].map(([label, amount]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-gray-50)' }}>
                  <span style={{ color: 'var(--color-gray-600)' }}>{label as string}</span>
                  <span style={{ fontWeight: 'var(--font-semibold)' }}>₹{(amount as number).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', marginTop: 'var(--space-2)', borderTop: '2px solid var(--color-forest)', fontFamily: 'var(--font-display)' }}>
                <strong style={{ color: 'var(--color-forest-dark)' }}>Total</strong>
                <strong style={{ fontSize: 'var(--text-xl)', color: 'var(--color-forest-dark)' }}>₹{budget.total.toLocaleString()}</strong>
              </div>
              {travelers > 1 && (
                <p style={{ textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                  ₹{budget.perPerson.toLocaleString()} per person ({travelers} travelers)
                </p>
              )}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginTop: 'var(--space-3)' }}>
                ⚠️ Estimates based on typical costs. Verify actual prices before booking.
              </p>
            </div>
          </div>

          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={() => { prevStep(); navigate('/plan/transport'); }}>← {t('common.back')}</button>
            <div className="plan-page__actions-right">
              <button className="btn btn--outline" onClick={() => dispatch({ type: 'MARK_SAVED' })}>💾 Save Trip</button>
              <button className="btn btn--primary btn--lg" onClick={handleContinue}>{t('common.continue')} →</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
