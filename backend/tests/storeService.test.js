const {
  getStoreList,
  getStoreById,
  getStoreByNo,
  createStore,
  updateStoreStatus,
  updateStore,
  removeStore,
  resetPassword,
  getStoreStatistics,
  getStoresByCity
} = require('../src/storeService');

describe('账号禁用 (Store Account Status Management)', () => {
  test('禁用门店账号 - 状态从 enabled 变为 disabled', () => {
    const enabledStores = getStoreList({ status: 'enabled' }).list;
    expect(enabledStores.length).toBeGreaterThan(0);
    const store = enabledStores[0];

    const result = updateStoreStatus(store.id, 'disabled');
    expect(result.status).toBe('disabled');
    expect(result.statusText).toBe('已禁用');
  });

  test('启用门店账号 - 状态从 disabled 变为 enabled', () => {
    const disabledStores = getStoreList({ status: 'disabled' }).list;
    if (disabledStores.length === 0) {
      const enabledStores = getStoreList({ status: 'enabled' }).list;
      if (enabledStores.length === 0) return;
      updateStoreStatus(enabledStores[0].id, 'disabled');
    }
    const nowDisabled = getStoreList({ status: 'disabled' }).list;
    expect(nowDisabled.length).toBeGreaterThan(0);
    const store = nowDisabled[0];

    const result = updateStoreStatus(store.id, 'enabled');
    expect(result.status).toBe('enabled');
    expect(result.statusText).toBe('已启用');
  });

  test('更新门店状态 - 无效状态参数抛出异常', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const store = stores[0];

    expect(() => {
      updateStoreStatus(store.id, 'invalid_status');
    }).toThrow('状态参数错误');
  });

  test('更新不存在门店状态 - 门店不存在抛出异常', () => {
    expect(() => {
      updateStoreStatus('NONEXISTENT_ID', 'disabled');
    }).toThrow('门店不存在');
  });

  test('禁用门店后 - 无法为禁用门店创建合同', () => {
    const enabledStores = getStoreList({ status: 'enabled' }).list;
    expect(enabledStores.length).toBeGreaterThan(0);
    const store = enabledStores[0];
    updateStoreStatus(store.id, 'disabled');

    const { createContract } = require('../src/contractService');
    expect(() => {
      createContract({
      partnerName: '测试',
      storeName: '测试门店',
      storeNo: store.storeNo,
      startDate: '2026-07-01',
      endDate: '2028-06-30'
      });
    }).toThrow('门店已被禁用，无法为其创建合同');
  });

  test('禁用门店后 - 无法为禁用门店创建保证金记录', () => {
    const disabledStores = getStoreList({ status: 'disabled' }).list;
    if (disabledStores.length === 0) return;
    const store = disabledStores[0];

    const { createDeposit } = require('../src/depositService');
    expect(() => {
      createDeposit({
        contractNo: 'HTTESTDISABLED',
        partnerName: '测试',
        storeName: store.storeName,
        storeNo: store.storeNo,
        amount: 50000
      });
    }).toThrow('门店已被禁用，无法为其创建保证金记录');
  });

  test('按状态筛选门店列表 - 只返回已启用门店', () => {
    const result = getStoreList({ status: 'enabled', page: 1, pageSize: 100 });
    result.list.forEach(store => {
      expect(store.status).toBe('enabled');
    });
  });

  test('按状态筛选门店列表 - 只返回已禁用门店', () => {
    const result = getStoreList({ status: 'disabled', page: 1, pageSize: 100 });
    result.list.forEach(store => {
      expect(store.status).toBe('disabled');
    });
  });
});

describe('门店管理其他功能 (Store Management)', () => {
  test('创建门店 - 必填项完整创建成功', () => {
    const storeData = {
      storeName: '测试创建门店',
      partnerName: '测试合伙人',
      partnerPhone: '13912345678',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      address: '天河路100号',
      account: 'test_unique_account_' + Date.now()
    };

    const result = createStore(storeData);
    expect(result).toBeDefined();
    expect(result.storeName).toBe('测试创建门店');
    expect(result.status).toBe('enabled');
    expect(result.statusText).toBe('已启用');
    expect(result.storeNo).toBeTruthy();
    expect(result.account).toBe(storeData.account);
  });

  test('创建门店 - 必填项缺失抛出异常', () => {
    expect(() => {
      createStore({
        storeName: '测试门店',
        partnerName: '测试'
      });
    }).toThrow('必填项不能为空');
  });

  test('创建门店 - 账号重复抛出异常', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const existingAccount = stores[0].account;

    expect(() => {
      createStore({
        storeName: '重复账号门店',
        partnerName: '测试',
        partnerPhone: '13800009999',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '测试地址',
        account: existingAccount
      });
    }).toThrow('账号已存在，请更换账号');
  });

  test('更新门店信息 - 允许字段更新', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const store = stores[0];

    const result = updateStore(store.id, {
      storeName: '更新后的门店名',
      remark: '测试更新备注'
    });
    expect(result.storeName).toBe('更新后的门店名');
    expect(result.remark).toBe('测试更新备注');
  });

  test('更新门店 - 更新账号为已存在账号抛出异常', () => {
    const stores = getStoreList().list;
    if (stores.length < 2) return;
    const store1 = stores[0];
    const store2 = stores[1];

    expect(() => {
      updateStore(store1.id, {
        account: store2.account
      });
    }).toThrow('账号已存在');
  });

  test('通过门店编号获取门店', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const store = stores[0];

    const result = getStoreByNo(store.storeNo);
    expect(result).not.toBeNull();
    expect(result.storeNo).toBe(store.storeNo);
  });

  test('通过ID获取不存在门店', () => {
    const result = getStoreById('NONEXISTENT');
    expect(result).toBeNull();
  });

  test('通过城市获取门店列表', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const city = stores[0].city;

    const result = getStoresByCity(city);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(s => {
      expect(s.city).toBe(city);
    });
  });

  test('重置门店密码 - 成功', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const store = stores[0];

    const result = resetPassword(store.id, 'newpassword123');
    expect(result.success).toBe(true);
    expect(result.account).toBe(store.account);
    expect(result.passwordUpdateTime).toBeTruthy();
  });

  test('重置门店密码 - 密码长度不足抛出异常', () => {
    const stores = getStoreList().list;
    expect(stores.length).toBeGreaterThan(0);
    const store = stores[0];

    expect(() => {
      resetPassword(store.id, '123');
    }).toThrow('密码长度不能少于6位');
  });

  test('删除门店 - 成功', () => {
    const storeData = {
      storeName: '待删除门店',
      partnerName: '待删除',
      partnerPhone: '13700008888',
      province: '天津市',
      city: '天津市',
      district: '和平区',
      address: '测试删除地址',
      account: 'to_delete_' + Date.now()
    };
    const newStore = createStore(storeData);
    const result = removeStore(newStore.id);
    expect(result).toBe(true);
    expect(getStoreById(newStore.id)).toBeNull();
  });

  test('删除不存在门店 - 抛出异常', () => {
    expect(() => {
      removeStore('NONEXISTENT_ID');
    }).toThrow('门店不存在');
  });

  test('获取门店统计数据', () => {
    const stats = getStoreStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('enabled');
    expect(stats).toHaveProperty('disabled');
    expect(stats).toHaveProperty('cities');
    expect(stats.enabled + stats.disabled).toBe(stats.total);
  });
});
