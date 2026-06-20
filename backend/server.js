const express = require('express');
const cors = require('cors');
const { getAllProvinces, getCitiesByProvince } = require('./src/constants');
const { getApplicationList, getApplicationById, auditApplication, getStatistics, advanceStage, updateStageData, getStageStatistics, getApplicationRaw } = require('./src/franchiseService');
const { getStoreList, getStoreById, getStoreStatistics, createStore, createStoreFromApplication, removeStore, updateStoreStatus, updateStore, resetPassword } = require('./src/storeService');
const { getLevelList, getLevelById, createLevel, updateLevel, updateLevelStatus, removeLevel, getLevelStatistics } = require('./src/levelService');
const { getContractList, getContractById, createContract, createContractFromApplication, updateContract, updateContractStatus, removeContract, getContractStatistics, getContractByNo, getContractsByStoreNo } = require('./src/contractService');
const { getDepositList, getDepositById, createDeposit, createDepositFromContract, createDepositFromApplication, payDeposit, refundDeposit, getDepositStatistics, getDepositsByContractNo } = require('./src/depositService');
const { getServiceFeeList, getServiceFeeById, createServiceFee, payServiceFee, getServiceFeeStatistics } = require('./src/serviceFeeService');
const { initCityAssignments, getCityAssignmentList, getCityAssignmentByCity, getCityAssignmentStatistics, assignCityToPartner, updateCityAssignmentFromStore } = require('./src/cityService');

const app = express();
const PORT = 3060;

app.use(cors());
app.use(express.json());

initCityAssignments(
  require('./src/storeService').getStoreList({ page: 1, pageSize: 1000 }).list,
  require('./src/franchiseService').getAllApplicationsRaw()
);

const success = (res, data, message = 'success') => {
  res.json({ code: 200, message, data });
};

const fail = (res, code, message) => {
  res.status(code).json({ code, message, data: null });
};

app.get('/api/statistics', (req, res) => {
  const stats = getStatistics();
  success(res, stats);
});

app.get('/api/regions/provinces', (req, res) => {
  const provinces = getAllProvinces();
  success(res, provinces);
});

app.get('/api/regions/cities', (req, res) => {
  const { province } = req.query;
  const cities = getCitiesByProvince(province);
  success(res, cities);
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
  success(res, result);
});

app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const application = getApplicationById(id);
  if (!application) {
    return fail(res, 404, '申请不存在');
  }
  success(res, application);
});

app.put('/api/applications/:id/audit', (req, res) => {
  const { id } = req.params;
  const { status, auditOpinion, auditor } = req.body;
  try {
    const result = auditApplication(id, { status, auditOpinion, auditor });
    success(res, result);
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/applications/:id/advance-stage', (req, res) => {
  const { id } = req.params;
  const { stageData } = req.body;
  try {
    const result = advanceStage(id, stageData);

    if (result._triggerStoreCreate || result._triggerContractCreate || result._triggerDepositCreate || result._triggerCityAssign) {
      const appRaw = getApplicationRaw(id);
      if (appRaw) {
        if (result._triggerStoreCreate) {
          try {
            const store = createStoreFromApplication(appRaw);
            if (store) {
              updateCityAssignmentFromStore(store);
            }
          } catch (e) { console.error('Auto-create store failed:', e.message); }
        }
        if (result._triggerContractCreate) {
          try {
            const contract = createContractFromApplication(appRaw);
            if (contract && result._triggerDepositCreate) {
              try {
                createDepositFromApplication(appRaw);
              } catch (e) { console.error('Auto-create deposit from application failed:', e.message); }
            }
          } catch (e) { console.error('Auto-create contract failed:', e.message); }
        }
        if (result._triggerCityAssign && !result._triggerStoreCreate) {
          try {
            assignCityToPartner(appRaw.city, {
              name: appRaw.legalPerson,
              phone: appRaw.phone,
              companyName: appRaw.companyName
            });
          } catch (e) { console.error('Auto-assign city failed:', e.message); }
        }
      }
    }

    const cleanResult = { ...result };
    delete cleanResult._triggerStoreCreate;
    delete cleanResult._triggerContractCreate;
    delete cleanResult._triggerDepositCreate;
    delete cleanResult._triggerCityAssign;

    success(res, cleanResult, '阶段推进成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/applications/:id/stage-data/:stage', (req, res) => {
  const { id, stage } = req.params;
  try {
    const result = updateStageData(id, Number(stage), req.body);
    success(res, result, '更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.get('/api/applications/stats/stage', (req, res) => {
  const stageStats = getStageStatistics();
  success(res, stageStats);
});

app.get('/api/stores/statistics', (req, res) => {
  const stats = getStoreStatistics();
  success(res, stats);
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
  success(res, result);
});

app.get('/api/stores/:id', (req, res) => {
  const { id } = req.params;
  const store = getStoreById(id);
  if (!store) {
    return fail(res, 404, '门店不存在');
  }

  const contracts = getContractsByStoreNo(store.storeNo);
  const depositList = contracts.flatMap(c => getDepositsByContractNo(c.contractNo));

  success(res, { ...store, contracts, deposits: depositList });
});

app.post('/api/stores', (req, res) => {
  try {
    const store = createStore(req.body);
    updateCityAssignmentFromStore(store);
    success(res, store, '添加成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.delete('/api/stores/:id', (req, res) => {
  try {
    const { id } = req.params;
    removeStore(id);
    success(res, null, '删除成功');
  } catch (error) {
    fail(res, 404, error.message);
  }
});

app.put('/api/stores/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const store = updateStoreStatus(id, status);
    success(res, store, '状态更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/stores/:id', (req, res) => {
  try {
    const store = updateStore(req.params.id, req.body);
    success(res, store, '更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/stores/:id/reset-password', (req, res) => {
  try {
    const { newPassword } = req.body;
    const result = resetPassword(req.params.id, newPassword);
    success(res, result, '密码重置成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.get('/api/levels/statistics', (req, res) => {
  const stats = getLevelStatistics();
  success(res, stats);
});

app.get('/api/levels', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getLevelList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  success(res, result);
});

app.get('/api/levels/:id', (req, res) => {
  const level = getLevelById(req.params.id);
  if (!level) return fail(res, 404, '等级不存在');
  success(res, level);
});

app.post('/api/levels', (req, res) => {
  try {
    const level = createLevel(req.body);
    success(res, level, '添加成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/levels/:id', (req, res) => {
  try {
    const level = updateLevel(req.params.id, req.body);
    success(res, level, '更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/levels/:id/status', (req, res) => {
  try {
    const level = updateLevelStatus(req.params.id, req.body.status);
    success(res, level, '状态更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.delete('/api/levels/:id', (req, res) => {
  try {
    removeLevel(req.params.id);
    success(res, null, '删除成功');
  } catch (error) {
    fail(res, 404, error.message);
  }
});

app.get('/api/contracts/statistics', (req, res) => {
  const stats = getContractStatistics();
  success(res, stats);
});

app.get('/api/contracts', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getContractList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  success(res, result);
});

app.get('/api/contracts/:id', (req, res) => {
  const contract = getContractById(req.params.id);
  if (!contract) return fail(res, 404, '合同不存在');

  const depositList = getDepositsByContractNo(contract.contractNo);
  success(res, { ...contract, deposits: depositList });
});

app.post('/api/contracts', (req, res) => {
  try {
    const contract = createContract(req.body);
    success(res, contract, '添加成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/contracts/:id', (req, res) => {
  try {
    const contract = updateContract(req.params.id, req.body);
    success(res, contract, '更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/contracts/:id/status', (req, res) => {
  try {
    const contract = updateContractStatus(req.params.id, req.body.status);

    if (contract._triggerDepositCreate) {
      try {
        createDepositFromContract(contract);
      } catch (e) { console.error('Auto-create deposit from contract failed:', e.message); }
    }

    const cleanResult = { ...contract };
    delete cleanResult._triggerDepositCreate;
    success(res, cleanResult, '状态更新成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.delete('/api/contracts/:id', (req, res) => {
  try {
    removeContract(req.params.id);
    success(res, null, '删除成功');
  } catch (error) {
    fail(res, 404, error.message);
  }
});

app.get('/api/deposits/statistics', (req, res) => {
  const stats = getDepositStatistics();
  success(res, stats);
});

app.get('/api/deposits', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  const result = getDepositList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword });
  success(res, result);
});

app.get('/api/deposits/:id', (req, res) => {
  const deposit = getDepositById(req.params.id);
  if (!deposit) return fail(res, 404, '保证金记录不存在');
  success(res, deposit);
});

app.post('/api/deposits', (req, res) => {
  try {
    const deposit = createDeposit(req.body);
    success(res, deposit, '添加成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/deposits/:id/pay', (req, res) => {
  try {
    const deposit = payDeposit(req.params.id, req.body);
    success(res, deposit, '缴纳成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/deposits/:id/refund', (req, res) => {
  try {
    const deposit = refundDeposit(req.params.id, req.body);
    success(res, deposit, '退还成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.get('/api/service-fees/statistics', (req, res) => {
  const stats = getServiceFeeStatistics();
  success(res, stats);
});

app.get('/api/service-fees', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword, period } = req.query;
  const result = getServiceFeeList({ page: parseInt(page), pageSize: parseInt(pageSize), status, keyword, period });
  success(res, result);
});

app.get('/api/service-fees/:id', (req, res) => {
  const fee = getServiceFeeById(req.params.id);
  if (!fee) return fail(res, 404, '服务费记录不存在');
  success(res, fee);
});

app.post('/api/service-fees', (req, res) => {
  try {
    const fee = createServiceFee(req.body);
    success(res, fee, '添加成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.put('/api/service-fees/:id/pay', (req, res) => {
  try {
    const fee = payServiceFee(req.params.id, req.body);
    success(res, fee, '缴纳成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.get('/api/city-assignments/statistics', (req, res) => {
  const stats = getCityAssignmentStatistics();
  success(res, stats);
});

app.get('/api/city-assignments', (req, res) => {
  const { page = 1, pageSize = 10, province, status, keyword } = req.query;
  const result = getCityAssignmentList({ page: parseInt(page), pageSize: parseInt(pageSize), province, status, keyword });
  success(res, result);
});

app.get('/api/city-assignments/:city', (req, res) => {
  const assignment = getCityAssignmentByCity(req.params.city);
  if (!assignment) return fail(res, 404, '城市归属记录不存在');
  success(res, assignment);
});

app.post('/api/city-assignments', (req, res) => {
  try {
    const { city, partnerName, partnerPhone, companyName } = req.body;
    if (!city || !partnerName) {
      return fail(res, 400, '城市和合伙人姓名不能为空');
    }
    const result = assignCityToPartner(city, { name: partnerName, phone: partnerPhone || '', companyName: companyName || '' });
    success(res, result, '城市归属分配成功');
  } catch (error) {
    fail(res, 400, error.message);
  }
});

app.listen(PORT, () => {
  console.log(`加盟商管理后端服务已启动: http://localhost:${PORT}`);
});
