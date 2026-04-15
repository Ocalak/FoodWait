import { Star, Clock, MapPin, TrendingUp, ShoppingCart, Heart, Calendar } from 'lucide-react';
import { isRestaurantOpen } from '@/lib/timeUtils';
import type { Shop } from '@/pages/Home';

interface RestaurantPopupProps {
  shop: Shop;
  isFavorite: boolean;
  onToggleFavorite: (shopId: string) => void;
  onReserve: (shopId: string) => void;
  onOrder: (url: string) => void;
}

export default function RestaurantPopup({
  shop,
  isFavorite,
  onToggleFavorite,
  onReserve,
  onOrder,
}: RestaurantPopupProps) {
  const restaurantStatus = shop.hours ? isRestaurantOpen(shop.hours) : null;
  const isClosed = restaurantStatus && !restaurantStatus.isOpen;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getWaitColor = (waitTime?: number) => {
    if (!waitTime) return 'text-green-600';
    if (waitTime < 10) return 'text-green-600';
    if (waitTime < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaitBgColor = (waitTime?: number) => {
    if (!waitTime) return 'bg-green-50 border-green-200';
    if (waitTime < 10) return 'bg-green-50 border-green-200';
    if (waitTime < 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getQueueStatus = (waitTime?: number) => {
    if (!waitTime) return 'Low Wait';
    if (waitTime < 10) return 'Low Wait';
    if (waitTime < 20) return 'Moderate';
    return 'High Wait';
  };

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-lg border-2 border-black">
      {/* Header with Favorite Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{shop.name}</h3>
          <p className="text-xs text-muted">{shop.address}</p>
        </div>
        <button
          onClick={() => onToggleFavorite(shop.id)}
          className="flex-shrink-0 ml-2 p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite
                ? 'fill-red-600 text-red-600'
                : 'text-gray-400 hover:text-red-600'
            }`}
          />
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-200">
        <div className="flex items-center gap-1">
          {renderStars(shop.rating)}
        </div>
        <span className="text-sm font-bold text-foreground">{shop.rating}</span>
        <span className="text-xs text-muted">({shop.reviews.length} reviews)</span>
      </div>

      {/* Status Badge */}
      {restaurantStatus && (
        <div
          className={`p-2 rounded-lg border-2 mb-3 text-xs font-bold ${
            restaurantStatus.isOpen
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {restaurantStatus.message}
        </div>
      )}

      {/* Wait Time */}
      {!isClosed && shop.waitTime !== undefined && (
        <div className={`p-3 rounded-lg border-2 mb-3 ${getWaitBgColor(shop.waitTime)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${getWaitColor(shop.waitTime)}`} />
              <div>
                <span className={`font-bold text-lg ${getWaitColor(shop.waitTime)}`}>
                  {shop.waitTime} min
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                shop.waitTime < 10
                  ? 'bg-green-200 text-green-800'
                  : shop.waitTime < 20
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-red-200 text-red-800'
              }`}
            >
              {getQueueStatus(shop.waitTime)}
            </span>
          </div>
        </div>
      )}

      {/* Distance & Queue */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="p-2 bg-primary/10 rounded border border-primary/20">
          <p className="text-muted">Distance</p>
          <p className="font-semibold text-foreground">{shop.distance.toFixed(2)} km</p>
        </div>
        <div className="p-2 bg-secondary/20 rounded border border-secondary/30">
          <p className="text-muted">Queue</p>
          <p className="font-semibold text-foreground">{shop.queueLength || 0} people</p>
        </div>
      </div>

      {/* Order Platforms */}
      {!isClosed && shop.orderingPlatforms && shop.orderingPlatforms.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            Order Online
          </p>
          <button
            onClick={() => onOrder(shop.orderingUrl || '')}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-red-600 text-white font-bold text-xs hover:shadow-md transition-all"
          >
            Order Now
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {!isClosed ? (
          <>
            <button
              onClick={() => onReserve(shop.id)}
              className="py-2 px-3 rounded-lg bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              Reserve
            </button>
            <button
              onClick={() => onOrder(shop.orderingUrl || '')}
              className="py-2 px-3 rounded-lg bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-colors flex items-center justify-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Order
            </button>
          </>
        ) : (
          <div className="col-span-2 py-2 px-3 rounded-lg bg-red-100 text-red-800 font-bold text-xs text-center border-2 border-red-300">
            Currently Closed
          </div>
        )}
      </div>
    </div>
  );
}
