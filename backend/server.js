const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

const FranchiseService = require('./src/franchiseService');
const {
  APPLICATION_STATUS,
  STATUS_MAP,
  BUSINESS_TYPE,
  BUSINESS_TYPE_MAP,
  CITY_LEVEL,
  CITY_LEVEL_MAP
} = require('./src/constants');

app.use(cors());
app.use(express.json());

const handleServiceResult = (res, result) => {
  if (result.success) {
    res.json({
      code: 0,
      message: result.message || 'success',
      data: result.data
    });
  } else {
    res.json({
      code: result.code || 1,
      message: result.message || '操作失败'
    });
  }
};

app.get('/api/franchise-applications', (req, res) => {
  const { status, keyword, city, businessType, page, pageSize } = req.query;

  const result = FranchiseService.getApplicationList({
    status,
    keyword,
    city,
    businessType
  });

  let list = result.list;
  const total = result.total;

  if (page && pageSize) {
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    list = list.slice(start, end);
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      list,
      total,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || total
    }
  });
});

app.get('/api/franchise-applications/statistics', (req, res) => {
  const statistics = FranchiseService.getStatistics();
  res.json({
    code: 0,
    message: 'success',
    data: statistics
  });
});

app.get('/api/franchise-applications/:id', (req, res) => {
  const { id } = req.params;
  const result = FranchiseService.getApplicationById(id);
  handleServiceResult(res, result);
});

app.post('/api/franchise-applications/:id/approve', (req, res) => {
  const { id } = req.params;
  const { auditOpinion, auditor } = req.body || {};
  const result = FranchiseService.approveApplication(id, {
    auditOpinion,
    auditor
  });
  handleServiceResult(res, result);
});

app.post('/api/franchise-applications/:id/reject', (req, res) => {
  const { id } = req.params;
  const { auditOpinion, auditor } = req.body || {};
  const result = FranchiseService.rejectApplication(id, {
    auditOpinion,
    auditor
  });
  handleServiceResult(res, result);
});

app.get('/api/status-config', (req, res) => {
  const statusList = [
    { key: 'all', label: '全部状态' },
    { key: APPLICATION_STATUS.PENDING, label: STATUS_MAP[APPLICATION_STATUS.PENDING].label },
    { key: APPLICATION_STATUS.APPROVED, label: STATUS_MAP[APPLICATION_STATUS.APPROVED].label },
    { key: APPLICATION_STATUS.REJECTED, label: STATUS_MAP[APPLICATION_STATUS.REJECTED].label }
  ];
  res.json({
    code: 0,
    message: 'success',
    data: statusList
  });
});

app.get('/api/business-types', (req, res) => {
  const typeList = [
    { key: 'all', label: '全部行业' },
    { key: BUSINESS_TYPE.CATERING, label: BUSINESS_TYPE_MAP[BUSINESS_TYPE.CATERING] },
    { key: BUSINESS_TYPE.RETAIL, label: BUSINESS_TYPE_MAP[BUSINESS_TYPE.RETAIL] },
    { key: BUSINESS_TYPE.SERVICE, label: BUSINESS_TYPE_MAP[BUSINESS_TYPE.SERVICE] },
    { key: BUSINESS_TYPE.EDUCATION, label: BUSINESS_TYPE_MAP[BUSINESS_TYPE.EDUCATION] },
    { key: BUSINESS_TYPE.OTHER, label: BUSINESS_TYPE_MAP[BUSINESS_TYPE.OTHER] }
  ];
  res.json({
    code: 0,
    message: 'success',
    data: typeList
  });
});

app.get('/api/city-levels', (req, res) => {
  const levelList = [
    { key: CITY_LEVEL.FIRST, label: CITY_LEVEL_MAP[CITY_LEVEL.FIRST] },
    { key: CITY_LEVEL.SECOND, label: CITY_LEVEL_MAP[CITY_LEVEL.SECOND] },
    { key: CITY_LEVEL.THIRD, label: CITY_LEVEL_MAP[CITY_LEVEL.THIRD] },
    { key: CITY_LEVEL.FOURTH, label: CITY_LEVEL_MAP[CITY_LEVEL.FOURTH] }
  ];
  res.json({
    code: 0,
    message: 'success',
    data: levelList
  });
});

app.listen(PORT, () => {
  console.log(`加盟商管理后台运行在 http://localhost:${PORT}`);
  console.log('====== 接口说明 ======');
  console.log('GET  /api/franchise-applications - 获取申请列表');
  console.log('GET  /api/franchise-applications/:id - 获取申请详情');
  console.log('GET  /api/franchise-applications/statistics - 获取统计数据');
  console.log('POST /api/franchise-applications/:id/approve - 审核通过');
  console.log('POST /api/franchise-applications/:id/reject - 审核驳回');
  console.log('GET  /api/status-config - 状态配置');
  console.log('GET  /api/business-types - 行业类型');
});
