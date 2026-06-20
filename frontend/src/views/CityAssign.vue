<template>
  <div class="city-assign">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card assigned">
          <div class="stat-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.assignedCityCount }}</div>
            <div class="stat-label">已归属城市数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon><MapLocation /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.pendingCityCount }}</div>
            <div class="stat-label">待归属城市数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card partner">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.partnerCount }}</div>
            <div class="stat-label">合作伙伴总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card store">
          <div class="stat-icon">
            <el-icon><Shop /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.storeCount }}</div>
            <div class="stat-label">门店总数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="省份">
          <el-select
            v-model="filterForm.province"
            placeholder="全部省份"
            style="width: 150px"
            clearable
            @change="handleProvinceChange"
          >
            <el-option
              v-for="p in provinceList"
              :key="p"
              :label="p"
              :value="p"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="归属状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="已归属" value="assigned" />
            <el-option label="待归属" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="城市/合作伙伴/门店名"
            style="width: 260px"
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
          <span class="card-title">
            <el-icon class="title-icon"><MapLocation /></el-icon>
            城市归属列表
          </span>
          <el-button text @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="province" label="省份" width="120" align="center" />
        <el-table-column prop="city" label="城市" width="120" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.city }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="partnerCount" label="合作伙伴数" width="120" align="center" />
        <el-table-column prop="storeCount" label="门店数" width="100" align="center" />
        <el-table-column label="归属状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'assigned' ? 'success' : 'warning'"
              effect="light"
            >{{ row.status === 'assigned' ? '已归属' : '待归属' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignTime" label="归属时间" width="170" align="center">
          <template #default="{ row }">
            <span class="mono-text">{{ row.assignTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button v-if="row.status === 'pending'" type="success" link @click="handleAssign(row)">
              <el-icon><Plus /></el-icon>
              归属
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

    <el-dialog v-model="detailVisible" title="城市归属详情" width="720px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="省份">{{ currentDetail.province }}</el-descriptions-item>
          <el-descriptions-item label="城市">
            <span class="mono-text">{{ currentDetail.city }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="归属状态">
            <el-tag
              :type="currentDetail.status === 'assigned' ? 'success' : 'warning'"
              effect="light"
            >{{ currentDetail.status === 'assigned' ? '已归属' : '待归属' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="归属时间">{{ currentDetail.assignTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="合作伙伴数">{{ currentDetail.partnerCount }}</el-descriptions-item>
          <el-descriptions-item label="门店数">{{ currentDetail.storeCount }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentDetail.partners && currentDetail.partners.length" class="detail-section">
          <div class="detail-section-title">合作伙伴列表</div>
          <el-table :data="currentDetail.partners" border size="small" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="partnerName" label="合作伙伴" min-width="120" />
            <el-table-column prop="partnerPhone" label="联系电话" width="140" align="center">
              <template #default="{ row }">
                <span class="mono-text">{{ row.partnerPhone || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="companyName" label="公司名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="assignTime" label="归属时间" width="170" align="center">
              <template #default="{ row }">
                <span class="mono-text">{{ row.assignTime || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-if="currentDetail.stores && currentDetail.stores.length" class="detail-section">
          <div class="detail-section-title">门店列表</div>
          <el-table :data="currentDetail.stores" border size="small" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="storeName" label="门店名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="storeNo" label="门店编号" width="140" align="center">
              <template #default="{ row }">
                <span class="mono-text">{{ row.storeNo || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="partnerName" label="所属合作伙伴" width="120" />
            <el-table-column prop="statusText" label="状态" width="100" align="center" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="assignVisible"
      title="归属合作伙伴"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="100px" class="dialog-form">
        <el-form-item label="城市" prop="city">
          <el-input v-model="assignForm.city" placeholder="城市" disabled />
        </el-form-item>
        <el-form-item label="合作伙伴" prop="partnerName">
          <el-input v-model="assignForm.partnerName" placeholder="请输入合作伙伴姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="partnerPhone">
          <el-input v-model="assignForm.partnerPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="assignForm.companyName" placeholder="请输入公司名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitAssign">确认归属</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getCityAssignmentList,
  getCityAssignmentStatistics,
  getCityAssignmentDetail,
  assignCityToPartner
} from '../api/cityAssign.js'
import { getProvinces, getCitiesByProvince } from '../api/region.js'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const provinceList = ref([])
const statistics = ref({
  assignedCityCount: 0,
  pendingCityCount: 0,
  partnerCount: 0,
  storeCount: 0
})

const filterForm = reactive({
  province: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const detailVisible = ref(false)
const currentDetail = ref(null)

const assignVisible = ref(false)
const assignFormRef = ref(null)
const assignForm = reactive({
  city: '',
  partnerName: '',
  partnerPhone: '',
  companyName: ''
})

const assignRules = {
  partnerName: [{ required: true, message: '请输入合作伙伴姓名', trigger: 'blur' }]
}

const loadStatistics = async () => {
  try {
    statistics.value = await getCityAssignmentStatistics()
  } catch (e) {
    console.error('加载城市归属统计失败', e)
  }
}

const loadProvinces = async () => {
  try {
    provinceList.value = await getProvinces()
  } catch (e) {
    console.error('加载省份列表失败', e)
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filterForm.province) params.province = filterForm.province
    if (filterForm.status) params.status = filterForm.status
    if (filterForm.keyword) params.keyword = filterForm.keyword
    const result = await getCityAssignmentList(params)
    tableData.value = result.list
    pagination.total = result.total
  } catch (e) {
    ElMessage.error(e.message || '加载城市归属列表失败')
  } finally {
    loading.value = false
  }
}

const handleProvinceChange = () => {
  handleSearch()
}

const handleSearch = () => {
  pagination.page = 1
  loadList()
}

const handleReset = () => {
  filterForm.province = ''
  filterForm.status = ''
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

const handleView = async (row) => {
  try {
    currentDetail.value = await getCityAssignmentDetail(row.city)
    detailVisible.value = true
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败')
  }
}

const handleAssign = (row) => {
  Object.assign(assignForm, {
    city: row.city,
    partnerName: '',
    partnerPhone: '',
    companyName: ''
  })
  assignVisible.value = true
}

const handleSubmitAssign = async () => {
  if (!assignFormRef.value) return
  try {
    await assignFormRef.value.validate()
  } catch (e) {
    return
  }
  submitting.value = true
  try {
    await assignCityToPartner({ ...assignForm })
    ElMessage.success('归属成功')
    assignVisible.value = false
    loadList()
    loadStatistics()
  } catch (e) {
    ElMessage.error(e.message || '归属失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadProvinces()
  loadList()
})
</script>

<style scoped>
.city-assign {
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

.stat-card.assigned .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.partner .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.store .stat-icon {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-form {
  padding: 4px 8px;
}

.detail-content {
  padding: 4px 0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #3b82f6;
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
