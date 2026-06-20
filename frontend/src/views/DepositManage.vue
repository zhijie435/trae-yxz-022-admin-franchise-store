<template>
  <div class="deposit-manage">
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
        <div class="stat-card total-amount">
          <div class="stat-icon">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ statistics.totalAmount?.toLocaleString() }}</div>
            <div class="stat-label">应收总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card total-paid">
          <div class="stat-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ statistics.totalPaid?.toLocaleString() }}</div>
            <div class="stat-label">已收总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card unpaid-count">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.unpaidCount }}</div>
            <div class="stat-label">未缴纳笔数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="缴纳状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="未缴纳" value="unpaid" />
            <el-option label="部分缴纳" value="partial" />
            <el-option label="已缴纳" value="paid" />
            <el-option label="已退还" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="编号/合伙人/门店名/合同号"
            style="width: 280px"
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
            添加保证金
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Coin /></el-icon>
            保证金记录
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="depositNo" label="编号" width="150" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.depositNo }}</span>
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
        <el-table-column label="应缴金额" width="120" align="center">
          <template #default="{ row }">
            <span class="money-text">¥{{ row.amount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已缴金额" width="120" align="center">
          <template #default="{ row }">
            <span class="money-text paid">¥{{ row.paidAmount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethodText" label="缴纳方式" width="110" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusTagType(row.status)"
              effect="light"
            >{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'unpaid' || row.status === 'partial'" type="success" link @click="handlePay(row)">
              <el-icon><Wallet /></el-icon>
              缴纳
            </el-button>
            <el-button v-if="row.status === 'paid'" type="warning" link @click="handleRefund(row)">
              <el-icon><RefreshLeft /></el-icon>
              退还
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
      v-model="addVisible"
      title="添加保证金"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" class="dialog-form">
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
            <el-form-item label="应缴金额" prop="amount">
              <el-input v-model.number="addForm.amount" placeholder="请输入应缴金额" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="缴纳方式" prop="paymentMethod">
              <el-select v-model="addForm.paymentMethod" placeholder="请选择缴纳方式" style="width: 100%">
                <el-option label="银行转账" value="bank_transfer" />
                <el-option label="在线支付" value="online" />
                <el-option label="现金" value="cash" />
                <el-option label="支票" value="check" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitAdd">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="payVisible"
      title="缴纳保证金"
      width="560px"
      :close-on-click-modal="false"
    >
      <div v-if="payRow" class="pay-info">
        <el-descriptions :column="2" border size="small" class="pay-desc">
          <el-descriptions-item label="编号">{{ payRow.depositNo }}</el-descriptions-item>
          <el-descriptions-item label="合同号">{{ payRow.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ payRow.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ payRow.storeName }}</el-descriptions-item>
          <el-descriptions-item label="应缴金额">¥{{ payRow.amount?.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="已缴金额">¥{{ payRow.paidAmount?.toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="payForm" :rules="payRules" ref="payFormRef" label-width="100px" class="dialog-form" style="margin-top: 16px">
        <el-form-item label="缴纳金额" prop="paidAmount">
          <el-input v-model.number="payForm.paidAmount" placeholder="请输入本次缴纳金额" type="number" />
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
      <template #footer>
        <el-button @click="payVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitPay">确认缴纳</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="refundVisible"
      title="退还保证金"
      width="560px"
      :close-on-click-modal="false"
    >
      <div v-if="refundRow" class="pay-info">
        <el-descriptions :column="2" border size="small" class="pay-desc">
          <el-descriptions-item label="编号">{{ refundRow.depositNo }}</el-descriptions-item>
          <el-descriptions-item label="合同号">{{ refundRow.contractNo }}</el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ refundRow.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ refundRow.storeName }}</el-descriptions-item>
          <el-descriptions-item label="应缴金额">¥{{ refundRow.amount?.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="已缴金额">¥{{ refundRow.paidAmount?.toLocaleString() }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="refundForm" :rules="refundRules" ref="refundFormRef" label-width="100px" class="dialog-form" style="margin-top: 16px">
        <el-form-item label="退还金额" prop="refundAmount">
          <el-input v-model.number="refundForm.refundAmount" placeholder="请输入退还金额" type="number" />
        </el-form-item>
        <el-form-item label="退还日期" prop="refundDate">
          <el-date-picker
            v-model="refundForm.refundDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择退还日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="handleSubmitRefund">确认退还</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="保证金详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="编号">
            <span class="mono-text">{{ currentDetail.depositNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合同号">
            <span class="mono-text">{{ currentDetail.contractNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="缴纳方式">{{ currentDetail.paymentMethodText }}</el-descriptions-item>
          <el-descriptions-item label="应缴金额">
            <span class="money-text">¥{{ currentDetail.amount?.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已缴金额">
            <span class="money-text paid">¥{{ currentDetail.paidAmount?.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentDetail.status)" effect="light">{{ currentDetail.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="缴纳日期">{{ currentDetail.paymentDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="退还日期">{{ currentDetail.refundDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getDepositList,
  getDepositStatistics,
  addDeposit,
  payDeposit,
  refundDeposit,
  getDepositDetail
} from '../api/deposit.js';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const statistics = ref({
  total: 0,
  totalAmount: 0,
  totalPaid: 0,
  unpaidCount: 0
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

const addVisible = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  contractNo: '',
  partnerName: '',
  storeName: '',
  storeNo: '',
  levelName: '',
  amount: '',
  paymentMethod: '',
  remark: ''
});

const addRules = {
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  storeNo: [{ required: true, message: '请输入门店编号', trigger: 'blur' }],
  levelName: [{ required: true, message: '请输入加盟等级', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入应缴金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择缴纳方式', trigger: 'change' }]
};

const payVisible = ref(false);
const payFormRef = ref(null);
const payRow = ref(null);
const payForm = reactive({
  paidAmount: '',
  paymentDate: ''
});

const payRules = {
  paidAmount: [{ required: true, message: '请输入缴纳金额', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '请选择缴纳日期', trigger: 'change' }]
};

const refundVisible = ref(false);
const refundFormRef = ref(null);
const refundRow = ref(null);
const refundForm = reactive({
  refundAmount: '',
  refundDate: ''
});

const refundRules = {
  refundAmount: [{ required: true, message: '请输入退还金额', trigger: 'blur' }],
  refundDate: [{ required: true, message: '请选择退还日期', trigger: 'change' }]
};

const detailVisible = ref(false);
const currentDetail = ref(null);

const statusTagType = (status) => {
  const map = { unpaid: 'info', partial: 'warning', paid: 'success', refunded: 'primary' };
  return map[status] || 'info';
};

const loadStatistics = async () => {
  try {
    statistics.value = await getDepositStatistics();
  } catch (e) {
    console.error('加载保证金统计失败', e);
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
    const result = await getDepositList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载保证金列表失败');
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
  Object.assign(addForm, {
    contractNo: '',
    partnerName: '',
    storeName: '',
    storeNo: '',
    levelName: '',
    amount: '',
    paymentMethod: '',
    remark: ''
  });
  addVisible.value = true;
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
    await addDeposit({ ...addForm });
    ElMessage.success('保证金添加成功');
    addVisible.value = false;
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
  Object.assign(payForm, { paidAmount: '', paymentDate: '' });
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
    await payDeposit(payRow.value.id, { ...payForm });
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

const handleRefund = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要退还【${row.depositNo}】的保证金吗？`,
      '退还保证金',
      {
        confirmButtonText: '确认退还',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
  } catch (e) {
    return;
  }
  refundRow.value = row;
  Object.assign(refundForm, { refundAmount: row.paidAmount, refundDate: '' });
  refundVisible.value = true;
};

const handleSubmitRefund = async () => {
  if (!refundFormRef.value) return;
  try {
    await refundFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await refundDeposit(refundRow.value.id, { ...refundForm });
    ElMessage.success('退还成功');
    refundVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '退还失败');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getDepositDetail(row.id);
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
.deposit-manage {
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

.stat-card.total-amount .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.total-paid .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.unpaid-count .stat-icon {
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
  font-weight: 600;
  color: #303133;
}

.money-text.paid {
  color: #67c23a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-form {
  padding: 4px 8px;
}

.pay-info {
  padding: 0 8px;
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
