const { mockApplications } = require('./mockData');
const { APPLICATION_STATUS, STATUS_MAP } = require('./constants');

let applications = JSON.parse(JSON.stringify(mockApplications));

const formatApplication = (app) => {
  const statusInfo = STATUS_MAP[app.status] || { label: '未知', type: 'info' };
  return {
    ...app,
    statusText: statusInfo.label
  };
};

const getApplicationList = (filters = {}) => {
  let result = [...applications];

  if (filters.status) {
    result = result.filter(app => app.status === filters.status);
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

  return formatApplication(app);
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
    rejected
  };
};

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

module.exports = {
  getApplicationList,
  getApplicationById,
  auditApplication,
  getStatistics
};
