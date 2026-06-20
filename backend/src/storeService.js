const { APPLICATION_STATUS } = require('./constants');
const { mockApplications } = require('./mockData');

const mockStores = [
  {
    id: 'ST001',
    storeNo: 'MD2026010001',
    storeName: '北京朝阳旗舰店',
    partnerName: '张伟',
    partnerPhone: '13800138001',
    companyName: '上海佳和餐饮管理有限公司',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '朝阳区建国路88号SOHO现代城A座1层',
    storeArea: '280平米',
    account: 'bj_chaoyang_001',
    openDate: '2026-03-15',
    status: 'enabled',
    createTime: '2026-02-20 10:00:00',
    remark: '北京地区核心旗舰店'
  },
  {
    id: 'ST002',
    storeNo: 'MD2026010002',
    storeName: '上海浦东体验店',
    partnerName: '李娜',
    partnerPhone: '13900139002',
    companyName: '北京优品零售有限公司',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '浦东新区世纪大道100号环球金融中心B1层',
    storeArea: '350平米',
    account: 'sh_pudong_002',
    openDate: '2026-04-01',
    status: 'enabled',
    createTime: '2026-03-10 14:30:00',
    remark: '华东地区旗舰体验店'
  },
  {
    id: 'ST003',
    storeNo: 'MD2026020003',
    storeName: '杭州西湖形象店',
    partnerName: '陈静',
    partnerPhone: '13400134006',
    companyName: '杭州美味餐饮管理有限公司',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    address: '西湖区文三路259号昌地火炬大厦1层',
    storeArea: '220平米',
    account: 'hz_xihu_003',
    openDate: '2026-05-10',
    status: 'enabled',
    createTime: '2026-04-15 09:20:00',
    remark: ''
  },
  {
    id: 'ST004',
    storeNo: 'MD2026020004',
    storeName: '广州天河标准店',
    partnerName: '王强',
    partnerPhone: '13700137003',
    companyName: '广州恒信服务有限公司',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    address: '天河区体育西路103号维多利广场1层',
    storeArea: '180平米',
    account: 'gz_tianhe_004',
    openDate: '2026-05-20',
    status: 'disabled',
    createTime: '2026-04-28 16:00:00',
    remark: '因违规操作被暂停账号'
  },
  {
    id: 'ST005',
    storeNo: 'MD2026030005',
    storeName: '深圳南山社区店',
    partnerName: '赵敏',
    partnerPhone: '13600136004',
    companyName: '成都智学教育咨询有限公司',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '南山区科技园南区高新南一道飞亚达大厦1层',
    storeArea: '150平米',
    account: 'sz_nanshan_005',
    openDate: '2026-06-01',
    status: 'enabled',
    createTime: '2026-05-10 11:15:00',
    remark: ''
  }
];

let stores = JSON.parse(JSON.stringify(mockStores));
let nextStoreCounter = 6;

const STATUS_MAP = {
  enabled: { label: '已启用', type: 'success' },
  disabled: { label: '已禁用', type: 'danger' }
};

const formatStore = (store) => ({
  ...store,
  statusText: (STATUS_MAP[store.status] || {}).label || '未知'
});

const pad4 = (n) => String(n).padStart(4, '0');

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getStoreList = ({ page = 1, pageSize = 10, status, keyword, province, city } = {}) => {
  let result = [...stores];

  if (status && status !== 'all') {
    result = result.filter(s => s.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(s =>
      s.storeName.toLowerCase().includes(kw) ||
      s.storeNo.toLowerCase().includes(kw) ||
      s.partnerName.toLowerCase().includes(kw) ||
      s.partnerPhone.includes(kw) ||
      s.account.toLowerCase().includes(kw)
    );
  }

  if (province && province !== 'all') {
    result = result.filter(s => s.province === province);
  }

  if (city && city !== 'all') {
    result = result.filter(s => s.city === city);
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = result.length;
  let list = result;
  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    list = result.slice(start, start + pageSize);
  }

  return {
    list: list.map(formatStore),
    total,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || total
  };
};

const getStoreById = (id) => {
  const store = stores.find(s => s.id === String(id));
  return store ? formatStore(store) : null;
};

const getStoreStatistics = () => {
  const total = stores.length;
  const enabled = stores.filter(s => s.status === 'enabled').length;
  const disabled = stores.filter(s => s.status === 'disabled').length;
  const cities = [...new Set(stores.map(s => s.city))].length;
  return { total, enabled, disabled, cities };
};

const createStore = (payload) => {
  const {
    storeName, partnerName, partnerPhone, companyName,
    province, city, district, address, storeArea, account, openDate, remark = ''
  } = payload;

  if (!storeName || !partnerName || !partnerPhone || !province || !city || !district || !address || !account) {
    throw new Error('必填项不能为空');
  }

  if (stores.find(s => s.account === account)) {
    throw new Error('账号已存在，请更换账号');
  }

  const newId = 'ST' + pad4(nextStoreCounter++);
  const now = formatNow();
  const today = now.substring(0, 10).replace(/-/g, '');
  const storeNo = 'MD' + today + pad4(nextStoreCounter - 1);

  const store = {
    id: newId,
    storeNo,
    storeName,
    partnerName,
    partnerPhone,
    companyName: companyName || '',
    province,
    city,
    district,
    address,
    storeArea: storeArea || '',
    account,
    openDate: openDate || now.substring(0, 10),
    status: 'enabled',
    createTime: now,
    remark
  };

  stores.unshift(store);
  return formatStore(store);
};

const removeStore = (id) => {
  const index = stores.findIndex(s => s.id === String(id));
  if (index === -1) throw new Error('门店不存在');
  stores.splice(index, 1);
  return true;
};

const updateStoreStatus = (id, status) => {
  if (!['enabled', 'disabled'].includes(status)) {
    throw new Error('状态参数错误');
  }
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');
  store.status = status;
  return formatStore(store);
};

const updateStore = (id, payload) => {
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');

  if (payload.storeNo) {
    const duplicate = stores.find(s => s.id !== String(id) && s.storeNo === payload.storeNo);
    if (duplicate) throw new Error('门店编号已存在');
  }

  if (payload.account) {
    const duplicate = stores.find(s => s.id !== String(id) && s.account === payload.account);
    if (duplicate) throw new Error('账号已存在');
  }

  const allowedFields = [
    'storeNo', 'storeName', 'partnerName', 'partnerPhone',
    'companyName', 'province', 'city', 'district', 'address', 'storeArea',
    'account', 'openDate', 'remark'
  ];
  allowedFields.forEach(field => {
    if (payload[field] !== undefined) {
      store[field] = payload[field];
    }
  });

  return formatStore(store);
};

const resetPassword = (id, newPassword) => {
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');
  if (!newPassword || newPassword.length < 6) {
    throw new Error('密码长度不能少于6位');
  }
  store.password = newPassword;
  store.passwordUpdateTime = formatNow();
  return { success: true, account: store.account, passwordUpdateTime: store.passwordUpdateTime };
};

module.exports = {
  getStoreList,
  getStoreById,
  getStoreStatistics,
  createStore,
  removeStore,
  updateStoreStatus,
  updateStore,
  resetPassword
};
