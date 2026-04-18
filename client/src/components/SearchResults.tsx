import { useState } from 'react';
import { Clock, MapPin, ChevronDown, Lock, ShoppingCart, Star, Heart, Calendar, ExternalLink } from 'lucide-react';
import { isRestaurantOpen, type OpeningHours } from '@/lib/timeUtils';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import type { Review } from '@/pages/Home';

interface Shop {
  id: string;
  name: string;
  address: string;
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
}

interface SearchResultsProps {
  shops: Shop[];
  favorites?: string[];
  onToggleFavorite?: (shopId: string) => void;
  onReserve?: (shopId: string) => void;
}

const WAIT_CONFIG = {
  low:  { label: 'Low Wait',  bg: '#dcfce7', border: '#86efac', text: '#166534' },
  mid:  { label: 'Moderate',  bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
  high: { label: 'High Wait', bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
};

function waitConfig(mins?: number) {
  if (!mins || mins < 10) return WAIT_CONFIG.low;
  if (mins < 20) return WAIT_CONFIG.mid;
  return WAIT_CONFIG.high;
}

const PLATFORM_COLORS: Record<string, string> = {
  UberEats:   'bg-black text-white',
  Lieferando: 'bg-orange-500 text-white',
  Deliveroo:  'bg-emerald-600 text-white',
  JustEat:    'bg-orange-400 text-white',
  DoorDash:   'bg-red-600 text-white',
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
      ))}
    </div>
  );
}

export default function SearchResults({ shops, favorites = [], onToggleFavorite, onReserve }: SearchResultsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shopReviews, setShopReviews] = useState<Record<string, Review[]>>(
    Object.fromEntries(shops.map(s => [s.id, s.reviews]))
  );

  const sorted = [...shops].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const addReview = (shopId: string, r: Omit<Review, 'id' | 'helpful' | 'date'>) => {
    const review: Review = { id: `r-${Date.now()}`, ...r, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), helpful: 0 };
    setShopReviews(prev => ({ ...prev, [shopId]: [review, ...prev[shopId]] }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-beb text-2xl uppercase tracking-wide text-foreground">Results</h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black bg-primary text-white text-xs font-black uppercase tracking-widest">
          {shops.length} found
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {sorted.map((shop, idx) => {
          const status = shop.hours ? isRestaurantOpen(shop.hours) : null;
          const isClosed = status && !status.isOpen;
          const wc = waitConfig(shop.waitTime);
          const isOpen = expanded === shop.id;
          const reviews = shopReviews[shop.id] || [];
          const isFav = favorites.includes(shop.id);

          return (
            <div
              key={shop.id}
              className={`border-2 border-black rounded-2xl overflow-hidden transition-all duration-200 bg-white ${
                isOpen ? 'shadow-[4px_4px_0_#0A0A0A]' : 'shadow-[2px_2px_0_#0A0A0A] hover:shadow-[4px_4px_0_#0A0A0A] hover:-translate-y-0.5'
              } ${isClosed ? 'opacity-60' : ''}`}
            >
              {/* ── Card top row (always visible) ── */}
              <button
                className="w-full text-left px-5 py-4 flex items-center gap-4"
                onClick={() => setExpanded(isOpen ? null : shop.id)}
                aria-expanded={isOpen}
              >
                {/* Rank */}
                <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-black bg-primary text-white font-beb text-sm flex items-center justify-center">
                  {idx + 1}
                </span>

                {/* Name + address */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-black text-base text-foreground leading-tight truncate ${isClosed ? 'line-through opacity-60' : ''}`}>
                      {shop.name}
                    </h3>
                    {isClosed && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" /> Closed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {(shop.distance / 1000).toFixed(2)} km
                    </span>
                    <Stars rating={shop.rating} />
                    <span className="text-muted">{shop.rating} ({reviews.length})</span>
                  </div>
                </div>

                {/* Wait time pill */}
                {!isClosed && shop.waitTime !== undefined && (
                  <div
                    className="flex-shrink-0 flex flex-col items-center px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border-2 min-w-[58px] sm:min-w-[64px]"
                    style={{ background: wc.bg, borderColor: wc.border }}
                  >
                    <span className="font-black text-sm sm:text-xl leading-none" style={{ color: wc.text }}>
                      {shop.waitRange ? `${shop.waitRange.p10}-${shop.waitRange.p90}` : shop.waitTime}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide mt-0.5" style={{ color: wc.text }}>
                      min
                    </span>
                  </div>
                )}

                {/* Favourite + chevron */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    onClick={e => { e.stopPropagation(); onToggleFavorite?.(shop.id); }}
                    aria-label={isFav ? 'Remove favourite' : 'Add favourite'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : 'text-zinc-300'}`} />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* ── Expanded details ── */}
              {isOpen && (
                <div className="px-5 pb-5 border-t-2 border-black/10 pt-4 space-y-5 animate-in slide-in-from-top-1 duration-200">

                  {/* Status + wait row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Open/close status */}
                    {status && (
                      <div className="p-3 rounded-xl border-2 border-black/10 bg-zinc-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Status</p>
                        <p className="font-black text-sm text-foreground">{status.message}</p>
                      </div>
                    )}
                    {/* Detailed wait */}
                    {!isClosed && shop.waitTime !== undefined && (
                      <div className="p-3 rounded-xl border-2" style={{ background: wc.bg, borderColor: wc.border }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: wc.text }}>90% Confidence Band</p>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="font-black text-xl sm:text-2xl leading-none" style={{ color: wc.text }}>
                              {shop.waitRange ? `${shop.waitRange.p10} - ${shop.waitRange.p90}` : shop.waitTime}
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold" style={{ color: wc.text }}>min</span>
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-wide opacity-70" style={{ color: wc.text }}>
                            {wc.label} · Markov simulation
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <p className="text-xs text-muted font-medium leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {shop.address}
                  </p>

                  {/* Queue bar */}
                  {!isClosed && shop.queueLength !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Queue</span>
                        <span className="text-xs font-black text-foreground">{shop.queueLength} people</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 border border-black/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min((shop.queueLength / 15) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Ordering platforms */}
                  {!isClosed && shop.orderingPlatforms?.length && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 flex items-center gap-1.5">
                        <ShoppingCart className="w-3 h-3" /> Order Online
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {shop.orderingPlatforms.map(p => (
                          <a key={p}
                            href={`https://www.google.com/search?q=${encodeURIComponent(shop.name + ' ' + p + ' bestellen')}`}
                            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className={`text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-opacity hover:opacity-80 ${PLATFORM_COLORS[p] || 'bg-zinc-700 text-white'}`}>
                            {p} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {reviews.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Recent Reviews</p>
                      <div className="space-y-2">
                        {reviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} />)}
                        {reviews.length > 3 && (
                          <p className="text-xs text-center text-muted font-bold py-1">+{reviews.length - 3} more reviews</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Review form */}
                  {!isClosed && (
                    <div className="bg-zinc-50 rounded-xl border border-black/10 p-3">
                      <ReviewForm onSubmit={r => addReview(shop.id, r)} />
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isClosed ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={e => { e.stopPropagation(); onReserve?.(shop.id); }}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_#0A0A0A] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0A0A0A] active:translate-y-0 active:shadow-none transition-all"
                        style={{ background: 'var(--secondary)', color: '#0A0A0A' }}
                      >
                        <Calendar className="w-4 h-4" /> Reserve
                      </button>
                      {shop.orderingUrl && (
                        <a
                          href={shop.orderingUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-black text-white shadow-[3px_3px_0_#0A0A0A] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0A0A0A] active:translate-y-0 active:shadow-none transition-all"
                          style={{ background: 'var(--primary)' }}
                        >
                          <ShoppingCart className="w-4 h-4" /> Order Now
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="py-3 px-4 rounded-xl bg-red-50 text-red-800 font-black text-sm text-center border-2 border-red-200">
                      Restaurant Currently Closed
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
