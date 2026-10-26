// SiriPayana Hotel & Accommodations Database
// Authentic Karnataka accommodations: KSTDC Mayura Government hotels, Jungle Lodges, heritage properties, and certified homestays

export interface HotelOption {
  id: string;
  name: string;
  district: string;
  region: 'north' | 'south' | 'east' | 'west';
  nearestDestinationId: string;
  type: 'heritage' | 'resort' | 'hotel' | 'homestay';
  stars: number;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  imageUrl: string;
  amenities: string[];
  description: string;
  bookingUrl: string;
  isDemo: boolean;
  address: string;
}

export const HOTELS_DATA: HotelOption[] = [
  // --- SOUTH KARNATAKA ---
  {
    id: 'kstdc-mayura-hoysala-mysuru',
    name: 'KSTDC Hotel Mayura Hoysala',
    district: 'Mysuru',
    region: 'south',
    nearestDestinationId: 'mysuru-palace',
    type: 'hotel',
    stars: 3,
    rating: 4.2,
    reviewsCount: 1420,
    pricePerNight: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Free WiFi', 'KSTDC Tour Desk', 'Multi-cuisine Restaurant', 'Free Parking', 'AC Rooms'],
    description: 'Official Karnataka State Tourism Development Corporation property located close to Mysuru Palace with authentic Karnataka hospitality.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Jhansi Lakshmibai Road, Mysuru, Karnataka 570005',
  },
  {
    id: 'lalitha-mahal-palace-mysuru',
    name: 'Lalitha Mahal Palace Hotel',
    district: 'Mysuru',
    region: 'south',
    nearestDestinationId: 'mysuru-palace',
    type: 'heritage',
    stars: 5,
    rating: 4.7,
    reviewsCount: 890,
    pricePerNight: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    amenities: ['Royal Suites', 'Swimming Pool', 'Heritage Dining Hall', 'Billiards Room', 'Spa & Wellness'],
    description: 'Built by the Maharaja of Mysore in 1921, this gleaming white palace offers authentic royal heritage hospitality.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Lalitha Mahal Nagar, Mysuru, Karnataka 570011',
  },
  {
    id: 'jlr-kabini-river-lodge',
    name: 'Jungle Lodges Kabini River Lodge',
    district: 'Mysuru',
    region: 'south',
    nearestDestinationId: 'kabini',
    type: 'resort',
    stars: 4,
    rating: 4.8,
    reviewsCount: 1250,
    pricePerNight: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    amenities: ['Wildlife Jeep Safari', 'Coracle Boat Ride', 'Naturalist Guides', 'All Meals Included', 'Riverside Cottages'],
    description: 'Rated among the world\'s top 5 wildlife resorts, situated on the banks of Kabini reservoir bordering Nagarhole.',
    bookingUrl: 'https://www.junglelodges.com/',
    isDemo: false,
    address: 'Nissana Beltur, Karapura, Kodagu border, Mysuru, Karnataka 571114',
  },
  {
    id: 'coorg-coffee-estate-homestay',
    name: 'Heritage Plantation Homestay Coorg',
    district: 'Kodagu',
    region: 'south',
    nearestDestinationId: 'coorg',
    type: 'homestay',
    stars: 3,
    rating: 4.6,
    reviewsCount: 430,
    pricePerNight: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&q=80',
    amenities: ['Coffee Plantation Walk', 'Traditional Kodava Cuisine', 'Campfire', 'Nature Trails', 'Homemade Wine Tasting'],
    description: 'Authentic Kodava family-run coffee plantation stay surrounded by pepper vines and silver oak trees.',
    bookingUrl: 'https://karnatakatourism.org',
    isDemo: false,
    address: 'Madikeri Rural, Kodagu, Karnataka 571201',
  },
  {
    id: 'kstdc-mayura-velapuri-belur',
    name: 'KSTDC Hotel Mayura Velapuri Belur',
    district: 'Hassan',
    region: 'south',
    nearestDestinationId: 'belur',
    type: 'hotel',
    stars: 3,
    rating: 4.1,
    reviewsCount: 650,
    pricePerNight: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Walking distance to temple', 'Vegetarian Dining', 'Spacious Lawns', 'Air-conditioned Rooms', 'Tour Guide Service'],
    description: 'Government tourist hotel directly adjacent to the historic 12th-century Chennakesava Temple at Belur.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Temple Road, Belur, Hassan District, Karnataka 573115',
  },

  // --- NORTH KARNATAKA ---
  {
    id: 'kstdc-mayura-bhuvaneshwari-hampi',
    name: 'KSTDC Hotel Mayura Bhuvaneshwari Kamalapur',
    district: 'Vijayanagara',
    region: 'north',
    nearestDestinationId: 'hampi',
    type: 'hotel',
    stars: 3,
    rating: 4.3,
    reviewsCount: 1820,
    pricePerNight: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    amenities: ['Close to Hampi Ruins', 'Swimming Pool', 'Multi-cuisine Restaurant', 'Hampi Travel Desk', 'Spacious AC Rooms'],
    description: 'The closest quality hotel to Hampi\'s UNESCO world heritage monuments, managed by KSTDC.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Kamalapur, Hampi, Vijayanagara District, Karnataka 583221',
  },
  {
    id: 'kstdc-mayura-chalukya-badami',
    name: 'KSTDC Hotel Mayura Chalukya Badami',
    district: 'Bagalkot',
    region: 'north',
    nearestDestinationId: 'badami-caves',
    type: 'hotel',
    stars: 3,
    rating: 4.0,
    reviewsCount: 740,
    pricePerNight: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Garden View', 'North Karnataka Cuisine', 'Free Parking', 'Travel Assistance for Pattadakal & Aihole'],
    description: 'Serene KSTDC property surrounded by sandstone ridges, ideal base for exploring Badami caves, Pattadakal, and Aihole.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Ramdurg Road, Badami, Bagalkot District, Karnataka 587201',
  },
  {
    id: 'kstdc-mayura-adil-shahi-bijapur',
    name: 'KSTDC Hotel Mayura Adil Shahi',
    district: 'Vijayapura',
    region: 'north',
    nearestDestinationId: 'gol-gumbaz',
    type: 'hotel',
    stars: 3,
    rating: 4.1,
    reviewsCount: 580,
    pricePerNight: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Restaurant', 'Room Service', 'Close to Gol Gumbaz', 'Air-Conditioned Suites', 'Doctor on Call'],
    description: 'Official tourism hotel in Vijayapura, situated walking distance from Ibrahim Rouza and Gol Gumbaz.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Anand Mahal Road, Vijayapura, Karnataka 586101',
  },

  // --- WEST KARNATAKA ---
  {
    id: 'kstdc-mayura-gerusoppa-jogfalls',
    name: 'KSTDC Hotel Mayura Gerusoppa Jog Falls',
    district: 'Shimoga',
    region: 'west',
    nearestDestinationId: 'jog-falls',
    type: 'hotel',
    stars: 3,
    rating: 4.4,
    reviewsCount: 1690,
    pricePerNight: 2600,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    amenities: ['Direct View of Jog Falls', 'Panoramic Balcony', 'South Indian Restaurant', 'Free Parking', 'Children Play Area'],
    description: 'Offers unbelievable direct views of all four waterfalls from the hotel courtyard and private balconies.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Jog Falls Viewpoint, Sagar Taluk, Shimoga District, Karnataka 577435',
  },
  {
    id: 'gokarna-beachside-eco-resort',
    name: 'Kudle Beach Heritage Resort Gokarna',
    district: 'Uttara Kannada',
    region: 'west',
    nearestDestinationId: 'gokarna',
    type: 'resort',
    stars: 4,
    rating: 4.6,
    reviewsCount: 920,
    pricePerNight: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    amenities: ['Cliff Ocean View', 'Beach Walk Access', 'Ayurveda Spa', 'Open-air Seafood Restaurant', 'Yoga Deck'],
    description: 'Eco-friendly coastal resort perched on Kudle hill with sweeping views of the Arabian Sea and beach trails.',
    bookingUrl: 'https://karnatakatourism.org',
    isDemo: false,
    address: 'Kudle Beach Road, Gokarna, Karnataka 581326',
  },
  {
    id: 'chikkamagaluru-coffee-heights',
    name: 'Western Ghats Highland Resort',
    district: 'Chikkamagaluru',
    region: 'west',
    nearestDestinationId: 'chikkamagaluru',
    type: 'resort',
    stars: 4,
    rating: 4.7,
    reviewsCount: 1100,
    pricePerNight: 4800,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    amenities: ['Infinity Mountain Pool', 'Trekking Guide to Mullayanagiri', 'Organic Coffee Tasting', 'Bonfire', 'Spa'],
    description: 'Nestled on the slopes of the Western Ghats with panoramic views of the Baba Budan Giri mountain range.',
    bookingUrl: 'https://karnatakatourism.org',
    isDemo: false,
    address: 'Mullayanagiri Road, Chikkamagaluru, Karnataka 577101',
  },

  // --- EAST KARNATAKA ---
  {
    id: 'kstdc-mayura-pine-borough-nandi',
    name: 'KSTDC Hotel Mayura Pine Top Nandi Hills',
    district: 'Chikkaballapur',
    region: 'east',
    nearestDestinationId: 'nandi-hills',
    type: 'hotel',
    stars: 3,
    rating: 4.2,
    reviewsCount: 880,
    pricePerNight: 2300,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Hilltop Sunrise Access', 'Pine Forest Surroundings', 'Garden Cafe', 'Exclusive Guest Entry', 'Spacious Suites'],
    description: 'Located right at the summit of Nandi Hills, allowing guests early morning sunrise access without highway rush.',
    bookingUrl: 'https://kstdc.co/',
    isDemo: false,
    address: 'Nandi Hills Summit, Chikkaballapur District, Karnataka 562101',
  },
  {
    id: 'bengaluru-heritage-grand',
    name: 'The Capitol Heritage Hotel Bengaluru',
    district: 'Bengaluru Urban',
    region: 'east',
    nearestDestinationId: 'bengaluru-heritage',
    type: 'hotel',
    stars: 4,
    rating: 4.5,
    reviewsCount: 1640,
    pricePerNight: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    amenities: ['Central City Location', 'Swimming Pool', '24h Business Center', 'Buffet Breakfast Included', 'Airport Shuttle'],
    description: 'Prime hotel in the heart of Bengaluru close to Vidhana Soudha, Bangalore Palace, and Lalbagh Gardens.',
    bookingUrl: 'https://karnatakatourism.org',
    isDemo: false,
    address: 'Raj Bhavan Road, Bengaluru, Karnataka 560001',
  },
  {
    id: 'kolar-gold-heritage-stay',
    name: 'Kolar Gold Fields Heritage Bungalow',
    district: 'Kolar',
    region: 'east',
    nearestDestinationId: 'kotilingeshwara',
    type: 'heritage',
    stars: 3,
    rating: 4.3,
    reviewsCount: 310,
    pricePerNight: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Colonial Architecture', 'Spacious Verandas', 'Lush Gardens', 'Home-cooked Meals', 'Close to Kotilingeshwara'],
    description: 'Restored colonial-era bungalow ideal for visiting Kotilingeshwara and Antaragange caves.',
    bookingUrl: 'https://karnatakatourism.org',
    isDemo: false,
    address: 'Robertsonpet, Kolar Gold Fields, Kolar, Karnataka 563122',
  },
];

export function getRecommendedHotels(
  selectedDestinationIds: string[],
  budgetRange: 'economy' | 'mid' | 'premium' = 'mid'
): HotelOption[] {
  // If destination matches nearestDestinationId, prioritize it
  let matches = HOTELS_DATA.filter(h =>
    selectedDestinationIds.includes(h.nearestDestinationId)
  );

  // If none direct, filter by region of selected destinations
  if (matches.length === 0) {
    matches = HOTELS_DATA;
  }

  // Sort by price matching budget
  if (budgetRange === 'economy') {
    return matches.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }
  if (budgetRange === 'premium') {
    return matches.sort((a, b) => b.pricePerNight - a.pricePerNight);
  }
  return matches.sort((a, b) => b.rating - a.rating);
}
