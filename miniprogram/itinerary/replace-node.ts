import { ItineraryNode, Place, PlaceCategory, ReplacementCandidate, UserPreferences, WeekendPlan } from '../types/index';
import { distanceKm, estimateTransport } from '../utilities/distance';
import { dailyTimeWindow } from '../utilities/time';
import { recalculateSummary } from './generate-plan';

function categoryChoices(category: string): PlaceCategory[] {
  if (category === 'cafe') return ['cafe', 'dessert', 'shopping', 'walk'];
  if (category === 'walk' || category === 'park') return ['walk', 'park', 'cafe', 'shopping'];
  if (category === 'lunch' || category === 'brunch' || category === 'dinner') return [category as PlaceCategory, 'cafe', 'dessert'];
  return [category as PlaceCategory, 'cafe', 'dessert', 'shopping'];
}

function legMinutes(a: ItineraryNode, location: Place['location']): number {
  return estimateTransport(distanceKm(a.location, location)).durationMinutes;
}

export function getReplacementCandidates(plan: WeekendPlan, nodeId: string, allPlaces: Place[]): ReplacementCandidate[] {
  const index = plan.nodes.findIndex((node) => node.id === nodeId);
  if (index < 0) return [];
  const current = plan.nodes[index];
  const previous = plan.nodes[index - 1];
  const next = plan.nodes[index + 1];
  const usedIds = new Set(plan.nodes.map((node) => node.sourceId));
  const preferences: UserPreferences = plan.preferencesSnapshot;
  const openAt = current.startAt;
  const closeAt = current.endAt;

  return allPlaces
    .filter((place) => categoryChoices(current.category).includes(place.category))
    .filter((place) => !usedIds.has(place.id))
    .filter((place) => !place.unsuitableFor.some((item) => preferences.dealbreakers.includes(item)))
    .filter((place) => preferences.budgetMax === null || plan.summary.estimatedTotalCost - current.estimatedCost + place.averageCost <= preferences.budgetMax)
    .filter((place) => {
      const hours = dailyTimeWindow(plan.selectedDate, place.openTime, place.closeTime);
      return openAt >= hours.openAt && closeAt <= hours.closeAt;
    })
    .map((place) => {
      const oldTransport = (current.transportFromPrevious?.durationMinutes || 0) + (next?.transportFromPrevious?.durationMinutes || 0);
      const newTransport = (previous ? legMinutes(previous, place.location) : 0) + (next ? estimateTransport(distanceKm(place.location, next.location)).durationMinutes : 0);
      return {
        place,
        budgetDelta: place.averageCost - current.estimatedCost,
        transportDelta: newTransport - oldTransport,
        tag: newTransport <= oldTransport ? '最顺路' : place.category === current.category ? '同类型' : '换个口味'
      };
    })
    .sort((a, b) => Number(a.place.source.isMock) - Number(b.place.source.isMock)
      || (b.place.qualityScore ?? 55) - (a.place.qualityScore ?? 55)
      || a.transportDelta - b.transportDelta
      || a.budgetDelta - b.budgetDelta)
    .slice(0, 3);
}

export function applyReplacement(plan: WeekendPlan, nodeId: string, place: Place): WeekendPlan {
  const index = plan.nodes.findIndex((node) => node.id === nodeId);
  if (index < 0 || plan.nodes[index].isAnchor) return plan;
  const original = plan.nodes[index];
  const previous = plan.nodes[index - 1];

  const replacement: ItineraryNode = {
    ...original,
    sourceId: place.id,
    name: place.name,
    category: place.category,
    categoryLabel: place.categoryLabel,
    imageUrl: place.imageUrl,
    address: place.address,
    district: place.district,
    location: place.location,
    estimatedCost: place.averageCost,
    recommendationReason: place.description,
    source: place.source,
    qualityScore: place.qualityScore,
    reviewRating: place.reviewRating,
    reviewCount: place.reviewCount,
    ratingSource: place.ratingSource,
    transportFromPrevious: previous ? {
      ...estimateTransport(distanceKm(previous.location, place.location)),
      distanceKm: Number(distanceKm(previous.location, place.location).toFixed(1))
    } : undefined
  };

  const nodes = [...plan.nodes];
  nodes[index] = replacement;
  const next = nodes[index + 1];
  if (next) {
    const km = distanceKm(replacement.location, next.location);
    nodes[index + 1] = {
      ...next,
      transportFromPrevious: { ...estimateTransport(km), distanceKm: Number(km.toFixed(1)) }
    };
  }

  const updated = { ...plan, version: plan.version + 1, nodes, saved: false, updatedAt: Date.now() };
  updated.summary = recalculateSummary(updated);
  return updated;
}

export function skipNode(plan: WeekendPlan, nodeId: string): WeekendPlan {
  const index = plan.nodes.findIndex((node) => node.id === nodeId);
  if (index < 0 || plan.nodes[index].isAnchor) return plan;
  const nodes = plan.nodes.filter((node) => node.id !== nodeId);
  const previous = nodes[index - 1];
  const next = nodes[index];
  if (previous && next) {
    const km = distanceKm(previous.location, next.location);
    nodes[index] = {
      ...next,
      transportFromPrevious: { ...estimateTransport(km), distanceKm: Number(km.toFixed(1)) }
    };
  } else if (next) {
    nodes[index] = { ...next, transportFromPrevious: undefined };
  }
  const updated = { ...plan, version: plan.version + 1, nodes, saved: false, updatedAt: Date.now() };
  updated.summary = recalculateSummary(updated);
  return updated;
}
