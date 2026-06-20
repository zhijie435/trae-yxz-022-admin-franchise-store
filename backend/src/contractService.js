const { getStoreByNo } = require('./storeService');

const mockContracts = [
  {
    id: 'CT001',
    contractNo: 'HT2026010001',
    partnerName: '张伟',
    partnerPhone: '13800138001',
    companyName: '上海佳和餐饮管理有限公司',
    storeName: '北京朝阳旗舰店',
    storeNo: 'MD2026010001',
    levelName: '金牌加盟商',
    startDate: '2026-03-15',
    endDate: '2029-03-14',
    status: 'active',
    signDate: '2026-03-01',
    depositAmount: 200000,
    serviceFeeRate: 3,
    remark: '三年期金牌合同',
    createTime: '2026-03-01 10:00:00'
  },
  {
    id: 'CT002',
    contractNo: 'HT2026010002',
    partnerName: '李娜',
    partnerPhone: '13900139002',
    companyName: '北京优品零售有限公司',
    storeName: '上海浦东体验店',
    storeNo: 'MD2026010002',
    levelName: '银牌加盟商',
    startDate: '2026-04-01',
    endDate: '2028-03-31',
    status: 'active',
    signDate: '2026-03-15',
    depositAmount: 100000,
    serviceFeeRate: 4,
    remark: '两年期银牌合同',
    createTime: '2026-03-15 14:30:00'
  },
  {
    id: 'CT003',
    contractNo: 'HT2026020003',
    partnerName: '陈静',
    partnerPhone: '13400134006',
    companyName: '杭州美味餐饮管理有限公司',
    storeName: '杭州西湖形象店',
    storeNo: 'MD2026020003',
    levelName: '标准加盟商',
    startDate: '2026-05-10',
    endDate: '2028-05-09',
    status: 'active',
    signDate: '2026-04-28',
    depositAmount: 50000,
    serviceFeeRate: 5,
    remark: '',
    createTime: '2026-04-28 09:20:00'
  },
  {
    id: 'CT004',
    contractNo: 'HT2026020004',
    partnerName: '王强',
    partnerPhone: '13700137003',
    companyName: '广州恒信服务有限公司',
    storeName: '广州天河标准店',
    storeNo: 'MD2026020004',
    levelName: '标准加盟商',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    status: 'expired',
    signDate: '2025-05-20',
    depositAmount: 50000,
    serviceFeeRate: 5,
    remark: '合同已到期，待续签',
    createTime: '2025-05-20 11:00:00'
  },
  {
    id: 'CT005',
    contractNo: 'HT2026030005',
    partnerName: '赵敏',
    partnerPhone: '13600136004',
    companyName: '成都智学教育咨询有限公司',
    storeName: '深圳南山社区店',
    storeNo: 'MD2026030005',
    levelName: '银牌加盟商',
    startDate: '2026-06-01',
    endDate: '2028-05-31',
    status: 'pending',
    signDate: '',
    depositAmount: 100000,
    serviceFeeRate: 4,
    remark: '待签约确认',
    createTime: '2026-05-15 16:00:00'
  }
];

let contracts = JSON.parse(JSON.stringify(mockContracts));
let nextContractCounter = 6;

const CONTRACT_STATUS_MAP = {
  pending: { label: '待签约', type: 'warning' },
  active: { label: '生效中', type: 'success' },
  expired: { label: '已到期', type: 'info' },
  terminated: { label: '已终止', type: 'danger' }
};

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const formatContract = (ct) => ({
  ...ct,
  statusText: (CONTRACT_STATUS_MAP[ct.status] || {}).label || '未知'
});

const getContractList = ({ page = 1, pageSize = 10, status, keyword } = {}) => {
  let result = [...contracts];

  if (status && status !== 'all') {
    result = result.filter(c => c.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(c =>
      c.contractNo.toLowerCase().includes(kw) ||
      c.partnerName.toLowerCase().includes(kw) ||
      c.companyName.toLowerCase().includes(kw) ||
      c.storeName.toLowerCase().includes(kw) ||
      c.partnerPhone.includes(kw)
    );
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = result.length;
  let list = result;
  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    list = result.slice(start, start + pageSize);
  }

  return {
    list: list.map(formatContract),
    total,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || total
  };
};

const getContractById = (id) => {
  const ct = contracts.find(c => c.id === String(id));
  return ct ? formatContract(ct) : null;
};

const createContract = (payload) => {
  const { partnerName, partnerPhone, companyName, storeName, storeNo, levelName, startDate, endDate, depositAmount, serviceFeeRate, remark } = payload;

  if (!partnerName || !storeName || !startDate || !endDate) {
    throw new Error('必填项不能为空');
  }

  if (storeNo) {
    const store = getStoreByNo(storeNo);
    if (store && store.status === 'disabled') {
      throw new Error('门店已被禁用，无法为其创建合同');
    }
  }

  const newId = 'CT' + String(nextContractCounter++).padStart(3, '0');
  const now = formatNow();
  const today = now.substring(0, 10).replace(/-/g, '');
  const contractNo = 'HT' + today + String(nextContractCounter - 1).padStart(4, '0');

  const contract = {
    id: newId,
    contractNo,
    partnerName,
    partnerPhone: partnerPhone || '',
    companyName: companyName || '',
    storeName,
    storeNo: storeNo || '',
    levelName: levelName || '标准加盟商',
    startDate,
    endDate,
    status: 'pending',
    signDate: '',
    depositAmount: depositAmount || 0,
    serviceFeeRate: serviceFeeRate || 0,
    remark: remark || '',
    createTime: now
  };

  contracts.unshift(contract);
  return formatContract(contract);
};

const updateContractStatus = (id, status) => {
  if (!['pending', 'active', 'expired', 'terminated'].includes(status)) {
    throw new Error('状态参数错误');
  }
  const contract = contracts.find(c => c.id === String(id));
  if (!contract) throw new Error('合同不存在');
  contract.status = status;
  if (status === 'active' && !contract.signDate) {
    contract.signDate = formatNow().substring(0, 10);
  }
  return formatContract(contract);
};

const updateContract = (id, payload) => {
  const contract = contracts.find(c => c.id === String(id));
  if (!contract) throw new Error('合同不存在');
  Object.assign(contract, payload);
  return formatContract(contract);
};

const removeContract = (id) => {
  const index = contracts.findIndex(c => c.id === String(id));
  if (index === -1) throw new Error('合同不存在');
  contracts.splice(index, 1);
  return true;
};

const getContractStatistics = () => {
  const total = contracts.length;
  const pending = contracts.filter(c => c.status === 'pending').length;
  const active = contracts.filter(c => c.status === 'active').length;
  const expired = contracts.filter(c => c.status === 'expired').length;
  const terminated = contracts.filter(c => c.status === 'terminated').length;
  return { total, pending, active, expired, terminated };
};

module.exports = {
  getContractList,
  getContractById,
  createContract,
  updateContract,
  updateContractStatus,
  removeContract,
  getContractStatistics
};
