import { Activity, Place, UserLocation, UserPreferences, WeekendPlan } from '../types/index';

const KEYS = {
  preferences: 'wr_preferences',
  anchorId: 'wr_anchor_id',
  currentPlan: 'wr_current_plan',
  savedPlans: 'wr_saved_plans',
  userLocation: 'wr_user_location',
  planningPlaces: 'wr_planning_places',
  activityCatalog: 'wr_activity_catalog'
};

export function savePreferences(value: UserPreferences): void {
  wx.setStorageSync(KEYS.preferences, value);
}

export function getPreferences(): UserPreferences | null {
  const stored = wx.getStorageSync(KEYS.preferences) as UserPreferences | null;
  if (!stored) return null;
  const wasLegacySurprise = stored.mood === 'surprise';
  return {
    ...stored,
    recommendationMode: stored.recommendationMode || (wasLegacySurprise ? 'surprise' : 'interest'),
    mood: wasLegacySurprise ? 'explore' : stored.mood,
    interests: wasLegacySurprise ? [] : (stored.interests || []),
    customInterests: wasLegacySurprise ? [] : (stored.customInterests || [])
  };
}

export function saveUserLocation(value: UserLocation): void {
  wx.setStorageSync(KEYS.userLocation, value);
}

export function getUserLocation(): UserLocation | null {
  return wx.getStorageSync(KEYS.userLocation) || null;
}

export function savePlanningPlaces(value: Place[]): void {
  wx.setStorageSync(KEYS.planningPlaces, value);
}

export function getPlanningPlaces(): Place[] {
  return wx.getStorageSync(KEYS.planningPlaces) || [];
}

export function saveActivityCatalog(value: Activity[]): void {
  wx.setStorageSync(KEYS.activityCatalog, value);
}

export function getActivityCatalog(): Activity[] {
  return wx.getStorageSync(KEYS.activityCatalog) || [];
}

export function saveAnchorId(id: string): void {
  wx.setStorageSync(KEYS.anchorId, id);
}

export function getAnchorId(): string {
  return wx.getStorageSync(KEYS.anchorId) || '';
}

export function saveCurrentPlan(plan: WeekendPlan): void {
  wx.setStorageSync(KEYS.currentPlan, plan);
}

export function getCurrentPlan(): WeekendPlan | null {
  return wx.getStorageSync(KEYS.currentPlan) || null;
}

export function getSavedPlans(): WeekendPlan[] {
  return wx.getStorageSync(KEYS.savedPlans) || [];
}

export function persistPlan(plan: WeekendPlan): WeekendPlan {
  const saved = { ...plan, saved: true, updatedAt: Date.now() };
  const existing = getSavedPlans();
  const next = [saved, ...existing.filter((item) => item.id !== saved.id)];
  wx.setStorageSync(KEYS.savedPlans, next);
  saveCurrentPlan(saved);
  return saved;
}

export function deleteSavedPlan(id: string): WeekendPlan[] {
  const next = getSavedPlans().filter((plan) => plan.id !== id);
  wx.setStorageSync(KEYS.savedPlans, next);
  const current = getCurrentPlan();
  if (current?.id === id) saveCurrentPlan({ ...current, saved: false, updatedAt: Date.now() });
  return next;
}
