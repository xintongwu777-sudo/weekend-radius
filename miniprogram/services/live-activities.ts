import { LIVE_POI_ENABLED } from '../config/runtime';
import { Activity, DealbreakerType, InterestType, MoodType, UserPreferences } from '../types/index';
import { toTimestamp } from '../utilities/time';
import { requestPlacesApi } from './places-api';

interface VenueTemplate {
  id: string;
  venueName: string;
  activityName: string;
  category: InterestType;
  categoryLabel: string;
  tags: InterestType[];
  imageUrl: string;
  description: string;
  startTime: string;
  endTime: string;
  price: number;
  bookingRequired: boolean;
  suitableMoods: MoodType[];
  unsuitableFor: DealbreakerType[];
  officialUrl: string;
}

const venueTemplates: VenueTemplate[] = [
  {
    id: 'guangdong-museum', venueName: '广东省博物馆', activityName: '广东省博物馆常设展参观',
    category: 'exhibition', categoryLabel: '展览 / 博物馆', tags: ['exhibition', 'history', 'culture', 'art'], imageUrl: '/assets/images/art.svg',
    description: '参观广东历史文化、自然资源与艺术类常设展。场馆真实存在，建议提前通过官方渠道预约。',
    startTime: '10:00', endTime: '12:00', price: 0, bookingRequired: true,
    suitableMoods: ['culture', 'recharge', 'explore', 'budget'], unsuitableFor: [], officialUrl: 'https://www.gdmuseum.org.cn/cn'
  },
  {
    id: 'guangzhou-art-museum', venueName: '广州艺术博物院（广州美术馆）', activityName: '广州艺术博物院馆藏参观',
    category: 'art', categoryLabel: '艺术 / 美术馆', tags: ['art', 'exhibition', 'culture', 'photography'], imageUrl: '/assets/images/art.svg',
    description: '以岭南书画与广州美术史为线索参观新馆。具体在展内容以馆方当日公告为准。',
    startTime: '14:00', endTime: '16:00', price: 0, bookingRequired: true,
    suitableMoods: ['culture', 'recharge', 'date', 'explore'], unsuitableFor: [], officialUrl: 'https://www.gzam.com.cn/'
  },
  {
    id: 'guangdong-art-museum-baietan', venueName: '广东美术馆（白鹅潭馆区）', activityName: '广东美术馆白鹅潭馆区参观',
    category: 'exhibition', categoryLabel: '展览 / 美术馆', tags: ['exhibition', 'art', 'culture', 'photography'], imageUrl: '/assets/images/art.svg',
    description: '在白鹅潭大湾区艺术中心参观广东美术馆展厅。普通展览通常免费，特展政策以官方发布为准。',
    startTime: '15:00', endTime: '17:00', price: 0, bookingRequired: false,
    suitableMoods: ['culture', 'date', 'explore', 'recharge'], unsuitableFor: [], officialUrl: 'https://www.gdmoa.org/visitor_guide/?show=baietan'
  },
  {
    id: 'nanyue-king-tomb', venueName: '南越王博物院（王墓展区）', activityName: '南越王博物院王墓展区参观',
    category: 'history', categoryLabel: '历史 / 博物馆', tags: ['history', 'culture', 'exhibition'], imageUrl: '/assets/images/art.svg',
    description: '在南越文王墓原址与出土文物陈列中了解两千年前的岭南。全票价格以官方当日政策为准。',
    startTime: '10:00', endTime: '12:00', price: 10, bookingRequired: true,
    suitableMoods: ['culture', 'explore', 'budget'], unsuitableFor: [], officialUrl: 'https://www.nywmuseum.org.cn/News/VisitIndex/Visit'
  },
  {
    id: 'nanyue-king-palace', venueName: '南越王博物院（王宫展区）', activityName: '南越王博物院王宫展区参观',
    category: 'history', categoryLabel: '历史 / 遗址', tags: ['history', 'culture', 'exhibition'], imageUrl: '/assets/images/art.svg',
    description: '参观南越国宫署遗址与曲流石渠等考古遗迹。展区真实、免费，需按官方要求预约。',
    startTime: '14:00', endTime: '16:00', price: 0, bookingRequired: true,
    suitableMoods: ['culture', 'explore', 'budget'], unsuitableFor: [], officialUrl: 'https://www.nywmuseum.org.cn/News/VisitIndex/Visit'
  },
  {
    id: 'guangzhou-library', venueName: '广州图书馆', activityName: '广州图书馆主题阅读与展厅漫游',
    category: 'reading', categoryLabel: '阅读 / 图书馆', tags: ['reading', 'culture', 'exhibition'], imageUrl: '/assets/images/workshop.svg',
    description: '按兴趣选择阅读楼层，也可顺路查看负一层展览空间。展览内容以馆方当日信息为准。',
    startTime: '10:00', endTime: '12:00', price: 0, bookingRequired: false,
    suitableMoods: ['recharge', 'culture', 'budget'], unsuitableFor: [], officialUrl: 'https://www.gzlib.org.cn/opentime/index.jhtml'
  },
  {
    id: 'guangzhou-cultural-center', venueName: '广州市文化馆', activityName: '广州市文化馆岭南园林漫游',
    category: 'culture', categoryLabel: '文化 / 城市空间', tags: ['culture', 'history', 'photography', 'outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '在广府园、广绣园等园区感受岭南园林与公共文化空间，具体展演活动以馆方当天安排为准。',
    startTime: '15:00', endTime: '17:00', price: 0, bookingRequired: true,
    suitableMoods: ['culture', 'explore', 'date', 'budget'], unsuitableFor: ['no_outdoor'], officialUrl: 'https://www.gz.gov.cn/zlgz/whgz/content/post_8962593.html'
  }
];

export async function loadVerifiedVenueActivities(preferences: UserPreferences): Promise<Activity[]> {
  if (!LIVE_POI_ENABLED) return [];
  try {
    const result = await requestPlacesApi({ kind: 'anchorVenues' });
    if (!result?.success || !Array.isArray(result.venues)) return [];
    const fetchedAt = Number(result.updatedAt || Date.now());
    return venueTemplates.map((template) => {
      const venue = result.venues.find((item: any) => item.id === template.id && item.poi);
      if (!venue) return null;
      const poi = venue.poi;
      const startAt = toTimestamp(preferences.selectedDate, template.startTime);
      const endAt = toTimestamp(preferences.selectedDate, template.endTime);
      return {
        id: `verified-${template.id}`,
        name: template.activityName,
        category: template.category,
        categoryLabel: template.categoryLabel,
        tags: template.tags,
        imageUrl: template.imageUrl,
        description: template.description,
        startAt,
        endAt,
        durationMinutes: Math.round((endAt - startAt) / 60000),
        venueName: poi.title || template.venueName,
        address: poi.address,
        district: poi.district || '广州',
        location: { latitude: Number(poi.location.lat), longitude: Number(poi.location.lng) },
        priceMin: template.price,
        priceMax: template.price,
        bookingRequired: template.bookingRequired,
        suitableMoods: template.suitableMoods,
        suitableInterests: template.tags,
        unsuitableFor: template.unsuitableFor,
        travelMinutesFromCenter: 20,
        noveltyScore: 8,
        scheduleType: 'suggested' as const,
        source: {
          name: `${template.venueName}官方信息 · 腾讯位置服务坐标`,
          url: template.officialUrl,
          isMock: false,
          providerId: poi.id,
          fetchedAt
        }
      } as Activity;
    }).filter((item): item is Activity => item !== null);
  } catch (error) {
    return [];
  }
}

export async function loadOfficialScheduleActivities(preferences: UserPreferences): Promise<Activity[]> {
  if (!LIVE_POI_ENABLED) return [];
  try {
    const result = await requestPlacesApi({
      kind: 'officialEvents',
      cityCode: preferences.cityCode,
      selectedDate: preferences.selectedDate
    });
    if (!result?.success || !Array.isArray(result.events)) return [];
    const fetchedAt = Number(result.updatedAt || Date.now());
    return result.events.map((event: any) => {
      const startAt = toTimestamp(preferences.selectedDate, event.startTime || '10:00');
      const endAt = toTimestamp(preferences.selectedDate, event.endTime || '17:00');
      return {
        id: `official-event-${event.id}`,
        name: event.name,
        category: event.category || 'anime',
        categoryLabel: event.categoryLabel || '官方活动',
        tags: event.tags || ['anime', 'exhibition'],
        imageUrl: '/assets/images/art.svg',
        description: event.description,
        startAt,
        endAt,
        durationMinutes: Math.round((endAt - startAt) / 60000),
        venueName: event.venueName,
        address: event.address,
        district: event.district || preferences.cityName,
        location: event.location,
        priceMin: Number(event.priceMin || 0),
        priceMax: Number(event.priceMax || 0),
        pricePending: Boolean(event.pricePending),
        bookingRequired: Boolean(event.bookingRequired),
        suitableMoods: ['culture', 'explore', 'date', 'surprise'],
        suitableInterests: event.tags || ['anime', 'exhibition'],
        unsuitableFor: [],
        travelMinutesFromCenter: 20,
        noveltyScore: 10,
        scheduleType: 'fixed' as const,
        qualityScore: 96,
        qualityReason: '活动名称、举办日期和场馆均来自主办方官方公告',
        source: {
          name: event.sourceName || '主办方官方公告',
          url: event.officialUrl,
          isMock: false,
          providerId: event.id,
          fetchedAt
        }
      } as Activity;
    });
  } catch (error) {
    return [];
  }
}
