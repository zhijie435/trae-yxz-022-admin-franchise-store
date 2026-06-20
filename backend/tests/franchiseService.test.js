const {
  auditApplication,
  getApplicationById,
  getApplicationList,
  advanceStage,
  updateStageData,
  getStatistics,
  getStageStatistics
} = require('../src/franchiseService');
const { APPLICATION_STATUS } = require('../src/constants');

describe('资质审核 (auditApplication)', () => {
  test('成功通过审核 - 状态更新为 approved，阶段推进到资质审核', () => {
    const pendingApp = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list[0];
    expect(pendingApp).toBeDefined();

    const result = auditApplication(pendingApp.id, {
      status: APPLICATION_STATUS.APPROVED,
      auditOpinion: '资质达标，同意加盟',
      auditor: '张总'
    });

    expect(result.status).toBe(APPLICATION_STATUS.APPROVED);
    expect(result.statusText).toBe('已通过');
    expect(result.onboardingStage).toBe(2);
    expect(result.stageStatus).toBe('pending');
    expect(result.auditor).toBe('张总');
    expect(result.auditOpinion).toBe('资质达标，同意加盟');
    expect(result.auditTime).toBeTruthy();
    expect(result.stageData.qualification.result).toBe('passed');
    expect(result.stageData.qualification.reviewer).toBe('张总');
  });

  test('成功驳回审核 - 状态更新为 rejected', () => {
    const list = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    const pendingApp = list[list.length - 1];
    expect(pendingApp).toBeDefined();

    const result = auditApplication(pendingApp.id, {
      status: APPLICATION_STATUS.REJECTED,
      auditOpinion: '注册资金不足，团队规模不达标',
      auditor: '李经理'
    });

    expect(result.status).toBe(APPLICATION_STATUS.REJECTED);
    expect(result.statusText).toBe('已驳回');
    expect(result.stageStatus).toBe('rejected');
    expect(result.auditor).toBe('李经理');
    expect(result.auditOpinion).toBe('注册资金不足，团队规模不达标');
    expect(result.stageData.qualification.result).toBe('rejected');
  });

  test('驳回时必须填写驳回原因 - 抛出异常', () => {
    let pendingApps = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    let pendingApp;
    if (pendingApps.length === 0) {
      pendingApp = getApplicationList().list.find(a => a.onboardingStage === 1 || a.status === APPLICATION_STATUS.PENDING);
      if (pendingApp) {
        const raw = require('../src/franchiseService').getApplicationRaw(pendingApp.id);
        if (raw) {
          raw.status = APPLICATION_STATUS.PENDING;
          raw.auditOpinion = '';
          raw.auditor = '';
          raw.auditTime = '';
        }
      }
    }
    pendingApps = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    pendingApp = pendingApps[0];
    if (!pendingApp) return;

    expect(() => {
      auditApplication(pendingApp.id, {
        status: APPLICATION_STATUS.REJECTED,
        auditOpinion: '',
        auditor: '李经理'
      });
    }).toThrow('驳回原因不能为空');
  });

  test('驳回时空白原因 - 抛出异常', () => {
    let pendingApps = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    let pendingApp;
    if (pendingApps.length === 0) {
      pendingApp = getApplicationList().list.find(a => a.onboardingStage === 1);
      if (pendingApp) {
        const raw = require('../src/franchiseService').getApplicationRaw(pendingApp.id);
        if (raw) {
          raw.status = APPLICATION_STATUS.PENDING;
          raw.auditOpinion = '';
          raw.auditor = '';
          raw.auditTime = '';
        }
      }
    }
    pendingApps = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    pendingApp = pendingApps[0];
    if (!pendingApp) return;

    expect(() => {
      auditApplication(pendingApp.id, {
        status: APPLICATION_STATUS.REJECTED,
        auditOpinion: '   ',
        auditor: '李经理'
      });
    }).toThrow('驳回原因不能为空');
  });

  test('重复审核已审核申请 - 抛出异常', () => {
    const approvedApp = getApplicationList({ status: APPLICATION_STATUS.APPROVED }).list[0];
    expect(approvedApp).toBeDefined();

    expect(() => {
      auditApplication(approvedApp.id, {
        status: APPLICATION_STATUS.APPROVED,
        auditOpinion: '再次审核',
        auditor: '张总'
      });
    }).toThrow('该申请已审核，不可重复操作');
  });

  test('审核不存在的申请 - 抛出异常', () => {
    expect(() => {
      auditApplication('NONEXISTENT_ID', {
        status: APPLICATION_STATUS.APPROVED,
        auditOpinion: 'test',
        auditor: 'test'
      });
    }).toThrow('申请记录不存在');
  });

  test('通过审核时 auditor 为空 - 使用默认值系统管理员', () => {
    const list = getApplicationList({ status: APPLICATION_STATUS.PENDING }).list;
    if (list.length === 0) return;
    const pendingApp = list[0];

    const result = auditApplication(pendingApp.id, {
      status: APPLICATION_STATUS.APPROVED,
      auditOpinion: '默认审核员测试'
    });

    expect(result.auditor).toBe('系统管理员');
  });
});

describe('上线流程 (advanceStage & updateStageData)', () => {
  test('推进阶段 - 从合同签约(3)推进到加盟培训(4)', () => {
    const stage3Apps = getApplicationList({ stage: 3 }).list;
    expect(stage3Apps.length).toBeGreaterThan(0);
    const app = stage3Apps[0];

    const result = advanceStage(app.id, {
      trainer: '李培训师',
      trainingStartDate: '2026-06-20'
    });

    expect(result.onboardingStage).toBe(4);
    expect(result.stageStatus).toBe('in_progress');
    expect(result.stageData.training.trainer).toBe('李培训师');
    expect(result.stageData.training.trainingStartDate).toBe('2026-06-20');
    expect(result.stageData.training.result).toBe('passed');
  });

  test('推进阶段 - 从加盟培训(4)推进到账号开通(5)', () => {
    const stage4Apps = getApplicationList({ stage: 4 }).list;
    expect(stage4Apps.length).toBeGreaterThan(0);
    const app = stage4Apps[0];

    const result = advanceStage(app.id, {
      account: 'test_account_001',
      storeNo: 'MD2026TEST001',
      storeName: '测试门店'
    });

    expect(result.onboardingStage).toBe(5);
    expect(result.stageStatus).toBe('in_progress');
    expect(result.stageData.account.account).toBe('test_account_001');
    expect(result.stageData.account.storeNo).toBe('MD2026TEST001');
    expect(result.stageData.account.storeName).toBe('测试门店');
    expect(result.stageData.account.operator).toBe('系统管理员');
  });

  test('推进阶段 - 从账号开通(5)推进到上线运营(6)，触发自动创建', () => {
    const stage5Apps = getApplicationList({ stage: 5 }).list;
    expect(stage5Apps.length).toBeGreaterThan(0);
    const app = stage5Apps[0];

    const result = advanceStage(app.id);

    expect(result.onboardingStage).toBe(6);
    expect(result.stageStatus).toBe('completed');
    expect(result._triggerStoreCreate).toBe(true);
    expect(result._triggerContractCreate).toBe(true);
    expect(result._triggerDepositCreate).toBe(true);
    expect(result._triggerCityAssign).toBe(true);
  });

  test('已驳回申请无法推进阶段 - 抛出异常', () => {
    const rejectedApps = getApplicationList({ status: APPLICATION_STATUS.REJECTED }).list;
    expect(rejectedApps.length).toBeGreaterThan(0);
    const app = rejectedApps[0];

    expect(() => {
      advanceStage(app.id);
    }).toThrow('已驳回的申请无法推进阶段');
  });

  test('已完成全部阶段后无法继续推进 - 抛出异常', () => {
    const stage6Apps = getApplicationList({ stage: 6 }).list;
    expect(stage6Apps.length).toBeGreaterThan(0);
    const app = stage6Apps[0];

    expect(() => {
      advanceStage(app.id);
    }).toThrow('已完成全部准入阶段');
  });

  test('推进不存在的申请 - 抛出异常', () => {
    expect(() => {
      advanceStage('NONEXISTENT');
    }).toThrow('申请记录不存在');
  });

  test('更新阶段数据 - 更新合同阶段数据', () => {
    const approvedApps = getApplicationList({ status: APPLICATION_STATUS.APPROVED }).list;
    expect(approvedApps.length).toBeGreaterThan(0);
    const app = approvedApps[0];

    const result = updateStageData(app.id, 3, {
      contractNo: 'HTTEST001',
      depositAmount: 150000,
      serviceFeeRate: 4
    });

    expect(result.stageData.contract.contractNo).toBe('HTTEST001');
    expect(result.stageData.contract.depositAmount).toBe(150000);
    expect(result.stageData.contract.serviceFeeRate).toBe(4);
  });

  test('更新阶段数据 - 无效阶段抛出异常', () => {
    const approvedApps = getApplicationList({ status: APPLICATION_STATUS.APPROVED }).list;
    expect(approvedApps.length).toBeGreaterThan(0);
    const app = approvedApps[0];

    expect(() => {
      updateStageData(app.id, 99, {});
    }).toThrow('无效的阶段');
  });

  test('更新阶段数据 - 申请不存在抛出异常', () => {
    expect(() => {
      updateStageData('NONEXISTENT', 3, {});
    }).toThrow('申请记录不存在');
  });
});

describe('统计数据 (getStatistics & getStageStatistics)', () => {
  test('获取整体统计数据', () => {
    const stats = getStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('approved');
    expect(stats).toHaveProperty('rejected');
    expect(stats).toHaveProperty('stageStats');
    expect(typeof stats.total).toBe('number');
    expect(stats.total).toBeGreaterThan(0);
  });

  test('获取阶段统计数据', () => {
    const stageStats = getStageStatistics();
    expect(stageStats).toHaveProperty('1');
    expect(stageStats).toHaveProperty('2');
    expect(stageStats).toHaveProperty('3');
    expect(stageStats).toHaveProperty('4');
    expect(stageStats).toHaveProperty('5');
    expect(stageStats).toHaveProperty('6');
    expect(stageStats).toHaveProperty('rejected');
    expect(stageStats).toHaveProperty('total');
    expect(stageStats).toHaveProperty('completed');
    expect(stageStats).toHaveProperty('inProgress');
  });
});
