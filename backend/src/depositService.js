const { getStoreByNo } = require('./storeService');

const mockDeposits = [
  {
    id: 'DP001',
    depositNo: 'BZ2026010001',
    contractNo: 'HT2026010001',
    partnerName: '张伟',
    storeName: '北京朝阳旗舰店',
    storeNo: 'MD2026010001',
    levelName: '金牌加盟商',
    amount: 200000,
    paidAmount: 200000,
    paymentMethod: 'bank_transfer',
    paymentMethodText: '银行转账',
    status: 'paid',
    paymentDate: '2026-02-28',
    remark: '全额缴纳',
    createTime: '2026-02-28 10:00:00'
  },
  {
    id: 'DP002',
    depositNo: 'BZ2026010002',
    contractNo: 'HT2026010002',
    partnerName: '李娜',
    storeName: '上海浦东体验店',
    storeNo: 'MD2026010002',
    levelName: '银牌加盟商',
    amount: 100000,
    paidAmount: 100000,
    paymentMethod: 'bank_transfer',
    paymentMethodText: '银行转账',
    status: 'paid',
    paymentDate: '2026-03-10',
    remark: '',
    createTime: '2026-03-10 14:30:00'
  },
  {
    id: 'DP003',
    depositNo: 'BZ2026020003',
    contractNo: 'HT2026020003',
    partnerName: '陈静',
    storeName: '杭州西湖形象店',
    storeNo: 'MD2026020003',
    levelName: '标准加盟商',
    amount: 50000,
    paidAmount: 30000,
    paymentMethod: 'online',
    paymentMethodText: '在线支付',
    status: 'partial',
    paymentDate: '2026-04-25',
    remark: '首期已缴纳，尾款30天内补齐',
    createTime: '2026-04-25 09:20:00'
  },
  {
    id: 'DP004',
    depositNo: 'BZ2026020004',
    contractNo: 'HT2026020004',
    partnerName: '王强',
    storeName: '广州天河标准店',
    storeNo: 'MD2026020004',
    levelName: '标准加盟商',
    amount: 50000,
    paidAmount: 50000,
    paymentMethod: 'bank_transfer',
    paymentMethodText: '银行转账',
    status: 'refunded',
    paymentDate: '2025-05-18',
    refundDate: '2026-06-01',
    refundAmount: 50000,
    remark: '合同到期，保证金已退还',
    createTime: '2025-05-18 11:00:00'
  },
  {
    id: 'DP005',
    depositNo: 'BZ2026030005',
    contractNo: 'HT2026030005',
    partnerName: '赵敏',
    storeName: '深圳南山社区店',
    storeNo: 'MD2026030005',
    levelName: '银牌加盟商',
    amount: 100000,
    paidAmount: 0,
    paymentMethod: '',
    paymentMethodText: '',
    status: 'unpaid',
    paymentDate: '',
    remark: '待签约后缴纳',
    createTime: '2026-05-15 16:00:00'
  }
];

let deposits = JSON.parse(JSON.stringify(mockDeposits));
let nextDepositCounter = 6;

const DEPOSIT_STATUS_MAP = {
  unpaid: { label: '未缴纳', type: 'info' },
  partial: { label: '部分缴纳', type: 'warning' },
  paid: { label: '已缴纳', type: 'success' },
  refunded: { label: '已退还', type: 'primary' }
};

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const formatDeposit = (dp) => ({
  ...dp,
  statusText: (DEPOSIT_STATUS_MAP[dp.status] || {}).label || '未知'
});

const getDepositList = ({ page = 1, pageSize = 10, status, keyword } = {}) => {
  let result = [...deposits];

  if (status && status !== 'all') {
    result = result.filter(d => d.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(d =>
      d.depositNo.toLowerCase().includes(kw) ||
      d.partnerName.toLowerCase().includes(kw) ||
      d.storeName.toLowerCase().includes(kw) ||
      d.contractNo.toLowerCase().includes(kw)
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
    list: list.map(formatDeposit),
    total,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || total
  };
};

const getDepositById = (id) => {
  const dp = deposits.find(d => d.id === String(id));
  return dp ? formatDeposit(dp) : null;
};

const createDeposit = (payload) => {
  const { contractNo, partnerName, storeName, storeNo, levelName, amount, paymentMethod, paymentDate, remark } = payload;

  if (!contractNo || !partnerName || !storeName || !amount) {
    throw new Error('必填项不能为空');
  }

  if (storeNo) {
    const store = getStoreByNo(storeNo);
    if (store && store.status === 'disabled') {
      throw new Error('门店已被禁用，无法为其创建保证金记录');
    }
  }

  const newId = 'DP' + String(nextDepositCounter++).padStart(3, '0');
  const now = formatNow();
  const today = now.substring(0, 10).replace(/-/g, '');
  const depositNo = 'BZ' + today + String(nextDepositCounter - 1).padStart(4, '0');

  const paymentMethodMap = {
    bank_transfer: '银行转账',
    online: '在线支付',
    cash: '现金',
    check: '支票'
  };

  const deposit = {
    id: newId,
    depositNo,
    contractNo,
    partnerName,
    storeName,
    storeNo: storeNo || '',
    levelName: levelName || '',
    amount,
    paidAmount: 0,
    paymentMethod: paymentMethod || '',
    paymentMethodText: paymentMethodMap[paymentMethod] || '',
    status: 'unpaid',
    paymentDate: paymentDate || '',
    remark: remark || '',
    createTime: now
  };

  deposits.unshift(deposit);
  return formatDeposit(deposit);
};

const payDeposit = (id, payload) => {
  const deposit = deposits.find(d => d.id === String(id));
  if (!deposit) throw new Error('保证金记录不存在');

  const { paidAmount, paymentMethod, paymentDate } = payload;
  if (!paidAmount || paidAmount <= 0) throw new Error('缴纳金额必须大于0');

  const paymentMethodMap = {
    bank_transfer: '银行转账',
    online: '在线支付',
    cash: '现金',
    check: '支票'
  };

  deposit.paidAmount = (deposit.paidAmount || 0) + Number(paidAmount);
  deposit.paymentMethod = paymentMethod || deposit.paymentMethod;
  deposit.paymentMethodText = paymentMethodMap[paymentMethod] || deposit.paymentMethodText;
  deposit.paymentDate = paymentDate || deposit.paymentDate;

  if (deposit.paidAmount >= deposit.amount) {
    deposit.status = 'paid';
    deposit.paidAmount = deposit.amount;
  } else {
    deposit.status = 'partial';
  }

  return formatDeposit(deposit);
};

const refundDeposit = (id, payload) => {
  const deposit = deposits.find(d => d.id === String(id));
  if (!deposit) throw new Error('保证金记录不存在');
  if (deposit.status !== 'paid') throw new Error('只有已缴纳的保证金才能退还');

  const { refundAmount, refundDate } = payload;
  deposit.status = 'refunded';
  deposit.refundAmount = refundAmount || deposit.paidAmount;
  deposit.refundDate = refundDate || formatNow().substring(0, 10);

  return formatDeposit(deposit);
};

const getDepositStatistics = () => {
  const total = deposits.length;
  const unpaid = deposits.filter(d => d.status === 'unpaid').length;
  const partial = deposits.filter(d => d.status === 'partial').length;
  const paid = deposits.filter(d => d.status === 'paid').length;
  const refunded = deposits.filter(d => d.status === 'refunded').length;
  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = deposits.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  return { total, unpaid, partial, paid, refunded, totalAmount, totalPaid };
};

module.exports = {
  getDepositList,
  getDepositById,
  createDeposit,
  payDeposit,
  refundDeposit,
  getDepositStatistics
};
