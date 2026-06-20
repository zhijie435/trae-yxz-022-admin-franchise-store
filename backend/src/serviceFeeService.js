const { getStoreByNo } = require('./storeService');

const mockServiceFees = [
  {
    id: 'SF001',
    feeNo: 'FW2026010001',
    contractNo: 'HT2026010001',
    partnerName: '张伟',
    storeName: '北京朝阳旗舰店',
    storeNo: 'MD2026010001',
    levelName: '金牌加盟商',
    feeRate: 3,
    revenueAmount: 850000,
    feeAmount: 25500,
    paidAmount: 25500,
    period: '2026-Q1',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'paid',
    paymentDate: '2026-04-05',
    remark: '',
    createTime: '2026-04-01 10:00:00'
  },
  {
    id: 'SF002',
    feeNo: 'FW2026010002',
    contractNo: 'HT2026010002',
    partnerName: '李娜',
    storeName: '上海浦东体验店',
    storeNo: 'MD2026010002',
    levelName: '银牌加盟商',
    feeRate: 4,
    revenueAmount: 620000,
    feeAmount: 24800,
    paidAmount: 24800,
    period: '2026-Q1',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    status: 'paid',
    paymentDate: '2026-04-08',
    remark: '',
    createTime: '2026-04-01 10:00:00'
  },
  {
    id: 'SF003',
    feeNo: 'FW2026020003',
    contractNo: 'HT2026020003',
    partnerName: '陈静',
    storeName: '杭州西湖形象店',
    storeNo: 'MD2026020003',
    levelName: '标准加盟商',
    feeRate: 5,
    revenueAmount: 380000,
    feeAmount: 19000,
    paidAmount: 19000,
    period: '2026-Q2',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'paid',
    paymentDate: '2026-06-15',
    remark: '提前缴纳',
    createTime: '2026-06-01 09:20:00'
  },
  {
    id: 'SF004',
    feeNo: 'FW2026020004',
    contractNo: 'HT2026010001',
    partnerName: '张伟',
    storeName: '北京朝阳旗舰店',
    storeNo: 'MD2026010001',
    levelName: '金牌加盟商',
    feeRate: 3,
    revenueAmount: 920000,
    feeAmount: 27600,
    paidAmount: 0,
    period: '2026-Q2',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'pending',
    paymentDate: '',
    remark: '待缴纳',
    createTime: '2026-06-01 10:00:00'
  },
  {
    id: 'SF005',
    feeNo: 'FW2026020005',
    contractNo: 'HT2026010002',
    partnerName: '李娜',
    storeName: '上海浦东体验店',
    storeNo: 'MD2026010002',
    levelName: '银牌加盟商',
    feeRate: 4,
    revenueAmount: 710000,
    feeAmount: 28400,
    paidAmount: 15000,
    period: '2026-Q2',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'partial',
    paymentDate: '2026-06-10',
    remark: '部分缴纳，尾款待补',
    createTime: '2026-06-01 10:00:00'
  },
  {
    id: 'SF006',
    feeNo: 'FW2026030006',
    contractNo: 'HT2026030005',
    partnerName: '赵敏',
    storeName: '深圳南山社区店',
    storeNo: 'MD2026030005',
    levelName: '银牌加盟商',
    feeRate: 4,
    revenueAmount: 280000,
    feeAmount: 11200,
    paidAmount: 0,
    period: '2026-Q2',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'overdue',
    paymentDate: '',
    remark: '逾期未缴',
    createTime: '2026-06-01 10:00:00'
  }
];

let serviceFees = JSON.parse(JSON.stringify(mockServiceFees));
let nextFeeCounter = 7;

const FEE_STATUS_MAP = {
  pending: { label: '待缴纳', type: 'warning' },
  partial: { label: '部分缴纳', type: 'warning' },
  paid: { label: '已缴纳', type: 'success' },
  overdue: { label: '逾期', type: 'danger' }
};

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const formatFee = (fee) => ({
  ...fee,
  statusText: (FEE_STATUS_MAP[fee.status] || {}).label || '未知'
});

const getServiceFeeList = ({ page = 1, pageSize = 10, status, keyword, period } = {}) => {
  let result = [...serviceFees];

  if (status && status !== 'all') {
    result = result.filter(f => f.status === status);
  }

  if (period) {
    result = result.filter(f => f.period === period);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(f =>
      f.feeNo.toLowerCase().includes(kw) ||
      f.partnerName.toLowerCase().includes(kw) ||
      f.storeName.toLowerCase().includes(kw) ||
      f.contractNo.toLowerCase().includes(kw)
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
    list: list.map(formatFee),
    total,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || total
  };
};

const getServiceFeeById = (id) => {
  const fee = serviceFees.find(f => f.id === String(id));
  return fee ? formatFee(fee) : null;
};

const createServiceFee = (payload) => {
  const { contractNo, partnerName, storeName, storeNo, levelName, feeRate, revenueAmount, period, startDate, endDate, remark } = payload;

  if (!contractNo || !partnerName || !storeName || !feeRate || !revenueAmount || !period) {
    throw new Error('必填项不能为空');
  }

  if (storeNo) {
    const store = getStoreByNo(storeNo);
    if (store && store.status === 'disabled') {
      throw new Error('门店已被禁用，无法为其创建服务费记录');
    }
  }

  const newId = 'SF' + String(nextFeeCounter++).padStart(3, '0');
  const now = formatNow();
  const today = now.substring(0, 10).replace(/-/g, '');
  const feeNo = 'FW' + today + String(nextFeeCounter - 1).padStart(4, '0');

  const feeAmount = Math.round(Number(revenueAmount) * Number(feeRate) / 100);

  const fee = {
    id: newId,
    feeNo,
    contractNo,
    partnerName,
    storeName,
    storeNo: storeNo || '',
    levelName: levelName || '',
    feeRate: Number(feeRate),
    revenueAmount: Number(revenueAmount),
    feeAmount,
    paidAmount: 0,
    period,
    startDate: startDate || '',
    endDate: endDate || '',
    status: 'pending',
    paymentDate: '',
    remark: remark || '',
    createTime: now
  };

  serviceFees.unshift(fee);
  return formatFee(fee);
};

const payServiceFee = (id, payload) => {
  const fee = serviceFees.find(f => f.id === String(id));
  if (!fee) throw new Error('服务费记录不存在');

  const { paidAmount, paymentDate } = payload;
  if (!paidAmount || paidAmount <= 0) throw new Error('缴纳金额必须大于0');

  fee.paidAmount = (fee.paidAmount || 0) + Number(paidAmount);
  fee.paymentDate = paymentDate || fee.paymentDate;

  if (fee.paidAmount >= fee.feeAmount) {
    fee.status = 'paid';
    fee.paidAmount = fee.feeAmount;
  } else {
    fee.status = 'partial';
  }

  return formatFee(fee);
};

const getServiceFeeStatistics = () => {
  const total = serviceFees.length;
  const pending = serviceFees.filter(f => f.status === 'pending').length;
  const partial = serviceFees.filter(f => f.status === 'partial').length;
  const paid = serviceFees.filter(f => f.status === 'paid').length;
  const overdue = serviceFees.filter(f => f.status === 'overdue').length;
  const totalFeeAmount = serviceFees.reduce((sum, f) => sum + f.feeAmount, 0);
  const totalPaid = serviceFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalRevenue = serviceFees.reduce((sum, f) => sum + f.revenueAmount, 0);
  return { total, pending, partial, paid, overdue, totalFeeAmount, totalPaid, totalRevenue };
};

module.exports = {
  getServiceFeeList,
  getServiceFeeById,
  createServiceFee,
  payServiceFee,
  getServiceFeeStatistics
};
