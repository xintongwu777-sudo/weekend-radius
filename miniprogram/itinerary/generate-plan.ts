import { Activity, ItineraryNode, Place, PlaceCategory, UserPreferences, WeekendPlan } from '../types/index';
import { distanceKm, estimateTransport } from '../utilities/distance';
import { addMinutes, dailyTimeWindow, minutesBetween, toTimestamp } from '../utilities/time';

function isAllowed(place: Place, preferences: UserPreferences): boolean {
  return !place.unsuitableFor.some((item) => preferences.dealbreakers.includes(item));
}

function isOpen(place: Place, startAt: number, endAt: number, dateKey: string): boolean {
  const { openAt, closeAt } = dailyTimeWindow(dateKey, place.openTime, place.closeTime);
  return startAt >= openAt && endAt <= closeAt;
}

function naturalPlaceTime(place: Place): string {
  if (place.category === 'park' || place.category === 'walk') return '08:00';
  if (place.category === 'brunch') return '09:30';
  if (place.category === 'cafe') return '10:00';
  if (place.category === 'shopping' || place.category === 'market') return '10:30';
  if (place.category === 'lunch') return '11:30';
  if (place.category === 'dessert') return '14:30';
  if (place.category === 'dinner') return '18:00';
  if (place.category === 'bar') return '19:30';
  return '10:00';
}

function findPlace(
  categories: PlaceCategory[],
  target: { latitude: number; longitude: number },
  used: Set<string>,
  preferences: UserPreferences,
  allPlaces: Place[],
  maxCost = Number.POSITIVE_INFINITY
): Place | undefined {
  return allPlaces
    .filter((place) => categories.includes(place.category) && !used.has(place.id) && isAllowed(place, preferences) && place.averageCost <= maxCost)
    .sort((a, b) => {
      const aRank = (a.qualityScore ?? 55) - distanceKm(a.location, target) * 6;
      const bRank = (b.qualityScore ?? 55) - distanceKm(b.location, target) * 6;
      return Number(a.source.isMock) - Number(b.source.isMock) || bRank - aRank;
    })[0];
}

function transportNode(from: ItineraryNode, toLocation: { latitude: number; longitude: number }) {
  const km = distanceKm(from.location, toLocation);
  const estimate = estimateTransport(km);
  return { ...estimate, distanceKm: Number(km.toFixed(1)) };
}

function placeNode(place: Place, startAt: number, dateKey: string, previous?: ItineraryNode): ItineraryNode {
  const transport = previous ? transportNode(previous, place.location) : undefined;
  const arrivalAt = previous && transport ? addMinutes(previous.endAt, transport.durationMinutes) : startAt;
  const { openAt } = dailyTimeWindow(dateKey, place.openTime, place.closeTime);
  const actualStart = Math.max(arrivalAt, openAt, toTimestamp(dateKey, naturalPlaceTime(place)));
  return {
    id: `node-${place.id}-${actualStart}`,
    sourceType: 'place', sourceId: place.id, name: place.name, category: place.category,
    categoryLabel: place.categoryLabel, imageUrl: place.imageUrl, address: place.address, district: place.district,
    location: place.location, startAt: actualStart, endAt: addMinutes(actualStart, place.suggestedStayMinutes),
    durationMinutes: place.suggestedStayMinutes, estimatedCost: place.averageCost,
    transportFromPrevious: transport, isAnchor: false, replaceable: true,
    recommendationReason: place.description,
    source: place.source,
    qualityScore: place.qualityScore,
    reviewRating: place.reviewRating,
    reviewCount: place.reviewCount,
    ratingSource: place.ratingSource
  };
}

function anchorNode(activity: Activity, previous?: ItineraryNode): ItineraryNode {
  return {
    id: `anchor-${activity.id}`, sourceType: 'activity', sourceId: activity.id, name: activity.name,
    category: activity.category, categoryLabel: activity.categoryLabel, imageUrl: activity.imageUrl,
    address: activity.address, district: activity.district, location: activity.location,
    startAt: activity.startAt, endAt: activity.endAt, durationMinutes: activity.durationMinutes,
    estimatedCost: activity.priceMin, transportFromPrevious: previous ? transportNode(previous, activity.location) : undefined,
    isAnchor: true, replaceable: false, recommendationReason: '这是你选定的 Anchor Event，整天的安排会围绕它展开。',
    source: activity.source,
    qualityScore: activity.qualityScore,
    reviewRating: activity.reviewRating,
    reviewCount: activity.reviewCount,
    ratingSource: activity.ratingSource
  };
}

export function recalculateSummary(plan: WeekendPlan): WeekendPlan['summary'] {
  const totalTransportMinutes = plan.nodes.reduce((sum, node) => sum + (node.transportFromPrevious?.durationMinutes || 0), 0);
  const estimatedTotalCost = plan.nodes.reduce((sum, node) => sum + node.estimatedCost, 0);
  const totalDurationMinutes = minutesBetween(plan.nodes[0].startAt, plan.nodes[plan.nodes.length - 1].endAt);
  const pace = plan.nodes.length <= 4 ? 'relaxed' : plan.nodes.length === 5 ? 'balanced' : 'full';
  return {
    startAt: plan.nodes[0].startAt,
    endAt: plan.nodes[plan.nodes.length - 1].endAt,
    totalDurationMinutes,
    totalTransportMinutes,
    estimatedTotalCost,
    pace
  };
}

export function generatePlan(preferences: UserPreferences, activity: Activity, allPlaces: Place[]): WeekendPlan {
  const availableStart = toTimestamp(preferences.selectedDate, preferences.availableStartTime);
  const availableEnd = toTimestamp(preferences.selectedDate, preferences.availableEndTime);
  const nodes: ItineraryNode[] = [];
  const used = new Set<string>();
  const availablePlaceBudget = () => preferences.budgetMax === null
    ? Number.POSITIVE_INFINITY
    : Math.max(0, preferences.budgetMax - activity.priceMin - nodes.reduce((sum, node) => sum + node.estimatedCost, 0));

  const anchorHour = new Date(activity.startAt).getHours();
  const beforeGroups: PlaceCategory[][] = anchorHour < 11
    ? [['cafe', 'brunch'], ['walk', 'park']]
    : anchorHour < 14
      ? [['walk', 'park'], ['cafe', 'brunch'], ['lunch']]
      : [['walk', 'park'], ['cafe', 'brunch'], ['shopping'], ['lunch']];

  for (const categories of beforeGroups) {
    const previous = nodes[nodes.length - 1];
    const target = previous ? previous.location : activity.location;
    const place = findPlace(categories, target, used, preferences, allPlaces, availablePlaceBudget());
    if (!place) continue;
    const node = placeNode(place, availableStart, preferences.selectedDate, previous);
    const toAnchorKm = distanceKm(node.location, activity.location);
    const toAnchorMinutes = estimateTransport(toAnchorKm).durationMinutes;
    if (node.endAt + (toAnchorMinutes + 12) * 60000 <= activity.startAt && isOpen(place, node.startAt, node.endAt, preferences.selectedDate)) {
      nodes.push(node);
      used.add(place.id);
    }
  }

  const anchor = anchorNode(activity, nodes[nodes.length - 1]);
  nodes.push(anchor);

  const endHour = new Date(activity.endAt).getHours();
  const afterGroups: PlaceCategory[][] = endHour < 17
    ? [['cafe', 'dessert', 'walk', 'park'], ['dinner', 'lunch'], ['dessert', 'shopping']]
    : endHour < 20
      ? [['dinner', 'lunch', 'cafe'], ['dessert', 'walk', 'shopping']]
      : [['dessert', 'cafe', 'walk']];

  for (const categories of afterGroups) {
    const previous = nodes[nodes.length - 1];
    const place = findPlace(categories, previous.location, used, preferences, allPlaces, availablePlaceBudget());
    if (!place) continue;
    const node = placeNode(place, previous.endAt, preferences.selectedDate, previous);
    if (node.endAt <= availableEnd && isOpen(place, node.startAt, node.endAt, preferences.selectedDate)) {
      nodes.push(node);
      used.add(place.id);
    }
  }

  const now = Date.now();
  const draft: WeekendPlan = {
    id: `plan-${now}`,
    version: 1,
    title: `${activity.district.replace('区', '')}的一日松弛计划`,
    cityCode: preferences.cityCode,
    cityName: preferences.cityName,
    selectedDate: preferences.selectedDate,
    preferencesSnapshot: preferences,
    anchorEventId: activity.id,
    nodes,
    summary: {} as WeekendPlan['summary'],
    saved: false,
    createdAt: now,
    updatedAt: now,
    planningPlaces: allPlaces
  };
  draft.summary = recalculateSummary(draft);
  return draft;
}
