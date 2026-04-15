import { useEffect, useRef } from 'react';
import type L from 'leaflet';
import type { Shop } from '@/pages/Home';

interface MapComponentProps {
  shops: Shop[];
  userLocation: { lat: number; lon: number } | null;
  onMapReady?: () => void;
  favorites?: string[];
  onToggleFavorite?: (shopId: string) => void;
  onReserve?: (shopId: string) => void;
  onOrder?: (url: string) => void;
}

export default function MapComponent({
  shops,
  userLocation,
  onMapReady,
  favorites = [],
  onToggleFavorite,
  onReserve,
  onOrder,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const leafletRef = useRef<typeof L | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        const L = (await import('leaflet')).default;
        leafletRef.current = L;

        // Initialize map
        if (!map.current && userLocation) {
          map.current = L.map(mapContainer.current).setView(
            [userLocation.lat, userLocation.lon],
            14
          );

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map.current);

          onMapReady?.();
        }

        // Clear existing markers
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        if (!map.current || !userLocation) return;

        // Add user location marker
        const userIcon = L.divIcon({
          html: `
            <div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lon], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map.current);

        userMarker.bindPopup('<strong>Your Location</strong>');
        markers.current.push(userMarker);

        // Add shop markers
        shops.forEach((shop, idx) => {
          const getWaitColor = (waitTime?: number) => {
            if (!waitTime) return '#22c55e'; // green
            if (waitTime < 10) return '#22c55e'; // green
            if (waitTime < 20) return '#f59e0b'; // amber
            return '#ef4444'; // red
          };

          const isFavorite = favorites.includes(shop.id);

          const shopIcon = L.divIcon({
            html: `
              <div class="flex flex-col items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md border-2 border-white" style="background-color: ${getWaitColor(shop.waitTime)}">
                  ${idx + 1}
                </div>
                <div class="w-1.5 h-1.5 bg-white rounded-full -mt-0.5 relative z-[-1]" style="box-shadow: 0 0 0 1px ${getWaitColor(shop.waitTime)}"></div>
              </div>
            `,
            iconSize: [24, 30],
            iconAnchor: [12, 30],
            popupAnchor: [0, -30],
          });

          const marker = L.marker([shop.lat, shop.lon], { icon: shopIcon }).addTo(
            map.current!
          );

          // Create rich popup content with all details
          const popupContent = document.createElement('div');
          popupContent.className = 'p-0 bg-white rounded-lg overflow-hidden';
          popupContent.style.width = '320px';

          const renderStars = (rating: number) => {
            return Array.from({ length: 5 })
              .map((_, i) => (i < Math.floor(rating) ? '★' : '☆'))
              .join('');
          };

          const getStatusBadge = () => {
            if (!shop.hours) return '';
            const now = new Date();
            const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const dayKey = day as keyof typeof shop.hours;
            const hours = shop.hours[dayKey];

            if (hours === 'Closed') {
              return '<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">CLOSED</span>';
            }

            return '<span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">OPEN NOW</span>';
          };

          popupContent.innerHTML = `
            <div style="padding: 12px; border-bottom: 2px solid #f3f4f6;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="flex: 1;">
                  <h3 style="font-weight: bold; margin: 0; font-size: 14px; color: #1f2937;">${shop.name}</h3>
                  <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">${shop.address}</p>
                </div>
                <button id="favorite-btn-${shop.id}" style="background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px; margin-left: 8px;">
                  ${isFavorite ? '❤️' : '🤍'}
                </button>
              </div>
              <div style="display: flex; gap: 8px; font-size: 11px; margin-top: 8px;">
                ${getStatusBadge()}
                <span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${shop.rating} ${renderStars(shop.rating)}</span>
              </div>
            </div>
            <div style="padding: 12px; border-bottom: 2px solid #f3f4f6;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <div style="background-color: #f0f9ff; padding: 8px; border-radius: 4px;">
                  <p style="color: #6b7280; margin: 0; font-size: 10px;">Distance</p>
                  <p style="font-weight: bold; color: #1f2937; margin: 4px 0 0 0;">${shop.distance.toFixed(2)} km</p>
                </div>
                <div style="background-color: #fef3c7; padding: 8px; border-radius: 4px;">
                  <p style="color: #6b7280; margin: 0; font-size: 10px;">Wait Time</p>
                  <p style="font-weight: bold; color: #1f2937; margin: 4px 0 0 0;">${shop.waitTime || 0} min</p>
                </div>
                <div style="background-color: #f0f9ff; padding: 8px; border-radius: 4px;">
                  <p style="color: #6b7280; margin: 0; font-size: 10px;">Queue</p>
                  <p style="font-weight: bold; color: #1f2937; margin: 4px 0 0 0;">${shop.queueLength || 0} people</p>
                </div>
                <div style="background-color: #fef3c7; padding: 8px; border-radius: 4px;">
                  <p style="color: #6b7280; margin: 0; font-size: 10px;">Reviews</p>
                  <p style="font-weight: bold; color: #1f2937; margin: 4px 0 0 0;">${shop.reviews.length} reviews</p>
                </div>
              </div>
            </div>
            <div style="padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="reserve-btn-${shop.id}" style="background-color: #fbbf24; color: #000; border: none; padding: 8px; border-radius: 4px; font-weight: bold; font-size: 11px; cursor: pointer; border: 2px solid #000;">
                📅 Reserve
              </button>
              <button id="order-btn-${shop.id}" style="background-color: #dc2626; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; font-size: 11px; cursor: pointer; border: 2px solid #000;">
                🛒 Order
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add event listeners after popup is created
          marker.on('popupopen', () => {
            const favoriteBtn = document.getElementById(`favorite-btn-${shop.id}`);
            const reserveBtn = document.getElementById(`reserve-btn-${shop.id}`);
            const orderBtn = document.getElementById(`order-btn-${shop.id}`);

            if (favoriteBtn) {
              favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onToggleFavorite?.(shop.id);
              });
            }

            if (reserveBtn) {
              reserveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onReserve?.(shop.id);
              });
            }

            if (orderBtn) {
              orderBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (shop.orderingUrl) {
                  onOrder?.(shop.orderingUrl);
                }
              });
            }
          });

          markers.current.push(marker);
        });

        // Fit bounds to show all markers
        if (markers.current.length > 0) {
          const group = new L.FeatureGroup(markers.current);
          map.current.fitBounds(group.getBounds().pad(0.1), { maxZoom: 15 });
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();
  }, [shops, userLocation, onMapReady, favorites, onToggleFavorite, onReserve, onOrder]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
}
