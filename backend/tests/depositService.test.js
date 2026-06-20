const {
  getDepositList,
  getDepositById,
  createDeposit,
  createDepositFromContract,
  createDepositFromApplication,
  payDeposit,
  refundDeposit,
  getDepositStatistics,
  getDepositsByContractNo
} = require('../src/depositService');
const {
  createContract,
  getContractList
} = require('../src/contractService');

describe('合同保证金 (Deposit Management)', () => {
  test('创建保证金记录 - 必填项完整创建成功', () => {
    const result = createDeposit({
      contractNo: 'HTTEST' + Date.now(),
      partnerName: '测试保证金合伙人',
      storeName: '测试保证金门店',
      storeNo: '',
      levelName: '标准加盟商',
      amount: 50000,
      paymentMethod: 'bank_transfer',
      paymentDate: '2026-06-20',
      remark: '测试创建保证金'
    });

    expect(result).toBeDefined();
    expect(result.depositNo).toBeTruthy();
    expect(result.amount).toBe(50000);
    expect(result.paidAmount).toBe(0);
    expect(result.status).toBe('unpaid');
    expect(result.statusText).toBe('未缴纳');
    expect(result.paymentMethodText).toBe('银行转账');
  });

  test('创建保证金记录 - 必填项缺失抛出异常', () => {
    expect(() => {
      createDeposit({
        contractNo: 'HTTEST_MISSING'
      });
    }).toThrow('必填项不能为空');
  });

  test('缴纳保证金 - 部分缴纳，状态变为 partial', () => {
    const unpaidDeposits = getDepositList({ status: 'unpaid' }).list;
    if (unpaidDeposits.length === 0) return;
    const deposit = unpaidDeposits[0];

    const partialAmount = Math.floor(deposit.amount / 2);
    const result = payDeposit(deposit.id, {
      paidAmount: partialAmount,
      paymentMethod: 'online',
      paymentDate: '2026-06-20'
    });

    expect(result.paidAmount).toBe(partialAmount);
    expect(result.status).toBe('partial');
    expect(result.statusText).toBe('部分缴纳');
    expect(result.paymentMethod).toBe('online');
    expect(result.paymentMethodText).toBe('在线支付');
  });

  test('缴纳保证金 - 全额缴纳，状态变为 paid', () => {
    let unpaidDeposits = getDepositList({ status: 'unpaid' }).list;
    if (unpaidDeposits.length === 0) {
      const newDeposit = createDeposit({
        contractNo: 'HTFULLPAY' + Date.now(),
        partnerName: '全额缴纳测试',
        storeName: '全额缴纳门店',
        amount: 100000
      });
      unpaidDeposits = [newDeposit];
    }
    const deposit = unpaidDeposits[0];

    const result = payDeposit(deposit.id, {
      paidAmount: deposit.amount,
      paymentMethod: 'bank_transfer',
      paymentDate: '2026-06-20'
    });

    expect(result.paidAmount).toBe(deposit.amount);
    expect(result.status).toBe('paid');
    expect(result.statusText).toBe('已缴纳');
  });

  test('缴纳保证金 - 缴纳金额为0抛出异常', () => {
    const all = getDepositList().list;
    expect(all.length).toBeGreaterThan(0);
    const deposit = all[0];

    expect(() => {
      payDeposit(deposit.id, { paidAmount: 0 });
    }).toThrow('缴纳金额必须大于0');
  });

  test('缴纳保证金 - 缴纳金额为负数抛出异常', () => {
    const all = getDepositList().list;
    expect(all.length).toBeGreaterThan(0);
    const deposit = all[0];

    expect(() => {
      payDeposit(deposit.id, { paidAmount: -1000 });
    }).toThrow('缴纳金额必须大于0');
  });

  test('缴纳保证金 - 超额缴纳按全额处理', () => {
    const newDeposit = createDeposit({
      contractNo: 'HTOVERPAY' + Date.now(),
      partnerName: '超额缴纳测试',
      storeName: '超额缴纳门店',
      amount: 50000
    });

    const result = payDeposit(newDeposit.id, {
      paidAmount: 100000,
      paymentMethod: 'bank_transfer'
    });

    expect(result.paidAmount).toBe(50000);
    expect(result.status).toBe('paid');
  });

  test('缴纳不存在的保证金 - 抛出异常', () => {
    expect(() => {
      payDeposit('NONEXISTENT', { paidAmount: 10000 });
    }).toThrow('保证金记录不存在');
  });

  test('退还保证金 - 已缴纳保证金退还成功', () => {
    let paidDeposits = getDepositList({ status: 'paid' }).list;
    if (paidDeposits.length === 0) {
      const newDeposit = createDeposit({
        contractNo: 'HTREFUND' + Date.now(),
        partnerName: '退还测试',
        storeName: '退还测试门店',
        amount: 50000
      });
      payDeposit(newDeposit.id, { paidAmount: 50000, paymentMethod: 'bank_transfer' });
      paidDeposits = getDepositList({ status: 'paid' }).list;
    }
    const deposit = paidDeposits[0];

    const result = refundDeposit(deposit.id, {
      refundAmount: deposit.paidAmount,
      refundDate: '2026-06-20'
    });

    expect(result.status).toBe('refunded');
    expect(result.statusText).toBe('已退还');
    expect(result.refundAmount).toBe(deposit.paidAmount);
    expect(result.refundDate).toBe('2026-06-20');
  });

  test('退还保证金 - 未缴纳状态抛出异常', () => {
    const unpaidDeposits = getDepositList({ status: 'unpaid' }).list;
    if (unpaidDeposits.length === 0) return;
    const deposit = unpaidDeposits[0];

    expect(() => {
      refundDeposit(deposit.id, { refundAmount: 10000 });
    }).toThrow('只有已缴纳的保证金才能退还');
  });

  test('退还保证金 - 部分缴纳状态抛出异常', () => {
    const partialDeposits = getDepositList({ status: 'partial' }).list;
    if (partialDeposits.length === 0) {
      const newDeposit = createDeposit({
        contractNo: 'HTPARTIALREFUND' + Date.now(),
        partnerName: '部分退还测试',
        storeName: '部分退还门店',
        amount: 100000
      });
      payDeposit(newDeposit.id, { paidAmount: 30000, paymentMethod: 'bank_transfer' });
    }
    const updatedPartial = getDepositList({ status: 'partial' }).list;
    if (updatedPartial.length === 0) return;
    const deposit = updatedPartial[0];

    expect(() => {
      refundDeposit(deposit.id, { refundAmount: 30000 });
    }).toThrow('只有已缴纳的保证金才能退还');
  });

  test('退还不存在的保证金 - 抛出异常', () => {
    expect(() => {
      refundDeposit('NONEXISTENT', { refundAmount: 10000 });
    }).toThrow('保证金记录不存在');
  });

  test('获取保证金列表 - 分页功能', () => {
    const result = getDepositList({ page: 1, pageSize: 2 });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
    expect(result.list.length).toBeLessThanOrEqual(2);
  });

  test('获取保证金列表 - 按状态筛选 unpaid', () => {
    const result = getDepositList({ status: 'unpaid', page: 1, pageSize: 100 });
    result.list.forEach(d => {
      expect(d.status).toBe('unpaid');
    });
  });

  test('获取保证金列表 - 按状态筛选 paid', () => {
    const result = getDepositList({ status: 'paid', page: 1, pageSize: 100 });
    result.list.forEach(d => {
      expect(d.status).toBe('paid');
    });
  });

  test('获取保证金列表 - 按关键词搜索', () => {
    const all = getDepositList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const keyword = all[0].partnerName.substring(0, 2);

    const result = getDepositList({ keyword, page: 1, pageSize: 100 });
    expect(result.list.length).toBeGreaterThan(0);
  });

  test('通过ID获取保证金', () => {
    const all = getDepositList({ page: 1, pageSize: 100 }).list;
    expect(all.length).toBeGreaterThan(0);
    const deposit = all[0];

    const result = getDepositById(deposit.id);
    expect(result).not.toBeNull();
    expect(result.id).toBe(deposit.id);
  });

  test('通过ID获取不存在的保证金 - 返回 null', () => {
    const result = getDepositById('NONEXISTENT');
    expect(result).toBeNull();
  });

  test('通过合同编号获取保证金列表', () => {
    const all = getDepositList({ page: 1, pageSize: 100 }).list;
    if (all.length === 0) return;
    const contractNo = all[0].contractNo;

    const result = getDepositsByContractNo(contractNo);
    expect(Array.isArray(result)).toBe(true);
    result.forEach(d => {
      expect(d.contractNo).toBe(contractNo);
    });
  });

  test('获取保证金统计数据', () => {
    const stats = getDepositStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('unpaid');
    expect(stats).toHaveProperty('partial');
    expect(stats).toHaveProperty('paid');
    expect(stats).toHaveProperty('refunded');
    expect(stats).toHaveProperty('totalAmount');
    expect(stats).toHaveProperty('totalPaid');
    expect(typeof stats.totalAmount).toBe('number');
    expect(typeof stats.totalPaid).toBe('number');
  });

  test('从合同创建保证金记录', () => {
    const contract = createContract({
      partnerName: '合同创建保证金',
      storeName: '合同创建保证金门店',
      startDate: '2026-07-01',
      endDate: '2028-06-30',
      depositAmount: 80000
    });

    const result = createDepositFromContract(contract);
    expect(result).not.toBeNull();
    expect(result.contractNo).toBe(contract.contractNo);
    expect(result.partnerName).toBe(contract.partnerName);
    expect(result.storeName).toBe(contract.storeName);
    expect(result.amount).toBe(80000);
    expect(result.status).toBe('unpaid');
  });

  test('从合同创建保证金 - 保证金金额为0返回null', () => {
    const contract = createContract({
      partnerName: '零保证金合同',
      storeName: '零保证金门店',
      startDate: '2026-07-01',
      endDate: '2028-06-30',
      depositAmount: 0
    });

    const result = createDepositFromContract(contract);
    expect(result).toBeNull();
  });

  test('从合同创建保证金 - 已存在不重复创建', () => {
    const contract = createContract({
      partnerName: '重复保证金测试',
      storeName: '重复保证金门店',
      startDate: '2026-07-01',
      endDate: '2028-06-30',
      depositAmount: 60000
    });

    const first = createDepositFromContract(contract);
    const second = createDepositFromContract(contract);
    expect(first.id).toBe(second.id);
  });

  test('从申请数据创建保证金', () => {
    const appData = {
      id: 'APPDEP001',
      applyNo: 'SQDEP001',
      legalPerson: '申请保证金创建人',
      phone: '13600007777',
      city: '上海市',
      stageData: {
        contract: {
          contractNo: 'HTAPPDEP001',
          depositAmount: 150000,
          contractType: '金牌加盟商'
        },
        account: {
          storeName: '申请保证金门店',
          storeNo: 'MDAPPDEP001'
        }
      }
    };

    const result = createDepositFromApplication(appData);
    expect(result).not.toBeNull();
    expect(result.contractNo).toBe('HTAPPDEP001');
    expect(result.partnerName).toBe('申请保证金创建人');
    expect(result.storeName).toBe('申请保证金门店');
    expect(result.amount).toBe(150000);
    expect(result.levelName).toBe('金牌加盟商');
    expect(result.applicationId).toBe('APPDEP001');
  });

  test('从申请数据创建保证金 - 无保证金金额返回null', () => {
    const appData = {
      id: 'APPDEP002',
      applyNo: 'SQDEP002',
      legalPerson: '无保证金申请人',
      city: '北京市',
      stageData: {
        contract: {},
        account: {}
      }
    };

    const result = createDepositFromApplication(appData);
    expect(result).toBeNull();
  });
});
