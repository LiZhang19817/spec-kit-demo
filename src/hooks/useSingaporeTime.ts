import { useEffect, useState } from 'react';

const clockParts = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function formatSingaporeClock(d: Date): string {
  const parts = clockParts.formatToParts(d);
  const v = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = v('hour');
  const minute = v('minute');
  const second = v('second');
  const dayPeriod = v('dayPeriod').toUpperCase();
  return `${hour}:${minute}:${second} ${dayPeriod}`;
}

/**
 * Live clock label for Asia/Singapore (UTC+8), e.g. "12:07:23 AM".
 */
export function useSingaporeTime(intervalMs = 1000): { now: Date; label: string } {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return { now, label: formatSingaporeClock(now) };
}
