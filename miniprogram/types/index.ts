export type WeekendDay = 'saturday' | 'sunday';
export type BudgetLevel = '50' | '100' | '200' | 'flexible';
export type BudgetMode = 'slider' | 'custom';
export type RecommendationMode = 'interest' | 'surprise';
export type InterestType =
  | 'exhibition' | 'art' | 'market' | 'food' | 'coffee' | 'music' | 'movie' | 'outdoor'
  | 'shopping' | 'workshop' | 'nightlife' | 'sports' | 'theater' | 'comedy' | 'dance' | 'anime'
  | 'reading' | 'photography' | 'gaming' | 'wellness' | 'handicraft' | 'history' | 'culture' | 'pets';
export type MoodType = 'recharge' | 'explore' | 'foodie' | 'culture' | 'date' | 'budget' | 'surprise';
export type DistancePreference = 'nearby' | 'within_30_min' | 'whole_city';
export type DealbreakerType = 'no_outdoor' | 'no_alcohol' | 'avoid_long_walks' | 'avoid_queues' | 'not_too_late';

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends LocationPoint {
  label: string;
  source: 'gps' | 'chosen';
  updatedAt: number;
}

export interface UserPreferences {
  cityCode: string;
  cityName: string;
  selectedDay: WeekendDay;
  selectedDate: string;
  availableStartTime: string;
  availableEndTime: string;
  budgetMode: BudgetMode;
  budgetLevel?: BudgetLevel;
  budgetMax: number | null;
  recommendationMode: RecommendationMode;
  surpriseSeed?: number;
  interests: InterestType[];
  customInterests: string[];
  mood: MoodType;
  distancePreference: DistancePreference;
  dealbreakers: DealbreakerType[];
}

export interface Activity {
  id: string;
  name: string;
  category: InterestType;
  categoryLabel: string;
  tags: InterestType[];
  imageUrl: string;
  description: string;
  startAt: number;
  endAt: number;
  durationMinutes: number;
  venueName: string;
  address: string;
  district: string;
  location: LocationPoint;
  priceMin: number;
  priceMax: number;
  bookingRequired: boolean;
  suitableMoods: MoodType[];
  suitableInterests: InterestType[];
  unsuitableFor: DealbreakerType[];
  travelMinutesFromCenter: number;
  noveltyScore: number;
  source: { name: string; url?: string; isMock: boolean; providerId?: string; fetchedAt?: number };
  scheduleType?: 'fixed' | 'suggested';
  qualityScore?: number;
  qualityReason?: string;
  reviewRating?: number;
  reviewCount?: number;
  ratingSource?: string;
  tasteRating?: number;
  scheduleNeedsConfirmation?: boolean;
  searchIntent?: string;
  pricePending?: boolean;
}

export type PlaceCategory = 'brunch' | 'lunch' | 'dinner' | 'cafe' | 'dessert' | 'walk' | 'park' | 'market' | 'shopping' | 'movie' | 'bar' | 'attraction';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  tags: InterestType[];
  imageUrl: string;
  description: string;
  address: string;
  district: string;
  location: LocationPoint;
  averageCost: number;
  suggestedStayMinutes: number;
  openTime: string;
  closeTime: string;
  suitableMoods: MoodType[];
  unsuitableFor: DealbreakerType[];
  source: { name: string; url?: string; isMock: boolean; providerId?: string; fetchedAt?: number };
  hoursEstimated?: boolean;
  priceEstimated?: boolean;
  phone?: string;
  qualityScore?: number;
  qualityReason?: string;
  reviewRating?: number;
  reviewCount?: number;
  ratingSource?: string;
  tasteRating?: number;
  scheduleNeedsConfirmation?: boolean;
  searchIntent?: string;
}

export interface MatchResult {
  activity: Activity;
  totalScore: number;
  scoreBreakdown: {
    interest: number;
    quality: number;
    mood: number;
    timeFit: number;
    budgetFit: number;
    distance: number;
    novelty: number;
  };
  passedHardConstraints: boolean;
  rejectionReasons: string[];
  recommendationReasons: string[];
}

export interface TransportLeg {
  mode: 'walk' | 'transit' | 'taxi';
  durationMinutes: number;
  distanceKm: number;
}

export interface ItineraryNode {
  id: string;
  sourceType: 'activity' | 'place';
  sourceId: string;
  name: string;
  category: string;
  categoryLabel: string;
  imageUrl: string;
  address: string;
  district: string;
  location: LocationPoint;
  startAt: number;
  endAt: number;
  durationMinutes: number;
  estimatedCost: number;
  transportFromPrevious?: TransportLeg;
  isAnchor: boolean;
  replaceable: boolean;
  recommendationReason: string;
  source?: { name: string; isMock: boolean; providerId?: string; fetchedAt?: number };
  qualityScore?: number;
  reviewRating?: number;
  reviewCount?: number;
  ratingSource?: string;
}

export interface WeekendPlan {
  id: string;
  version: number;
  title: string;
  cityCode: string;
  cityName: string;
  selectedDate: string;
  preferencesSnapshot: UserPreferences;
  anchorEventId: string;
  nodes: ItineraryNode[];
  summary: {
    startAt: number;
    endAt: number;
    totalDurationMinutes: number;
    totalTransportMinutes: number;
    estimatedTotalCost: number;
    pace: 'relaxed' | 'balanced' | 'full';
  };
  saved: boolean;
  createdAt: number;
  updatedAt: number;
  placeDataMode?: 'mock' | 'hybrid' | 'live';
  placeDataUpdatedAt?: number;
  planningPlaces?: Place[];
}

export interface ReplacementCandidate {
  place: Place;
  budgetDelta: number;
  transportDelta: number;
  tag: string;
}
