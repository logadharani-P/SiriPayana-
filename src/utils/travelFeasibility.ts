// Travel feasibility validation for SiriPayana
import { destinations, Destination } from '../data/destinations';
import { SelectedDestination } from '../context/TripContext';

export interface FeasibilityAssessment {
  status: 'optimal' | 'moderate' | 'tight' | 'unrealistic';
  score: number; // 0 to 100
  title: string;
  summary: string;
  totalEstimatedKm: number;
  totalEstimatedTravelHours: number;
  recommendedDays: number;
  availableDays: number;
  regionCount: number;
  regions: string[];
  warnings: string[];
  suggestions: string[];
  pacingNote: string;
}

// Major Karnataka transit hubs coordinates
const HUB_COORDINATES: Record<string, { lat: number; lng: number }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mangaluru: { lat: 12.9141, lng: 74.8560 },
  mangalore: { lat: 12.9141, lng: 74.8560 },
  hubballi: { lat: 15.3647, lng: 75.1240 },
  hubli: { lat: 15.3647, lng: 75.1240 },
  belagavi: { lat: 15.8497, lng: 74.4977 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
  kalaburagi: { lat: 17.3297, lng: 76.8343 },
  gulbarga: { lat: 17.3297, lng: 76.8343 },
  shivamogga: { lat: 13.9299, lng: 75.5681 },
  shimoga: { lat: 13.9299, lng: 75.5681 },
  udupi: { lat: 13.3409, lng: 74.7421 },
  hassan: { lat: 13.0033, lng: 76.1004 },
};

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by road winding factor ~1.3 for Karnataka terrain (ghats / curves)
  return Math.round(R * c * 1.3);
}

export function validateTravelFeasibility(
  startingCity: string,
  durationDays: number,
  travellerCount: number,
  selectedDestinations: (Destination | SelectedDestination)[]
): FeasibilityAssessment {
  const count = selectedDestinations.length;
  const availableDays = Math.max(1, durationDays || 3);

  if (count === 0) {
    return {
      status: 'optimal',
      score: 100,
      title: 'Ready for Selection',
      summary: 'Select destinations to calculate route feasibility and pacing advice.',
      totalEstimatedKm: 0,
      totalEstimatedTravelHours: 0,
      recommendedDays: availableDays,
      availableDays,
      regionCount: 0,
      regions: [],
      warnings: [],
      suggestions: ['Choose places located in adjacent districts to optimize travel time.'],
      pacingNote: 'No destinations selected yet.',
    };
  }

  // Find start city coords
  const cleanCity = (startingCity || 'Bengaluru').trim().toLowerCase();
  const startCoords =
    HUB_COORDINATES[cleanCity] ||
    HUB_COORDINATES['bengaluru'];

  // Map destinations coordinates & regions
  const destPoints = selectedDestinations.map(d => {
    const destId = 'destinationId' in d ? d.destinationId : d.id;
    const matched = destinations.find(x => x.id === destId);

    const lat = matched?.latitude ?? ('latitude' in d ? (d as Destination).latitude : d.coordinates?.lat ?? 13.0);
    const lng = matched?.longitude ?? ('longitude' in d ? (d as Destination).longitude : d.coordinates?.lng ?? 76.5);
    const region = matched?.region ?? ('region' in d ? (d as Destination).region : 'south');
    const name = d.name;
    return { lat, lng, region, name };
  });

  // Unique regions
  const uniqueRegions = Array.from(new Set(destPoints.map(p => p.region.toLowerCase())));
  const regionCount = uniqueRegions.length;

  // Calculate route distance approximation:
  // Start hub -> D1 -> D2 -> ... -> Dn -> Start hub
  let totalKm = 0;
  let currentLat = startCoords.lat;
  let currentLng = startCoords.lng;

  for (const p of destPoints) {
    totalKm += haversineDistanceKm(currentLat, currentLng, p.lat, p.lng);
    currentLat = p.lat;
    currentLng = p.lng;
  }
  // Return journey to start city
  totalKm += haversineDistanceKm(currentLat, currentLng, startCoords.lat, startCoords.lng);

  // Average vehicle speed in Karnataka (including ghats, tolls, local traffic) ~ 45 km/h
  const travelHours = Math.round((totalKm / 45) * 10) / 10;

  // Sightseeing time: average 3.5 hours per destination
  const sightseeingHours = count * 3.5;
  const totalTripHours = travelHours + sightseeingHours;

  // Comfortable active hours per day (travel + visits) ~ 8 hours/day
  const recommendedDays = Math.max(1, Math.ceil(totalTripHours / 8));

  // Determine feasibility status
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 95;

  // Check 1: Days comparison
  if (recommendedDays > availableDays) {
    const dayDeficit = recommendedDays - availableDays;
    score -= dayDeficit * 15;
    if (dayDeficit >= 3) {
      warnings.push(
        `High Travel Load: You have selected ${count} destinations across ~${totalKm} km, which comfortably takes ~${recommendedDays} days. In your ${availableDays}-day trip, this will involve extensive travel fatigue.`
      );
    } else {
      warnings.push(
        `Tight Schedule: Exploring ${count} places comfortably usually requires ~${recommendedDays} days. For your ${availableDays}-day trip, consider prioritizing key highlights.`
      );
    }
  }

  // Check 2: Geographical dispersion (crossing multiple distant regions)
  if (regionCount >= 3) {
    score -= 20;
    warnings.push(
      `Wide Geographical Spread: Destinations span ${regionCount} distinct regions (${uniqueRegions.join(', ').toUpperCase()}). Traveling between North and South Karnataka involves 8–10 hours of highway driving.`
    );
    suggestions.push(
      `Focus on 1 or 2 neighboring regions (e.g. South & West Karnataka for Mysore + Coorg + Coastal) to minimize transit time.`
    );
  }

  // Check 3: Daily destination density
  const placesPerDay = count / availableDays;
  if (placesPerDay > 3) {
    score -= 15;
    warnings.push(
      `Fast Pacing: Averaging ${placesPerDay.toFixed(1)} destinations per day may leave little time to fully experience each site.`
    );
  }

  // Suggestions
  if (uniqueRegions.includes('north') && uniqueRegions.includes('south')) {
    suggestions.push(
      `Consider high-speed Vande Bharat / Jan Shatabdi trains between Bengaluru and Hubballi/Dharwad to cross regions smoothly.`
    );
  }
  if (count > 5) {
    suggestions.push(
      `Grouping selected places by district (e.g. Mysuru district or Kodagu district) can cut daily inter-city travel in half.`
    );
  }
  if (availableDays >= recommendedDays && regionCount <= 2) {
    suggestions.push(
      `Excellent balance! Your itinerary allows sufficient time for local cuisine, heritage walks, and relaxed sightseeing.`
    );
  }

  score = Math.max(20, Math.min(100, score));

  let status: FeasibilityAssessment['status'] = 'optimal';
  let title = 'Well-Paced Itinerary';
  let summary = `Your selected destinations fit comfortably within ${availableDays} days with a balanced travel pace.`;

  if (score < 50) {
    status = 'unrealistic';
    title = 'Action Suggested: High Travel Load';
    summary = `The selected itinerary spans ~${totalKm} km across ${regionCount} regions. We recommend adjusting trip duration or focusing on fewer regions for a comfortable experience.`;
  } else if (score < 75) {
    status = 'tight';
    title = 'Tight Pacing Detected';
    summary = `This trip is feasible but brisk. You'll spend ~${travelHours} hours in transit over ${availableDays} days.`;
  } else if (score < 88) {
    status = 'moderate';
    title = 'Moderate Pacing';
    summary = `Good combination of places. Expect moderate daily travel times of around ~${Math.round(travelHours / availableDays)} hours/day.`;
  }

  const pacingNote = `~${totalKm} km total route • ~${travelHours} hrs transit • ~${recommendedDays} days recommended pace`;

  return {
    status,
    score,
    title,
    summary,
    totalEstimatedKm: totalKm,
    totalEstimatedTravelHours: travelHours,
    recommendedDays,
    availableDays,
    regionCount,
    regions: uniqueRegions,
    warnings,
    suggestions,
    pacingNote,
  };
}
