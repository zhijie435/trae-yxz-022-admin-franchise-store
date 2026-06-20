<template>
  <div class="service-fee-manage">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">全部记录</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card fee-amount">
          <div class="stat-icon">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ statistics.totalFeeAmount.toLocaleString() }}</div>
            <div class="stat-label">应收总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card paid-amount">
          <div class="stat-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ statistics.totalPaid.toLocaleString() }}</div>
            <div class="stat-label">已收总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card overdue">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.overdue }}</div>
            <div class="stat-label">逾期笔数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="缴纳状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待缴纳" value="pending" />
            <el-option label="部分缴纳" value="partial" />
            <el-option label="已缴纳" value="paid" />
            <el-option label="逾期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item label="账期">
          <el-select v-model="filterForm.period" placeholder="全部账期" style="width: 140px" clearable @change="handleSearch">
            <el-option label="2025-Q1" value="2025-Q1" />
            <el-option label="2025-Q2" value="2025-Q2" />
            <el-option label="2025-Q3" value="2025-Q3" />
            <el-option label="2025-Q4" value="2025-Q4" />
            <el-option label="2026-Q1" value="2026-Q1" />
            <el-option label="2026-Q2" value="2026-Q2" />
            <el-option label="2026-Q3" value="2026-Q3" />
            <el-option label="2026-Q4" value="2026-Q4" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="编号/合伙人/门店名"
            style="width: 240px"
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
            添加服务费
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Coin /></el-icon>
            服务费记录
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="feeNo" label="编号" width="150" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.feeNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contractNo" label="合同号" width="150" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.contractNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="partnerName" label="合伙人" width="120" align="center" />
        <el-table-column prop="storeName" label="门店名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="levelName" label="等级" width="100" align="center" />
        <el-table-column label="费率" width="80" align="center">
          <template #default="{ row }">
            {{ row.feeRate }}%
          </template>
        </el-table-column>
        <el-table-column label="营收额" width="120" align="right">
          <template #default="{ row }">
            <span class="money-text">¥{{ row.revenueAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="应缴额" width="120" align="right">
          <template #default="{ row }">
            <span class="money-text">¥{{ row.feeAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已缴额" width="120" align="right">
          <template #default="{ row }">
            <span class="money-text paid">¥{{ row.paidAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="账期" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning" effect="light">待缴纳</el-tag>
            <el-tag v-else-if="row.status === 'partial'" type="warning" effect="light">部分缴纳</el-tag>
            <el-tag v-else-if="row.status === 'paid'" type="success" effect="light">已缴纳</el-tag>
            <el-tag v-else-if="row.status === 'overdue'" type="danger" effect="light">逾期</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'paid'" type="primary" link @click="handlePay(row)">
              <el-icon><Coin /></el-icon>
              缴纳
            </el-button>
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              详情
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
      title="添加服务费"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="addForm.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合伙人姓名" prop="partnerName">
              <el-input v-model="addForm.partnerName" placeholder="请输入合伙人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="addForm.storeName" placeholder="请输入门店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店编号" prop="storeNo">
              <el-input v-model="addForm.storeNo" placeholder="请输入门店编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加盟等级" prop="levelName">
              <el-input v-model="addForm.levelName" placeholder="请输入加盟等级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务费率(%)" prop="feeRate">
              <el-input-number v-model="addForm.feeRate" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="营收金额" prop="revenueAmount">
              <el-input-number v-model="addForm.revenueAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账期" prop="period">
              <el-input v-model="addForm.period" placeholder="如 2026-Q2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="addForm.startDate"
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
                v-model="addForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitAdd">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="payVisible"
      title="缴纳服务费"
      width="520px"
      :close-on-click-modal="false"
    >
      <div v-if="payRow" class="pay-info">
        <el-descriptions :column="2" border size="small" class="pay-desc">
          <el-descriptions-item label="编号">{{ payRow.feeNo }}</el-descriptions-item>
          <el-descriptions-item label="账期">{{ payRow.period }}</el-descriptions-item>
          <el-descriptions-item label="应缴额">¥{{ payRow.feeAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="已缴额">¥{{ payRow.paidAmount.toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="payForm" :rules="payFormRules" ref="payFormRef" label-width="100px" style="margin-top: 20px">
          <el-form-item label="缴纳金额" prop="paidAmount">
            <el-input-number v-model="payForm.paidAmount" :min="0.01" :precision="2" style="width: 100%" />
          </el-form-item>
          <el-form-item label="缴纳日期" prop="paymentDate">
            <el-date-picker
              v-model="payForm.paymentDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择缴纳日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="payVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitPay">确认缴纳</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="服务费详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="编号">
            <span class="mono-text">{{ currentDetail.feeNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合同号">
            <span class="mono-text">{{ currentDetail.contractNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="服务费率">{{ currentDetail.feeRate }}%</el-descriptions-item>
          <el-descriptions-item label="营收金额">¥{{ currentDetail.revenueAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="应缴金额">¥{{ currentDetail.feeAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="已缴金额">¥{{ currentDetail.paidAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="账期">{{ currentDetail.period }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentDetail.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentDetail.endDate }}</el-descriptions-item>
          <el-descriptions-item label="缴纳状态">
            <el-tag v-if="currentDetail.status === 'pending'" type="warning" effect="light">待缴纳</el-tag>
            <el-tag v-else-if="currentDetail.status === 'partial'" type="warning" effect="light">部分缴纳</el-tag>
            <el-tag v-else-if="currentDetail.status === 'paid'" type="success" effect="light">已缴纳</el-tag>
            <el-tag v-else-if="currentDetail.status === 'overdue'" type="danger" effect="light">逾期</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getServiceFeeList,
  getServiceFeeStatistics,
  addServiceFee,
  payServiceFee,
  getServiceFeeDetail
} from '../api/serviceFee.js';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const statistics = ref({
  total: 0,
  totalFeeAmount: 0,
  totalPaid: 0,
  overdue: 0
});

const filterForm = reactive({
  status: '',
  period: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const formVisible = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  contractNo: '',
  partnerName: '',
  storeName: '',
  storeNo: '',
  levelName: '',
  feeRate: null,
  revenueAmount: null,
  period: '',
  startDate: '',
  endDate: '',
  remark: ''
});

const addFormRules = {
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  storeNo: [{ required: true, message: '请输入门店编号', trigger: 'blur' }],
  levelName: [{ required: true, message: '请输入加盟等级', trigger: 'blur' }],
  feeRate: [{ required: true, message: '请输入服务费率', trigger: 'blur' }],
  revenueAmount: [{ required: true, message: '请输入营收金额', trigger: 'blur' }],
  period: [{ required: true, message: '请输入账期', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
};

const payVisible = ref(false);
const payRow = ref(null);
const payFormRef = ref(null);
const payForm = reactive({
  paidAmount: null,
  paymentDate: ''
});

const payFormRules = {
  paidAmount: [{ required: true, message: '请输入缴纳金额', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '请选择缴纳日期', trigger: 'change' }]
};

const detailVisible = ref(false);
const currentDetail = ref(null);

const loadStatistics = async () => {
  try {
    statistics.value = await getServiceFeeStatistics();
  } catch (e) {
    console.error('加载服务费统计失败', e);
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
    if (filterForm.period) params.period = filterForm.period;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    const result = await getServiceFeeList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载服务费列表失败');
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
  filterForm.period = '';
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
  Object.assign(addForm, {
    contractNo: '',
    partnerName: '',
    storeName: '',
    storeNo: '',
    levelName: '',
    feeRate: null,
    revenueAmount: null,
    period: '',
    startDate: '',
    endDate: '',
    remark: ''
  });
  formVisible.value = true;
};

const handleSubmitAdd = async () => {
  if (!addFormRef.value) return;
  try {
    await addFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await addServiceFee({ ...addForm });
    ElMessage.success('服务费添加成功');
    formVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '添加失败');
  } finally {
    submitting.value = false;
  }
};

const handlePay = (row) => {
  payRow.value = row;
  payForm.paidAmount = null;
  payForm.paymentDate = '';
  payVisible.value = true;
};

const handleSubmitPay = async () => {
  if (!payFormRef.value) return;
  try {
    await payFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await payServiceFee(payRow.value.id, { ...payForm });
    ElMessage.success('缴纳成功');
    payVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '缴纳失败');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getServiceFeeDetail(row.id);
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
.service-fee-manage {
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

.stat-card.fee-amount .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.paid-amount .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.overdue .stat-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
  font-size: 12.5px;
  font-weight: 500;
}

.money-text.paid {
  color: #67c23a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-form {
  padding: 4px 8px;
}

.pay-info {
  padding: 4px 0;
}

.pay-desc {
  margin-bottom: 0;
}

.detail-content {
  padding: 4px 0;
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
