<template>
  <div class="contract-manage">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">全部合同</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.pending }}</div>
            <div class="stat-label">待签约</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card active">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.active }}</div>
            <div class="stat-label">生效中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card expired">
          <div class="stat-icon">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.expired }}</div>
            <div class="stat-label">已到期</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="合同状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待签约" value="pending" />
            <el-option label="生效中" value="active" />
            <el-option label="已到期" value="expired" />
            <el-option label="已终止" value="terminated" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="合同编号/合伙人/门店名/公司名"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加合同
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Document /></el-icon>
            全部合同信息
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractNo" label="合同编号" width="160" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.contractNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="partnerName" label="合伙人" width="120" align="center" />
        <el-table-column prop="storeName" label="门店名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="levelName" label="加盟等级" width="130" align="center">
          <template #default="{ row }">
            <el-tag effect="light" :type="levelTagType(row.levelName)">{{ row.levelName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="合同期限" width="200" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.startDate }} ~ {{ row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="保证金" width="120" align="center">
          <template #default="{ row }">
            <span class="money-text">¥{{ formatMoney(row.depositAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务费率" width="100" align="center">
          <template #default="{ row }">
            <span class="rate-text">{{ row.serviceFeeRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="light">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button v-if="row.status !== 'terminated'" type="warning" link @click="handleTerminate(row)">
              <el-icon><CircleClose /></el-icon>
              终止
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="formVisible"
      title="添加合同"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="contractForm" :rules="formRules" ref="contractFormRef" label-width="100px" class="add-contract-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合伙人姓名" prop="partnerName">
              <el-input v-model="contractForm.partnerName" placeholder="请输入合伙人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="partnerPhone">
              <el-input v-model="contractForm.partnerPhone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="contractForm.companyName" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="contractForm.storeName" placeholder="请输入门店名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店编号" prop="storeNo">
              <el-input v-model="contractForm.storeNo" placeholder="请输入门店编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加盟等级" prop="levelName">
              <el-select v-model="contractForm.levelName" placeholder="请选择加盟等级" style="width: 100%">
                <el-option label="标准加盟商" value="标准加盟商" />
                <el-option label="银牌加盟商" value="银牌加盟商" />
                <el-option label="金牌加盟商" value="金牌加盟商" />
                <el-option label="钻石加盟商" value="钻石加盟商" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="contractForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择开始日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="contractForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保证金金额" prop="depositAmount">
              <el-input v-model="contractForm.depositAmount" placeholder="请输入保证金金额" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务费率" prop="serviceFeeRate">
              <el-input v-model="contractForm.serviceFeeRate" placeholder="请输入服务费率">
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注说明">
          <el-input v-model="contractForm.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitAdd">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="合同详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同编号">
            <span class="mono-text">{{ currentDetail.contractNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentDetail.status)" effect="light">{{ statusLabel(currentDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <el-link type="primary">{{ currentDetail.partnerPhone }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="公司名称">{{ currentDetail.companyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="门店编号">
            <span class="mono-text">{{ currentDetail.storeNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentDetail.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentDetail.endDate }}</el-descriptions-item>
          <el-descriptions-item label="保证金金额">
            <span class="money-text">¥{{ formatMoney(currentDetail.depositAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="服务费率">
            <span class="rate-text">{{ currentDetail.serviceFeeRate }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="1">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="1">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider v-if="currentDetail.deposits && currentDetail.deposits.length > 0">关联保证金</el-divider>
        <div v-if="currentDetail.deposits && currentDetail.deposits.length > 0" class="related-section">
          <el-table :data="currentDetail.deposits" size="small" border>
            <el-table-column prop="depositNo" label="编号" width="140" align="center">
              <template #default="{ row }"><span class="mono-text">{{ row.depositNo }}</span></template>
            </el-table-column>
            <el-table-column label="应缴金额" width="110" align="center">
              <template #default="{ row }">¥{{ row.amount?.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column label="已缴金额" width="110" align="center">
              <template #default="{ row }">¥{{ row.paidAmount?.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="paymentMethodText" label="缴纳方式" width="100" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'unpaid' ? 'info' : row.status === 'partial' ? 'warning' : 'primary'" effect="light" size="small">{{ row.statusText }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getContractList,
  getContractStatistics,
  addContract,
  updateContractStatus,
  deleteContract,
  getContractDetail
} from '../api/contract.js';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const statistics = ref({
  total: 0,
  pending: 0,
  active: 0,
  expired: 0
});

const filterForm = reactive({
  status: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const formVisible = ref(false);
const contractFormRef = ref(null);
const contractForm = reactive({
  partnerName: '',
  partnerPhone: '',
  companyName: '',
  storeName: '',
  storeNo: '',
  levelName: '',
  startDate: '',
  endDate: '',
  depositAmount: '',
  serviceFeeRate: '',
  remark: ''
});

const formRules = {
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  partnerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  storeNo: [{ required: true, message: '请输入门店编号', trigger: 'blur' }],
  levelName: [{ required: true, message: '请选择加盟等级', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  depositAmount: [{ required: true, message: '请输入保证金金额', trigger: 'blur' }],
  serviceFeeRate: [{ required: true, message: '请输入服务费率', trigger: 'blur' }]
};

const detailVisible = ref(false);
const currentDetail = ref(null);

const statusTagType = (status) => {
  const map = { pending: 'warning', active: 'success', expired: 'info', terminated: 'danger' };
  return map[status] || 'info';
};

const statusLabel = (status) => {
  const map = { pending: '待签约', active: '生效中', expired: '已到期', terminated: '已终止' };
  return map[status] || status;
};

const levelTagType = (levelName) => {
  const map = { '钻石加盟商': 'danger', '金牌加盟商': 'warning', '银牌加盟商': '', '标准加盟商': 'info' };
  return map[levelName] || 'info';
};

const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('zh-CN');
};

const loadStatistics = async () => {
  try {
    statistics.value = await getContractStatistics();
  } catch (e) {
    console.error('加载合同统计失败', e);
  }
};

const loadList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (filterForm.status) params.status = filterForm.status;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    const result = await getContractList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载合同列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadList();
};

const handleReset = () => {
  filterForm.status = '';
  filterForm.keyword = '';
  pagination.page = 1;
  loadList();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadList();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  loadList();
};

const handleAdd = () => {
  Object.assign(contractForm, {
    partnerName: '',
    partnerPhone: '',
    companyName: '',
    storeName: '',
    storeNo: '',
    levelName: '',
    startDate: '',
    endDate: '',
    depositAmount: '',
    serviceFeeRate: '',
    remark: ''
  });
  formVisible.value = true;
};

const handleSubmitAdd = async () => {
  if (!contractFormRef.value) return;
  try {
    await contractFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await addContract({ ...contractForm });
    ElMessage.success('合同添加成功');
    formVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '添加失败');
  } finally {
    submitting.value = false;
  }
};

const handleTerminate = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要终止合同【${row.contractNo}】吗？终止后将无法恢复！`,
      '终止合同',
      {
        confirmButtonText: '确认终止',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
  } catch (e) {
    return;
  }

  try {
    await updateContractStatus(row.id, 'terminated');
    ElMessage.success('合同已终止');
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '终止失败');
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除合同【${row.contractNo}】吗？删除后无法恢复！`,
      '删除合同',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
  } catch (e) {
    return;
  }

  try {
    await deleteContract(row.id);
    ElMessage.success('删除成功');
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '删除失败');
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getContractDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

onMounted(() => {
  loadStatistics();
  loadList();
});
</script>

<style scoped>
.contract-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.active .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.expired .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.filter-card {
  border-radius: 10px;
}

.filter-form {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.table-card {
  border-radius: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #3b82f6;
}

.mono-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12.5px;
  font-weight: 500;
}

.money-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  color: #e6a23c;
}

.rate-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 500;
  color: #409eff;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-contract-form {
  padding: 4px 8px;
}

.detail-content {
  padding: 4px 0;
}

.related-section {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 14px;
  }
  .stat-value {
    font-size: 22px;
  }
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
</style>
