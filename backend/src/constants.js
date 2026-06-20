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

module.exports = {
  APPLICATION_STATUS,
  ONBOARDING_STAGES,
  STAGE_INFO,
  STATUS_MAP
};
