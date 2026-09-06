import { LocationPoint } from '../types/index';

export function distanceKm(a: LocationPoint, b: LocationPoint): number {
  const radius = 6371;
  const rad = (value: number) => (value * Math.PI) / 180;
  const deltaLat = rad(b.latitude - a.latitude);
  const deltaLng = rad(b.longitude - a.longitude);
  const lat1 = rad(a.latitude);
  const lat2 = rad(b.latitude);
  const value = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function estimateTransport(distance: number): { mode: 'walk' | 'transit' | 'taxi'; durationMinutes: number } {
  if (distance <= 1.5) return { mode: 'walk', durationMinutes: Math.max(5, Math.round(distance * 13)) };
  if (distance <= 8) return { mode: 'transit', durationMinutes: Math.round(12 + distance * 3.2) };
  return { mode: 'taxi', durationMinutes: Math.round(10 + distance * 2.5) };
}
