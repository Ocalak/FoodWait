/**
 * Restaurant Operating Hours Utility
 * Provides functions to check if a restaurant is open and get its status
 */

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface RestaurantStatus {
  isOpen: boolean;
  status: 'open' | 'closed' | 'closing-soon' | 'opening-soon';
  message: string;
  nextOpen?: string;
  nextClose?: string;
}

/**
 * Get current day name
 */
export function getCurrentDay(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

/**
 * Parse time string (e.g., "09:00" or "9:00 AM") to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return -1;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  
  // Handle 12-hour format
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

/**
 * Get current time in minutes since midnight
 */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Parse opening hours range (e.g., "09:00-22:00" or "9:00 AM - 10:00 PM")
 */
export function parseHoursRange(hoursStr: string): { open: number; close: number } | null {
  if (!hoursStr || hoursStr.toLowerCase() === 'closed') {
    return null;
  }
  
  const parts = hoursStr.split('-').map(p => p.trim());
  if (parts.length !== 2) return null;
  
  const openTime = timeToMinutes(parts[0]);
  const closeTime = timeToMinutes(parts[1]);
  
  if (openTime === -1 || closeTime === -1) return null;
  
  return { open: openTime, close: closeTime };
}

/**
 * Check if restaurant is currently open
 */
export function isRestaurantOpen(hours: OpeningHours): RestaurantStatus {
  const currentDay = getCurrentDay();
  const currentTime = getCurrentTimeInMinutes();
  
  const todayHours = hours[currentDay as keyof OpeningHours];
  
  if (!todayHours || todayHours.toLowerCase() === 'closed') {
    return {
      isOpen: false,
      status: 'closed',
      message: 'Closed today',
    };
  }
  
  const range = parseHoursRange(todayHours);
  if (!range) {
    return {
      isOpen: false,
      status: 'closed',
      message: 'Hours not available',
    };
  }
  
  const { open, close } = range;
  
  // Check if currently open
  if (currentTime >= open && currentTime < close) {
    // Check if closing soon (within 30 minutes)
    if (close - currentTime <= 30) {
      const minutesLeft = close - currentTime;
      return {
        isOpen: true,
        status: 'closing-soon',
        message: `Closes in ${minutesLeft} min`,
        nextClose: minutesToTimeString(close),
      };
    }
    
    return {
      isOpen: true,
      status: 'open',
      message: 'Open now',
      nextClose: minutesToTimeString(close),
    };
  }
  
  // Check if opening soon (within 30 minutes)
  if (currentTime < open && open - currentTime <= 30) {
    const minutesUntil = open - currentTime;
    return {
      isOpen: false,
      status: 'opening-soon',
      message: `Opens in ${minutesUntil} min`,
      nextOpen: minutesToTimeString(open),
    };
  }
  
  // Closed
  return {
    isOpen: false,
    status: 'closed',
    message: `Opens at ${minutesToTimeString(open)}`,
    nextOpen: minutesToTimeString(open),
  };
}

/**
 * Convert minutes since midnight to time string
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Parse OSM opening_hours string (e.g. "Mo-Fr 08:00-22:00; Sa,Su 09:00-21:00")
 * into our OpeningHours format. Returns null if unparseable.
 */
export function parseOsmHours(osm: string): OpeningHours | null {
  if (!osm) return null;

  // "24/7" shortcut
  if (osm.trim() === '24/7') {
    const always = '00:00-24:00';
    return { monday: always, tuesday: always, wednesday: always, thursday: always, friday: always, saturday: always, sunday: always };
  }

  const DAY_MAP: Record<string, (keyof OpeningHours)[]> = {
    Mo: ['monday'], Tu: ['tuesday'], We: ['wednesday'],
    Th: ['thursday'], Fr: ['friday'], Sa: ['saturday'], Su: ['sunday'],
    'Mo-Fr': ['monday','tuesday','wednesday','thursday','friday'],
    'Mo-Su': ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
    'Sa-Su': ['saturday','sunday'],
    'Tu-Su': ['tuesday','wednesday','thursday','friday','saturday','sunday'],
    'We-Su': ['wednesday','thursday','friday','saturday','sunday'],
  };

  const result: OpeningHours = {};

  const rules = osm.split(';').map(s => s.trim()).filter(Boolean);
  for (const rule of rules) {
    // Match patterns like "Mo-Fr 08:00-22:00" or "Mo,We 10:00-20:00" or just "08:00-22:00"
    const match = rule.match(/^([A-Za-z,\-]+)?\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
    if (!match) continue;

    const [, dayPart, openT, closeT] = match;
    const timeRange = `${openT}-${closeT}`;

    if (!dayPart) {
      // No day prefix — applies to all days
      (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as (keyof OpeningHours)[]).forEach(d => { result[d] = timeRange; });
      continue;
    }

    // Handle comma-separated and range day specs
    const dayTokens = dayPart.split(',');
    for (const token of dayTokens) {
      const days = DAY_MAP[token.trim()];
      if (days) days.forEach(d => { result[d] = timeRange; });
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Get restaurant status badge color
 */
export function getStatusColor(status: 'open' | 'closed' | 'closing-soon' | 'opening-soon'): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'closing-soon':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'opening-soon':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'closed':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Get restaurant status icon
 */
export function getStatusIcon(status: 'open' | 'closed' | 'closing-soon' | 'opening-soon'): string {
  switch (status) {
    case 'open':
      return '✓';
    case 'closing-soon':
      return '⏰';
    case 'opening-soon':
      return '🕐';
    case 'closed':
      return '✕';
    default:
      return '?';
  }
}
