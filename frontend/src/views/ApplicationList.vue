<template>
  <div class="application-list">
    <div class="stat-cards">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">申请总数</div>
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
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card approved">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-card rejected">
            <div class="stat-icon">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.rejected }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="filterForm.city" placeholder="全部城市" style="width: 140px" clearable @change="handleSearch">
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="广州市" value="广州市" />
            <el-option label="深圳市" value="深圳市" />
            <el-option label="杭州市" value="杭州市" />
            <el-option label="成都市" value="成都市" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="公司名称/法人/电话/申请编号"
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
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">加盟商申请列表</span>
          <el-button type="primary" plain @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        stripe
        @row-click="handleRowClick"
      >
        <el-table-column prop="applyNo" label="申请编号" width="160" />
        <el-table-column prop="companyName" label="公司名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="legalPerson" label="法人代表" width="100" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column label="所在城市" width="140">
          <template #default="{ row }">
            {{ row.city }} {{ row.district }}
          </template>
        </el-table-column>
        <el-table-column prop="registeredCapital" label="注册资金" width="110" />
        <el-table-column prop="statusText" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning" effect="light">{{ row.statusText }}</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success" effect="light">{{ row.statusText }}</el-tag>
            <el-tag v-else type="danger" effect="light">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="viewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click.stop="handleApprove(row)"
            >
              <el-icon><CircleCheck /></el-icon>
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              link
              @click.stop="handleReject(row)"
            >
              <el-icon><CircleClose /></el-icon>
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="90px">
        <el-form-item label="申请编号">
          <span>{{ currentApp?.applyNo }}</span>
        </el-form-item>
        <el-form-item label="公司名称">
          <span>{{ currentApp?.companyName }}</span>
        </el-form-item>
        <el-form-item label="法人代表">
          <span>{{ currentApp?.legalPerson }}</span>
        </el-form-item>
        <el-form-item label="驳回原因" required>
          <el-input
            v-model="rejectForm.auditOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">
          确认驳回
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getApplicationList,
  getStatistics,
  auditApplication
} from '../api/application.js'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const statistics = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

const filterForm = reactive({
  status: '',
  city: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const rejectDialogVisible = ref(false)
const currentApp = ref(null)
const rejectForm = reactive({
  auditOpinion: ''
})

const loadStatistics = async () => {
  try {
    statistics.value = await getStatistics()
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filterForm.status) params.status = filterForm.status
    if (filterForm.city) params.city = filterForm.city
    if (filterForm.keyword) params.keyword = filterForm.keyword
    const result = await getApplicationList(params)
    tableData.value = result.list
    pagination.total = result.total
  } catch (e) {
    ElMessage.error(e.message || '加载列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadList()
}

const handleReset = () => {
  filterForm.status = ''
  filterForm.city = ''
  filterForm.keyword = ''
  pagination.page = 1
  loadList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadList()
}

const viewDetail = (row) => {
  router.push(`/applications/${row.id}`)
}

const handleRowClick = (row) => {
  viewDetail(row)
}

const handleApprove = (row) => {
  ElMessageBox.confirm(
    `确定要通过【${row.companyName}】的加盟申请吗？`,
    '审核通过',
    {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      submitting.value = true
      await auditApplication(row.id, {
        status: 'approved',
        auditOpinion: '资质审核通过，同意加盟',
        auditor: '管理员'
      })
      ElMessage.success('审核通过')
      loadList()
      loadStatistics()
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    } finally {
      submitting.value = false
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  currentApp.value = row
  rejectForm.auditOpinion = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.auditOpinion.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  try {
    submitting.value = true
    await auditApplication(currentApp.value.id, {
      status: 'rejected',
      auditOpinion: rejectForm.auditOpinion,
      auditor: '管理员'
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadList()
    loadStatistics()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadList()
})
</script>

<style scoped>
.application-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-cards {
  margin-bottom: 0;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.approved .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
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
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f0f9ff !important;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }
  .stat-value {
    font-size: 22px;
  }
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
