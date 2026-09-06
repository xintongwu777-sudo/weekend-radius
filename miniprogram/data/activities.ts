import { Activity, InterestType, MoodType, WeekendDay } from '../types/index';
import { getNextWeekendDate, toTimestamp } from '../utilities/time';

interface ActivityTemplate {
  id: string;
  name: string;
  category: InterestType;
  categoryLabel: string;
  tags: InterestType[];
  imageUrl: string;
  description: string;
  days: WeekendDay[];
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  priceMin: number;
  priceMax: number;
  bookingRequired: boolean;
  suitableMoods: MoodType[];
  unsuitableFor: Activity['unsuitableFor'];
  travelMinutesFromCenter: number;
  noveltyScore: number;
}

const templates: ActivityTemplate[] = [
  {
    id: 'gz-image-001', name: '城市切片：当代影像展', category: 'exhibition', categoryLabel: '展览',
    tags: ['exhibition', 'art'], imageUrl: '/assets/images/art.svg',
    description: '从街道、建筑与日常人物出发，观看六组关于广州城市生活的影像作品。适合慢慢逛，也适合一个人的下午。',
    days: ['saturday', 'sunday'], startTime: '14:00', endTime: '16:00', venueName: '珠江新城艺文空间',
    address: '天河区珠江新城艺文街区', district: '天河区', latitude: 23.1188, longitude: 113.3224,
    priceMin: 38, priceMax: 58, bookingRequired: false, suitableMoods: ['recharge', 'explore', 'culture', 'date'],
    unsuitableFor: [], travelMinutesFromCenter: 18, noveltyScore: 9
  },
  {
    id: 'gz-market-002', name: '东山口独立设计市集', category: 'market', categoryLabel: '市集',
    tags: ['market', 'art', 'shopping'], imageUrl: '/assets/images/market.svg',
    description: '集合独立首饰、纸品、香氛和小型出版物的周末市集，沿途还有不少适合停留的街角小店。',
    days: ['saturday'], startTime: '13:30', endTime: '16:30', venueName: '东山口街区庭院',
    address: '越秀区东山口启明社区附近', district: '越秀区', latitude: 23.1231, longitude: 113.2962,
    priceMin: 0, priceMax: 30, bookingRequired: false, suitableMoods: ['explore', 'date', 'budget', 'surprise'],
    unsuitableFor: ['avoid_queues'], travelMinutesFromCenter: 14, noveltyScore: 8
  },
  {
    id: 'gz-workshop-003', name: '西关植物拓印工作坊', category: 'workshop', categoryLabel: 'Workshop',
    tags: ['workshop', 'art'], imageUrl: '/assets/images/workshop.svg',
    description: '在安静的西关院落里完成一幅植物拓印作品，材料已经备好，零基础也能轻松参加。',
    days: ['saturday', 'sunday'], startTime: '15:00', endTime: '17:00', venueName: '永庆坊手作间',
    address: '荔湾区恩宁路永庆坊附近', district: '荔湾区', latitude: 23.1164, longitude: 113.2447,
    priceMin: 78, priceMax: 88, bookingRequired: true, suitableMoods: ['recharge', 'culture', 'date'],
    unsuitableFor: [], travelMinutesFromCenter: 28, noveltyScore: 10
  },
  {
    id: 'gz-nature-004', name: '海珠湖黄昏自然观察', category: 'outdoor', categoryLabel: '户外',
    tags: ['outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '跟随自然向导认识城市湿地，在日落前完成一段节奏舒缓的环湖观察路线。',
    days: ['sunday'], startTime: '16:30', endTime: '18:20', venueName: '海珠湖自然教育径',
    address: '海珠区新滘中路海珠湖附近', district: '海珠区', latitude: 23.0754, longitude: 113.3272,
    priceMin: 20, priceMax: 30, bookingRequired: true, suitableMoods: ['recharge', 'explore', 'budget'],
    unsuitableFor: ['no_outdoor', 'avoid_long_walks'], travelMinutesFromCenter: 32, noveltyScore: 8
  },
  {
    id: 'gz-movie-005', name: '城市短片周末放映', category: 'movie', categoryLabel: '电影',
    tags: ['movie', 'art'], imageUrl: '/assets/images/movie.svg',
    description: '六部围绕城市记忆与青年生活的短片联映，放映结束后有二十分钟轻交流。',
    days: ['saturday', 'sunday'], startTime: '18:30', endTime: '20:30', venueName: '海珠青年艺文空间',
    address: '海珠区江南西艺文街区', district: '海珠区', latitude: 23.0972, longitude: 113.2748,
    priceMin: 45, priceMax: 55, bookingRequired: true, suitableMoods: ['recharge', 'culture', 'date'],
    unsuitableFor: [], travelMinutesFromCenter: 20, noveltyScore: 8
  },
  {
    id: 'gz-music-006', name: '沙面室内爵士小夜场', category: 'music', categoryLabel: '音乐',
    tags: ['music', 'nightlife'], imageUrl: '/assets/images/music.svg',
    description: '在老建筑里的小型爵士现场，用一小时把周六收得刚刚好。场次座位有限，需要提前预约。',
    days: ['saturday'], startTime: '19:30', endTime: '21:00', venueName: '沙面小剧场',
    address: '荔湾区沙面南街附近', district: '荔湾区', latitude: 23.1082, longitude: 113.2391,
    priceMin: 108, priceMax: 128, bookingRequired: true, suitableMoods: ['date', 'culture', 'explore'],
    unsuitableFor: ['no_alcohol', 'not_too_late'], travelMinutesFromCenter: 26, noveltyScore: 9
  },
  {
    id: 'gz-photo-007', name: '骑楼清晨街拍漫游', category: 'photography', categoryLabel: '摄影',
    tags: ['photography', 'history', 'outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '从清晨的老城骑楼出发，用手机或相机记录街道苏醒的两个小时。无需专业设备。',
    days: ['saturday'], startTime: '06:00', endTime: '08:00', venueName: '北京路骑楼街区集合点',
    address: '越秀区北京路附近', district: '越秀区', latitude: 23.1217, longitude: 113.2697,
    priceMin: 0, priceMax: 0, bookingRequired: false, suitableMoods: ['explore', 'budget', 'culture'],
    unsuitableFor: ['no_outdoor', 'avoid_long_walks'], travelMinutesFromCenter: 18, noveltyScore: 9
  },
  {
    id: 'gz-sports-008', name: '珠江公园零基础飞盘局', category: 'sports', categoryLabel: '运动',
    tags: ['sports', 'outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '面向第一次尝试飞盘的人，现场分组、教学和轻对抗，不需要自带装备。',
    days: ['saturday', 'sunday'], startTime: '09:00', endTime: '10:30', venueName: '珠江公园草坪',
    address: '天河区珠江公园附近', district: '天河区', latitude: 23.1194, longitude: 113.3338,
    priceMin: 0, priceMax: 0, bookingRequired: true, suitableMoods: ['explore', 'budget', 'surprise'],
    unsuitableFor: ['no_outdoor', 'avoid_long_walks'], travelMinutesFromCenter: 22, noveltyScore: 8
  },
  {
    id: 'gz-reading-009', name: '江边旧书交换会', category: 'reading', categoryLabel: '阅读 / 书店',
    tags: ['reading', 'market', 'culture'], imageUrl: '/assets/images/market.svg',
    description: '带一本读完的书来，也可以空手逛逛。现场有独立出版物、旧杂志和安静阅读区。',
    days: ['saturday', 'sunday'], startTime: '10:30', endTime: '12:30', venueName: '滨江艺文客厅',
    address: '海珠区滨江西路附近', district: '海珠区', latitude: 23.1061, longitude: 113.2742,
    priceMin: 0, priceMax: 0, bookingRequired: false, suitableMoods: ['recharge', 'culture', 'budget'],
    unsuitableFor: [], travelMinutesFromCenter: 21, noveltyScore: 7
  },
  {
    id: 'gz-comedy-010', name: '广州话脱口秀开放麦', category: 'comedy', categoryLabel: '喜剧 / 脱口秀',
    tags: ['comedy', 'nightlife'], imageUrl: '/assets/images/music.svg',
    description: '新演员和成熟段子交替上场的一小时开放麦，轻松、直接，很适合临时起意的夜晚。',
    days: ['saturday'], startTime: '20:00', endTime: '21:30', venueName: '天河南小剧场',
    address: '天河区体育西路附近', district: '天河区', latitude: 23.1325, longitude: 113.3218,
    priceMin: 29, priceMax: 39, bookingRequired: true, suitableMoods: ['explore', 'date', 'surprise'],
    unsuitableFor: ['not_too_late'], travelMinutesFromCenter: 18, noveltyScore: 9
  },
  {
    id: 'gz-theater-011', name: '周日即兴戏剧实验场', category: 'theater', categoryLabel: '戏剧',
    tags: ['theater', 'comedy', 'art'], imageUrl: '/assets/images/movie.svg',
    description: '没有固定剧本，演员根据观众给出的关键词现场创作，整场演出每一次都不一样。',
    days: ['sunday'], startTime: '19:00', endTime: '21:00', venueName: '东山口社区剧场',
    address: '越秀区东山口附近', district: '越秀区', latitude: 23.1236, longitude: 113.2969,
    priceMin: 68, priceMax: 88, bookingRequired: true, suitableMoods: ['explore', 'date', 'culture', 'surprise'],
    unsuitableFor: ['not_too_late'], travelMinutesFromCenter: 15, noveltyScore: 10
  },
  {
    id: 'gz-gaming-012', name: '城市主题桌游下午场', category: 'gaming', categoryLabel: '桌游 / 游戏',
    tags: ['gaming'], imageUrl: '/assets/images/workshop.svg',
    description: '主持人会根据人数快速组局，一个人来也能加入，游戏以合作和轻策略为主。',
    days: ['saturday', 'sunday'], startTime: '14:30', endTime: '17:00', venueName: '江南西桌游客厅',
    address: '海珠区江南西附近', district: '海珠区', latitude: 23.0986, longitude: 113.2749,
    priceMin: 28, priceMax: 38, bookingRequired: false, suitableMoods: ['explore', 'date', 'budget', 'surprise'],
    unsuitableFor: [], travelMinutesFromCenter: 20, noveltyScore: 8
  },
  {
    id: 'gz-wellness-013', name: '公园晨间舒展与冥想', category: 'wellness', categoryLabel: '瑜伽 / 疗愈',
    tags: ['wellness', 'outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '一小时低强度舒展和呼吸练习，适合想早起但不想高强度运动的周日。',
    days: ['sunday'], startTime: '07:30', endTime: '08:30', venueName: '麓湖公园草坪',
    address: '越秀区麓湖公园附近', district: '越秀区', latitude: 23.1512, longitude: 113.2827,
    priceMin: 0, priceMax: 0, bookingRequired: true, suitableMoods: ['recharge', 'budget'],
    unsuitableFor: ['no_outdoor'], travelMinutesFromCenter: 24, noveltyScore: 7
  },
  {
    id: 'gz-pets-014', name: '宠物友好草地见面会', category: 'pets', categoryLabel: '宠物友好',
    tags: ['pets', 'outdoor'], imageUrl: '/assets/images/outdoor.svg',
    description: '可以带宠物，也可以只来看看。现场有饮水区、简单互动和宠物用品交换角。',
    days: ['saturday'], startTime: '16:00', endTime: '18:00', venueName: '二沙岛草地活动区',
    address: '越秀区二沙岛附近', district: '越秀区', latitude: 23.1092, longitude: 113.3031,
    priceMin: 0, priceMax: 0, bookingRequired: false, suitableMoods: ['recharge', 'date', 'budget'],
    unsuitableFor: ['no_outdoor'], travelMinutesFromCenter: 19, noveltyScore: 8
  },
  {
    id: 'gz-dance-015', name: '零基础 Swing 体验夜', category: 'dance', categoryLabel: '舞蹈',
    tags: ['dance', 'music', 'nightlife'], imageUrl: '/assets/images/music.svg',
    description: '从基本步开始的 Swing 体验课，不需要舞伴，结束后可以留下参加自由舞会。',
    days: ['sunday'], startTime: '18:30', endTime: '20:00', venueName: '海珠舞蹈空间',
    address: '海珠区昌岗附近', district: '海珠区', latitude: 23.0906, longitude: 113.2761,
    priceMin: 49, priceMax: 69, bookingRequired: true, suitableMoods: ['explore', 'date', 'surprise'],
    unsuitableFor: ['not_too_late'], travelMinutesFromCenter: 24, noveltyScore: 9
  },
  {
    id: 'gz-history-016', name: '南越城历史线索导览', category: 'history', categoryLabel: '历史文化',
    tags: ['history', 'culture', 'outdoor'], imageUrl: '/assets/images/art.svg',
    description: '从城市遗址到街巷地名，用两小时拼起广州古城的空间线索。',
    days: ['sunday'], startTime: '09:30', endTime: '11:30', venueName: '越秀古城集合点',
    address: '越秀区中山四路附近', district: '越秀区', latitude: 23.1274, longitude: 113.2736,
    priceMin: 0, priceMax: 20, bookingRequired: false, suitableMoods: ['culture', 'explore', 'budget'],
    unsuitableFor: ['no_outdoor', 'avoid_long_walks'], travelMinutesFromCenter: 17, noveltyScore: 8
  }
];

export function getActivities(day: WeekendDay): Activity[] {
  const selectedDate = getNextWeekendDate(day);
  return templates.filter((item) => item.days.includes(day)).map((item) => {
    const startAt = toTimestamp(selectedDate, item.startTime);
    const endAt = toTimestamp(selectedDate, item.endTime);
    return {
      id: item.id, name: item.name, category: item.category, categoryLabel: item.categoryLabel, tags: item.tags,
      imageUrl: item.imageUrl, description: item.description, startAt, endAt,
      durationMinutes: Math.round((endAt - startAt) / 60000), venueName: item.venueName, address: item.address,
      district: item.district, location: { latitude: item.latitude, longitude: item.longitude },
      priceMin: item.priceMin, priceMax: item.priceMax, bookingRequired: item.bookingRequired,
      suitableMoods: item.suitableMoods, suitableInterests: item.tags, unsuitableFor: item.unsuitableFor,
      travelMinutesFromCenter: item.travelMinutesFromCenter, noveltyScore: item.noveltyScore,
      source: { name: '周末半径演示数据', isMock: true }
    };
  });
}

export function findActivity(id: string, day: WeekendDay): Activity | undefined {
  return getActivities(day).find((activity) => activity.id === id);
}
