const mockLevels = [
  {
    id: 'LV001',
    levelName: '标准加盟商',
    levelCode: 'STANDARD',
    depositAmount: 50000,
    serviceFeeRate: 5,
    minStoreArea: 100,
    maxStores: 3,
    description: '适合初次加盟的合作伙伴，享受基础支持服务',
    benefits: '品牌授权、培训支持、运营指导、物料支持',
    status: 'enabled',
    createTime: '2026-01-10 10:00:00'
  },
  {
    id: 'LV002',
    levelName: '银牌加盟商',
    levelCode: 'SILVER',
    depositAmount: 100000,
    serviceFeeRate: 4,
    minStoreArea: 150,
    maxStores: 8,
    description: '适合有一定规模的加盟伙伴，享受进阶支持服务',
    benefits: '品牌授权、培训支持、运营指导、物料支持、区域保护、营销支持',
    status: 'enabled',
    createTime: '2026-01-10 10:00:00'
  },
  {
    id: 'LV003',
    levelName: '金牌加盟商',
    levelCode: 'GOLD',
    depositAmount: 200000,
    serviceFeeRate: 3,
    minStoreArea: 200,
    maxStores: 15,
    description: '适合大规模运营的加盟伙伴，享受全方位支持服务',
    benefits: '品牌授权、培训支持、运营指导、物料支持、区域保护、营销支持、优先新品、专属客服',
    status: 'enabled',
    createTime: '2026-01-10 10:00:00'
  },
  {
    id: 'LV004',
    levelName: '钻石加盟商',
    levelCode: 'DIAMOND',
    depositAmount: 500000,
    serviceFeeRate: 2,
    minStoreArea: 300,
    maxStores: 50,
    description: '最高等级加盟伙伴，享受顶级定制化服务',
    benefits: '品牌授权、培训支持、运营指导、物料支持、区域保护、营销支持、优先新品、专属客服、定制方案、股权激励',
    status: 'enabled',
    createTime: '2026-01-10 10:00:00'
  },
  {
    id: 'LV005',
    levelName: '试点加盟商',
    levelCode: 'PILOT',
    depositAmount: 30000,
    serviceFeeRate: 6,
    minStoreArea: 80,
    maxStores: 1,
    description: '试点区域特殊等级，用于市场测试',
    benefits: '品牌授权、培训支持、运营指导',
    status: 'disabled',
    createTime: '2026-03-15 14:30:00'
  }
];

let levels = JSON.parse(JSON.stringify(mockLevels));
let nextLevelCounter = 6;

const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getLevelList = ({ page = 1, pageSize = 10, status, keyword } = {}) => {
  let result = [...levels];

  if (status && status !== 'all') {
    result = result.filter(l => l.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(l =>
      l.levelName.toLowerCase().includes(kw) ||
      l.levelCode.toLowerCase().includes(kw) ||
      l.description.toLowerCase().includes(kw)
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
    list,
    total,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || total
  };
};

const getLevelById = (id) => {
  return levels.find(l => l.id === String(id)) || null;
};

const createLevel = (payload) => {
  const { levelName, levelCode, depositAmount, serviceFeeRate, minStoreArea, maxStores, description, benefits } = payload;

  if (!levelName || !levelCode) {
    throw new Error('等级名称和编码不能为空');
  }

  if (levels.find(l => l.levelCode === levelCode)) {
    throw new Error('等级编码已存在');
  }

  const newId = 'LV' + String(nextLevelCounter++).padStart(3, '0');
  const level = {
    id: newId,
    levelName,
    levelCode,
    depositAmount: depositAmount || 0,
    serviceFeeRate: serviceFeeRate || 0,
    minStoreArea: minStoreArea || 0,
    maxStores: maxStores || 0,
    description: description || '',
    benefits: benefits || '',
    status: 'enabled',
    createTime: formatNow()
  };

  levels.unshift(level);
  return level;
};

const updateLevel = (id, payload) => {
  const level = levels.find(l => l.id === String(id));
  if (!level) throw new Error('等级不存在');

  if (payload.levelCode && payload.levelCode !== level.levelCode) {
    if (levels.find(l => l.levelCode === payload.levelCode)) {
      throw new Error('等级编码已存在');
    }
  }

  Object.assign(level, payload);
  return level;
};

const updateLevelStatus = (id, status) => {
  if (!['enabled', 'disabled'].includes(status)) {
    throw new Error('状态参数错误');
  }
  const level = levels.find(l => l.id === String(id));
  if (!level) throw new Error('等级不存在');
  level.status = status;
  return level;
};

const removeLevel = (id) => {
  const index = levels.findIndex(l => l.id === String(id));
  if (index === -1) throw new Error('等级不存在');
  levels.splice(index, 1);
  return true;
};

const getLevelStatistics = () => {
  const total = levels.length;
  const enabled = levels.filter(l => l.status === 'enabled').length;
  const disabled = levels.filter(l => l.status === 'disabled').length;
  const avgDeposit = total > 0 ? Math.round(levels.reduce((sum, l) => sum + l.depositAmount, 0) / total) : 0;
  return { total, enabled, disabled, avgDeposit };
};

module.exports = {
  getLevelList,
  getLevelById,
  createLevel,
  updateLevel,
  updateLevelStatus,
  removeLevel,
  getLevelStatistics
};
