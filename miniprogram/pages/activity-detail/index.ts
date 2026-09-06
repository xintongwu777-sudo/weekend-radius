import { findActivity } from '../../data/activities';
import { places } from '../../data/places';
import { generatePlan } from '../../itinerary/generate-plan';
import { scoreActivity } from '../../recommendation/score-activities';
import { applyUserDistance } from '../../services/activity-distance';
import { searchNearbyPlaces } from '../../services/live-places';
import { getActivityCatalog, getPreferences, getUserLocation, saveAnchorId, saveCurrentPlan, savePlanningPlaces } from '../../services/storage';
import { formatChineseDate, formatTime } from '../../utilities/time';

Page({
  data: {
    activity: null as any,
    match: null as any
  },

  onLoad(options: any) {
    const preferences = getPreferences();
    if (!preferences) return wx.redirectTo({ url: '/pages/preferences/index' });
    const original = getActivityCatalog().find((item) => item.id === options.id) || findActivity(options.id, preferences.selectedDay);
    const activity = original ? applyUserDistance([original], getUserLocation())[0] : undefined;
    if (!activity) return wx.showToast({ title: '没有找到这个活动', icon: 'none' });
    const match = scoreActivity(activity, preferences);
    this.setData({
      activity: {
        ...activity,
        isRealVenue: !activity.source.isMock,
        dateText: formatChineseDate(preferences.selectedDate),
        timeLabel: activity.scheduleType === 'suggested' ? '建议时段' : '活动时间',
        timeText: `${formatTime(activity.startAt)}–${formatTime(activity.endAt)}`,
        priceText: activity.pricePending
          ? '待官方公布'
          : activity.priceMin === activity.priceMax ? `¥${activity.priceMin}` : `¥${activity.priceMin}–${activity.priceMax}`,
        reviewText: activity.reviewRating
          ? `${activity.ratingSource || '地图口碑'} ${activity.reviewRating.toFixed(1)} 分${activity.reviewCount ? `，${activity.reviewCount} 条评论` : ''}${activity.tasteRating ? `，口味 ${activity.tasteRating.toFixed(1)} 分` : ''}`
          : ''
      },
      match
    });
  },

  openVenueLocation() {
    const activity = this.data.activity;
    if (!activity || activity.source.isMock) {
      return wx.showToast({ title: '演示地点暂不支持导航', icon: 'none' });
    }
    wx.openLocation({
      latitude: Number(activity.location.latitude),
      longitude: Number(activity.location.longitude),
      name: activity.venueName,
      address: activity.address,
      scale: 17
    });
  },

  copyOfficialSource() {
    const url = this.data.activity?.source?.url;
    if (!url) return;
    wx.setClipboardData({ data: url });
  },

  async chooseAnchor() {
    const preferences = getPreferences();
    const activity = this.data.activity;
    if (!preferences || !activity) return;
    saveAnchorId(activity.id);
    wx.showLoading({ title: '搜索附近地点…', mask: true });
    try {
      const liveResult = await searchNearbyPlaces(activity.location);
      const planningPlaces = liveResult.places.length ? [...liveResult.places, ...places] : places;
      savePlanningPlaces(planningPlaces);
      const plan = generatePlan(preferences, activity, planningPlaces);
      plan.placeDataMode = liveResult.mode;
      plan.placeDataUpdatedAt = liveResult.updatedAt;
      saveCurrentPlan(plan);
      wx.navigateTo({ url: '/pages/itinerary/index' });
    } finally {
      wx.hideLoading();
    }
  }
});
