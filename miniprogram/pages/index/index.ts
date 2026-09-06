import { getSavedPlans } from '../../services/storage';
import { getUserLocation, saveUserLocation } from '../../services/storage';
import { chooseUserLocation, getCurrentUserLocation, isInGuangzhou } from '../../services/location';
import { formatChineseDate } from '../../utilities/time';
import { UserLocation } from '../../types/index';

Page({
  data: {
    savedCard: null as any,
    locationLabel: '点此定位',
    locationReady: false,
    locating: false
  },

  onShow() {
    const latest = getSavedPlans()[0];
    const location = getUserLocation();
    this.setData({
      locationLabel: location ? (location.source === 'chosen' ? location.label : '已定位') : '点此定位',
      locationReady: Boolean(location),
      savedCard: latest ? {
        title: latest.title,
        dateText: formatChineseDate(latest.selectedDate),
        anchorName: latest.nodes.find((node) => node.isAnchor)?.name || '',
        cost: latest.summary.estimatedTotalCost
      } : null
    });
  },

  selectLocation() {
    if (this.data.locating) return;
    wx.showActionSheet({
      itemList: ['使用我的当前位置', '在地图上选择位置'],
      success: (result: any) => {
        if (result.tapIndex === 0) this.locateWithGps();
        if (result.tapIndex === 1) this.locateWithMap();
      }
    });
  },

  async locateWithGps() {
    this.setData({ locating: true, locationLabel: '定位中…' });
    try {
      this.acceptLocation(await getCurrentUserLocation());
    } catch (error: any) {
      this.setData({ locating: false, locationLabel: getUserLocation() ? '已定位' : '点此定位' });
      const denied = String(error?.errMsg || '').includes('auth deny');
      if (denied) {
        wx.showModal({
          title: '需要位置权限',
          content: '开启定位后，才能按照你到活动地点的真实距离进行推荐。',
          confirmText: '去设置',
          success: (result: any) => { if (result.confirm) wx.openSetting({}); }
        });
      } else {
        wx.showToast({ title: '暂时没有定位成功', icon: 'none' });
      }
    }
  },

  async locateWithMap() {
    this.setData({ locating: true });
    try {
      this.acceptLocation(await chooseUserLocation());
    } catch (error: any) {
      this.setData({ locating: false });
      if (!String(error?.errMsg || '').includes('cancel')) wx.showToast({ title: '没有选中位置', icon: 'none' });
    }
  },

  acceptLocation(location: UserLocation) {
    if (!isInGuangzhou(location.latitude, location.longitude)) {
      this.setData({ locating: false, locationLabel: getUserLocation() ? '已定位' : '点此定位' });
      return wx.showModal({
        title: '首发版先服务广州',
        content: '这个位置不在广州范围内。你可以在地图上选择一个广州出发点继续体验。',
        showCancel: false
      });
    }
    saveUserLocation(location);
    this.setData({
      locating: false,
      locationReady: true,
      locationLabel: location.source === 'chosen' ? location.label : '已定位'
    });
    wx.showToast({ title: '位置已更新', icon: 'success' });
  },

  startPlanning() {
    wx.navigateTo({ url: '/pages/preferences/index' });
  },

  openSaved() {
    wx.navigateTo({ url: '/pages/saved/index' });
  }
});
