import { deleteSavedPlan, getSavedPlans, saveCurrentPlan } from '../../services/storage';
import { WeekendPlan } from '../../types/index';
import { formatChineseDate } from '../../utilities/time';

function decoratePlan(plan: WeekendPlan) {
  const now = Date.now();
  const startAt = plan.summary?.startAt || plan.nodes[0]?.startAt || 0;
  const endAt = plan.summary?.endAt || plan.nodes[plan.nodes.length - 1]?.endAt || 0;
  const status = now < startAt
    ? { key: 'pending', label: '待出发' }
    : now <= endAt
      ? { key: 'ongoing', label: '进行中' }
      : { key: 'completed', label: '已完成' };

  return {
    ...plan,
    dateText: formatChineseDate(plan.selectedDate),
    anchorName: plan.nodes.find((node) => node.isAnchor)?.name || '',
    cover: plan.nodes.find((node) => node.isAnchor)?.imageUrl || '/assets/images/hero.svg',
    statusKey: status.key,
    statusLabel: status.label,
    isCompleted: status.key === 'completed'
  };
}

Page({
  data: {
    activePlans: [] as any[],
    completedPlans: [] as any[],
    totalPlans: 0
  },

  onShow() {
    this.refreshPlans();
  },

  refreshPlans() {
    const plans = getSavedPlans().map(decoratePlan);
    const activePlans = plans
      .filter((plan) => !plan.isCompleted)
      .sort((a, b) => a.summary.startAt - b.summary.startAt);
    const completedPlans = plans
      .filter((plan) => plan.isCompleted)
      .sort((a, b) => b.summary.endAt - a.summary.endAt);
    this.setData({ activePlans, completedPlans, totalPlans: plans.length });
  },

  openPlan(event: any) {
    const raw = getSavedPlans().find((plan) => plan.id === event.currentTarget.dataset.id);
    if (!raw) return;
    saveCurrentPlan(raw);
    wx.navigateTo({ url: '/pages/itinerary/index' });
  },

  deletePlan(event: any) {
    const id = event.currentTarget.dataset.id;
    const title = event.currentTarget.dataset.title;
    wx.showModal({
      title: '删除这份计划？',
      content: `“${title}”删除后无法恢复。`,
      confirmText: '删除',
      confirmColor: '#E9663D',
      cancelText: '保留',
      success: (result: any) => {
        if (!result.confirm) return;
        deleteSavedPlan(id);
        this.refreshPlans();
        wx.showToast({ title: '计划已删除', icon: 'none' });
      }
    });
  },

  startPlanning() {
    wx.navigateTo({ url: '/pages/preferences/index' });
  }
});
