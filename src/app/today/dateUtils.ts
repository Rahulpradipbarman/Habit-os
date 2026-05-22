import { supabase } from '@/lib/supabase';

/**
 * Retrieves the stored timezone for the current user from the `users` table.
 * Returns a string like "America/New_York". If not found, returns null.
 */
export const getStoredUserTimeZone = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('timezone')
    .eq('id', userId)
    .single();
  
  if (!error && data?.timezone) {
    return data.timezone as string;
  }
  
  return null;
};

/**
 * Returns a date string (YYYY‑MM‑DD) representing the given date in the given
 * IANA timezone. If no timezone is supplied, the browser's resolved timezone is used.
 */
export const getLocalDate = (tz: string, dateObj?: Date): string => {
  let zone = tz;
  if (!zone) {
    console.warn("[WARNING] No timezone provided to getLocalDate, falling back to UTC");
    zone = 'UTC';
  }
  const now = dateObj || new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: zone,
  }).formatToParts(now);
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
};

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

export function formatLocalTime(
  date: Date | string,
  timezone: string
) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatLocalDate(
  date: Date | string,
  timezone: string
) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Calculates a greeting based on the current time in the provided timezone.
 * Returns:
 * "Good morning" → 5 AM–11:59 AM
 * "Good afternoon" → 12 PM–4:59 PM
 * "Good evening" → 5 PM–8:59 PM
 * "Good night" → 9 PM–4:59 AM
 */
export const getTimeBasedGreeting = (timezone: string): string => {
  let zone = timezone;
  if (!zone) {
    console.warn("[WARNING] No timezone provided to getTimeBasedGreeting, falling back to UTC");
    zone = 'UTC';
  }
  
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: zone,
  }).formatToParts(new Date());

  const hourPart = parts.find(p => p.type === 'hour');
  const hour = hourPart ? parseInt(hourPart.value, 10) : new Date().getHours();
  const normalizedHour = hour === 24 ? 0 : hour;

  let greeting = '';
  if (normalizedHour >= 5 && normalizedHour < 12) {
    greeting = 'Good morning';
  } else if (normalizedHour >= 12 && normalizedHour < 17) {
    greeting = 'Good afternoon';
  } else if (normalizedHour >= 17 && normalizedHour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Greeting Verify] Timezone: ${zone} | Local Hour: ${normalizedHour} | Result: ${greeting}`);
  }

  return greeting;
};
