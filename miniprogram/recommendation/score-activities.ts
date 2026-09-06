import { Activity, InterestType, MatchResult, UserPreferences } from '../types/index';
import { toTimestamp } from '../utilities/time';

const interestAffinity: Partial<Record<InterestType, InterestType[]>> = {
  exhibition: ['art', 'history', 'culture'],
  art: ['exhibition', 'culture'],
  food: ['coffee'],
  coffee: ['food'],
  music: ['nightlife', 'theater'],
  movie: ['art', 'culture'],
  anime: ['exhibition', 'art', 'culture'],
  outdoor: ['culture'],
  shopping: ['market'],
  theater: ['music', 'art', 'culture'],
  reading: ['culture', 'history'],
  history: ['exhibition', 'culture'],
  culture: ['exhibition', 'art', 'history', 'reading', 'outdoor'],
  nightlife: ['music']
};

const moodLabels: Record<UserPreferences['mood'], string> = {
  recharge: '放松充电',
  explore: '探索城市',
  foodie: '美食探店',
  culture: '文化漫游',
  date: '浪漫约会',
  budget: '省钱出行',
  surprise: '随机惊喜'
};

const moodAffinity: Record<UserPreferences['mood'], InterestType[]> = {
  recharge: ['coffee', 'reading', 'outdoor', 'wellness', 'movie'],
  explore: ['culture', 'outdoor', 'shopping', 'market', 'nightlife', 'music'],
  foodie: ['food', 'coffee'],
  culture: ['exhibition', 'art', 'history', 'theater', 'reading', 'anime', 'culture'],
  date: ['coffee', 'food', 'movie', 'art', 'music', 'shopping', 'theater', 'nightlife'],
  budget: ['outdoor', 'reading', 'history', 'culture', 'exhibition', 'market'],
  surprise: []
};

export function scoreActivity(activity: Activity, preferences: UserPreferences): MatchResult {
  const isSurprise = preferences.recommendationMode === 'surprise';
  const rejectionReasons: string[] = [];
  const availableStart = toTimestamp(preferences.selectedDate, preferences.availableStartTime);
  const availableEnd = toTimestamp(preferences.selectedDate, preferences.availableEndTime);

  if (activity.startAt < availableStart || activity.endAt > availableEnd) rejectionReasons.push('活动时间超出你的可用时段');
  if (!activity.pricePending && preferences.budgetMax !== null && activity.priceMin > preferences.budgetMax) rejectionReasons.push('活动价格超过预算');
  const violated = activity.unsuitableFor.filter((item) => preferences.dealbreakers.includes(item));
  if (violated.length) rejectionReasons.push('活动与你设置的避雷项冲突');

  const directInterestMatches = activity.suitableInterests.filter((item) => preferences.interests.includes(item)).length;
  const relatedInterestMatches = preferences.interests.filter((selected) => (
    activity.suitableInterests.some((item) => (interestAffinity[selected] || []).includes(item))
  )).length;
  const searchableText = `${activity.name} ${activity.categoryLabel} ${activity.description}`.toLowerCase();
  const customMatches = (preferences.customInterests || []).filter((item) => searchableText.includes(item.toLowerCase()));
  const categoryMatch = preferences.interests.includes(activity.category);
  const interest = isSurprise ? 20 : customMatches.length || categoryMatch
    ? 36
    : directInterestMatches
      ? Math.min(36, 33 + (directInterestMatches - 1) * 3)
      : relatedInterestMatches
        ? Math.min(24, 20 + (relatedInterestMatches - 1) * 2)
        : 0;
  const quality = activity.qualityScore === undefined
    ? 8
    : Math.max(0, Math.min(20, Math.round(((activity.qualityScore - 40) / 60) * 20)));
  const directMoodMatch = moodAffinity[preferences.mood].includes(activity.category)
    || activity.suitableInterests.some((item) => moodAffinity[preferences.mood].includes(item))
    || (preferences.mood === 'budget' && !activity.pricePending && activity.priceMax === 0);
  // Interests express what the user actually wants to do. Mood is deliberately
  // a smaller tie-breaker so it can refine those choices without replacing them.
  const mood = directMoodMatch ? 12 : activity.suitableMoods.includes(preferences.mood) ? 6 : 0;
  const timeFit = rejectionReasons.some((item) => item.includes('时间')) ? 0 : 12;
  const budgetFit = activity.pricePending ? 5 : preferences.budgetMax === null ? 10 : activity.priceMax <= preferences.budgetMax * 0.55 ? 10 : activity.priceMin <= preferences.budgetMax ? 7 : 0;
  const distanceLimit = preferences.distancePreference === 'nearby' ? 20 : preferences.distancePreference === 'within_30_min' ? 35 : 90;
  const distance = activity.travelMinutesFromCenter <= distanceLimit ? 15 : Math.max(2, 15 - Math.round((activity.travelMinutesFromCenter - distanceLimit) / 4));
  const novelty = Math.min(5, Math.round(activity.noveltyScore / 2));
  const rawScore = interest + quality + mood + timeFit + budgetFit + distance + novelty;
  const totalScore = Math.min(100, Math.round((rawScore / 110) * 100));

  const recommendationReasons: string[] = [];
  if (isSurprise) recommendationReasons.push('这次不按兴趣设限，优先挑了时间、距离和体验更合适的去处');
  if (!isSurprise) {
    if (customMatches.length) recommendationReasons.push(`回应了你输入的“${customMatches[0]}”`);
    else if (interest >= 33) recommendationReasons.push(`直接回应了你选择的${activity.categoryLabel}兴趣`);
    else if (interest > 0) recommendationReasons.push('和你选择的兴趣方向相近');
  }
  if (!isSurprise && mood === 12) recommendationReasons.push(`同时适合“${moodLabels[preferences.mood]}”的心情`);
  else if (!isSurprise && mood === 6) recommendationReasons.push(`也适合你选择的“${moodLabels[preferences.mood]}”`);
  if (activity.reviewRating) {
    recommendationReasons.push(`${activity.ratingSource || '地图口碑'} ${activity.reviewRating.toFixed(1)} 分${activity.reviewCount ? `，${activity.reviewCount} 条评论` : ''}`);
  } else if (activity.qualityReason) recommendationReasons.push(activity.qualityReason);
  if (budgetFit === 10) recommendationReasons.push('为后续吃饭和散步留出了预算');
  if (!recommendationReasons.length) recommendationReasons.push('时间和路线都比较轻松，适合顺路体验');

  return {
    activity, totalScore,
    scoreBreakdown: { interest, quality, mood, timeFit, budgetFit, distance, novelty },
    passedHardConstraints: rejectionReasons.length === 0,
    rejectionReasons, recommendationReasons: recommendationReasons.slice(0, 2)
  };
}

export function recommendActivities(activities: Activity[], preferences: UserPreferences): MatchResult[] {
  const isSurprise = preferences.recommendationMode === 'surprise';
  const seed = Number(preferences.surpriseSeed || 0);
  const surpriseOrder = (value: string) => {
    let hash = seed || 2166136261;
    for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
    return Math.abs(hash % 17);
  };
  const scored = activities.map((activity) => scoreActivity(activity, preferences));
  const eligible = scored.filter((item) => item.passedHardConstraints);
  const relevant = eligible
    .filter((item) => isSurprise || item.scoreBreakdown.interest > 0 || item.scoreBreakdown.mood > 0)
    .sort((a, b) => {
      if (!isSurprise && b.scoreBreakdown.interest !== a.scoreBreakdown.interest) {
        return b.scoreBreakdown.interest - a.scoreBreakdown.interest;
      }
      return (b.totalScore + (isSurprise ? surpriseOrder(b.activity.id) : 0))
        - (a.totalScore + (isSurprise ? surpriseOrder(a.activity.id) : 0));
    });
  const diversified: MatchResult[] = [];
  const seenCategories = new Set<InterestType>();

  for (const item of relevant) {
    if (seenCategories.has(item.activity.category)) continue;
    diversified.push(item);
    seenCategories.add(item.activity.category);
  }
  for (const item of relevant) {
    if (!diversified.includes(item)) diversified.push(item);
  }
  return diversified.slice(0, 8);
}
