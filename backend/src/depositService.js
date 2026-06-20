const { getStoreByNo } = require('./storeService');
const { formatNow, generateId, generateBusinessNo, paginateList } = require('./utils');

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
    applicationId: '',
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
    applicationId: '',
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
    applicationId: '',
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
    applicationId: '',
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
    applicationId: '',
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

const PAYMENT_METHOD_MAP = {
  bank_transfer: '银行转账',
  online: '在线支付',
  cash: '现金',
  check: '支票'
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

  return paginateList({
    list: result.map(formatDeposit),
    page,
    pageSize
  });
};

const getDepositById = (id) => {
  const dp = deposits.find(d => d.id === String(id));
  return dp ? formatDeposit(dp) : null;
};

const createDeposit = (payload) => {
  const { contractNo, partnerName, storeName, storeNo, levelName, amount, paymentMethod, paymentDate, remark, applicationId } = payload;

  if (!contractNo || !partnerName || !storeName || !amount) {
    throw new Error('必填项不能为空');
  }

  if (storeNo) {
    const store = getStoreByNo(storeNo);
    if (store && store.status === 'disabled') {
      throw new Error('门店已被禁用，无法为其创建保证金记录');
    }
  }

  const newId = generateId('DP', nextDepositCounter++);
  const now = formatNow();
  const depositNo = generateBusinessNo('BZ', nextDepositCounter - 1);

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
    paymentMethodText: PAYMENT_METHOD_MAP[paymentMethod] || '',
    status: 'unpaid',
    paymentDate: paymentDate || '',
    applicationId: applicationId || '',
    remark: remark || '',
    createTime: now
  };

  deposits.unshift(deposit);
  return formatDeposit(deposit);
};

const createDepositFromContract = (contractData) => {
  if (!contractData.depositAmount || contractData.depositAmount <= 0) {
    return null;
  }

  const existing = deposits.find(d => d.contractNo === contractData.contractNo);
  if (existing) {
    return formatDeposit(existing);
  }

  return createDeposit({
    contractNo: contractData.contractNo,
    partnerName: contractData.partnerName,
    storeName: contractData.storeName,
    storeNo: contractData.storeNo || '',
    levelName: contractData.levelName || '',
    amount: contractData.depositAmount,
    remark: `由合同 ${contractData.contractNo} 自动创建`,
    applicationId: contractData.applicationId || ''
  });
};

const createDepositFromApplication = (appData) => {
  const contractStageData = appData.stageData?.contract || {};
  const accountStageData = appData.stageData?.account || {};

  if (!contractStageData.depositAmount || contractStageData.depositAmount <= 0) {
    return null;
  }

  const contractNo = contractStageData.contractNo || '';
  if (contractNo) {
    const existing = deposits.find(d => d.contractNo === contractNo);
    if (existing) {
      existing.applicationId = appData.id;
      return formatDeposit(existing);
    }
  }

  return createDeposit({
    contractNo: contractNo || `HT${appData.applyNo}`,
    partnerName: appData.legalPerson,
    storeName: accountStageData.storeName || `${appData.city}门店`,
    storeNo: accountStageData.storeNo || '',
    levelName: contractStageData.contractType || '标准加盟商',
    amount: contractStageData.depositAmount,
    remark: `由申请 ${appData.applyNo} 自动创建`,
    applicationId: appData.id
  });
};

const payDeposit = (id, payload) => {
  const deposit = deposits.find(d => d.id === String(id));
  if (!deposit) throw new Error('保证金记录不存在');

  const { paidAmount, paymentMethod, paymentDate } = payload;
  if (!paidAmount || paidAmount <= 0) throw new Error('缴纳金额必须大于0');

  deposit.paidAmount = (deposit.paidAmount || 0) + Number(paidAmount);
  deposit.paymentMethod = paymentMethod || deposit.paymentMethod;
  deposit.paymentMethodText = PAYMENT_METHOD_MAP[paymentMethod] || deposit.paymentMethodText;
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

const getDepositsByContractNo = (contractNo) => {
  return deposits.filter(d => d.contractNo === contractNo).map(formatDeposit);
};

module.exports = {
  getDepositList,
  getDepositById,
  createDeposit,
  createDepositFromContract,
  createDepositFromApplication,
  payDeposit,
  refundDeposit,
  getDepositStatistics,
  getDepositsByContractNo
};
