import { LIVE_POI_ENABLED } from '../config/runtime';
import { DistancePreference, InterestType, LocationPoint, MoodType, Place } from '../types/index';
import { requestPlacesApi } from './places-api';

export interface NearbyPlacesResult {
  places: Place[];
  mode: 'mock' | 'live';
  updatedAt?: number;
  message?: string;
}

export async function searchNearbyPlaces(center: LocationPoint): Promise<NearbyPlacesResult> {
  if (!LIVE_POI_ENABLED) {
    return { places: [], mode: 'mock', message: '实时地点服务尚未配置' };
  }

  try {
    const result = await requestPlacesApi({ center, radius: 5000 });
    if (!result?.success || !Array.isArray(result.places)) {
      return { places: [], mode: 'mock', message: result?.message || '实时地点服务暂时不可用' };
    }
    return {
      places: result.places as Place[],
      mode: result.places.length ? 'live' : 'mock',
      updatedAt: Number(result.updatedAt || Date.now())
    };
  } catch (error: any) {
    return { places: [], mode: 'mock', message: error?.errMsg || '实时地点服务暂时不可用' };
  }
}

export async function searchNearbyActivityPlaces(
  center: LocationPoint,
  interests: InterestType[],
  customInterests: string[],
  distancePreference: DistancePreference,
  mood: MoodType,
  recommendationMode: 'interest' | 'surprise' = 'interest',
  surpriseSeed?: number
): Promise<NearbyPlacesResult> {
  if (!LIVE_POI_ENABLED) {
    return { places: [], mode: 'mock', message: '实时地点服务尚未配置' };
  }

  try {
    const radius = distancePreference === 'nearby' ? 3000 : distancePreference === 'within_30_min' ? 10000 : 20000;
    const result = await requestPlacesApi({
      kind: 'activityPlaces', center, radius, interests, customInterests, distancePreference,
      mood, recommendationMode, surpriseSeed
    });
    if (!result?.success || !Array.isArray(result.places)) {
      return { places: [], mode: 'mock', message: result?.message || '实时活动地点暂时不可用' };
    }
    return {
      places: result.places as Place[],
      mode: result.places.length ? 'live' : 'mock',
      updatedAt: Number(result.updatedAt || Date.now())
    };
  } catch (error: any) {
    return { places: [], mode: 'mock', message: error?.errMsg || error?.message || '实时活动地点暂时不可用' };
  }
}
