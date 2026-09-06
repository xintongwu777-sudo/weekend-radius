import { Activity, InterestType, Place, UserPreferences } from '../types/index';
import { dailyTimeWindow, toTimestamp } from '../utilities/time';

function activityCategory(place: Place): InterestType {
  if (['brunch', 'lunch', 'dinner', 'dessert'].includes(place.category)) return 'food';
  if (place.category === 'cafe') return 'coffee';
  if (place.category === 'bar') return 'nightlife';
  if (place.category === 'movie' || place.tags.includes('movie')) return 'movie';
  if (place.tags.includes('music')) return 'music';
  if (place.tags.includes('theater')) return 'theater';
  if (place.tags.includes('reading')) return 'reading';
  if (place.category === 'shopping') return 'shopping';
  if (place.category === 'park') return 'outdoor';
  return 'culture';
}

function activityName(place: Place): string {
  if (['brunch', 'lunch', 'dinner', 'dessert'].includes(place.category)) return `去${place.name}认真吃一顿`;
  if (place.category === 'cafe') return `到${place.name}喝杯咖啡`;
  if (place.category === 'bar') return `去${place.name}开启夜生活`;
  if (place.category === 'park') return `到${place.name}散步放空`;
  if (place.category === 'shopping') return `逛逛${place.name}`;
  if (place.category === 'movie') return `去${place.name}选一场电影`;
  if (place.tags.includes('music')) return `看看${place.name}最近的演出`;
  if (place.tags.includes('theater')) return `去${place.name}看一场演出`;
  if (place.tags.includes('reading')) return `在${place.name}慢慢逛书`;
  return `去${place.name}城市漫游`;
}

function activityDescription(place: Place): string {
  const base = `${place.source.name}提供的真实地点，可直接导航至${place.address}。`;
  if (place.scheduleNeedsConfirmation) {
    return `${base}这是与“${place.searchIntent || place.categoryLabel}”相关的场馆或地点，不代表选定日期一定有活动；请通过主办方或场馆官方渠道确认日期、场次和票价。`;
  }
  if (place.reviewRating && place.qualityReason) {
    return `${base}${place.qualityReason}。评分、评论数和价格仅作推荐排序参考，请以最新页面为准。`;
  }
  if (place.qualityReason) return `${base}${place.qualityReason}。综合口碑为编辑参考，不是某个平台的实时星级。`;
  if (place.category === 'movie') return `${base}影片、场次和票价请在选定日期前通过影院或购票平台确认。`;
  if (place.tags.includes('music') || place.tags.includes('theater')) {
    return `${base}这里展示的是演出场馆，不代表已有特定演出；具体节目和票价需通过场馆官方渠道确认。`;
  }
  return `${base}开放时间和消费金额为规划参考，请以现场信息为准。`;
}

function minimumUsefulMinutes(place: Place): number {
  if (place.category === 'movie') return 110;
  if (place.tags.some((tag) => ['music', 'theater'].includes(tag))) return 90;
  if (place.category === 'shopping') return 60;
  if (place.category === 'park') return 45;
  if (place.category === 'cafe') return 35;
  if (['brunch', 'lunch', 'dinner', 'dessert'].includes(place.category)) return 50;
  return 45;
}

function preferredStartTime(place: Place): string {
  if (place.category === 'bar') return '19:30';
  if (place.tags.some((tag) => ['music', 'theater'].includes(tag))) return '19:00';
  if (place.category === 'movie') return '13:00';
  if (place.category === 'lunch' || place.category === 'brunch') return '11:30';
  if (place.category === 'dessert') return '14:30';
  if (place.category === 'cafe') return '10:00';
  if (place.category === 'park') return '08:00';
  if (place.category === 'shopping' || place.tags.includes('reading')) return '10:30';
  return '10:00';
}

function resolveSuggestedSchedule(place: Place, preferences: UserPreferences) {
  const availableStart = toTimestamp(preferences.selectedDate, preferences.availableStartTime);
  const availableEnd = toTimestamp(preferences.selectedDate, preferences.availableEndTime);
  const { openAt, closeAt } = dailyTimeWindow(preferences.selectedDate, place.openTime, place.closeTime);

  const windowStart = Math.max(availableStart, openAt);
  const windowEnd = Math.min(availableEnd, closeAt);
  const availableMinutes = Math.floor((windowEnd - windowStart) / 60000);
  const minimumMinutes = minimumUsefulMinutes(place);
  if (availableMinutes < minimumMinutes) return null;

  const durationMinutes = Math.min(place.suggestedStayMinutes || 90, availableMinutes);
  const latestStart = windowEnd - durationMinutes * 60000;
  const naturalStart = toTimestamp(preferences.selectedDate, preferredStartTime(place));
  const startAt = Math.max(windowStart, Math.min(naturalStart, latestStart));
  return { startAt, endAt: startAt + durationMinutes * 60000, durationMinutes };
}

export function convertPlacesToActivities(places: Place[], preferences: UserPreferences): Activity[] {
  const seenCategories = new Map<string, number>();
  const activities: Activity[] = [];

  for (const place of places) {
    const supported = place.category === 'park'
      || place.category === 'shopping'
      || place.category === 'movie'
      || place.category === 'attraction'
      || place.category === 'lunch'
      || place.category === 'cafe'
      || place.category === 'bar'
      || place.tags.some((tag) => ['music', 'theater', 'reading'].includes(tag));
    if (!supported) continue;
    const schedule = resolveSuggestedSchedule(place, preferences);
    if (!schedule) continue;
    const category = activityCategory(place);
    const count = seenCategories.get(category) || 0;
    if (count >= 4) continue;
    seenCategories.set(category, count + 1);
    const suitableInterests = Array.from(new Set<InterestType>([category, ...place.tags]));
    activities.push({
      id: `place-activity-${place.id}`,
      name: activityName(place),
      category,
      categoryLabel: place.categoryLabel,
      tags: suitableInterests,
      imageUrl: place.imageUrl,
      description: activityDescription(place),
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      durationMinutes: schedule.durationMinutes,
      venueName: place.name,
      address: place.address,
      district: place.district,
      location: place.location,
      priceMin: place.averageCost,
      priceMax: place.averageCost,
      bookingRequired: place.category === 'movie' || place.tags.includes('music') || place.tags.includes('theater'),
      suitableMoods: place.suitableMoods,
      suitableInterests,
      unsuitableFor: place.unsuitableFor,
      travelMinutesFromCenter: 20,
      noveltyScore: category === 'music' || category === 'theater' ? 9 : 7,
      scheduleType: 'suggested',
      qualityScore: place.qualityScore,
      qualityReason: place.qualityReason,
      reviewRating: place.reviewRating,
      reviewCount: place.reviewCount,
      ratingSource: place.ratingSource,
      tasteRating: place.tasteRating,
      source: place.source
    });
  }
  return activities;
}
