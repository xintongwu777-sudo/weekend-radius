import { ItineraryNode, Place, TransportLeg, WeekendPlan } from '../types/index';
import { distanceKm, estimateTransport } from '../utilities/distance';
import { addMinutes, dailyTimeWindow, minutesBetween, toTimestamp } from '../utilities/time';
import { recalculateSummary } from './generate-plan';

export interface AdditionCandidate {
  place: Place;
  startAt: number;
  endAt: number;
  transportFromPrevious?: TransportLeg;
  transportToNext?: TransportLeg;
  routeMinutes: number;
  score: number;
  tag: string;
}

export interface AdditionSlot {
  id: string;
  insertIndex: number;
  gapStartAt: number;
  gapEndAt: number;
  availableMinutes: number;
  candidates: AdditionCandidate[];
}

function transportBetween(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): TransportLeg {
  const km = distanceKm(from, to);
  return { ...estimateTransport(km), distanceKm: Number(km.toFixed(1)) };
}

function candidateScore(place: Place, plan: WeekendPlan, routeMinutes: number, waitMinutes: number): number {
  const preferences = plan.preferencesSnapshot;
  const interestMatches = place.tags.filter((tag) => preferences.interests.includes(tag)).length;
  const moodMatch = place.suitableMoods.includes(preferences.mood) ? 18 : 0;
  const interestScore = Math.min(30, interestMatches * 18);
  const routeScore = Math.max(0, 28 - routeMinutes);
  const waitScore = Math.max(0, 12 - Math.round(waitMinutes / 15));
  const budgetScore = place.averageCost === 0 ? 12 : Math.max(0, 10 - Math.round(place.averageCost / 30));
  const liveDataBonus = place.source.isMock ? 0 : 8;
  const qualityBonus = place.qualityScore === undefined
    ? 5
    : Math.max(0, Math.min(15, Math.round(((place.qualityScore - 40) / 60) * 15)));
  return interestScore + moodMatch + routeScore + waitScore + budgetScore + liveDataBonus + qualityBonus;
}

function candidateTag(place: Place, plan: WeekendPlan, routeMinutes: number): string {
  if (routeMinutes <= 15) return '最顺路';
  if (place.averageCost === 0) return '免费';
  if (place.tags.some((tag) => plan.preferencesSnapshot.interests.includes(tag))) return '符合兴趣';
  return '填满空档';
}

export function getAdditionSlots(plan: WeekendPlan, allPlaces: Place[]): AdditionSlot[] {
  const preferences = plan.preferencesSnapshot;
  const availableStart = toTimestamp(plan.selectedDate, preferences.availableStartTime);
  const availableEnd = toTimestamp(plan.selectedDate, preferences.availableEndTime);
  const usedIds = new Set(plan.nodes.map((node) => node.sourceId));
  const remainingBudget = preferences.budgetMax === null
    ? Number.POSITIVE_INFINITY
    : Math.max(0, preferences.budgetMax - plan.summary.estimatedTotalCost);
  const slots: AdditionSlot[] = [];

  for (let insertIndex = 0; insertIndex <= plan.nodes.length; insertIndex += 1) {
    const previous = plan.nodes[insertIndex - 1];
    const next = plan.nodes[insertIndex];
    const gapStartAt = previous ? previous.endAt : availableStart;
    const gapEndAt = next ? next.startAt : availableEnd;
    const availableMinutes = minutesBetween(gapStartAt, gapEndAt);
    if (availableMinutes < 35) continue;

    const candidates = allPlaces
      .filter((place) => !usedIds.has(place.id))
      .filter((place) => place.averageCost <= remainingBudget)
      .filter((place) => !place.unsuitableFor.some((item) => preferences.dealbreakers.includes(item)))
      .map((place): AdditionCandidate | null => {
        const transportFromPrevious = previous ? transportBetween(previous.location, place.location) : undefined;
        const transportToNext = next ? transportBetween(place.location, next.location) : undefined;
        const arrivalAt = previous && transportFromPrevious
          ? addMinutes(previous.endAt, transportFromPrevious.durationMinutes)
          : availableStart;
        const { openAt, closeAt } = dailyTimeWindow(plan.selectedDate, place.openTime, place.closeTime);
        const startAt = Math.max(arrivalAt, openAt);
        const endAt = addMinutes(startAt, place.suggestedStayMinutes);
        const arrivalAtNext = next && transportToNext ? addMinutes(endAt, transportToNext.durationMinutes) : endAt;
        if (startAt < gapStartAt || endAt > closeAt || arrivalAtNext > gapEndAt) return null;

        const routeMinutes = (transportFromPrevious?.durationMinutes || 0) + (transportToNext?.durationMinutes || 0);
        const waitMinutes = minutesBetween(gapStartAt, startAt);
        return {
          place,
          startAt,
          endAt,
          transportFromPrevious,
          transportToNext,
          routeMinutes,
          score: candidateScore(place, plan, routeMinutes, waitMinutes),
          tag: candidateTag(place, plan, routeMinutes)
        };
      })
      .filter((candidate): candidate is AdditionCandidate => candidate !== null)
      .sort((a, b) => b.score - a.score || a.routeMinutes - b.routeMinutes)
      .slice(0, 3);

    if (candidates.length) {
      slots.push({
        id: `gap-${insertIndex}-${gapStartAt}-${gapEndAt}`,
        insertIndex,
        gapStartAt,
        gapEndAt,
        availableMinutes,
        candidates
      });
    }
  }

  return slots;
}

export function applyAddition(plan: WeekendPlan, slotId: string, placeId: string, allPlaces: Place[]): WeekendPlan {
  const slot = getAdditionSlots(plan, allPlaces).find((item) => item.id === slotId);
  const candidate = slot?.candidates.find((item) => item.place.id === placeId);
  if (!slot || !candidate) return plan;

  const place = candidate.place;
  const node: ItineraryNode = {
    id: `node-added-${place.id}-${Date.now()}`,
    sourceType: 'place',
    sourceId: place.id,
    name: place.name,
    category: place.category,
    categoryLabel: place.categoryLabel,
    imageUrl: place.imageUrl,
    address: place.address,
    district: place.district,
    location: place.location,
    startAt: candidate.startAt,
    endAt: candidate.endAt,
    durationMinutes: place.suggestedStayMinutes,
    estimatedCost: place.averageCost,
    transportFromPrevious: candidate.transportFromPrevious,
    isAnchor: false,
    replaceable: true,
    recommendationReason: `根据当前空档自动推荐：${place.description}`,
    source: place.source,
    qualityScore: place.qualityScore,
    reviewRating: place.reviewRating,
    reviewCount: place.reviewCount,
    ratingSource: place.ratingSource
  };

  const nodes = [...plan.nodes];
  nodes.splice(slot.insertIndex, 0, node);
  const next = nodes[slot.insertIndex + 1];
  if (next) {
    nodes[slot.insertIndex + 1] = { ...next, transportFromPrevious: candidate.transportToNext };
  }

  const updated = { ...plan, version: plan.version + 1, nodes, saved: false, updatedAt: Date.now() };
  updated.summary = recalculateSummary(updated);
  return updated;
}
