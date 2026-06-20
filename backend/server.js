const express = require('express');
const cors = require('cors');
const { getAllProvinces, getCitiesByProvince } = require('./src/constants');
const { getApplicationList, getApplicationById, auditApplication, getStatistics, advanceStage, updateStageData, getStageStatistics } = require('./src/franchiseService');
const { getStoreList, getStoreById, getStoreStatistics, createStore, removeStore, updateStoreStatus, updateStore, resetPassword } = require('./src/storeService');
const { getLevelList, getLevelById, createLevel, updateLevel, updateLevelStatus, removeLevel, getLevelStatistics } = require('./src/levelService');
const { getContractList, getContractById, createContract, updateContract, updateContractStatus, removeContract, getContractStatistics } = require('./src/contractService');
const { getDepositList, getDepositById, createDeposit, payDeposit, refundDeposit, getDepositStatistics } = require('./src/depositService');
const { getServiceFeeList, getServiceFeeById, createServiceFee, payServiceFee, getServiceFeeStatistics } = require('./src/serviceFeeService');

const app = express();
const PORT = 3060;

app.use(cors());
app.use(express.json());

app.get('/api/statistics', (req, res) => {
  const stats = getStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/regions/provinces', (req, res) => {
  const provinces = getAllProvinces();
  res.json({ code: 200, message: 'success', data: provinces });
});

app.get('/api/regions/cities', (req, res) => {
  const { province } = req.query;
  const cities = getCitiesByProvince(province);
  res.json({ code: 200, message: 'success', data: cities });
});

app.get('/api/applications', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, province, city, stage } = req.query;
  const result = getApplicationList({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    status,
    keyword,
    province,
    city,
    stage
  });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const application = getApplicationById(id);
  if (!application) {
    return res.status(404).json({ code: 404, message: '申请不存在', data: null });
  }
  res.json({ code: 200, message: 'success', data: application });
});

app.put('/api/applications/:id/audit', (req, res) => {
  const { id } = req.params;
  const { status, auditOpinion, auditor } = req.body;
  try {
    const result = auditApplication(id, { status, auditOpinion, auditor });
    res.json({ code: 200, message: 'success', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/applications/:id/advance-stage', (req, res) => {
  const { id } = req.params;
  const { stageData } = req.body;
  try {
    const result = advanceStage(id, stageData);
    res.json({ code: 200, message: '阶段推进成功', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/applications/:id/stage-data/:stage', (req, res) => {
  const { id, stage } = req.params;
  try {
    const result = updateStageData(id, Number(stage), req.body);
    res.json({ code: 200, message: '更新成功', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.get('/api/applications/stats/stage', (req, res) => {
  const stageStats = getStageStatistics();
  res.json({ code: 200, message: 'success', data: stageStats });
});

app.get('/api/stores/statistics', (req, res) => {
  const stats = getStoreStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/stores', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, province, city } = req.query;
  const result = getStoreList({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    status,
    keyword,
    province,
    city
  });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/stores/:id', (req, res) => {
  const { id } = req.params;
  const store = getStoreById(id);
  if (!store) {
    return res.status(404).json({ code: 404, message: '门店不存在', data: null });
  }
  res.json({ code: 200, message: 'success', data: store });
});

app.post('/api/stores', (req, res) => {
  try {
    const store = createStore(req.body);
    res.json({ code: 200, message: '添加成功', data: store });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.delete('/api/stores/:id', (req, res) => {
  try {
    const { id } = req.params;
    removeStore(id);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    res.status(404).json({ code: 404, message: error.message, data: null });
  }
});

app.put('/api/stores/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const store = updateStoreStatus(id, status);
    res.json({ code: 200, message: '状态更新成功', data: store });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/stores/:id', (req, res) => {
  try {
    const store = updateStore(req.params.id, req.body);
    res.json({ code: 200, message: '更新成功', data: store });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/stores/:id/reset-password', (req, res) => {
  try {
    const { newPassword } = req.body;
    const result = resetPassword(req.params.id, newPassword);
    res.json({ code: 200, message: '密码重置成功', data: result });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.get('/api/levels/statistics', (req, res) => {
  const stats = getLevelStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/levels', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getLevelList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/levels/:id', (req, res) => {
  const level = getLevelById(req.params.id);
  if (!level) return res.status(404).json({ code: 404, message: '等级不存在', data: null });
  res.json({ code: 200, message: 'success', data: level });
});

app.post('/api/levels', (req, res) => {
  try {
    const level = createLevel(req.body);
    res.json({ code: 200, message: '添加成功', data: level });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/levels/:id', (req, res) => {
  try {
    const level = updateLevel(req.params.id, req.body);
    res.json({ code: 200, message: '更新成功', data: level });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/levels/:id/status', (req, res) => {
  try {
    const level = updateLevelStatus(req.params.id, req.body.status);
    res.json({ code: 200, message: '状态更新成功', data: level });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.delete('/api/levels/:id', (req, res) => {
  try {
    removeLevel(req.params.id);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    res.status(404).json({ code: 404, message: error.message, data: null });
  }
});

app.get('/api/contracts/statistics', (req, res) => {
  const stats = getContractStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/contracts', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getContractList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/contracts/:id', (req, res) => {
  const contract = getContractById(req.params.id);
  if (!contract) return res.status(404).json({ code: 404, message: '合同不存在', data: null });
  res.json({ code: 200, message: 'success', data: contract });
});

app.post('/api/contracts', (req, res) => {
  try {
    const contract = createContract(req.body);
    res.json({ code: 200, message: '添加成功', data: contract });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/contracts/:id', (req, res) => {
  try {
    const contract = updateContract(req.params.id, req.body);
    res.json({ code: 200, message: '更新成功', data: contract });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/contracts/:id/status', (req, res) => {
  try {
    const contract = updateContractStatus(req.params.id, req.body.status);
    res.json({ code: 200, message: '状态更新成功', data: contract });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.delete('/api/contracts/:id', (req, res) => {
  try {
    removeContract(req.params.id);
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (error) {
    res.status(404).json({ code: 404, message: error.message, data: null });
  }
});

app.get('/api/deposits/statistics', (req, res) => {
  const stats = getDepositStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/deposits', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getDepositList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/deposits/:id', (req, res) => {
  const deposit = getDepositById(req.params.id);
  if (!deposit) return res.status(404).json({ code: 404, message: '保证金记录不存在', data: null });
  res.json({ code: 200, message: 'success', data: deposit });
});

app.post('/api/deposits', (req, res) => {
  try {
    const deposit = createDeposit(req.body);
    res.json({ code: 200, message: '添加成功', data: deposit });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/deposits/:id/pay', (req, res) => {
  try {
    const deposit = payDeposit(req.params.id, req.body);
    res.json({ code: 200, message: '缴纳成功', data: deposit });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/deposits/:id/refund', (req, res) => {
  try {
    const deposit = refundDeposit(req.params.id, req.body);
    res.json({ code: 200, message: '退还成功', data: deposit });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.get('/api/service-fees/statistics', (req, res) => {
  const stats = getServiceFeeStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/service-fees', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, period } = req.query;
  const result = getServiceFeeList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword, period });
  res.json({ code: 200, message: 'success', data: result });
});

app.get('/api/service-fees/:id', (req, res) => {
  const fee = getServiceFeeById(req.params.id);
  if (!fee) return res.status(404).json({ code: 404, message: '服务费记录不存在', data: null });
  res.json({ code: 200, message: 'success', data: fee });
});

app.post('/api/service-fees', (req, res) => {
  try {
    const fee = createServiceFee(req.body);
    res.json({ code: 200, message: '添加成功', data: fee });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.put('/api/service-fees/:id/pay', (req, res) => {
  try {
    const fee = payServiceFee(req.params.id, req.body);
    res.json({ code: 200, message: '缴纳成功', data: fee });
  } catch (error) {
    res.status(400).json({ code: 400, message: error.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`加盟商管理后端服务已启动: http://localhost:${PORT}`);
});
