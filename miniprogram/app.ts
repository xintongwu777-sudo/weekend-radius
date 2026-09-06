import { CLOUD_ENV_ID, LIVE_POI_ENABLED, NATIVE_CLOUD_ENABLED } from './config/runtime';

App({
  onLaunch() {
    if (NATIVE_CLOUD_ENABLED && wx.cloud) {
      wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true });
    }
  },
  globalData: {
    cityCode: 'guangzhou',
    cityName: '广州',
    livePoiEnabled: LIVE_POI_ENABLED
  }
});
