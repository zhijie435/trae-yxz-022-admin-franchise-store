const {
  initCityAssignments,
  getCityAssignmentList,
  getCityAssignmentByCity,
  getCityAssignmentStatistics,
  assignCityToPartner,
  updateCityAssignmentFromStore
} = require('../src/cityService');
const { getStoreList } = require('../src/storeService');
const { getAllApplicationsRaw } = require('../src/franchiseService');

describe('城市绑定 (City Assignment)', () => {
  beforeAll(() => {
    const stores = getStoreList({ page: 1, pageSize: 1000 }).list;
    const applications = getAllApplicationsRaw();
    initCityAssignments(stores, applications);
  });

  test('初始化城市绑定列表 - 应包含门店和申请中的城市', () => {
    const result = getCityAssignmentList({ page: 1, pageSize: 100 });
    expect(result.list.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.list[0]).toHaveProperty('province');
    expect(result.list[0]).toHaveProperty('city');
    expect(result.list[0]).toHaveProperty('partnerCount');
    expect(result.list[0]).toHaveProperty('storeCount');
    expect(result.list[0]).toHaveProperty('partners');
    expect(result.list[0]).toHaveProperty('stores');
    expect(result.list[0]).toHaveProperty('status');
  });

  test('获取城市绑定列表 - 按省份筛选', () => {
    const all = getCityAssignmentList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const province = all[0].province;

    const result = getCityAssignmentList({ province, page: 1, pageSize: 100 });
    result.list.forEach(item => {
      expect(item.province).toBe(province);
    });
  });

  test('获取城市绑定列表 - 按状态筛选 assigned', () => {
    const result = getCityAssignmentList({ status: 'assigned', page: 1, pageSize: 100 });
    result.list.forEach(item => {
      expect(item.status).toBe('assigned');
    });
  });

  test('获取城市绑定列表 - 按状态筛选 pending', () => {
    const result = getCityAssignmentList({ status: 'pending', page: 1, pageSize: 100 });
    result.list.forEach(item => {
      expect(item.status).toBe('pending');
    });
  });

  test('获取城市绑定列表 - 按关键词搜索城市名', () => {
    const all = getCityAssignmentList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const cityName = all[0].city.substring(0, 2);

    const result = getCityAssignmentList({ keyword: cityName, page: 1, pageSize: 100 });
    expect(result.list.length).toBeGreaterThan(0);
    result.list.forEach(item => {
      const matchCity = item.city.includes(cityName);
      const matchProvince = item.province.includes(cityName);
      const matchPartner = item.partners.some(p =>
        p.name.includes(cityName) || p.companyName.includes(cityName)
      );
      expect(matchCity || matchProvince || matchPartner).toBe(true);
    });
  });

  test('获取城市绑定列表 - 分页功能', () => {
    const result = getCityAssignmentList({ page: 1, pageSize: 2 });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
    expect(result.list.length).toBeLessThanOrEqual(2);
  });

  test('通过城市名获取城市绑定记录', () => {
    const all = getCityAssignmentList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const city = all[0].city;

    const result = getCityAssignmentByCity(city);
    expect(result).not.toBeNull();
    expect(result.city).toBe(city);
  });

  test('通过城市名获取不存在的城市绑定记录 - 返回 null', () => {
    const result = getCityAssignmentByCity('不存在的城市名');
    expect(result).toBeNull();
  });

  test('分配城市给新合伙人 - 已有城市记录', () => {
    const all = getCityAssignmentList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const existingCity = all[0].city;
    const initialPartnerCount = all[0].partnerCount;

    const newPartner = {
      name: '测试合伙人',
      phone: '13900001111',
      companyName: '测试有限公司'
    };

    const result = assignCityToPartner(existingCity, newPartner);
    expect(result.city).toBe(existingCity);
    expect(result.status).toBe('assigned');
    expect(result.partnerCount).toBe(initialPartnerCount + 1);
    expect(result.partners.some(p => p.name === '测试合伙人')).toBe(true);
    expect(result.assignTime).toBeTruthy();
    expect(result.updateTime).toBeTruthy();
  });

  test('分配城市给新合伙人 - 同一合伙人不重复添加', () => {
    const all = getCityAssignmentList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const existingCity = all[0].city;
    const existingPartner = all[0].partners[0];
    const initialPartnerCount = all[0].partnerCount;

    const result = assignCityToPartner(existingCity, existingPartner);
    expect(result.partnerCount).toBe(initialPartnerCount);
  });

  test('分配城市给新合伙人 - 全新城市记录', () => {
    const newPartner = {
      name: '新城市合伙人',
      phone: '13800002222',
      companyName: '新城市有限公司'
    };

    const result = assignCityToPartner('南京市', newPartner);
    expect(result).toBeDefined();
    expect(result.city).toBe('南京市');
    expect(result.province).toBe('江苏省');
    expect(result.status).toBe('assigned');
    expect(result.partnerCount).toBeGreaterThanOrEqual(1);
    expect(result.storeCount).toBeGreaterThanOrEqual(0);
  });

  test('根据门店信息更新城市绑定 - 已有城市记录', () => {
    const all = getCityAssignmentList({ status: 'assigned', page: 1, pageSize: 100 }).list;
    if (all.length === 0 || all[0].stores.length === 0) return;
    const testStore = all[0].stores[0];
    const initialStoreCount = all[0].storeCount;

    const mockNewStore = {
      id: 'STTEST001',
      storeNo: 'MDTEST001',
      storeName: '测试门店',
      partnerName: '门店测试合伙人',
      partnerPhone: '13700003333',
      companyName: '门店测试公司',
      province: all[0].province,
      city: all[0].city,
      status: 'enabled',
      account: 'test_account_001'
    };

    updateCityAssignmentFromStore(mockNewStore);
    const updated = getCityAssignmentByCity(all[0].city);
    expect(updated.storeCount).toBe(initialStoreCount + 1);
    expect(updated.stores.some(s => s.storeNo === 'MDTEST001')).toBe(true);
    expect(updated.partners.some(p => p.name === '门店测试合伙人')).toBe(true);
  });

  test('根据门店信息更新城市绑定 - 同一门店不重复添加', () => {
    const all = getCityAssignmentList({ status: 'assigned', page: 1, pageSize: 100 }).list;
    if (all.length === 0 || all[0].stores.length === 0) return;
    const existingStore = all[0].stores[0];
    const initialStoreCount = all[0].storeCount;

    const mockStore = {
      id: existingStore.storeId,
      storeNo: existingStore.storeNo,
      storeName: existingStore.storeName,
      partnerName: existingStore.partnerName,
      partnerPhone: '13600004444',
      companyName: '重复门店公司',
      province: all[0].province,
      city: all[0].city,
      status: 'enabled',
      account: existingStore.account
    };

    updateCityAssignmentFromStore(mockStore);
    const updated = getCityAssignmentByCity(all[0].city);
    expect(updated.storeCount).toBe(initialStoreCount);
  });

  test('获取城市绑定统计数据', () => {
    const stats = getCityAssignmentStatistics();
    expect(stats).toHaveProperty('totalCities');
    expect(stats).toHaveProperty('assignedCities');
    expect(stats).toHaveProperty('pendingCities');
    expect(stats).toHaveProperty('totalPartners');
    expect(stats).toHaveProperty('totalStores');
    expect(stats).toHaveProperty('assignedProvinces');
    expect(stats).toHaveProperty('unassignedProvinces');
    expect(typeof stats.totalCities).toBe('number');
    expect(stats.assignedCities + stats.pendingCities).toBe(stats.totalCities);
    expect(Array.isArray(stats.assignedProvinces)).toBe(true);
    expect(Array.isArray(stats.unassignedProvinces)).toBe(true);
  });
});
