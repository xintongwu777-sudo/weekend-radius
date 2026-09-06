import { recommendActivities } from '../../recommendation/score-activities';
import { moods } from '../../data/options';
import { applyUserDistance } from '../../services/activity-distance';
import { loadOfficialScheduleActivities, loadVerifiedVenueActivities } from '../../services/live-activities';
import { searchNearbyActivityPlaces } from '../../services/live-places';
import { convertPlacesToActivities } from '../../services/place-activities';
import { getPreferences, getUserLocation, saveActivityCatalog } from '../../services/storage';
import { formatChineseDate, formatTime } from '../../utilities/time';

Page({
  data: {
    summary: '',
    dateText: '',
    emptyCopy: '附近暂时没有找到符合这些兴趣的真实去处，可以修改兴趣或扩大距离。',
    results: [] as any[]
  },

  async onShow() {
    const preferences = getPreferences();
    if (!preferences) return wx.redirectTo({ url: '/pages/preferences/index' });
    const userLocation = getUserLocation();
    wx.showLoading({ title: '核对真实地点…', mask: true });
    const isSurprise = preferences.recommendationMode === 'surprise';
    const wantsVerifiedVenue = isSurprise || preferences.interests.some((item) => (
      ['exhibition', 'art', 'history', 'culture', 'reading'].includes(item)
    ));
    const wantsOfficialSchedule = isSurprise
      || preferences.interests.includes('anime')
      || preferences.customInterests.some((item) => /漫展|动漫|二次元/.test(item));
    const nearbyResult = userLocation
      ? await searchNearbyActivityPlaces(
        userLocation, preferences.interests, preferences.customInterests, preferences.distancePreference,
        preferences.mood, preferences.recommendationMode, preferences.surpriseSeed
      )
      : { places: [], mode: 'mock' as const, message: '请先回首页完成定位' };
    const verifiedActivities = wantsVerifiedVenue ? await loadVerifiedVenueActivities(preferences) : [];
    const officialActivities = wantsOfficialSchedule ? await loadOfficialScheduleActivities(preferences) : [];
    const nearbyActivities = convertPlacesToActivities(nearbyResult.places, preferences);
    const liveCatalog = [...officialActivities, ...verifiedActivities, ...nearbyActivities];
    const activities = applyUserDistance(liveCatalog, userLocation);
    saveActivityCatalog(activities);
    const results = recommendActivities(activities, preferences).map((result) => ({
      ...result,
      id: result.activity.id,
      activity: {
        ...result.activity,
        sourceLabel: result.activity.source.isMock
          ? '演示活动'
          : result.activity.source.name.includes('官方公告') || result.activity.source.name.includes('公共服务平台')
            ? '官方排期'
          : result.activity.source.name.includes('百度')
            ? '百度口碑'
          : result.activity.source.name.includes('口碑精选')
            ? '口碑精选'
            : result.activity.scheduleType === 'suggested' ? '真实去处' : '真实场馆',
        timeText: `${result.activity.scheduleType === 'suggested' ? '建议 ' : ''}${formatTime(result.activity.startAt)}–${formatTime(result.activity.endAt)}`,
        priceText: result.activity.pricePending ? '票价待公布' : result.activity.priceMin === 0 ? '免费起' : `¥${result.activity.priceMin} 起`,
        reviewText: result.activity.reviewRating
          ? `${result.activity.ratingSource || '地图口碑'} ${result.activity.reviewRating.toFixed(1)} 分${result.activity.reviewCount ? ` · ${result.activity.reviewCount} 条评论` : ''}`
          : ''
      },
      reason: result.recommendationReasons[0],
      relaxed: !result.passedHardConstraints
    }));
    this.setData({
      results,
      dateText: formatChineseDate(preferences.selectedDate),
      emptyCopy: wantsOfficialSchedule && !officialActivities.length && !results.length
        ? '这个周末暂未查到已确认日期和场馆的官方漫展排期。可以换一个周末，或再选一种兴趣。'
        : nearbyResult.message || '附近暂时没有找到符合这些兴趣的真实去处，可以修改兴趣或扩大距离。',
      summary: `${preferences.cityName}${userLocation ? ' · 已按当前位置测距' : ''} · ${moods.find((item) => item.value === preferences.mood)?.label || '周末出行'} · ${preferences.availableStartTime}–${preferences.availableEndTime} · ${preferences.budgetMax === null ? '预算灵活' : `¥${preferences.budgetMax} 内`}`
    });
    wx.hideLoading();
  },

  editPreferences() {
    wx.navigateBack();
  },

  openActivity(event: any) {
    wx.navigateTo({ url: `/pages/activity-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
