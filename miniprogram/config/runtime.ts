// 保留环境 ID 供后续迁移到微信原生云开发时使用。
export const CLOUD_ENV_ID = 'weekend-radius-d7g6jqqde67abca7d';

// 当前免费 PostgreSQL 环境通过 CloudBase HTTP 网关提供真实地点服务。
export const LIVE_POI_ENDPOINT = 'https://weekend-radius-d7g6jqqde67abca7d-1476930026.ap-shanghai.app.tcloudbase.com/api/places';

export const NATIVE_CLOUD_ENABLED = false;
export const LIVE_POI_ENABLED = LIVE_POI_ENDPOINT.length > 0;
