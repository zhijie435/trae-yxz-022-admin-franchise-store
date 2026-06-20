const { mockApplications } = require('./mockData');
const { APPLICATION_STATUS, STATUS_MAP, BUSINESS_TYPE_MAP, CITY_LEVEL_MAP } = require('./constants');

let applications = JSON.parse(JSON.stringify(mockApplications));

const formatApplication = (app) => {
  const statusInfo = STATUS_MAP[app.status] || { label: '未知', color: '#909399', type: 'info' };
  return {
    ...app,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    statusType: statusInfo.type,
    businessTypeLabel: BUSINESS_TYPE_MAP[app.businessType] || app.businessType,
    cityLevelLabel: CITY_LEVEL_MAP[app.cityLevel] || app.cityLevel,
    investmentBudgetLabel: formatBudget(app.investmentBudget)
  };
};

const formatBudget = (budget) => {
  if (budget >= 10000) {
    return `${(budget / 10000).toFixed(0)}万元`;
  }
  return `${budget}元`;
};

const getApplicationList = (filters = {}) => {
  let result = [...applications];

  if (filters.status && filters.status !== 'all') {
    result = result.filter(app => app.status === filters.status);
  }

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    result = result.filter(app =>
      app.applicantName.toLowerCase().includes(keyword) ||
      app.phone.includes(keyword) ||
      (app.companyName && app.companyName.toLowerCase().includes(keyword)) ||
      app.id.toLowerCase().includes(keyword)
    );
  }

  if (filters.city) {
    result = result.filter(app => app.city.includes(filters.city));
  }

  if (filters.businessType && filters.businessType !== 'all') {
    result = result.filter(app => app.businessType === filters.businessType);
  }

  result.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime));

  return {
    list: result.map(formatApplication),
    total: result.length
  };
};

const getApplicationById = (id) => {
  const app = applications.find(a => a.id === id);
  if (!app) {
    return { success: false, message: '申请记录不存在' };
  }
  return { success: true, data: formatApplication(app) };
};

const approveApplication = (id, { auditOpinion, auditor }) => {
  const app = applications.find(a => a.id === id);
  if (!app) {
    return { success: false, message: '申请记录不存在' };
  }
  if (app.status !== APPLICATION_STATUS.PENDING) {
    return { success: false, message: '该申请已审核，不可重复操作' };
  }

  app.status = APPLICATION_STATUS.APPROVED;
  app.auditOpinion = auditOpinion || '';
  app.auditor = auditor || '系统管理员';
  app.auditTime = formatNow();

  return { success: true, message: '审核通过', data: formatApplication(app) };
};

const rejectApplication = (id, { auditOpinion, auditor }) => {
  const app = applications.find(a => a.id === id);
  if (!app) {
    return { success: false, message: '申请记录不存在' };
  }
  if (app.status !== APPLICATION_STATUS.PENDING) {
    return { success: false, message: '该申请已审核，不可重复操作' };
  }
  if (!auditOpinion || auditOpinion.trim() === '') {
    return { success: false, message: '驳回原因不能为空' };
  }

  app.status = APPLICATION_STATUS.REJECTED;
  app.auditOpinion = auditOpinion;
  app.auditor = auditor || '系统管理员';
  app.auditTime = formatNow();

  return { success: true, message: '已驳回', data: formatApplication(app) };
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
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) + '%' : '0%'
  };
};

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const createApplication = (data) => {
  const newId = generateId();
  const newApp = {
    id: newId,
    applicantName: data.applicantName,
    phone: data.phone,
    email: data.email || '',
    companyName: data.companyName || '',
    businessType: data.businessType,
    city: data.city,
    cityLevel: data.cityLevel,
    intendedStoreArea: Number(data.intendedStoreArea) || 0,
    investmentBudget: Number(data.investmentBudget) || 0,
    experience: data.experience || '',
    businessLicense: data.businessLicense || '',
    idCard: data.idCard || '',
    applyTime: formatNow(),
    status: APPLICATION_STATUS.PENDING,
    auditOpinion: '',
    auditor: '',
    auditTime: ''
  };
  applications.unshift(newApp);
  return { success: true, message: '提交成功', data: formatApplication(newApp) };
};

const generateId = () => {
  const num = String(applications.length + 1).padStart(4, '0');
  return `FA2024${num}`;
};

module.exports = {
  getApplicationList,
  getApplicationById,
  approveApplication,
  rejectApplication,
  getStatistics,
  createApplication
};
