import { LIVE_POI_ENDPOINT } from '../config/runtime';

export function requestPlacesApi(payload: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: LIVE_POI_ENDPOINT,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload,
      timeout: 20000,
      success(response: any) {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`实时地点服务返回 ${response.statusCode}`));
          return;
        }

        if (typeof response.data === 'string') {
          try {
            resolve(JSON.parse(response.data));
          } catch (error) {
            reject(new Error('实时地点服务返回内容无法读取'));
          }
          return;
        }

        resolve(response.data);
      },
      fail(error: any) {
        reject(error);
      }
    });
  });
}
