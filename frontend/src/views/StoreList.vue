<template>
  <div class="store-list">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon><Shop /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">全部门店</div>
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
        <div class="stat-card cities">
          <div class="stat-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.cities }}</div>
            <div class="stat-label">覆盖城市</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="账号状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="已启用" value="enabled" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="门店名称/编号/合伙人/账号/电话"
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
            添加门店合伙人
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Shop /></el-icon>
            全部门店信息
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="storeNo" label="门店编号" width="150" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.storeNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="门店名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="城市合伙人" width="170" align="center">
          <template #default="{ row }">
            <div class="partner-cell">
              <el-avatar :size="28" class="partner-avatar">{{ row.partnerName.charAt(0) }}</el-avatar>
              <div class="partner-info">
                <div class="partner-name">{{ row.partnerName }}</div>
                <div class="partner-phone">{{ row.partnerPhone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所在城市" width="180" align="center">
          <template #default="{ row }">
            {{ row.province }} {{ row.city }} {{ row.district }}
          </template>
        </el-table-column>
        <el-table-column prop="storeArea" label="面积" width="80" align="center" />
        <el-table-column prop="account" label="登录账号" width="150" align="center">
          <template #default="{ row }">
            <span class="mono-text account-text">{{ row.account }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="openDate" label="开业时间" width="110" align="center" />
        <el-table-column label="账号状态" width="100" align="center">
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
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="warning" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="info" link @click="handleResetPwd(row)">
              <el-icon><Key /></el-icon>
              重置密码
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
      :title="editingId ? '编辑门店信息' : '添加城市合伙人门店'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form :model="storeForm" :rules="formRules" ref="storeFormRef" label-width="100px" class="add-store-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="门店编号" prop="storeNo">
              <el-input v-model="storeForm.storeNo" placeholder="如 MD2026010001" :disabled="!editingId" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="storeForm.storeName" placeholder="请输入门店名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="登录账号" prop="account">
              <el-input v-model="storeForm.account" placeholder="英文、数字、下划线组合" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合伙人姓名" prop="partnerName">
              <el-input v-model="storeForm.partnerName" placeholder="请输入合伙人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="partnerPhone">
              <el-input v-model="storeForm.partnerPhone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="storeForm.companyName" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店面积">
              <el-input v-model="storeForm.storeArea" placeholder="例如 200平米" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="所在省份" prop="province">
              <el-select v-model="storeForm.province" placeholder="请选择省份" style="width: 100%" @change="handleProvinceChange">
                <el-option v-for="p in provinceList" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所在城市" prop="city">
              <el-select v-model="storeForm.city" placeholder="请选择城市" style="width: 100%" :disabled="!storeForm.province">
                <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区/县" prop="district">
              <el-input v-model="storeForm.district" placeholder="如 朝阳区" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="开业日期">
              <el-date-picker
                v-model="storeForm.openDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择开业日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="门店地址" prop="address">
          <el-input v-model="storeForm.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="storeForm.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitForm">
          {{ editingId ? '保存修改' : '确认添加' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="门店详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="门店编号">
            <span class="mono-text">{{ currentDetail.storeNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="门店名称" :span="1">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <el-link type="primary">{{ currentDetail.partnerPhone }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="所在城市">{{ currentDetail.province }} {{ currentDetail.city }} {{ currentDetail.district }}</el-descriptions-item>
          <el-descriptions-item label="公司名称">{{ currentDetail.companyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="门店面积">{{ currentDetail.storeArea || '-' }}</el-descriptions-item>
          <el-descriptions-item label="开业时间">{{ currentDetail.openDate }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">
            <span class="mono-text">{{ currentDetail.account }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag v-if="currentDetail.status === 'enabled'" type="success" effect="light">{{ currentDetail.statusText }}</el-tag>
            <el-tag v-else type="danger" effect="light">{{ currentDetail.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="门店地址" :span="2">{{ currentDetail.address }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="1">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="1">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog
      v-model="resetPwdVisible"
      title="重置登录密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="resetPwdTarget" class="reset-pwd-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="门店名称">{{ resetPwdTarget.storeName }}</el-descriptions-item>
          <el-descriptions-item label="门店编号">
            <span class="mono-text">{{ resetPwdTarget.storeNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="登录账号">
            <span class="mono-text account-text">{{ resetPwdTarget.account }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ resetPwdTarget.partnerName }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdFormRef" label-width="100px" class="reset-pwd-form">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPwdForm.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitResetPwd">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getStores,
  getStoreStatistics,
  addStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
  getStoreDetail,
  resetPassword,
  getProvinces,
  getCitiesByProvince
} from '../api/store.js';

const loading = ref(false);
const submitting = ref(false);
const togglingId = ref(null);
const tableData = ref([]);
const statistics = ref({
  total: 0,
  enabled: 0,
  disabled: 0,
  cities: 0
});

const provinceList = ref([]);
const cityOptions = ref([]);

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
const editingId = ref(null);
const storeFormRef = ref(null);
const storeForm = reactive({
  storeNo: '',
  storeName: '',
  account: '',
  partnerName: '',
  partnerPhone: '',
  companyName: '',
  province: '',
  city: '',
  district: '',
  address: '',
  storeArea: '',
  openDate: '',
  remark: ''
});

const formRules = {
  storeNo: [{ required: true, message: '请输入门店编号', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  account: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '账号需4-20位字母/数字/下划线', trigger: 'blur' }
  ],
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  partnerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  district: [{ required: true, message: '请输入区/县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入门店详细地址', trigger: 'blur' }]
};

const detailVisible = ref(false);
const currentDetail = ref(null);

const resetPwdVisible = ref(false);
const resetPwdTarget = ref(null);
const resetPwdFormRef = ref(null);
const resetPwdForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

const validateConfirmPwd = (rule, value, callback) => {
  if (value !== resetPwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const resetPwdRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
};

const loadStatistics = async () => {
  try {
    statistics.value = await getStoreStatistics();
  } catch (e) {
    console.error('加载门店统计失败', e);
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
    const result = await getStores(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载门店列表失败');
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
  editingId.value = null;
  Object.assign(storeForm, {
    storeNo: '',
    storeName: '',
    account: '',
    partnerName: '',
    partnerPhone: '',
    companyName: '',
    province: '',
    city: '',
    district: '',
    address: '',
    storeArea: '',
    openDate: '',
    remark: ''
  });
  cityOptions.value = [];
  formVisible.value = true;
};

const handleEdit = (row) => {
  editingId.value = row.id;
  Object.assign(storeForm, {
    storeNo: row.storeNo,
    storeName: row.storeName,
    account: row.account,
    partnerName: row.partnerName,
    partnerPhone: row.partnerPhone,
    companyName: row.companyName || '',
    province: row.province || '',
    city: row.city,
    district: row.district,
    address: row.address,
    storeArea: row.storeArea || '',
    openDate: row.openDate || '',
    remark: row.remark || ''
  });
  if (row.province) {
    getCitiesByProvince(row.province).then(cities => {
      cityOptions.value = cities;
    }).catch(() => {
      cityOptions.value = [];
    });
  } else {
    cityOptions.value = [];
  }
  formVisible.value = true;
};

const handleProvinceChange = async (val) => {
  storeForm.city = '';
  if (val) {
    try {
      cityOptions.value = await getCitiesByProvince(val);
    } catch (e) {
      cityOptions.value = [];
    }
  } else {
    cityOptions.value = [];
  }
};

const handleSubmitForm = async () => {
  if (!storeFormRef.value) return;
  try {
    await storeFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    if (editingId.value) {
      await updateStore(editingId.value, { ...storeForm });
      ElMessage.success('门店信息更新成功');
    } else {
      await addStore({ ...storeForm });
      ElMessage.success('门店添加成功');
    }
    formVisible.value = false;
    editingId.value = null;
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || (editingId.value ? '更新失败' : '添加失败'));
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = async (row, newStatus) => {
  const targetAction = newStatus === 'enabled' ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(
      `确定要${targetAction}【${row.storeName}】的账号吗？`,
      `${targetAction}账号`,
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
    await toggleStoreStatus(row.id, newStatus);
    row.statusText = newStatus === 'enabled' ? '已启用' : '已禁用';
    ElMessage.success(`账号${targetAction}成功`);
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
      `确定要删除【${row.storeName}】吗？删除后无法恢复！`,
      '删除门店',
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
    await deleteStore(row.id);
    ElMessage.success('删除成功');
    loadList();
    loadStatistics();
  } catch (e) {
    ElMessage.error(e.message || '删除失败');
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getStoreDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

const handleResetPwd = (row) => {
  resetPwdTarget.value = row;
  resetPwdForm.newPassword = '';
  resetPwdForm.confirmPassword = '';
  resetPwdVisible.value = true;
};

const handleSubmitResetPwd = async () => {
  if (!resetPwdFormRef.value) return;
  try {
    await resetPwdFormRef.value.validate();
  } catch (e) {
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要重置【${resetPwdTarget.value.storeName}】的登录密码吗？`,
      '重置密码确认',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
  } catch (e) {
    return;
  }

  submitting.value = true;
  try {
    await resetPassword(resetPwdTarget.value.id, resetPwdForm.newPassword);
    ElMessage.success('密码重置成功');
    resetPwdVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || '密码重置失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    provinceList.value = await getProvinces();
  } catch (e) {
    console.error('加载省份列表失败', e);
  }
  loadStatistics();
  loadList();
});
</script>

<style scoped>
.store-list {
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

.stat-card.cities .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.account-text {
  color: #3b82f6;
}

.partner-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.partner-avatar {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  font-size: 13px;
  font-weight: 600;
  border: 2px solid #e0e7ff;
}

.partner-info {
  text-align: left;
  line-height: 1.35;
}

.partner-name {
  font-weight: 500;
  color: #303133;
  font-size: 13.5px;
}

.partner-phone {
  font-size: 12px;
  color: #909399;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-store-form {
  padding: 4px 8px;
}

.detail-content {
  padding: 4px 0;
}

.reset-pwd-info {
  margin-bottom: 20px;
}

.reset-pwd-form {
  padding: 4px 8px;
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
