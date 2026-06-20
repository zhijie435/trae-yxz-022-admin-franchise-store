<template>
  <div class="franchise-level">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">全部等级</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card enabled">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.enabled }}</div>
            <div class="stat-label">已启用</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card disabled">
          <div class="stat-icon">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.disabled }}</div>
            <div class="stat-label">已禁用</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card avg-deposit">
          <div class="stat-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ statistics.avgDeposit?.toLocaleString() || 0 }}</div>
            <div class="stat-label">平均保证金</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="已启用" value="enabled" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="等级名称/编码"
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
            添加等级
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Trophy /></el-icon>
            全部等级信息
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="levelCode" label="等级编码" width="120" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.levelCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="levelName" label="等级名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="保证金金额" width="130" align="center">
          <template #default="{ row }">
            <span class="mono-text deposit-text">¥{{ row.depositAmount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务费率" width="100" align="center">
          <template #default="{ row }">
            {{ row.serviceFeeRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="minStoreArea" label="最小面积" width="100" align="center">
          <template #default="{ row }">
            {{ row.minStoreArea }}㎡
          </template>
        </el-table-column>
        <el-table-column prop="maxStores" label="最大门店数" width="110" align="center" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              :active-text="row.status === 'enabled' ? '启用' : '禁用'"
              :loading="togglingId === row.id"
              @change="(val) => handleToggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
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
      v-model="addVisible"
      title="添加加盟商等级"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="levelForm" :rules="formRules" ref="addFormRef" label-width="110px" class="level-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级名称" prop="levelName">
              <el-input v-model="levelForm.levelName" placeholder="请输入等级名称" maxlength="30" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级编码" prop="levelCode">
              <el-input v-model="levelForm.levelCode" placeholder="如 LEVEL_GOLD" maxlength="20" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保证金金额" prop="depositAmount">
              <el-input-number v-model="levelForm.depositAmount" :min="0" :precision="2" :step="1000" style="width: 100%" placeholder="请输入保证金金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务费率(%)" prop="serviceFeeRate">
              <el-input-number v-model="levelForm.serviceFeeRate" :min="0" :max="100" :precision="2" :step="0.5" style="width: 100%" placeholder="请输入服务费率" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小面积(㎡)" prop="minStoreArea">
              <el-input-number v-model="levelForm.minStoreArea" :min="0" :precision="0" :step="10" style="width: 100%" placeholder="请输入最小面积" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大门店数" prop="maxStores">
              <el-input-number v-model="levelForm.maxStores" :min="1" :precision="0" :step="1" style="width: 100%" placeholder="请输入最大门店数" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="levelForm.description" type="textarea" :rows="3" placeholder="选填，等级描述" />
        </el-form-item>
        <el-form-item label="权益说明">
          <el-input v-model="levelForm.benefits" type="textarea" :rows="3" placeholder="选填，权益说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitAdd">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editVisible"
      title="编辑加盟商等级"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="110px" class="level-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级名称" prop="levelName">
              <el-input v-model="editForm.levelName" placeholder="请输入等级名称" maxlength="30" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级编码" prop="levelCode">
              <el-input v-model="editForm.levelCode" placeholder="如 LEVEL_GOLD" maxlength="20" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保证金金额" prop="depositAmount">
              <el-input-number v-model="editForm.depositAmount" :min="0" :precision="2" :step="1000" style="width: 100%" placeholder="请输入保证金金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务费率(%)" prop="serviceFeeRate">
              <el-input-number v-model="editForm.serviceFeeRate" :min="0" :max="100" :precision="2" :step="0.5" style="width: 100%" placeholder="请输入服务费率" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小面积(㎡)" prop="minStoreArea">
              <el-input-number v-model="editForm.minStoreArea" :min="0" :precision="0" :step="10" style="width: 100%" placeholder="请输入最小面积" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大门店数" prop="maxStores">
              <el-input-number v-model="editForm.maxStores" :min="1" :precision="0" :step="1" style="width: 100%" placeholder="请输入最大门店数" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="选填，等级描述" />
        </el-form-item>
        <el-form-item label="权益说明">
          <el-input v-model="editForm.benefits" type="textarea" :rows="3" placeholder="选填，权益说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitEdit">确认保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="等级详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="等级编码">
            <span class="mono-text">{{ currentDetail.levelCode }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="等级名称">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="保证金金额">
            <span class="mono-text deposit-text">¥{{ currentDetail.depositAmount?.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="服务费率">{{ currentDetail.serviceFeeRate }}%</el-descriptions-item>
          <el-descriptions-item label="最小面积">{{ currentDetail.minStoreArea }}㎡</el-descriptions-item>
          <el-descriptions-item label="最大门店数">{{ currentDetail.maxStores }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentDetail.status === 'enabled'" type="success" effect="light">已启用</el-tag>
            <el-tag v-else type="danger" effect="light">已禁用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentDetail.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="权益说明" :span="2">{{ currentDetail.benefits || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getLevelList,
  getLevelStatistics,
  addLevel,
  updateLevel,
  updateLevelStatus,
  deleteLevel
} from '../api/level.js';

const loading = ref(false);
const submitting = ref(false);
const togglingId = ref(null);
const tableData = ref([]);
const statistics = ref({
  total: 0,
  enabled: 0,
  disabled: 0,
  avgDeposit: 0
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
const editVisible = ref(false);
const detailVisible = ref(false);
const addFormRef = ref(null);
const editFormRef = ref(null);
const currentDetail = ref(null);

const createEmptyForm = () => ({
  levelName: '',
  levelCode: '',
  depositAmount: 0,
  serviceFeeRate: 0,
  minStoreArea: 0,
  maxStores: 1,
  description: '',
  benefits: ''
});

const levelForm = reactive(createEmptyForm());
const editForm = reactive(createEmptyForm());
let editingId = null;

const formRules = {
  levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  levelCode: [
    { required: true, message: '请输入等级编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]{2,20}$/, message: '编码需2-20位大写字母/数字/下划线', trigger: 'blur' }
  ],
  depositAmount: [{ required: true, message: '请输入保证金金额', trigger: 'blur' }],
  serviceFeeRate: [{ required: true, message: '请输入服务费率', trigger: 'blur' }],
  minStoreArea: [{ required: true, message: '请输入最小面积', trigger: 'blur' }],
  maxStores: [{ required: true, message: '请输入最大门店数', trigger: 'blur' }]
};

const loadStatistics = async () => {
  try {
    statistics.value = await getLevelStatistics();
  } catch (e) {
    console.error('加载等级统计失败', e);
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
    const result = await getLevelList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载等级列表失败');
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
  Object.assign(levelForm, createEmptyForm());
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
    await addLevel({ ...levelForm });
    ElMessage.success('等级添加成功');
    addVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '添加失败');
  } finally {
    submitting.value = false;
  }
};

const handleEdit = (row) => {
  editingId = row.id;
  Object.assign(editForm, {
    levelName: row.levelName,
    levelCode: row.levelCode,
    depositAmount: row.depositAmount,
    serviceFeeRate: row.serviceFeeRate,
    minStoreArea: row.minStoreArea,
    maxStores: row.maxStores,
    description: row.description || '',
    benefits: row.benefits || ''
  });
  editVisible.value = true;
};

const handleSubmitEdit = async () => {
  if (!editFormRef.value) return;
  try {
    await editFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await updateLevel(editingId, { ...editForm });
    ElMessage.success('等级更新成功');
    editVisible.value = false;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '更新失败');
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = async (row, newStatus) => {
  const targetAction = newStatus === 'enabled' ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(
      `确定要${targetAction}【${row.levelName}】吗？`,
      `${targetAction}等级`,
      {
        confirmButtonText: `确认${targetAction}`,
        cancelButtonText: '取消',
        type: newStatus === 'enabled' ? 'success' : 'warning'
      }
    );
  } catch (e) {
    const original = newStatus === 'enabled' ? 'disabled' : 'enabled';
    row.status = original;
    return;
  }

  togglingId.value = row.id;
  try {
    await updateLevelStatus(row.id, newStatus);
    ElMessage.success(`等级${targetAction}成功`);
    loadStatistics();
  } catch (e) {
    const original = newStatus === 'enabled' ? 'disabled' : 'enabled';
    row.status = original;
    ElMessage.error(e.message || '状态更新失败');
  } finally {
    togglingId.value = null;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除【${row.levelName}】吗？删除后无法恢复！`,
      '删除等级',
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
    await deleteLevel(row.id);
    ElMessage.success('删除成功');
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '删除失败');
  }
};

onMounted(() => {
  loadStatistics();
  loadList();
});
</script>

<style scoped>
.franchise-level {
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

.stat-card.enabled .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.disabled .stat-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.stat-card.avg-deposit .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.deposit-text {
  color: #f5576c;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.level-form {
  padding: 4px 8px;
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
