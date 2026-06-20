const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const ONBOARDING_STAGES = {
  APPLY: 1,
  QUALIFICATION: 2,
  CONTRACT: 3,
  TRAINING: 4,
  ACCOUNT: 5,
  OPERATIONAL: 6
};

const STAGE_INFO = {
  1: { code: 'apply', name: '提交申请', icon: 'Document', color: '#667eea', type: 'primary' },
  2: { code: 'qualification', name: '资质审核', icon: 'User', color: '#f59e0b', type: 'warning' },
  3: { code: 'contract', name: '合同签约', icon: 'Notebook', color: '#10b981', type: 'success' },
  4: { code: 'training', name: '加盟培训', icon: 'Reading', color: '#8b5cf6', type: 'primary' },
  5: { code: 'account', name: '账号开通', icon: 'Key', color: '#06b6d4', type: 'info' },
  6: { code: 'operational', name: '上线运营', icon: 'Shop', color: '#22c55e', type: 'success' }
};

const STATUS_MAP = {
  [APPLICATION_STATUS.PENDING]: {
    label: '待审核',
    type: 'warning'
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: '已通过',
    type: 'success'
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: '已驳回',
    type: 'danger'
  }
};

const PROVINCE_CITY_MAP = {
  '北京市': { province: '北京市', cities: ['北京市'] },
  '上海市': { province: '上海市', cities: ['上海市'] },
  '天津市': { province: '天津市', cities: ['天津市'] },
  '重庆市': { province: '重庆市', cities: ['重庆市'] },
  '广东省': { province: '广东省', cities: ['广州市', '深圳市', '东莞市', '佛山市', '珠海市', '中山市'] },
  '江苏省': { province: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '南通市', '徐州市'] },
  '浙江省': { province: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '绍兴市', '金华市'] },
  '四川省': { province: '四川省', cities: ['成都市', '绵阳市', '德阳市', '宜宾市', '泸州市'] },
  '湖北省': { province: '湖北省', cities: ['武汉市', '宜昌市', '襄阳市', '荆州市'] },
  '山东省': { province: '山东省', cities: ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市'] },
  '河南省': { province: '河南省', cities: ['郑州市', '洛阳市', '开封市', '南阳市'] },
  '福建省': { province: '福建省', cities: ['福州市', '厦门市', '泉州市', '漳州市'] },
  '陕西省': { province: '陕西省', cities: ['西安市', '咸阳市', '宝鸡市'] },
  '湖南省': { province: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市'] },
  '安徽省': { province: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '安庆市'] },
  '辽宁省': { province: '辽宁省', cities: ['沈阳市', '大连市', '鞍山市', '朝阳市'] }
};

const getAllProvinces = () => Object.keys(PROVINCE_CITY_MAP);

const getCitiesByProvince = (province) => PROVINCE_CITY_MAP[province]?.cities || [];

const getProvinceByCity = (city) => {
  for (const province of Object.keys(PROVINCE_CITY_MAP)) {
    if (PROVINCE_CITY_MAP[province].cities.includes(city)) {
      return province;
    }
  }
  return '';
};

module.exports = {
  APPLICATION_STATUS,
  ONBOARDING_STAGES,
  STAGE_INFO,
  STATUS_MAP,
  PROVINCE_CITY_MAP,
  getAllProvinces,
  getCitiesByProvince,
  getProvinceByCity
};
