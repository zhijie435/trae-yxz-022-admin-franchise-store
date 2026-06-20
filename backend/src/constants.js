const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const STATUS_MAP = {
  [APPLICATION_STATUS.PENDING]: {
    label: '待审核',
    color: '#e6a23c',
    type: 'warning'
  },
  [APPLICATION_STATUS.APPROVED]: {
    label: '已通过',
    color: '#67c23a',
    type: 'success'
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: '已驳回',
    color: '#f56c6c',
    type: 'danger'
  }
};

const BUSINESS_TYPE = {
  CATERING: 'catering',
  RETAIL: 'retail',
  SERVICE: 'service',
  EDUCATION: 'education',
  OTHER: 'other'
};

const BUSINESS_TYPE_MAP = {
  [BUSINESS_TYPE.CATERING]: '餐饮',
  [BUSINESS_TYPE.RETAIL]: '零售',
  [BUSINESS_TYPE.SERVICE]: '服务',
  [BUSINESS_TYPE.EDUCATION]: '教育',
  [BUSINESS_TYPE.OTHER]: '其他'
};

const CITY_LEVEL = {
  FIRST: 'first',
  SECOND: 'second',
  THIRD: 'third',
  FOURTH: 'fourth'
};

const CITY_LEVEL_MAP = {
  [CITY_LEVEL.FIRST]: '一线城市',
  [CITY_LEVEL.SECOND]: '二线城市',
  [CITY_LEVEL.THIRD]: '三线城市',
  [CITY_LEVEL.FOURTH]: '四线及以下'
};

module.exports = {
  APPLICATION_STATUS,
  STATUS_MAP,
  BUSINESS_TYPE,
  BUSINESS_TYPE_MAP,
  CITY_LEVEL,
  CITY_LEVEL_MAP
};
