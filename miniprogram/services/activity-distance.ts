import { Activity, UserLocation } from '../types/index';
import { distanceKm, estimateTransport } from '../utilities/distance';

export function applyUserDistance(activities: Activity[], location: UserLocation | null): Activity[] {
  if (!location) return activities;
  return activities.map((activity) => ({
    ...activity,
    travelMinutesFromCenter: estimateTransport(distanceKm(location, activity.location)).durationMinutes
  }));
}
