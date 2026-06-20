const {
  getContractList,
  getContractById,
  getContractByNo,
  createContract,
  createContractFromApplication,
  updateContract,
  updateContractStatus,
  removeContract,
  getContractStatistics,
  getContractsByStoreNo
} = require('../src/contractService');
const {
  getStoreList
} = require('../src/storeService');

describe('合同管理 (Contract Management)', () => {
  test('创建合同 - 必填项完整创建成功', () => {
    const result = createContract({
      partnerName: '测试合同合伙人',
      partnerPhone: '13900001111',
      companyName: '测试合同公司',
      storeName: '测试合同门店',
      storeNo: '',
      levelName: '标准加盟商',
      startDate: '2026-07-01',
      endDate: '2028-06-30',
      depositAmount: 50000,
      serviceFeeRate: 5,
      remark: '测试创建合同'
    });

    expect(result).toBeDefined();
    expect(result.contractNo).toBeTruthy();
    expect(result.partnerName).toBe('测试合同合伙人');
    expect(result.status).toBe('pending');
    expect(result.statusText).toBe('待签约');
    expect(result.depositAmount).toBe(50000);
  });

  test('创建合同 - 必填项缺失抛出异常', () => {
    expect(() => {
      createContract({
        partnerName: '测试',
        storeName: '测试门店'
      });
    }).toThrow('必填项不能为空');
  });

  test('获取合同列表 - 分页功能', () => {
    const result = getContractList({ page: 1, pageSize: 3 });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
    expect(result.list.length).toBeLessThanOrEqual(3);
  });

  test('获取合同列表 - 按状态筛选', () => {
    const result = getContractList({ status: 'active', page: 1, pageSize: 100 });
    result.list.forEach(c => {
      expect(c.status).toBe('active');
    });
  });

  test('获取合同列表 - 按关键词搜索', () => {
    const all = getContractList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const keyword = all[0].partnerName.substring(0, 2);

    const result = getContractList({ keyword, page: 1, pageSize: 100 });
    expect(result.list.length).toBeGreaterThan(0);
  });

  test('通过ID获取合同', () => {
    const all = getContractList({ page: 1, pageSize: 100 }).list;
    expect(all.length).toBeGreaterThan(0);
    const contract = all[0];

    const result = getContractById(contract.id);
    expect(result).not.toBeNull();
    expect(result.id).toBe(contract.id);
  });

  test('通过ID获取不存在的合同 - 返回 null', () => {
    const result = getContractById('NONEXISTENT');
    expect(result).toBeNull();
  });

  test('通过合同编号获取合同', () => {
    const all = getContractList({ page: 1, pageSize: 100 }).list;
    expect(all.length).toBeGreaterThan(0);
    const contract = all[0];

    const result = getContractByNo(contract.contractNo);
    expect(result).not.toBeNull();
    expect(result.contractNo).toBe(contract.contractNo);
  });

  test('更新合同状态 - 从 pending 到 active，触发保证金创建标记', () => {
    const pendingContracts = getContractList({ status: 'pending' }).list;
    if (pendingContracts.length === 0) {
      const newContract = createContract({
        partnerName: '状态测试',
        storeName: '状态测试门店',
        startDate: '2026-07-01',
        endDate: '2028-06-30',
        depositAmount: 50000
      });
      pendingContracts.push(newContract);
    }
    const contract = pendingContracts[0];

    const result = updateContractStatus(contract.id, 'active');
    expect(result.status).toBe('active');
    expect(result.statusText).toBe('生效中');
    expect(result.signDate).toBeTruthy();
    expect(result._triggerDepositCreate).toBe(true);
  });

  test('更新合同状态 - 从 active 到 expired', () => {
    const activeContracts = getContractList({ status: 'active' }).list;
    expect(activeContracts.length).toBeGreaterThan(0);
    const contract = activeContracts[0];

    const result = updateContractStatus(contract.id, 'expired');
    expect(result.status).toBe('expired');
    expect(result.statusText).toBe('已到期');
  });

  test('更新合同状态 - 从 active 到 terminated', () => {
    const activeContracts = getContractList({ status: 'active' }).list;
    if (activeContracts.length === 0) return;
    const contract = activeContracts[0];

    const result = updateContractStatus(contract.id, 'terminated');
    expect(result.status).toBe('terminated');
    expect(result.statusText).toBe('已终止');
  });

  test('更新合同状态 - 无效状态抛出异常', () => {
    const all = getContractList().list;
    expect(all.length).toBeGreaterThan(0);
    const contract = all[0];

    expect(() => {
      updateContractStatus(contract.id, 'invalid_status');
    }).toThrow('状态参数错误');
  });

  test('更新合同状态 - 不存在的合同抛出异常', () => {
    expect(() => {
      updateContractStatus('NONEXISTENT', 'active');
    }).toThrow('合同不存在');
  });

  test('更新合同信息', () => {
    const all = getContractList().list;
    expect(all.length).toBeGreaterThan(0);
    const contract = all[0];

    const result = updateContract(contract.id, {
      remark: '更新备注信息',
      serviceFeeRate: 6
    });
    expect(result.remark).toBe('更新备注信息');
    expect(result.serviceFeeRate).toBe(6);
  });

  test('删除合同 - 成功', () => {
    const newContract = createContract({
      partnerName: '待删除',
      storeName: '待删除门店',
      startDate: '2026-07-01',
      endDate: '2028-06-30'
    });
    const result = removeContract(newContract.id);
    expect(result).toBe(true);
    expect(getContractById(newContract.id)).toBeNull();
  });

  test('删除不存在的合同 - 抛出异常', () => {
    expect(() => {
      removeContract('NONEXISTENT');
    }).toThrow('合同不存在');
  });

  test('通过门店编号获取合同列表', () => {
    const stores = getStoreList().list;
    if (stores.length === 0) return;
    const storeNo = stores[0].storeNo;

    const result = getContractsByStoreNo(storeNo);
    expect(Array.isArray(result)).toBe(true);
    result.forEach(c => {
      expect(c.storeNo).toBe(storeNo);
    });
  });

  test('获取合同统计数据', () => {
    const stats = getContractStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('expired');
    expect(stats).toHaveProperty('terminated');
    expect(stats.pending + stats.active + stats.expired + stats.terminated).toBe(stats.total);
  });

  test('根据申请数据创建合同', () => {
    const appData = {
      id: '999',
      applyNo: 'SQTEST001',
      legalPerson: '申请创建人',
      phone: '13500008888',
      companyName: '申请公司',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      stageData: {
        contract: {
          contractType: '金牌加盟商',
          startDate: '2026-07-01',
          endDate: '2029-06-30',
          depositAmount: 200000,
          serviceFeeRate: 3
        },
        account: {
          storeName: '申请创建门店'
        }
      }
    };

    const result = createContractFromApplication(appData);
    expect(result).toBeDefined();
    expect(result.partnerName).toBe('申请创建人');
    expect(result.levelName).toBe('金牌加盟商');
    expect(result.depositAmount).toBe(200000);
    expect(result.applicationId).toBe('999');
  });
});
