import { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Loader2, AlertCircle, Navigation, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import useEmblaCarousel from 'embla-carousel-react';
import SearchResults from '@/components/SearchResults';
import MapComponent from '@/components/MapComponent';
import ReservationForm, { type Reservation } from '@/components/ReservationForm';
import { useFavorites } from '@/hooks/useFavorites';
import { isRestaurantOpen, parseOsmHours, type OpeningHours } from '@/lib/timeUtils';
import { simulateWait } from '@/lib/simulation';
import QuickEstimateToggle, { type EstimateMode } from '@/components/QuickEstimateToggle';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
  waitTime?: number;
  waitRange?: { p10: number; p90: number };
  queueLength?: number;
  hours?: OpeningHours;
  orderingUrl?: string;
  orderingPlatforms?: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  prepMins?: number; // Persisted for reactive simulation
}

const FOOD_CHIPS = [
  { label: 'Kebab',   emoji: '🥙' },
  { label: 'Sushi',   emoji: '🍣' },
  { label: 'Pizza',   emoji: '🍕' },
  { label: 'Ramen',   emoji: '🍜' },
  { label: 'Burger',  emoji: '🍔' },
  { label: 'Tacos',   emoji: '🌮' },
  { label: 'Curry',   emoji: '🍛' },
  { label: 'Salad',   emoji: '🥗' },
  { label: 'Poke',    emoji: '🥣' },
  { label: 'Wings',   emoji: '🍗' },
  { label: 'Pasta',   emoji: '🍝' },
  { label: 'BBQ',     emoji: '🥩' },
  { label: 'Falafel', emoji: '🧆' },
  { label: 'Pho',     emoji: '🍲' },
];

function FoodCarousel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, align: 'start', containScroll: 'trimSnaps' });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      {/* Prev arrow */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{ marginLeft: -10, background: 'rgba(0,0,0,0.05)', border: '1.5px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.4)' }}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden mx-4">
        <div className="flex gap-2 py-1">
          {FOOD_CHIPS.map((chip) => {
            const active = value.toLowerCase() === chip.label.toLowerCase();
            return (
              <button
                key={chip.label}
                onClick={() => onChange(chip.label)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-sm uppercase tracking-wider transition-all"
                style={{
                  background: active ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                  color: active ? 'white' : 'rgba(0,0,0,0.5)',
                  border: active ? '2px solid var(--primary)' : '2px solid rgba(0,0,0,0.07)',
                  boxShadow: active ? '0 4px 16px rgba(212,32,39,0.35)' : 'none',
                  transform: active ? 'translateY(-1px)' : 'none',
                }}
              >
                <span>{chip.emoji}</span>
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next arrow */}
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{ marginRight: -10, background: 'rgba(0,0,0,0.05)', border: '1.5px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.4)' }}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [foodType, setFoodType] = useState('Kebab');
  const [city, setCity] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Shop | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [estimateMode, setEstimateMode] = useState<EstimateMode>('moderate');

  // Mapping estimate mode to simulation params
  const getSimulationParams = (mode: EstimateMode) => {
    switch (mode) {
      case 'quiet':    return { arrivalRate: 1, staff: 3 };
      case 'moderate': return { arrivalRate: 3, staff: 2 };
      case 'busy':     return { arrivalRate: 6, staff: 1 }; // High busy
      default:         return { arrivalRate: 3, staff: 2 };
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('mcr_mcp_reservations');
    if (stored) {
      try { setReservations(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (reservations.length > 0) {
      localStorage.setItem('mcr_mcp_reservations', JSON.stringify(reservations));
    }
  }, [reservations]);

  // Reactive wait-time updates when crowd level toggle is flipped
  useEffect(() => {
    if (shops.length === 0) return;
    
    const { arrivalRate, staff } = getSimulationParams(estimateMode);
    
    setShops(prev => prev.map(shop => {
      const q = shop.queueLength || 0;
      const p = shop.prepMins || 10;
      const sim = simulateWait(q, staff, p, arrivalRate);
      return {
        ...shop,
        waitTime: sim.mean,
        waitRange: { p10: sim.p10, p90: sim.p90 }
      };
    }));
  }, [estimateMode]);

  const generateHours = (): OpeningHours => {
    const openHour = Math.floor(Math.random() * 4) + 7;  // 07:00 – 10:00
    const closeHour = Math.floor(Math.random() * 4) + 21; // 21:00 – 00:00
    const timeRange = `${openHour.toString().padStart(2, '0')}:00-${closeHour.toString().padStart(2, '0')}:00`;
    return { monday: timeRange, tuesday: timeRange, wednesday: timeRange, thursday: timeRange, friday: timeRange, saturday: timeRange, sunday: timeRange };
  };

  const generateReviews = (_name: string): Review[] => {
    const reviewCount = Math.floor(Math.random() * 8) + 3;
    const reviewTexts = ['Great food and fast service!', 'Excellent quality, highly recommended', 'Amazing experience, will come back', 'Good value for money', 'Friendly staff and delicious food', 'Best restaurant in the area', 'Very satisfied with the meal', 'Perfect for family dinners'];
    const authors = ['Sarah M.', 'John D.', 'Emma L.', 'Michael R.', 'Lisa K.', 'David P.', 'Jessica T.', 'Robert H.'];
    return Array.from({ length: reviewCount }, (_, i) => {
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date(); date.setDate(date.getDate() - daysAgo);
      return { id: `review-${i}`, author: authors[Math.floor(Math.random() * authors.length)], rating: Math.floor(Math.random() * 2) + 4, text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)], date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), helpful: Math.floor(Math.random() * 50) };
    });
  };

  const getOrderingPlatforms = (name: string) => {
    const all = [
      { name: 'UberEats',  url: `https://www.ubereats.com/search?q=${encodeURIComponent(name)}` },
      { name: 'Lieferando', url: `https://www.lieferando.de/en/search#q=${encodeURIComponent(name)}` },
      { name: 'Deliveroo', url: `https://deliveroo.co.uk/search?q=${encodeURIComponent(name)}` },
      { name: 'JustEat',   url: `https://www.just-eat.co.uk/search?q=${encodeURIComponent(name)}` },
    ];
    const selected = all.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
    // Google search is the universal fallback — always resolves
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' online bestellen order delivery')}`;
    return { platforms: selected.map(p => p.name), url: googleUrl };
  };

  const fetchShops = async (lat: number, lon: number, food: string) => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},10000&limit=50&apiKey=df6a689990a246aa93ebc189810ae4a6`);
      const data = await response.json();
      if (data.features?.length > 0) {
        const shopList: Shop[] = data.features.map((f: any, idx: number) => {
          const restaurantName = f.properties.name || 'Unnamed Restaurant';
          const { platforms, url } = getOrderingPlatforms(restaurantName);
          const reviews = generateReviews(restaurantName);
          const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
          const rawOsm = f.properties.opening_hours || f.properties.datasource?.raw?.opening_hours;
          const hours = (rawOsm ? parseOsmHours(rawOsm) : null) ?? generateHours();
          
          const { arrivalRate, staff } = getSimulationParams(estimateMode);
          const queueSize = Math.floor(Math.random() * 8) + (estimateMode === 'busy' ? 10 : 0);
          const prepMins = Math.floor(Math.random() * 10) + 5;
          const sim = simulateWait(queueSize, staff, prepMins, arrivalRate);

          return { 
            id: `shop-${idx}`, 
            name: restaurantName, 
            address: f.properties.formatted || 'Nearby', 
            lat: f.geometry.coordinates[1], 
            lon: f.geometry.coordinates[0], 
            distance: f.properties.distance || 0, 
            waitTime: sim.mean,
            waitRange: { p10: sim.p10, p90: sim.p90 },
            queueLength: queueSize,
            prepMins,
            hours, 
            orderingUrl: url, 
            orderingPlatforms: platforms, 
            rating: parseFloat(avgRating.toFixed(1)), 
            reviewCount: reviews.length, 
            reviews 
          };
        });
        setShops(shopList);
        setHasSearched(true);
      } else {
        setError('No restaurants found in this area. Try a different location.');
        setShops([]);
      }
    } catch {
      setError('Failed to fetch restaurants. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGPSSearch = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { const { latitude, longitude } = pos.coords; setUserLocation({ lat: latitude, lon: longitude }); fetchShops(latitude, longitude, foodType); },
      (err) => { setError(`Location error: ${err.message}. Please enter a city name instead.`); setLoading(false); }
    );
  };

  const handleCitySearch = async () => {
    if (!city.trim()) { setError('Please enter a city name.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data?.length > 0) { const { lat, lon } = data[0]; setUserLocation({ lat: parseFloat(lat), lon: parseFloat(lon) }); fetchShops(parseFloat(lat), parseFloat(lon), foodType); }
      else setError(`Could not find "${city}". Please try a different spelling.`);
    } catch { setError('Geocoding service error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleReserve = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) { setSelectedRestaurant(shop); setShowReservationForm(true); }
  };

  const handleReservationSubmit = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    setReservations(prev => [...prev, { id: `res-${Date.now()}`, ...reservation, createdAt: new Date().toISOString(), status: 'confirmed' }]);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40 border-b-2 border-black" style={{ background: 'var(--background)', paddingLeft: '4cm', paddingRight: '3cm' }}>
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setLocation('/')} className="flex items-center gap-2 font-beb text-2xl uppercase tracking-widest text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            QBite
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted hidden sm:block">Queue Intelligence Active</span>
          </div>
        </div>
      </header>

      <main style={{ paddingLeft: '4cm', paddingRight: '3cm', paddingTop: '2.5rem', paddingBottom: '3rem' }}>

        {/* ── Search Panel ── */}
        <div className="mb-12">

          <div className="flex flex-col gap-6">
            <h1 className="font-beb text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-none text-foreground tracking-tight">
              Queue Intelligence Search
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-muted">
              Real-time crowd simulation for local spots. 
              Find the shortest queue in seconds.
            </p>
          </div>

          {/* Free-floating search section */}
          <div className="py-8">

            {/* Craving label + carousel */}
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-black/40">
                1. What are you craving?
              </p>
              <FoodCarousel value={foodType} onChange={setFoodType} />
            

            {/* Quick Estimate / Simulation Mode Selection */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-black/40">
                2. Real-time crowd level
              </p>
              <div className="w-full">
                <QuickEstimateToggle value={estimateMode} onChange={setEstimateMode} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px mb-8" style={{ background: 'rgba(0,0,0,0.07)' }} />

            {/* Inputs row */}
            <div className="flex flex-col gap-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-black/40">
                3. Final details
              </p>
              <div className="flex flex-col md:flex-row gap-4">

              {/* Food input */}
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20" />
                <input
                  type="text"
                  placeholder="Pizza, kebab, sushi…"
                  value={foodType}
                  onChange={e => setFoodType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                  className="w-full rounded-2xl font-semibold outline-none transition-all"
                  style={{
                    paddingLeft: '3.5rem', paddingRight: '1.5rem',
                    paddingTop: '1.2rem', paddingBottom: '1.2rem',
                    fontSize: '1.1rem',
                    background: 'white',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    color: '#0A0A0A',
                    caretColor: 'var(--primary)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                />
              </div>

              {/* City input */}
              <div className="relative flex-1">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20" />
                <input
                  type="text"
                  placeholder="City name…"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                  className="w-full rounded-2xl font-semibold outline-none transition-all"
                  style={{
                    paddingLeft: '3.5rem', paddingRight: '1.5rem',
                    paddingTop: '1.2rem', paddingBottom: '1.2rem',
                    fontSize: '1.1rem',
                    background: 'white',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    color: '#0A0A0A',
                    caretColor: 'var(--primary)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                />
              </div>

              {/* GPS button */}
              <button
                onClick={handleGPSSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-40 hover:opacity-90 active:scale-95"
                style={{
                  paddingLeft: '1.8rem', paddingRight: '1.8rem',
                  paddingTop: '1.2rem', paddingBottom: '1.2rem',
                  fontSize: '0.95rem',
                  background: 'white',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  color: '#0A0A0A',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
                GPS
              </button>

              {/* Search button */}
              <button
                onClick={handleCitySearch}
                disabled={loading}
                className="flex items-center justify-center gap-3 rounded-2xl font-beb uppercase tracking-widest text-white transition-all disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  paddingLeft: '2.5rem', paddingRight: '2.5rem',
                  paddingTop: '1.2rem', paddingBottom: '1.2rem',
                  fontSize: '1.3rem',
                  background: 'var(--primary)',
                  boxShadow: '0 6px 32px rgba(212,32,39,0.45)',
                }}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                Search
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-400">{error}</p>
              </div>
            )}
           </div>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl border-2 border-black/10 bg-white/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        )}

        {/* ── Results ── */}
        {!loading && shops.length > 0 && (() => {
          const openShops = shops.filter(s => !s.hours || isRestaurantOpen(s.hours).isOpen);
          return (
            <div className="flex flex-col lg:flex-row gap-12">

              {/* Map */}
              <div className="lg:w-[500px] xl:w-[680px] flex-shrink-0">
                <div className="sticky top-24">
                  <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[420px] lg:h-[620px]">
                    <MapComponent
                      shops={openShops}
                      userLocation={userLocation}
                      onMapReady={() => {}}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                      onReserve={handleReserve}
                      onOrder={(url) => window.open(url, '_blank')}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-muted">
                      {openShops.length} open spots within 10 km
                    </span>
                    <span className="text-xs font-bold text-muted">Sorted by distance</span>
                  </div>
                </div>
              </div>

              {/* Results list */}
              <div className="flex-1 min-w-0">
                <SearchResults
                  shops={openShops}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onReserve={handleReserve}
                />
              </div>
            </div>
          );
        })()}

        {/* ── Empty state ── */}
        {!loading && !hasSearched && (
          <div className="border-2 border-dashed border-black/20 rounded-2xl py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-black/20 flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-black/20" />
            </div>
            <p className="font-beb text-3xl uppercase tracking-wide text-black/20 mb-2">Ready to find food?</p>
            <p className="text-sm text-muted font-medium">Enter what you're craving + a city, or use GPS.</p>
          </div>
        )}
      </main>

      {/* ── Reservation modal ── */}
      {showReservationForm && selectedRestaurant && (
        <ReservationForm
          restaurantName={selectedRestaurant.name}
          restaurantId={selectedRestaurant.id}
          onSubmit={handleReservationSubmit}
          onClose={() => { setShowReservationForm(false); setSelectedRestaurant(null); }}
        />
      )}
    </div>
  );
}
