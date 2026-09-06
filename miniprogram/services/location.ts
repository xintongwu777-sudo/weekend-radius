import { UserLocation } from '../types/index';

const GUANGZHOU_BOUNDS = {
  minLatitude: 22.45,
  maxLatitude: 23.95,
  minLongitude: 112.75,
  maxLongitude: 114.15
};

export function isInGuangzhou(latitude: number, longitude: number): boolean {
  return latitude >= GUANGZHOU_BOUNDS.minLatitude
    && latitude <= GUANGZHOU_BOUNDS.maxLatitude
    && longitude >= GUANGZHOU_BOUNDS.minLongitude
    && longitude <= GUANGZHOU_BOUNDS.maxLongitude;
}

export function getCurrentUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: (result: any) => resolve({
        latitude: Number(result.latitude),
        longitude: Number(result.longitude),
        label: '当前位置',
        source: 'gps',
        updatedAt: Date.now()
      }),
      fail: reject
    });
  });
}

export function chooseUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (result: any) => resolve({
        latitude: Number(result.latitude),
        longitude: Number(result.longitude),
        label: result.name || result.address || '地图选点',
        source: 'chosen',
        updatedAt: Date.now()
      }),
      fail: reject
    });
  });
}
