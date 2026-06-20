const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
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
  STATUS_MAP
};
