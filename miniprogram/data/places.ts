import { Place } from '../types/index';

export const places: Place[] = [
  {
    id: 'place-tianhe-brunch', name: '榕下早午餐', category: 'brunch', categoryLabel: 'Brunch', tags: ['food'],
    imageUrl: '/assets/images/food.svg', description: '自然光充足、节奏轻松的周末早午餐。',
    address: '天河区华就路附近', district: '天河区', location: { latitude: 23.1212, longitude: 113.3206 },
    averageCost: 68, suggestedStayMinutes: 75, openTime: '10:00', closeTime: '21:30', suitableMoods: ['recharge', 'foodie', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-tianhe-cafe', name: '窗边计划咖啡', category: 'cafe', categoryLabel: 'Café', tags: ['coffee'],
    imageUrl: '/assets/images/coffee.svg', description: '适合展前短暂停留的一间安静咖啡馆。',
    address: '天河区花城大道附近', district: '天河区', location: { latitude: 23.1198, longitude: 113.3247 },
    averageCost: 32, suggestedStayMinutes: 50, openTime: '09:30', closeTime: '22:00', suitableMoods: ['recharge', 'culture', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-tianhe-dinner', name: '小满食堂', category: 'dinner', categoryLabel: 'Dinner', tags: ['food'],
    imageUrl: '/assets/images/food.svg', description: '份量舒服的现代粤菜，适合作为一天的收尾。',
    address: '天河区猎德大道附近', district: '天河区', location: { latitude: 23.1174, longitude: 113.3276 },
    averageCost: 82, suggestedStayMinutes: 80, openTime: '11:30', closeTime: '22:00', suitableMoods: ['foodie', 'date', 'culture'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-yuexiu-lunch', name: '东山小馆', category: 'lunch', categoryLabel: 'Lunch', tags: ['food'],
    imageUrl: '/assets/images/food.svg', description: '藏在街角的清爽粤式午餐，适合市集前垫一垫。',
    address: '越秀区庙前西街附近', district: '越秀区', location: { latitude: 23.1248, longitude: 113.2945 },
    averageCost: 48, suggestedStayMinutes: 65, openTime: '11:00', closeTime: '21:00', suitableMoods: ['foodie', 'budget', 'explore'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-yuexiu-cafe', name: '前院咖啡', category: 'cafe', categoryLabel: 'Café', tags: ['coffee'],
    imageUrl: '/assets/images/coffee.svg', description: '旧洋房前院里的小咖啡馆，适合逛完市集休息。',
    address: '越秀区启明一马路附近', district: '越秀区', location: { latitude: 23.1222, longitude: 113.2978 },
    averageCost: 30, suggestedStayMinutes: 50, openTime: '10:00', closeTime: '21:30', suitableMoods: ['explore', 'date', 'recharge'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-yuexiu-walk', name: '新河浦树荫散步', category: 'walk', categoryLabel: 'Walk', tags: ['outdoor', 'art'],
    imageUrl: '/assets/images/outdoor.svg', description: '沿安静街巷走一段，看看老建筑和沿途小店。',
    address: '越秀区新河浦历史文化街区', district: '越秀区', location: { latitude: 23.1204, longitude: 113.2928 },
    averageCost: 0, suggestedStayMinutes: 45, openTime: '07:00', closeTime: '22:00', suitableMoods: ['explore', 'budget', 'date'], unsuitableFor: ['no_outdoor', 'avoid_long_walks'], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-liwan-lunch', name: '西关家常菜', category: 'lunch', categoryLabel: 'Lunch', tags: ['food'],
    imageUrl: '/assets/images/food.svg', description: '不绕路的西关家常味，价格和份量都很友好。',
    address: '荔湾区恩宁路附近', district: '荔湾区', location: { latitude: 23.1173, longitude: 113.2471 },
    averageCost: 45, suggestedStayMinutes: 65, openTime: '11:00', closeTime: '21:00', suitableMoods: ['foodie', 'budget', 'culture'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-liwan-dessert', name: '荔枝巷糖水铺', category: 'dessert', categoryLabel: 'Dessert', tags: ['food'],
    imageUrl: '/assets/images/dessert.svg', description: '适合手作课后停留的传统糖水小店。',
    address: '荔湾区多宝路附近', district: '荔湾区', location: { latitude: 23.1179, longitude: 113.2498 },
    averageCost: 18, suggestedStayMinutes: 35, openTime: '12:00', closeTime: '22:30', suitableMoods: ['foodie', 'budget', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-liwan-walk', name: '荔枝湾慢行段', category: 'walk', categoryLabel: 'Walk', tags: ['outdoor', 'culture'],
    imageUrl: '/assets/images/outdoor.svg', description: '沿水边和骑楼之间走一小段，节奏舒缓。',
    address: '荔湾区荔枝湾景区', district: '荔湾区', location: { latitude: 23.1241, longitude: 113.2433 },
    averageCost: 0, suggestedStayMinutes: 45, openTime: '07:00', closeTime: '22:00', suitableMoods: ['recharge', 'culture', 'budget'], unsuitableFor: ['no_outdoor', 'avoid_long_walks'], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-haizhu-cafe', name: '江南窗景咖啡', category: 'cafe', categoryLabel: 'Café', tags: ['coffee'],
    imageUrl: '/assets/images/coffee.svg', description: '放映前可以坐一会儿的社区咖啡馆。',
    address: '海珠区江南西路附近', district: '海珠区', location: { latitude: 23.0991, longitude: 113.2768 },
    averageCost: 28, suggestedStayMinutes: 45, openTime: '09:30', closeTime: '22:00', suitableMoods: ['recharge', 'culture', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-haizhu-dinner', name: '同福晚饭', category: 'dinner', categoryLabel: 'Dinner', tags: ['food'],
    imageUrl: '/assets/images/food.svg', description: '适合放映后的一顿简单晚饭，步行和公共交通都顺路。',
    address: '海珠区同福中路附近', district: '海珠区', location: { latitude: 23.0949, longitude: 113.2698 },
    averageCost: 55, suggestedStayMinutes: 70, openTime: '11:30', closeTime: '22:30', suitableMoods: ['foodie', 'culture', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-haizhu-park', name: '湖边短暂停留', category: 'park', categoryLabel: 'Park', tags: ['outdoor'],
    imageUrl: '/assets/images/outdoor.svg', description: '不赶路地坐一会儿，看湖面和傍晚的光。',
    address: '海珠区海珠湖附近', district: '海珠区', location: { latitude: 23.0767, longitude: 113.3245 },
    averageCost: 0, suggestedStayMinutes: 40, openTime: '07:00', closeTime: '20:00', suitableMoods: ['recharge', 'budget'], unsuitableFor: ['no_outdoor'], source: { name: '周末半径演示数据', isMock: true }
  },
  {
    id: 'place-any-shopping', name: '周末生活选物店', category: 'shopping', categoryLabel: 'Shopping', tags: ['shopping', 'art'],
    imageUrl: '/assets/images/market.svg', description: '以文具、家居和广州独立设计为主的小型选物空间。',
    address: '越秀区文明路附近', district: '越秀区', location: { latitude: 23.1254, longitude: 113.2764 },
    averageCost: 35, suggestedStayMinutes: 45, openTime: '11:00', closeTime: '21:00', suitableMoods: ['explore', 'surprise', 'date'], unsuitableFor: [], source: { name: '周末半径演示数据', isMock: true }
  }
];
