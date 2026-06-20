const express = require('express');
const cors = require('cors');
const { getApplicationList, getApplicationById, auditApplication, getStatistics } = require('./src/franchiseService');
const { getStoreList, getStoreById, getStoreStatistics, createStore, removeStore, updateStoreStatus } = require('./src/storeService');

const app = express();
const PORT = 3060;

app.use(cors());
app.use(express.json());

app.get('/api/statistics', (req, res) => {
  const stats = getStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/applications', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, city } = req.query;
  const result = getApplicationList({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    status,
    keyword,
    city
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

app.get('/api/stores/statistics', (req, res) => {
  const stats = getStoreStatistics();
  res.json({ code: 200, message: 'success', data: stats });
});

app.get('/api/stores', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, city } = req.query;
  const result = getStoreList({
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    status,
    keyword,
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

app.listen(PORT, () => {
  console.log(`加盟商管理后端服务已启动: http://localhost:${PORT}`);
});
