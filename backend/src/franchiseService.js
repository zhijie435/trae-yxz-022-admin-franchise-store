const { mockApplications } = require('./mockData');
const { APPLICATION_STATUS, STATUS_MAP, STAGE_INFO, ONBOARDING_STAGES } = require('./constants');
const { formatNow } = require('./utils');

let applications = JSON.parse(JSON.stringify(mockApplications));

const formatApplication = (app) => {
  const statusInfo = STATUS_MAP[app.status] || { label: '未知', type: 'info' };
  const stageInfo = STAGE_INFO[app.onboardingStage] || { name: '未知', type: 'info' };
  return {
    ...app,
    statusText: statusInfo.label,
    statusType: statusInfo.type,
    stageName: stageInfo.name,
    stageCode: stageInfo.code,
    stageColor: stageInfo.color,
    stageType: stageInfo.type
  };
};

const getApplicationList = (filters = {}) => {
  let result = [...applications];

  if (filters.status) {
    result = result.filter(app => app.status === filters.status);
  }

  if (filters.stage) {
    result = result.filter(app => String(app.onboardingStage) === String(filters.stage));
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    result = result.filter(app =>
      app.applyNo.toLowerCase().includes(keyword) ||
      app.companyName.toLowerCase().includes(keyword) ||
      app.legalPerson.toLowerCase().includes(keyword) ||
      app.phone.includes(keyword)
    );
  }

  if (filters.province) {
    result = result.filter(app => app.province === filters.province);
  }

  if (filters.city) {
    result = result.filter(app => app.city === filters.city);
  }

  result.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime));

  const total = result.length;
  let list = result;

  if (filters.page && filters.pageSize) {
    const start = (Number(filters.page) - 1) * Number(filters.pageSize);
    const end = start + Number(filters.pageSize);
    list = result.slice(start, end);
  }

  return {
    list: list.map(formatApplication),
    total,
    page: Number(filters.page) || 1,
    pageSize: Number(filters.pageSize) || total
  };
};

const getApplicationById = (id) => {
  const app = applications.find(a => a.id === String(id));
  if (!app) {
    return null;
  }
  return formatApplication(app);
};

const auditApplication = (id, { status, auditOpinion, auditor }) => {
  const app = applications.find(a => a.id === String(id));
  if (!app) {
    throw new Error('申请记录不存在');
  }
  if (app.status !== APPLICATION_STATUS.PENDING) {
    throw new Error('该申请已审核，不可重复操作');
  }
  if (status === APPLICATION_STATUS.REJECTED && (!auditOpinion || auditOpinion.trim() === '')) {
    throw new Error('驳回原因不能为空');
  }

  app.status = status;
  app.auditOpinion = auditOpinion || '';
  app.auditor = auditor || '系统管理员';
  app.auditTime = formatNow();

  if (status === APPLICATION_STATUS.APPROVED) {
    app.onboardingStage = 2;
    app.stageStatus = 'pending';
    if (!app.stageData) app.stageData = { qualification: {}, contract: {}, training: {}, account: {} };
    app.stageData.qualification = {
      reviewer: app.auditor,
      reviewTime: app.auditTime,
      result: 'passed',
      opinion: auditOpinion || '资质审核通过，同意加盟'
    };
  } else if (status === APPLICATION_STATUS.REJECTED) {
    app.stageStatus = 'rejected';
    if (!app.stageData) app.stageData = { qualification: {}, contract: {}, training: {}, account: {} };
    app.stageData.qualification = {
      reviewer: app.auditor,
      reviewTime: app.auditTime,
      result: 'rejected',
      opinion: auditOpinion
    };
  }

  return formatApplication(app);
};

const advanceStage = (id, stageData) => {
  const app = applications.find(a => a.id === String(id));
  if (!app) throw new Error('申请记录不存在');

  if (app.status === APPLICATION_STATUS.REJECTED) {
    throw new Error('已驳回的申请无法推进阶段');
  }

  const currentStage = app.onboardingStage;
  if (currentStage >= 6) {
    throw new Error('已完成全部准入阶段');
  }

  const now = formatNow();

  if (currentStage === 2 && stageData) {
    app.stageData.contract = {
      ...app.stageData.contract,
      ...stageData,
      signDate: stageData.signDate || now.substring(0, 10)
    };
  } else if (currentStage === 3 && stageData) {
    app.stageData.training = {
      ...app.stageData.training,
      ...stageData,
      result: 'passed'
    };
  } else if (currentStage === 4 && stageData) {
    app.stageData.account = {
      ...app.stageData.account,
      ...stageData,
      openDate: stageData.openDate || now.substring(0, 10),
      operator: stageData.operator || '系统管理员'
    };
  }

  app.onboardingStage = currentStage + 1;
  app.stageStatus = app.onboardingStage === 6 ? 'completed' : 'in_progress';

  const result = formatApplication(app);

  if (app.onboardingStage === 6) {
    result._triggerStoreCreate = true;
    result._triggerContractCreate = true;
    result._triggerDepositCreate = true;
    result._triggerCityAssign = true;
  }

  return result;
};

const updateStageData = (id, stage, data) => {
  const app = applications.find(a => a.id === String(id));
  if (!app) throw new Error('申请记录不存在');

  const stageKey = {
    2: 'qualification',
    3: 'contract',
    4: 'training',
    5: 'account'
  }[stage];

  if (!stageKey) {
    throw new Error('无效的阶段');
  }

  if (!app.stageData) app.stageData = {};
  app.stageData[stageKey] = {
    ...app.stageData[stageKey],
    ...data
  };

  return formatApplication(app);
};

const getStageStatistics = () => {
  const stageStats = {};
  for (let i = 1; i <= 6; i++) {
    stageStats[i] = applications.filter(a => a.onboardingStage === i && a.status !== APPLICATION_STATUS.REJECTED).length;
  }
  stageStats.rejected = applications.filter(a => a.status === APPLICATION_STATUS.REJECTED).length;
  stageStats.total = applications.length;
  stageStats.completed = applications.filter(a => a.onboardingStage === 6 && a.stageStatus === 'completed').length;
  stageStats.inProgress = applications.filter(a => a.status !== APPLICATION_STATUS.REJECTED && a.onboardingStage < 6).length;
  return stageStats;
};

const getStatistics = () => {
  const total = applications.length;
  const pending = applications.filter(a => a.status === APPLICATION_STATUS.PENDING).length;
  const approved = applications.filter(a => a.status === APPLICATION_STATUS.APPROVED).length;
  const rejected = applications.filter(a => a.status === APPLICATION_STATUS.REJECTED).length;

  return {
    total,
    pending,
    approved,
    rejected,
    stageStats: getStageStatistics()
  };
};

const getApplicationRaw = (id) => {
  return applications.find(a => a.id === String(id));
};

const getAllApplicationsRaw = () => {
  return applications;
};

module.exports = {
  getApplicationList,
  getApplicationById,
  getApplicationRaw,
  getAllApplicationsRaw,
  auditApplication,
  advanceStage,
  updateStageData,
  getStatistics,
  getStageStatistics
};
