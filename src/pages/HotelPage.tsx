import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrip, SelectedHotelBooking } from '../context/TripContext';
import { getRecommendedHotels, HotelOption } from '../data/hotels';
import StepIndicator from '../components/StepIndicator';
import './HotelPage.css';

export default function HotelPage() {
  const { t } = useTranslation();
  const { trip, dispatch, goToStep } = useTrip();
  const navigate = useNavigate();

  const travelers = Math.max(trip.preferences.adults + trip.preferences.children, 1);
  const duration = Math.max(trip.preferences.duration || 3, 1);
  const requiredNights = Math.max(duration - 1, 1);
  const requiredRooms = Math.ceil(travelers / 2);

  const selectedDestinationIds = useMemo(
    () => trip.selectedDestinations.map(d => d.destinationId),
    [trip.selectedDestinations]
  );

  const recommendedHotels = useMemo(
    () => getRecommendedHotels(selectedDestinationIds, trip.preferences.budgetRange || 'mid'),
    [selectedDestinationIds, trip.preferences.budgetRange]
  );

  const isHotelSelected = (hotelId: string) => {
    return trip.selectedHotels.some(h => h.hotelId === hotelId);
  };

  const handleSelectHotel = (hotel: HotelOption) => {
    const totalCost = hotel.pricePerNight * requiredNights * requiredRooms;
    const booking: SelectedHotelBooking = {
      hotelId: hotel.id,
      destinationId: hotel.nearestDestinationId,
      destinationName: hotel.district,
      hotelName: hotel.name,
      pricePerNight: hotel.pricePerNight,
      nights: requiredNights,
      rooms: requiredRooms,
      totalCost,
      imageUrl: hotel.imageUrl,
    };
    dispatch({ type: 'SELECT_HOTEL', payload: booking });
  };

  const handleRemoveHotel = (hotelId: string) => {
    dispatch({ type: 'REMOVE_HOTEL', payload: hotelId });
  };

  const handleContinue = () => {
    // If user hasn't selected any specific hotel, select the top recommended one by default
    if (trip.selectedHotels.length === 0 && recommendedHotels.length > 0) {
      handleSelectHotel(recommendedHotels[0]);
    }
    goToStep(4); // index 4: Budget
    navigate('/plan/budget');
  };

  const handleBack = () => {
    goToStep(2); // index 2: Transport
    navigate('/plan/transport');
  };

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <div className="container">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold-light)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', fontWeight: 'var(--font-bold)' }}>
            Step 5 • Accommodation & Stays
          </span>
          <h1>🏨 Hotel & Resort Booking</h1>
          <p>
            Curated stays near your selected destinations: KSTDC Mayura Government hotels, Jungle Lodges, and boutique heritage stays.
          </p>
        </div>
      </div>

      <div className="container plan-page__body">
        <StepIndicator />

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Reservation Calculation Summary Banner */}
          <div className="hotel-calc-banner">
            <div className="hotel-calc-item">
              <span>📅 Duration</span>
              <strong>{duration} Days ({requiredNights} Nights)</strong>
            </div>
            <div className="hotel-calc-item">
              <span>👥 Travellers</span>
              <strong>{travelers} People ({trip.preferences.adults} Adults{trip.preferences.children > 0 ? `, ${trip.preferences.children} Children` : ''})</strong>
            </div>
            <div className="hotel-calc-item">
              <span>🛏️ Rooms Needed</span>
              <strong>{requiredRooms} Room{requiredRooms > 1 ? 's' : ''} (Twin Sharing)</strong>
            </div>
            <div className="hotel-calc-item">
              <span>🏷️ Travel Style</span>
              <strong>{(trip.preferences.travelStyle || 'Comfortable').toUpperCase()}</strong>
            </div>
          </div>

          {/* Selected Hotels Summary */}
          {trip.selectedHotels.length > 0 && (
            <div className="hotel-selected-summary">
              <h3>✅ Selected Accommodation ({trip.selectedHotels.length})</h3>
              <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                {trip.selectedHotels.map(h => (
                  <div key={h.hotelId} className="hotel-selected-card">
                    <img src={h.imageUrl} alt={h.hotelName} className="hotel-selected-thumb" />
                    <div style={{ flex: 1 }}>
                      <strong>{h.hotelName}</strong>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', margin: '2px 0' }}>
                        {h.rooms} Room(s) × {h.nights} Night(s) @ ₹{h.pricePerNight.toLocaleString()}/night
                      </p>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-forest)', fontWeight: 'bold' }}>
                        Total: ₹{h.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="btn btn--outline btn--sm"
                      style={{ color: '#c2410c', borderColor: '#fdba74' }}
                      onClick={() => handleRemoveHotel(h.hotelId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Hotels Grid */}
          <h2 className="form-section__title" style={{ marginTop: 'var(--space-8)' }}>
            🎯 Recommended Stays for Your Route
          </h2>

          <div className="hotel-grid">
            {recommendedHotels.map(hotel => {
              const selected = isHotelSelected(hotel.id);
              const totalEstimate = hotel.pricePerNight * requiredNights * requiredRooms;

              return (
                <div
                  key={hotel.id}
                  className={`hotel-card ${selected ? 'hotel-card--selected' : ''}`}
                >
                  <div className="hotel-card__media">
                    <img src={hotel.imageUrl} alt={hotel.name} className="hotel-card__img" />
                    <span className="hotel-card__type-badge">
                      {hotel.type.toUpperCase()}
                    </span>
                    <span className="hotel-card__rating-badge">
                      ★ {hotel.rating} ({hotel.reviewsCount})
                    </span>
                  </div>

                  <div className="hotel-card__body">
                    <div className="hotel-card__location">📍 {hotel.district} • Near {hotel.nearestDestinationId}</div>
                    <h3 className="hotel-card__name">{hotel.name}</h3>
                    <p className="hotel-card__desc">{hotel.description}</p>

                    <div className="hotel-card__amenities">
                      {hotel.amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="hotel-amenity-tag">✓ {a}</span>
                      ))}
                    </div>

                    <div className="hotel-card__pricing-box">
                      <div>
                        <span className="hotel-per-night">₹{hotel.pricePerNight.toLocaleString()}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}> / night</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', display: 'block' }}>
                          {requiredNights} night(s), {requiredRooms} room(s)
                        </span>
                        <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-forest-dark)' }}>
                          ₹{totalEstimate.toLocaleString()} Total
                        </strong>
                      </div>
                    </div>

                    <div className="hotel-card__actions">
                      {hotel.bookingUrl && (
                        <a
                          href={hotel.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--outline btn--sm"
                        >
                          Provider Page ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className={`btn btn--sm ${selected ? 'btn--danger-outline' : 'btn--primary'}`}
                        onClick={() => {
                          if (selected) {
                            handleRemoveHotel(hotel.id);
                          } else {
                            handleSelectHotel(hotel);
                          }
                        }}
                      >
                        {selected ? '✕ Remove Stay' : '✓ Select This Stay'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Actions */}
          <div className="plan-page__actions">
            <button className="btn btn--outline" onClick={handleBack}>
              ← Back to Transport
            </button>
            <button className="btn btn--primary btn--lg" onClick={handleContinue}>
              Proceed to Budget Summary (Step 6) →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
