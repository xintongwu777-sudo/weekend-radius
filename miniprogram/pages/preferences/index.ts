import { dealbreakers, interests, moods } from '../../data/options';
import { getPreferences, savePreferences } from '../../services/storage';
import { BudgetMode, DealbreakerType, DistancePreference, InterestType, MoodType, RecommendationMode, UserPreferences, WeekendDay } from '../../types/index';
import { formatChineseDate, getNextWeekendDate } from '../../utilities/time';

function createPaddedValues(max: number): string[] {
  return Array.from({ length: max + 1 }, (_, value) => String(value).padStart(2, '0'));
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function parseTimePickerValue(value: string, fallbackHour: number): number[] {
  if (!value || !value.includes(':')) return [fallbackHour, 0];
  const [hour, minute] = value.split(':').map(Number);
  if (hour >= 24) return [23, 59];
  return [Math.max(0, Math.min(23, hour)), Math.max(0, Math.min(59, minute))];
}

function pickerValueToTime(value: number[]): string {
  return `${String(value[0]).padStart(2, '0')}:${String(value[1]).padStart(2, '0')}`;
}

const hours = createPaddedValues(23);
const minutes = createPaddedValues(59);
const MAX_INTERESTS = 5;
const supportedInterestValues = interests.map((item) => item.value as InterestType);

Page({
  data: {
    selectedDay: 'saturday' as WeekendDay,
    dayCards: [] as any[],
    hours,
    minutes,
    startPickerValue: [11, 0],
    endPickerValue: [21, 0],
    budgetMode: 'slider' as BudgetMode,
    budgetValue: 200,
    customBudget: '',
    recommendationMode: 'interest' as RecommendationMode,
    recommendationModes: [
      { value: 'interest', label: '按兴趣推荐', copy: '我来选想玩的方向' },
      { value: 'surprise', label: '随机惊喜', copy: '跳过兴趣，由系统替我挑' }
    ],
    interests: interests.map((item) => ({ ...item, selected: ['art', 'coffee', 'food'].includes(item.value) })),
    selectedInterests: ['art', 'coffee', 'food'] as InterestType[],
    customInterestInput: '',
    customInterests: [] as string[],
    selectedInterestCount: 3,
    moods: moods.map((item) => ({ ...item, selected: item.value === 'explore' })),
    selectedMood: 'explore' as MoodType,
    distance: 'within_30_min' as DistancePreference,
    distanceOptions: [
      { value: 'nearby', label: '附近就行', copy: '少走路，轻松一点' },
      { value: 'within_30_min', label: '30 分钟以内', copy: '距离和选择刚刚好' },
      { value: 'whole_city', label: '全城都可以', copy: '好玩最重要' }
    ],
    dealbreakers: dealbreakers.map((item) => ({ ...item, selected: false })),
    selectedDealbreakers: [] as DealbreakerType[]
  },

  onLoad() {
    const saved = getPreferences();
    if (saved) {
      const savedBudget = saved.budgetMax === null ? 200 : Number(saved.budgetMax);
      const budgetMode: BudgetMode = saved.budgetMode || (savedBudget > 500 ? 'custom' : 'slider');
      this.setData({
        selectedDay: saved.selectedDay,
        startPickerValue: parseTimePickerValue(saved.availableStartTime, 11),
        endPickerValue: parseTimePickerValue(saved.availableEndTime, 21),
        budgetMode,
        budgetValue: Math.max(0, Math.min(500, savedBudget)),
        customBudget: budgetMode === 'custom' ? String(savedBudget) : '',
        recommendationMode: saved.recommendationMode || 'interest',
        selectedInterests: (saved.interests || []).filter((item) => supportedInterestValues.includes(item)),
        customInterests: saved.customInterests || [],
        selectedMood: saved.mood,
        distance: saved.distancePreference,
        selectedDealbreakers: saved.dealbreakers || []
      });
    }
    this.refreshChoices();
  },

  refreshChoices() {
    const selectedInterests = this.data.selectedInterests;
    const selectedDealbreakers = this.data.selectedDealbreakers;
    this.setData({
      selectedInterestCount: selectedInterests.length + this.data.customInterests.length,
      dayCards: (['saturday', 'sunday'] as WeekendDay[]).map((value) => ({
        value,
        label: value === 'saturday' ? '周六' : '周日',
        date: formatChineseDate(getNextWeekendDate(value)).split(' ')[0],
        selected: value === this.data.selectedDay
      })),
      interests: interests.map((item) => ({ ...item, selected: selectedInterests.includes(item.value as InterestType) })),
      moods: moods.map((item) => ({ ...item, selected: item.value === this.data.selectedMood })),
      dealbreakers: dealbreakers.map((item) => ({ ...item, selected: selectedDealbreakers.includes(item.value as DealbreakerType) }))
    });
  },

  selectDay(event: any) { this.setData({ selectedDay: event.currentTarget.dataset.value }); this.refreshChoices(); },
  selectDistance(event: any) { this.setData({ distance: event.currentTarget.dataset.value }); },
  selectMood(event: any) { this.setData({ selectedMood: event.currentTarget.dataset.value }); this.refreshChoices(); },
  changeStartTime(event: any) { this.setData({ startPickerValue: event.detail.value.map(Number) }); },
  changeEndTime(event: any) { this.setData({ endPickerValue: event.detail.value.map(Number) }); },
  changeBudget(event: any) { this.setData({ budgetValue: Number(event.detail.value), budgetMode: 'slider' }); },
  selectBudgetMode(event: any) { this.setData({ budgetMode: event.currentTarget.dataset.value }); },
  selectRecommendationMode(event: any) {
    const recommendationMode = event.currentTarget.dataset.value as RecommendationMode;
    if (recommendationMode === 'surprise') {
      this.setData({ recommendationMode, selectedInterests: [], customInterests: [], customInterestInput: '' });
      this.refreshChoices();
      return;
    }
    this.setData({ recommendationMode });
  },
  changeCustomBudget(event: any) { this.setData({ customBudget: String(event.detail.value).replace(/[^0-9]/g, '') }); },
  changeCustomInterest(event: any) { this.setData({ customInterestInput: event.detail.value }); },
  toggleInterest(event: any) {
    if (this.data.recommendationMode === 'surprise') return;
    const value = event.currentTarget.dataset.value as InterestType;
    const selected = [...this.data.selectedInterests];
    const index = selected.indexOf(value);
    if (index >= 0) selected.splice(index, 1);
    else if (selected.length + this.data.customInterests.length < MAX_INTERESTS) selected.push(value);
    else return wx.showToast({ title: `最多选择 ${MAX_INTERESTS} 个兴趣`, icon: 'none' });
    this.setData({ selectedInterests: selected });
    this.refreshChoices();
  },

  addCustomInterest() {
    if (this.data.recommendationMode === 'surprise') return;
    const value = this.data.customInterestInput.trim();
    if (!value) return wx.showToast({ title: '先输入一种想玩的活动', icon: 'none' });
    if (this.data.selectedInterests.length + this.data.customInterests.length >= MAX_INTERESTS) {
      return wx.showToast({ title: `最多选择 ${MAX_INTERESTS} 个兴趣`, icon: 'none' });
    }
    if (this.data.customInterests.includes(value) || interests.some((item) => item.label === value)) {
      return wx.showToast({ title: '这个兴趣已经添加了', icon: 'none' });
    }
    this.setData({ customInterests: [...this.data.customInterests, value], customInterestInput: '' });
    this.refreshChoices();
  },

  removeCustomInterest(event: any) {
    const value = event.currentTarget.dataset.value;
    this.setData({ customInterests: this.data.customInterests.filter((item) => item !== value) });
    this.refreshChoices();
  },

  toggleDealbreaker(event: any) {
    const value = event.currentTarget.dataset.value as DealbreakerType;
    const selected = [...this.data.selectedDealbreakers];
    const index = selected.indexOf(value);
    if (index >= 0) selected.splice(index, 1); else selected.push(value);
    this.setData({ selectedDealbreakers: selected });
    this.refreshChoices();
  },

  submit() {
    const isSurprise = this.data.recommendationMode === 'surprise';
    const pendingInterest = this.data.customInterestInput.trim();
    const customInterests = [...this.data.customInterests];
    if (!isSurprise && pendingInterest
      && !customInterests.includes(pendingInterest)
      && !interests.some((item) => item.label === pendingInterest)) {
      if (this.data.selectedInterests.length + customInterests.length >= MAX_INTERESTS) {
        return wx.showToast({ title: `最多选择 ${MAX_INTERESTS} 个兴趣`, icon: 'none' });
      }
      customInterests.push(pendingInterest);
    }
    if (!isSurprise && !this.data.selectedInterests.length && !customInterests.length) {
      return wx.showToast({ title: '至少选择或输入一个兴趣', icon: 'none' });
    }
    const start = pickerValueToTime(this.data.startPickerValue);
    const end = pickerValueToTime(this.data.endPickerValue);
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      return wx.showToast({ title: '结束时间要晚于开始时间', icon: 'none' });
    }

    let budgetMax = this.data.budgetValue;
    if (this.data.budgetMode === 'custom') {
      if (this.data.customBudget === '') return wx.showToast({ title: '请输入自定义预算', icon: 'none' });
      budgetMax = Number(this.data.customBudget);
      if (!Number.isFinite(budgetMax) || budgetMax < 0 || budgetMax > 99999999) {
        return wx.showToast({ title: '请输入 0–99999999 的预算', icon: 'none' });
      }
    }

    const preferences: UserPreferences = {
      cityCode: 'guangzhou', cityName: '广州', selectedDay: this.data.selectedDay,
      selectedDate: getNextWeekendDate(this.data.selectedDay), availableStartTime: start, availableEndTime: end,
      budgetMode: this.data.budgetMode, budgetMax: Math.floor(budgetMax),
      recommendationMode: this.data.recommendationMode,
      surpriseSeed: isSurprise ? Date.now() : undefined,
      customInterests: isSurprise ? [] : customInterests,
      interests: isSurprise ? [] : this.data.selectedInterests,
      mood: this.data.selectedMood,
      distancePreference: this.data.distance, dealbreakers: this.data.selectedDealbreakers
    };
    savePreferences(preferences);
    wx.navigateTo({ url: '/pages/recommendations/index' });
  }
});
