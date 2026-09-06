const https = require('https');
const crypto = require('crypto');

const SEARCH_GROUPS = [
  { keyword: '餐厅', category: 'lunch', categoryLabel: '餐厅', tags: ['food'], imageUrl: '/assets/images/food.svg', averageCost: 55, stay: 70, openTime: '11:00', closeTime: '22:00' },
  { keyword: '咖啡', category: 'cafe', categoryLabel: '咖啡', tags: ['coffee'], imageUrl: '/assets/images/coffee.svg', averageCost: 32, stay: 50, openTime: '09:00', closeTime: '22:00' },
  { keyword: '甜品', category: 'dessert', categoryLabel: '甜品', tags: ['food'], imageUrl: '/assets/images/dessert.svg', averageCost: 22, stay: 40, openTime: '11:00', closeTime: '23:00' },
  { keyword: '公园', category: 'park', categoryLabel: '公园', tags: ['outdoor'], imageUrl: '/assets/images/outdoor.svg', averageCost: 0, stay: 50, openTime: '06:30', closeTime: '21:30' },
  { keyword: '商场', category: 'shopping', categoryLabel: '逛街', tags: ['shopping'], imageUrl: '/assets/images/market.svg', averageCost: 0, stay: 60, openTime: '10:00', closeTime: '22:00' },
  { keyword: '景点', category: 'attraction', categoryLabel: '城市去处', tags: ['culture', 'outdoor'], imageUrl: '/assets/images/art.svg', averageCost: 0, stay: 60, openTime: '09:00', closeTime: '18:00' }
];

const ACTIVITY_PLACE_GROUPS = [
  { keyword: '公园', category: 'park', categoryLabel: '公园', tags: ['outdoor'], interests: ['outdoor'], moods: ['recharge', 'explore', 'date', 'budget'], outdoor: true, imageUrl: '/assets/images/outdoor.svg', averageCost: 0, stay: 75, openTime: '06:30', closeTime: '21:30' },
  { keyword: '商场', category: 'shopping', categoryLabel: '逛街', tags: ['shopping'], interests: ['shopping'], moods: ['explore', 'date', 'surprise'], imageUrl: '/assets/images/market.svg', averageCost: 0, stay: 100, openTime: '10:00', closeTime: '22:00' },
  { keyword: '景点', category: 'attraction', categoryLabel: '城市去处', tags: ['culture', 'outdoor'], interests: ['exhibition', 'art', 'history', 'culture'], moods: ['culture', 'explore', 'date', 'budget'], outdoor: true, imageUrl: '/assets/images/art.svg', averageCost: 0, stay: 90, openTime: '09:00', closeTime: '18:00' },
  { keyword: '电影院', category: 'movie', categoryLabel: '电影院', tags: ['movie'], interests: ['movie'], moods: ['recharge', 'culture', 'date'], imageUrl: '/assets/images/movie.svg', averageCost: 55, stay: 130, openTime: '10:00', closeTime: '23:00' },
  { keyword: '剧场', category: 'attraction', categoryLabel: '剧场', tags: ['theater', 'art'], interests: ['theater'], moods: ['culture', 'explore', 'date'], imageUrl: '/assets/images/movie.svg', averageCost: 80, stay: 120, openTime: '10:00', closeTime: '22:30' },
  { keyword: 'LiveHouse', category: 'attraction', categoryLabel: 'Livehouse', tags: ['music', 'nightlife'], interests: ['music', 'nightlife'], moods: ['explore', 'date', 'surprise'], imageUrl: '/assets/images/music.svg', averageCost: 120, stay: 120, openTime: '18:00', closeTime: '23:30' },
  { keyword: '书店', category: 'attraction', categoryLabel: '书店', tags: ['reading', 'culture'], interests: ['reading'], moods: ['recharge', 'culture', 'budget'], imageUrl: '/assets/images/market.svg', averageCost: 0, stay: 90, openTime: '10:00', closeTime: '22:00' },
  { keyword: '本地特色餐厅', category: 'lunch', categoryLabel: '美食', tags: ['food'], interests: ['food'], moods: ['foodie', 'date', 'surprise'], imageUrl: '/assets/images/food.svg', averageCost: 65, stay: 75, openTime: '11:00', closeTime: '22:00' },
  { keyword: '精品咖啡', category: 'cafe', categoryLabel: '咖啡', tags: ['coffee'], interests: ['coffee'], moods: ['recharge', 'foodie', 'date'], imageUrl: '/assets/images/coffee.svg', averageCost: 35, stay: 60, openTime: '09:00', closeTime: '22:00' },
  { keyword: '酒吧', category: 'bar', categoryLabel: '夜生活', tags: ['nightlife', 'music'], interests: ['nightlife'], moods: ['explore', 'date', 'surprise'], alcohol: true, imageUrl: '/assets/images/music.svg', averageCost: 100, stay: 100, openTime: '18:00', closeTime: '02:00' }
];

const MOOD_DISCOVERY_KEYWORDS = {
  recharge: ['公园', '精品咖啡', '书店', '电影院'],
  explore: ['景点', '公园', '商场', 'LiveHouse'],
  foodie: ['本地特色餐厅', '精品咖啡'],
  culture: ['景点', '剧场', '书店', '电影院'],
  date: ['精品咖啡', '电影院', '商场', '本地特色餐厅'],
  budget: ['公园', '书店', '景点']
};

const CURATED_MALLS = [
  { names: ['太古汇'], score: 96, reason: '高端品牌、餐饮和空间体验突出，适合品质购物与约会', url: 'https://www.taikoohui.com/zh-CN' },
  { names: ['天环', 'Parc Central'], score: 94, reason: '建筑与户外空间辨识度高，适合拍照和轻松逛街', url: 'https://www.thnet.gov.cn/zjth/tzth/zlpt/content/post_9126462.html' },
  { names: ['正佳广场'], score: 92, reason: '体量大，餐饮、影院和室内体验丰富，但周末通常较拥挤', url: 'https://you.ctrip.com/sight/guangzhou152/1412403.html' },
  { names: ['广州K11', 'K11购物艺术中心'], score: 91, reason: '艺术展陈、设计品牌和餐饮结合较好，适合城市文化与逛街', url: 'https://sw.gz.gov.cn/xxgk/tzgg/ywgs/content/post_10954852.html' },
  { names: ['天河城'], score: 89, reason: '品牌覆盖全面、交通方便，适合日常购物和家庭出行', url: 'https://www.thnet.gov.cn/zjth/tzth/zlpt/content/post_9126462.html' },
  { names: ['万菱汇'], score: 87, reason: '潮流零售与餐饮选择较集中，适合年轻人顺路停留', url: 'https://sw.gz.gov.cn/xxgk/tzgg/ywgs/content/post_10954852.html' },
  { names: ['天汇广场', 'IGC'], score: 86, reason: '珠江新城综合体验较完整，餐饮和休闲选择均衡', url: 'https://www.thnet.gov.cn/zjth/tzth/zlpt/content/post_9126462.html' },
  { names: ['北京路天河城'], score: 84, reason: '适合与北京路步行街、历史街区组合成一段城市漫游', url: 'https://www.gz.gov.cn/attachment/7/7950/7950448/10611439.pdf' }
];

const LARGE_MALL_SIGNALS = ['购物中心', '商业广场', '天河城', '万达', '万象', 'K11', '太古汇', '天环', '正佳', '万菱汇'];

const ANCHOR_VENUES = [
  { id: 'guangdong-museum', keyword: '广东省博物馆' },
  { id: 'guangzhou-art-museum', keyword: '广州艺术博物院 广州美术馆' },
  { id: 'guangdong-art-museum-baietan', keyword: '广东美术馆 白鹅潭馆区' },
  { id: 'nanyue-king-tomb', keyword: '南越王博物院 王墓展区' },
  { id: 'nanyue-king-palace', keyword: '南越王博物院 王宫展区' },
  { id: 'guangzhou-library', keyword: '广州图书馆' },
  { id: 'guangzhou-cultural-center', keyword: '广州市文化馆' }
];

// Only events with an explicit organizer/venue announcement belong here. Map keyword
// results are deliberately excluded: a POI name containing “漫” is not an anime event.
const OFFICIAL_EVENTS = [
  {
    id: 'cicf-agf-guangzhou-2026',
    cityCode: 'guangzhou',
    name: '2026 CICF×AGF广州动漫游戏盛典',
    category: 'anime',
    categoryLabel: '动漫 / 漫展',
    tags: ['anime', 'exhibition', 'gaming', 'culture'],
    startDate: '2026-10-02',
    endDate: '2026-10-05',
    startTime: '10:00',
    endTime: '17:00',
    venueName: '广州保利世贸博览馆',
    address: '广州市海珠区新港东路1000号',
    district: '海珠区',
    location: { latitude: 23.09855, longitude: 113.36637 },
    priceMin: 0,
    priceMax: 0,
    pricePending: true,
    bookingRequired: true,
    description: 'CICF主办方已确认活动于10月2日至5日在广州保利世贸博览馆举办，包含动漫游戏展、宅舞赛事、COSPLAY赛事和主题专区。每日具体入场时段与票价发布后再更新。',
    officialUrl: 'https://www.cicfexpo.com/index.php?a=show&c=index&catid=32&id=1198&m=content',
    sourceName: 'CICF×AGF主办方官方公告'
  }
];

const OFFICIAL_EVENT_FEEDS = [
  {
    name: '广州市会展业公共服务平台排期',
    url: 'https://mice-gz.org/hz/index.html',
    baseUrl: 'https://mice-gz.org'
  }
];

const OFFICIAL_EVENT_VENUES = [
  {
    aliases: ['保利世贸博览馆', '广州保利世贸博览馆'],
    venueName: '广州保利世贸博览馆',
    address: '广州市海珠区新港东路1000号',
    district: '海珠区',
    location: { latitude: 23.09855, longitude: 113.36637 }
  },
  {
    aliases: ['灵感创新展馆', '广州灵感创新馆', 'LIC灵感创新展馆'],
    venueName: '灵感创新展馆',
    address: '广州市海珠区新港东路628号',
    district: '海珠区',
    location: { latitude: 23.0986, longitude: 113.35698 }
  },
  {
    aliases: ['海珠国际会展中心', '南丰国际会展中心'],
    venueName: '海珠国际会展中心',
    address: '广州市海珠区新港东路630-638号',
    district: '海珠区',
    location: { latitude: 23.09738, longitude: 113.36008 }
  }
];

const STRICT_ANIME_EVENT_PATTERN = /动漫|漫画|ACG|二次元|游戏嘉年华|插画艺术节/i;
let officialEventFeedCache = { expiresAt: 0, events: [], status: 'not_loaded', errors: [] };

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    request.setTimeout(4500, () => request.destroy(new Error('地图服务请求超时')));
    request.on('error', reject);
  });
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`官方排期返回 ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve(body));
    });
    request.setTimeout(5000, () => request.destroy(new Error('官方排期请求超时')));
    request.on('error', reject);
  });
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveOfficialVenue(value) {
  const normalized = normalizeName(value);
  return OFFICIAL_EVENT_VENUES.find((venue) => (
    venue.aliases.some((alias) => normalized.includes(normalizeName(alias)))
  ));
}

function parseOfficialEventFeed(html, source) {
  const events = [];
  const itemPattern = /<li\b[^>]*class="[^"]*vus-clearfix[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  for (const match of html.matchAll(itemPattern)) {
    const block = match[1];
    const linkMatch = block.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const venueMatch = block.match(/地址：([\s\S]*?)<\/p>/i);
    const dates = [...block.matchAll(/<p[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/p>/gi)].map((item) => item[1]);
    if (!linkMatch || !venueMatch || dates.length < 2) continue;

    const name = decodeHtml(linkMatch[2]);
    const rawVenueName = decodeHtml(venueMatch[1]);
    const venue = resolveOfficialVenue(rawVenueName);
    if (!STRICT_ANIME_EVENT_PATTERN.test(name) || !venue) continue;

    const detailUrl = linkMatch[1].startsWith('http') ? linkMatch[1] : `${source.baseUrl}${linkMatch[1]}`;
    const startDate = dates[0];
    const endDate = dates[1];
    const providerId = crypto.createHash('md5').update(`${name}:${startDate}:${endDate}`).digest('hex').slice(0, 16);
    events.push({
      id: `gz-mice-${providerId}`,
      cityCode: 'guangzhou',
      name,
      category: 'anime',
      categoryLabel: '动漫 / 漫展',
      tags: ['anime', 'exhibition', 'gaming', 'culture'],
      startDate,
      endDate,
      startTime: '10:00',
      endTime: '17:00',
      venueName: venue.venueName,
      address: venue.address,
      district: venue.district,
      location: venue.location,
      priceMin: 0,
      priceMax: 0,
      pricePending: true,
      bookingRequired: true,
      description: `${source.name}已列出“${name}”，举办日期为${startDate}至${endDate}，场馆为${venue.venueName}。每日入场时间和票价以主办方后续发布为准。`,
      officialUrl: detailUrl,
      sourceName: source.name
    });
  }
  return events;
}

function mergeOfficialEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const identity = `${normalizeName(event.name)}:${event.startDate}:${event.endDate}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

async function loadOfficialEvents() {
  const now = Date.now();
  if (officialEventFeedCache.expiresAt > now) return officialEventFeedCache;

  const settled = await Promise.allSettled(OFFICIAL_EVENT_FEEDS.map(async (source) => (
    parseOfficialEventFeed(await requestText(source.url), source)
  )));
  const liveEvents = settled.filter((item) => item.status === 'fulfilled').flatMap((item) => item.value);
  const errors = settled.filter((item) => item.status === 'rejected').map((item) => item.reason?.message || '官方排期读取失败');
  officialEventFeedCache = {
    expiresAt: now + 30 * 60 * 1000,
    events: mergeOfficialEvents([...OFFICIAL_EVENTS, ...liveEvents]),
    status: liveEvents.length ? 'live' : errors.length ? 'fallback' : 'live_empty',
    errors
  };
  return officialEventFeedCache;
}

function buildTencentMapUrl(path, params, key, secretKey) {
  params.set('key', key);
  const sortedEntries = Array.from(params.entries()).sort(([left], [right]) => (
    left < right ? -1 : left > right ? 1 : 0
  ));
  const signingQuery = sortedEntries.map(([name, value]) => `${name}=${value}`).join('&');
  const signature = crypto
    .createHash('md5')
    .update(`${path}?${signingQuery}${secretKey}`)
    .digest('hex');
  const query = new URLSearchParams(sortedEntries).toString();
  return `https://apis.map.qq.com${path}?${query}&sig=${signature}`;
}

function javaUrlEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

function buildBaiduMapUrl(path, entries, key, secretKey) {
  const signedEntries = [...entries, ['ak', key], ['timestamp', String(Math.floor(Date.now() / 1000))]];
  const query = signedEntries
    .map(([name, value]) => `${name}=${javaUrlEncode(value)}`)
    .join('&');
  const signature = crypto
    .createHash('md5')
    .update(javaUrlEncode(`${path}?${query}${secretKey}`))
    .digest('hex');
  return `https://api.map.baidu.com${path}?${query}&sn=${signature}`;
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function calculateReviewQuality(rating, reviewCount) {
  if (!Number.isFinite(rating) || rating <= 0) return undefined;
  const count = Math.max(0, Number(reviewCount) || 0);
  const confidence = Math.min(1, Math.log10(count + 1) / 3);
  const adjustedRating = 4 + (rating - 4) * confidence;
  return Math.max(45, Math.min(96, Math.round(50 + (adjustedRating - 3) * 25)));
}

function reviewReason(rating, reviewCount, averageCost) {
  if (!Number.isFinite(rating) || rating <= 0) return '';
  const parts = [`百度地图地点信息显示 ${rating.toFixed(1)} 分`];
  if (reviewCount > 0) parts.push(`${reviewCount} 条评论`);
  if (averageCost > 0) parts.push(`人均约 ¥${Math.round(averageCost)}`);
  return parts.join('、');
}

function parseShopHours(value, fallbackOpen, fallbackClose) {
  const match = String(value || '').match(/(\d{1,2}:\d{2})\s*[-—至]\s*(\d{1,2}:\d{2})/);
  return match
    ? { openTime: match[1], closeTime: match[2], estimated: false }
    : { openTime: fallbackOpen, closeTime: fallbackClose, estimated: true };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { status: 'fulfilled', value: await mapper(items[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function searchGroup(group, center, radius, key, secretKey, fetchedAt, context = {}) {
  const curatedShopping = context.kind === 'activityPlaces' && group.category === 'shopping';
  const wholeCityShopping = curatedShopping && context.distancePreference === 'whole_city';
  const params = new URLSearchParams({
    keyword: curatedShopping ? '购物中心' : group.keyword,
    boundary: wholeCityShopping
      ? 'region(广州,1)'
      : `nearby(${center.latitude},${center.longitude},${radius},1)`,
    page_size: curatedShopping ? '20' : '6'
  });
  if (!wholeCityShopping) params.set('orderby', '_distance');
  const payload = await requestJson(buildTencentMapUrl('/ws/place/v1/search', params, key, secretKey));
  if (payload.status !== 0 || !Array.isArray(payload.data)) {
    throw new Error(`${group.category}: ${payload.status ?? 'unknown'} ${payload.message || '腾讯地图查询失败'}`);
  }

  const unsuitableFor = [];
  if (group.outdoor || (group.category === 'park') || (group.category === 'attraction' && !group.interests)) unsuitableFor.push('no_outdoor');
  if (group.alcohol) unsuitableFor.push('no_alcohol');

  const mapped = payload.data.map((item) => {
    const normalizedTitle = normalizeName(item.title);
    const curated = curatedShopping
      ? CURATED_MALLS.find((mall) => mall.names.some((name) => normalizedTitle.includes(normalizeName(name))))
      : null;
    const looksLarge = curated || LARGE_MALL_SIGNALS.some((signal) => normalizedTitle.includes(normalizeName(signal)));
    return {
    id: `tmap-${group.category}-${item.id}`,
    name: item.title,
    category: group.category,
    categoryLabel: group.categoryLabel,
    tags: group.tags,
    imageUrl: group.imageUrl,
    description: `腾讯地图实时地点${item._distance ? `，距活动约 ${Math.max(1, Math.round(item._distance / 100) / 10)} km` : ''}。`,
    address: item.address || item.title,
    district: item.ad_info?.district || '广州',
    location: { latitude: Number(item.location.lat), longitude: Number(item.location.lng) },
    averageCost: group.averageCost,
    suggestedStayMinutes: group.stay,
    openTime: group.openTime,
    closeTime: group.closeTime,
    suitableMoods: group.moods || ['recharge', 'explore', 'foodie', 'culture', 'date', 'budget', 'surprise'],
    unsuitableFor,
    source: {
      name: curated ? '周末半径口碑精选 · 腾讯位置服务' : '腾讯位置服务',
      url: curated?.url,
      isMock: false, providerId: item.id, fetchedAt
    },
    hoursEstimated: true,
    priceEstimated: true,
    phone: item.tel || '',
    qualityScore: curated?.score || (looksLarge ? 72 : 58),
    qualityReason: curated?.reason || (looksLarge ? '地图分类与名称显示为较完整的购物中心' : ''),
    scheduleNeedsConfirmation: Boolean(group.scheduleNeedsConfirmation),
    searchIntent: group.searchIntent,
    _distance: Number(item._distance || 0),
    _looksLarge: Boolean(looksLarge)
    };
  });

  if (!curatedShopping) return mapped;
  return mapped
    .filter((item) => item._looksLarge)
    .sort((left, right) => (right.qualityScore - left.qualityScore) || (left._distance - right._distance))
    .slice(0, 8)
    .map(({ _distance, _looksLarge, ...item }) => item);
}

async function searchBaiduGroup(group, center, radius, key, secretKey, fetchedAt, context = {}) {
  const curatedShopping = context.kind === 'activityPlaces' && group.category === 'shopping';
  const wholeCityShopping = curatedShopping && context.distancePreference === 'whole_city';
  const query = curatedShopping ? '购物中心' : (group.baiduQuery || group.keyword);
  const entries = [['query', query]];

  if (wholeCityShopping) {
    entries.push(['region', '广州'], ['city_limit', 'true']);
  } else {
    entries.push(
      ['location', `${center.latitude},${center.longitude}`],
      ['radius', String(radius)],
      ['radius_limit', 'true']
    );
  }

  const isFood = ['lunch', 'cafe', 'dessert'].includes(group.category);
  const canSortByReviews = isFood || ['shopping', 'movie', 'bar'].includes(group.category);
  entries.push(
    ['output', 'json'],
    ['scope', '2'],
    ['coord_type', '2'],
    ['ret_coordtype', 'gcj02ll'],
    ['page_size', curatedShopping ? '20' : '12'],
    ['page_num', '0']
  );
  if (canSortByReviews) {
    entries.push(['filter', `industry_type:${isFood ? 'cater' : 'life'}|sort_name:overall_rating|sort_rule:0`]);
  }

  const path = '/place/v2/search';
  const payload = await requestJson(buildBaiduMapUrl(path, entries, key, secretKey));
  if (Number(payload.status) !== 0 || !Array.isArray(payload.results)) {
    throw new Error(`${group.category}: ${payload.status ?? 'unknown'} ${payload.message || '百度地图查询失败'}`);
  }
  if (!payload.results.length) throw new Error(`${group.category}: 百度地图未返回结果`);

  const unsuitableFor = [];
  if (group.outdoor || group.category === 'park' || (group.category === 'attraction' && !group.interests)) unsuitableFor.push('no_outdoor');
  if (group.alcohol) unsuitableFor.push('no_alcohol');

  const mapped = payload.results.map((item) => {
    const detail = item.detail_info || {};
    const normalizedTitle = normalizeName(item.name);
    const curated = curatedShopping
      ? CURATED_MALLS.find((mall) => mall.names.some((name) => normalizedTitle.includes(normalizeName(name))))
      : null;
    const looksLarge = curated || LARGE_MALL_SIGNALS.some((signal) => normalizedTitle.includes(normalizeName(signal)));
    const rating = finiteNumber(detail.overall_rating);
    const reviewCount = Math.max(0, finiteNumber(detail.comment_num) || 0);
    const reportedCost = finiteNumber(detail.price);
    const averageCost = reportedCost && reportedCost > 0 ? reportedCost : group.averageCost;
    const calculatedQuality = calculateReviewQuality(rating, reviewCount);
    const hours = parseShopHours(detail.shop_hours, group.openTime, group.closeTime);
    const distanceMeters = Math.max(0, finiteNumber(detail.distance) || 0);
    const qualityReason = reviewReason(rating, reviewCount, reportedCost || 0) || curated?.reason || (looksLarge ? '地图分类与名称显示为较完整的购物中心' : '');

    return {
      id: `baidu-${group.category}-${item.uid}`,
      name: item.name,
      category: group.category,
      categoryLabel: group.categoryLabel,
      tags: group.tags,
      imageUrl: group.imageUrl,
      description: `百度地图实时地点${distanceMeters ? `，距中心约 ${Math.max(1, Math.round(distanceMeters / 100) / 10)} km` : ''}。`,
      address: item.address || item.name,
      district: item.area || '广州',
      location: { latitude: Number(item.location?.lat), longitude: Number(item.location?.lng) },
      averageCost,
      suggestedStayMinutes: group.stay,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      suitableMoods: group.moods || ['recharge', 'explore', 'foodie', 'culture', 'date', 'budget', 'surprise'],
      unsuitableFor,
      source: {
        name: '百度地图地点检索',
        url: detail.detail_url || curated?.url,
        isMock: false,
        providerId: item.uid,
        fetchedAt
      },
      hoursEstimated: hours.estimated,
      priceEstimated: !(reportedCost && reportedCost > 0),
      phone: item.telephone || '',
      qualityScore: calculatedQuality || curated?.score || (looksLarge ? 72 : 58),
      qualityReason,
      reviewRating: rating,
      reviewCount,
      ratingSource: rating ? '百度地图' : undefined,
      tasteRating: finiteNumber(detail.taste_rating),
      scheduleNeedsConfirmation: Boolean(group.scheduleNeedsConfirmation),
      searchIntent: group.searchIntent,
      _distance: distanceMeters,
      _looksLarge: Boolean(looksLarge)
    };
  }).filter((item) => Number.isFinite(item.location.latitude) && Number.isFinite(item.location.longitude));

  const eligible = curatedShopping ? mapped.filter((item) => item._looksLarge) : mapped;
  return eligible
    .sort((left, right) => (right.qualityScore - left.qualityScore) || (left._distance - right._distance))
    .slice(0, curatedShopping ? 8 : 10)
    .map(({ _distance, _looksLarge, ...item }) => item);
}

async function searchGroupWithFallback(group, center, radius, providers, fetchedAt, context) {
  let baiduError;
  if (providers.baiduKey && providers.baiduSecretKey) {
    try {
      return await searchBaiduGroup(group, center, radius, providers.baiduKey, providers.baiduSecretKey, fetchedAt, context);
    } catch (error) {
      baiduError = error;
    }
  }

  try {
    return await searchGroup(group, center, radius, providers.tencentKey, providers.tencentSecretKey, fetchedAt, context);
  } catch (tencentError) {
    const messages = [baiduError?.message, tencentError?.message].filter(Boolean);
    throw new Error(messages.join(' | ') || '地图查询失败');
  }
}

function normalizeName(value) {
  return String(value || '').replace(/[\s（）()·]/g, '').toLowerCase();
}

async function searchAnchorVenue(venue, key, secretKey) {
  const params = new URLSearchParams({
    keyword: venue.keyword,
    boundary: 'region(广州,1)',
    page_size: '5'
  });
  const payload = await requestJson(buildTencentMapUrl('/ws/place/v1/search', params, key, secretKey));
  if (payload.status !== 0 || !Array.isArray(payload.data)) {
    throw new Error(`${venue.id}: ${payload.status ?? 'unknown'} ${payload.message || '腾讯地图查询失败'}`);
  }
  if (!payload.data.length) return { ...venue, poi: null };
  const expected = normalizeName(venue.keyword.split(' ')[0]);
  const poi = payload.data.find((item) => normalizeName(item.title).includes(expected)) || payload.data[0];
  return {
    ...venue,
    poi: {
      id: poi.id,
      title: poi.title,
      address: poi.address,
      district: poi.ad_info?.district || '广州',
      location: poi.location
    }
  };
}

function parseRequest(event) {
  if (!event?.httpMethod) return event || {};
  if (!event.body) return event.queryStringParameters || {};
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(rawBody);
  } catch (error) {
    return {};
  }
}

function selectActivityGroups(request) {
  const requestedInterests = Array.isArray(request.interests)
    ? request.interests.filter((item) => typeof item === 'string')
    : [];
  const selected = [];

  if (request.recommendationMode === 'surprise') {
    const seed = Math.abs(Number(request.surpriseSeed) || Date.now());
    const pool = ACTIVITY_PLACE_GROUPS.map((group, index) => ({
      group,
      order: ((seed % 104729) * (index + 11) + (index + 3) * 7919) % 104729
    }));
    return pool.sort((left, right) => left.order - right.order).slice(0, 6).map((item) => item.group);
  }

  const customInterests = Array.isArray(request.customInterests)
    ? request.customInterests.filter((item) => typeof item === 'string' && item.trim()).slice(0, 2)
    : [];
  const requestsOfficialAnime = requestedInterests.includes('anime')
    || customInterests.some((item) => /漫展|动漫|二次元/.test(item));
  const hasNonAnimeInterest = requestedInterests.some((item) => item !== 'anime')
    || customInterests.some((item) => !/漫展|动漫|二次元/.test(item));
  for (const keyword of customInterests) {
    const trimmed = keyword.trim();
    const isAnime = /漫展|动漫|二次元/.test(trimmed);
    if (isAnime) continue;
    selected.push({
      keyword: trimmed,
      baiduQuery: trimmed,
      category: 'attraction', categoryLabel: trimmed,
      tags: ['culture'],
      interests: [], moods: ['explore', 'surprise'], imageUrl: '/assets/images/art.svg',
      averageCost: 0, stay: 90, openTime: '09:30', closeTime: '21:00',
      scheduleNeedsConfirmation: true, searchIntent: trimmed
    });
  }

  interestLoop: for (const interest of requestedInterests) {
    const candidates = ACTIVITY_PLACE_GROUPS.filter((group) => group.interests.includes(interest));
    for (const candidate of candidates.slice(0, 2)) {
      if (!selected.includes(candidate)) selected.push(candidate);
      if (selected.length >= 4) break interestLoop;
    }
  }

  if (requestsOfficialAnime && !hasNonAnimeInterest) return [];

  const moodKeywords = MOOD_DISCOVERY_KEYWORDS[request.mood] || [];
  for (const keyword of moodKeywords) {
    const candidate = ACTIVITY_PLACE_GROUPS.find((group) => group.keyword === keyword);
    if (candidate && !selected.includes(candidate)) selected.push(candidate);
    if (selected.length >= 6) break;
  }

  if (selected.length) return selected.slice(0, 6);
  if (requestsOfficialAnime) return [];
  return ACTIVITY_PLACE_GROUPS.filter((group) => ['公园', '商场', '景点', '电影院', '精品咖啡'].includes(group.keyword));
}

function makeResponse(event, payload, statusCode = 200) {
  if (!event?.httpMethod) return payload;
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(payload)
  };
}

exports.main = async (event) => {
  if (event?.httpMethod === 'OPTIONS') {
    return makeResponse(event, { success: true });
  }

  const request = parseRequest(event);
  if (request.kind === 'officialEvents') {
    const selectedDate = String(request.selectedDate || '');
    const cityCode = String(request.cityCode || 'guangzhou');
    const feed = await loadOfficialEvents();
    const events = feed.events.filter((item) => (
      item.cityCode === cityCode
      && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
      && selectedDate >= item.startDate
      && selectedDate <= item.endDate
    ));
    return makeResponse(event, {
      success: true,
      events,
      sourceStatus: feed.status,
      providerErrors: feed.errors,
      updatedAt: Date.now()
    });
  }
  const key = process.env.TENCENT_MAP_KEY;
  const secretKey = process.env.TENCENT_MAP_SK;
  if (!key || !secretKey) {
    return makeResponse(event, { success: false, message: '云函数缺少腾讯位置服务环境变量', places: [] }, 500);
  }

  if (request.kind === 'anchorVenues') {
    const settled = await mapWithConcurrency(ANCHOR_VENUES, 3, (venue) => searchAnchorVenue(venue, key, secretKey));
    const venues = settled.filter((item) => item.status === 'fulfilled').map((item) => item.value).filter((venue) => venue.poi);
    const providerErrors = settled.filter((item) => item.status === 'rejected').map((item) => item.reason?.message || '腾讯地图查询失败');
    return makeResponse(event, { success: venues.length > 0, venues, providerErrors, updatedAt: Date.now() });
  }

  const center = request.center;
  if (!Number.isFinite(center?.latitude) || !Number.isFinite(center?.longitude)) {
    return makeResponse(event, { success: false, message: '搜索中心点无效', places: [] }, 400);
  }

  const radius = Math.max(500, Math.min(20000, Number(request.radius) || 5000));
  const fetchedAt = Date.now();
  const groups = request.kind === 'activityPlaces' ? selectActivityGroups(request) : SEARCH_GROUPS;
  const providers = {
    tencentKey: key,
    tencentSecretKey: secretKey,
    baiduKey: process.env.BAIDU_MAP_AK,
    baiduSecretKey: process.env.BAIDU_MAP_SK
  };
  const settled = await mapWithConcurrency(groups, 2, (group) => (
    searchGroupWithFallback(group, center, radius, providers, fetchedAt, request)
  ));
  const allPlaces = settled.filter((item) => item.status === 'fulfilled').flatMap((item) => item.value);
  const seenPlaces = new Set();
  const places = allPlaces.filter((place) => {
    const identity = `${normalizeName(place.name)}:${place.category}`;
    if (seenPlaces.has(identity)) return false;
    seenPlaces.add(identity);
    return true;
  });
  const providerErrors = settled.filter((item) => item.status === 'rejected').map((item) => item.reason?.message || '腾讯地图查询失败');
  return makeResponse(event, { success: places.length > 0, places, providerErrors, updatedAt: fetchedAt });
};
