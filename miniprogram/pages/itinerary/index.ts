import { places as fallbackPlaces } from '../../data/places';
import { applyAddition, getAdditionSlots } from '../../itinerary/add-node';
import { applyReplacement, getReplacementCandidates, skipNode } from '../../itinerary/replace-node';
import { getCurrentPlan, getPlanningPlaces, persistPlan, saveCurrentPlan } from '../../services/storage';
import { Place, WeekendPlan } from '../../types/index';
import { formatChineseDate, formatTime } from '../../utilities/time';

function resolvePlaces(plan: WeekendPlan): Place[] {
  if (plan.planningPlaces?.length) return plan.planningPlaces;
  const stored = getPlanningPlaces();
  return stored.length ? stored : fallbackPlaces;
}

function decoratePlan(plan: WeekendPlan) {
  const paceLabels = { relaxed: '松弛', balanced: '刚刚好', full: '充实' };
  const liveSourceNames = Array.from(new Set(resolvePlaces(plan)
    .filter((place) => !place.source.isMock)
    .map((place) => place.source.name.includes('百度') ? '百度地图' : '腾讯位置服务')));
  const additionSlots = getAdditionSlots(plan, resolvePlaces(plan)).map((slot) => ({
    ...slot,
    timeText: `${formatTime(slot.gapStartAt)}–${formatTime(slot.gapEndAt)}`,
    availableText: slot.availableMinutes >= 60
      ? `${Math.floor(slot.availableMinutes / 60)} 小时 ${slot.availableMinutes % 60 ? `${slot.availableMinutes % 60} 分` : ''}`
      : `${slot.availableMinutes} 分钟`
  }));
  return {
    ...plan,
    dateText: formatChineseDate(plan.selectedDate),
    startText: formatTime(plan.summary.startAt),
    endText: formatTime(plan.summary.endAt),
    paceText: paceLabels[plan.summary.pace],
    placeSourceText: liveSourceNames.join('、') || '实时地点服务',
    additionBefore: additionSlots.find((slot) => slot.insertIndex === 0) || null,
    nodes: plan.nodes.map((node, index) => ({
      ...node,
      startText: formatTime(node.startAt),
      endText: formatTime(node.endAt),
      transportModeText: node.transportFromPrevious?.mode === 'walk' ? '步行' : node.transportFromPrevious?.mode === 'transit' ? '公共交通' : '打车',
      reviewText: node.reviewRating
        ? `${node.ratingSource || '地图口碑'} ${node.reviewRating.toFixed(1)} 分${node.reviewCount ? ` · ${node.reviewCount} 条评论` : ''}`
        : '',
      additionAfter: additionSlots.find((slot) => slot.insertIndex === index + 1) || null
    }))
  };
}

Page({
  data: {
    plan: null as any,
    replaceOpen: false,
    replacingNode: null as any,
    candidates: [] as any[],
    addOpen: false,
    selectedSlot: null as any,
    addCandidates: [] as any[]
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const plan = getCurrentPlan();
    if (!plan) return wx.redirectTo({ url: '/pages/index/index' });
    this.setData({ plan: decoratePlan(plan) });
  },

  openReplace(event: any) {
    const plan = getCurrentPlan();
    if (!plan) return;
    const availablePlaces = resolvePlaces(plan);
    const nodeId = event.currentTarget.dataset.id;
    const replacingNode = plan.nodes.find((node) => node.id === nodeId);
    const candidates = getReplacementCandidates(plan, nodeId, availablePlaces).map((candidate) => ({
      ...candidate,
      budgetText: candidate.budgetDelta === 0 ? '预算不变' : `${candidate.budgetDelta > 0 ? '+' : '−'}¥${Math.abs(candidate.budgetDelta)}`,
      transportText: candidate.transportDelta === 0 ? '路程不变' : `${candidate.transportDelta > 0 ? '+' : '−'}${Math.abs(candidate.transportDelta)} 分钟`,
      reviewText: candidate.place.reviewRating
        ? `${candidate.place.reviewRating.toFixed(1)} 分${candidate.place.reviewCount ? ` · ${candidate.place.reviewCount} 条评论` : ''}`
        : ''
    }));
    this.setData({ replaceOpen: true, replacingNode, candidates });
  },

  closeReplace() {
    this.setData({ replaceOpen: false, replacingNode: null, candidates: [] });
  },

  openAdd(event: any) {
    const plan = getCurrentPlan();
    if (!plan) return;
    const availablePlaces = resolvePlaces(plan);
    const slot = getAdditionSlots(plan, availablePlaces).find((item) => item.id === event.currentTarget.dataset.id);
    if (!slot) return wx.showToast({ title: '这个空档暂时放不下新活动', icon: 'none' });
    const selectedSlot = {
      ...slot,
      timeText: `${formatTime(slot.gapStartAt)}–${formatTime(slot.gapEndAt)}`
    };
    const addCandidates = slot.candidates.map((candidate) => ({
      ...candidate,
      id: candidate.place.id,
      timeText: `${formatTime(candidate.startAt)}–${formatTime(candidate.endAt)}`,
      priceText: candidate.place.averageCost ? `约 ¥${candidate.place.averageCost}` : '免费',
      routeText: candidate.routeMinutes ? `新增交通约 ${candidate.routeMinutes} 分钟` : '无需额外交通',
      reviewText: candidate.place.reviewRating
        ? `${candidate.place.reviewRating.toFixed(1)} 分${candidate.place.reviewCount ? ` · ${candidate.place.reviewCount} 条评论` : ''}`
        : ''
    }));
    this.setData({ addOpen: true, selectedSlot, addCandidates });
  },

  closeAdd() {
    this.setData({ addOpen: false, selectedSlot: null, addCandidates: [] });
  },

  openNodeLocation(event: any) {
    const plan = getCurrentPlan();
    const node = plan?.nodes.find((item) => item.id === event.currentTarget.dataset.id);
    if (!node || !node.source || node.source.isMock) {
      return wx.showToast({ title: '演示地点暂不支持导航', icon: 'none' });
    }
    wx.openLocation({
      latitude: Number(node.location.latitude),
      longitude: Number(node.location.longitude),
      name: node.name,
      address: node.address,
      scale: 17
    });
  },

  chooseAddition(event: any) {
    const plan = getCurrentPlan();
    if (!plan || !this.data.selectedSlot) return;
    const updated = applyAddition(plan, this.data.selectedSlot.id, event.currentTarget.dataset.id, resolvePlaces(plan));
    saveCurrentPlan(updated);
    this.closeAdd();
    this.refresh();
    wx.showToast({ title: '已加入行程', icon: 'success' });
  },

  noop() {},

  chooseCandidate(event: any) {
    const plan = getCurrentPlan();
    if (!plan || !this.data.replacingNode) return;
    const place = resolvePlaces(plan).find((item) => item.id === event.currentTarget.dataset.id);
    if (!place) return;
    const updated = applyReplacement(plan, this.data.replacingNode.id, place);
    saveCurrentPlan(updated);
    this.closeReplace();
    this.refresh();
    wx.showToast({ title: '这一站已经换好', icon: 'success' });
  },

  skipCurrent() {
    const plan = getCurrentPlan();
    if (!plan || !this.data.replacingNode) return;
    saveCurrentPlan(skipNode(plan, this.data.replacingNode.id));
    this.closeReplace();
    this.refresh();
    wx.showToast({ title: '已跳过这一站', icon: 'none' });
  },

  savePlan() {
    const plan = getCurrentPlan();
    if (!plan) return;
    const saved = persistPlan(plan);
    this.setData({ plan: decoratePlan(saved) });
    wx.showToast({ title: '周末计划已保存', icon: 'success' });
  }
});
