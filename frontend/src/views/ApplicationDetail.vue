<template>
  <div class="application-detail">
    <div class="detail-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回列表</span>
      </el-button>
      <div class="header-status">
        <el-tag v-if="application?.status === 'pending'" type="warning" size="large" effect="light">
          {{ application?.statusText }}
        </el-tag>
        <el-tag v-else-if="application?.status === 'approved'" type="success" size="large" effect="light">
          {{ application?.statusText }}
        </el-tag>
        <el-tag v-else type="danger" size="large" effect="light">
          {{ application?.statusText }}
        </el-tag>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <el-card v-if="application" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><User /></el-icon>
            <span class="card-title">企业基本信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="申请编号">
            <span class="monospace">{{ application.applyNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="公司名称" :span="2">
            {{ application.companyName }}
          </el-descriptions-item>
          <el-descriptions-item label="法人代表">
            {{ application.legalPerson }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <el-link type="primary">{{ application.phone }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="所在城市">
            {{ application.city }} {{ application.district }}
          </el-descriptions-item>
          <el-descriptions-item label="营业执照号">
            <span class="monospace">{{ application.businessLicense }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="注册资金">
            <span class="highlight">{{ application.registeredCapital }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ application.applyTime }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="application" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><OfficeBuilding /></el-icon>
            <span class="card-title">企业经营能力</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="经营范围" :span="3">
            {{ application.businessScope }}
          </el-descriptions-item>
          <el-descriptions-item label="从业经验" :span="2">
            {{ application.experience }}
          </el-descriptions-item>
          <el-descriptions-item label="团队规模">
            <span class="highlight">{{ application.teamSize }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="仓储面积">
            <span class="highlight">{{ application.warehouseArea }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="配送车辆">
            <span class="highlight">{{ application.distributionVehicles }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="application && application.status !== 'pending'" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><CircleCheck /></el-icon>
            <span class="card-title">审核信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="审核人">
            {{ application.auditor || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{ application.auditTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核结果">
            <el-tag v-if="application.status === 'approved'" type="success" effect="light">
              {{ application.statusText }}
            </el-tag>
            <el-tag v-else type="danger" effect="light">
              {{ application.statusText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="3">
            <div class="audit-opinion">
              {{ application.auditOpinion || '无' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="application && application.status === 'pending'" class="audit-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon audit-icon"><EditPen /></el-icon>
            <span class="card-title">资质审核</span>
          </div>
        </template>
        <div class="audit-form">
          <el-form :model="auditForm" label-width="100px">
            <el-form-item label="审核意见">
              <el-input
                v-model="auditForm.auditOpinion"
                type="textarea"
                :rows="4"
                placeholder="请输入审核意见（驳回时必填）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <div class="audit-actions">
                <el-button
                  type="success"
                  size="large"
                  :loading="submitting"
                  @click="handleApprove"
                >
                  <el-icon><CircleCheck /></el-icon>
                  <span>审核通过</span>
                </el-button>
                <el-button
                  type="danger"
                  size="large"
                  :loading="submitting"
                  @click="handleReject"
                >
                  <el-icon><CircleClose /></el-icon>
                  <span>审核驳回</span>
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getApplicationDetail,
  auditApplication
} from '../api/application.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const application = ref(null)

const auditForm = reactive({
  auditOpinion: ''
})

const loadDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const data = await getApplicationDetail(id)
    application.value = data
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/applications')
}

const handleApprove = async () => {
  ElMessageBox.confirm(
    `确定要通过【${application.value.companyName}】的加盟申请吗？`,
    '审核通过确认',
    {
      confirmButtonText: '确认通过',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      submitting.value = true
      await auditApplication(route.params.id, {
        status: 'approved',
        auditOpinion: auditForm.auditOpinion || '资质审核通过，同意加盟',
        auditor: '管理员'
      })
      ElMessage.success('审核通过')
      loadDetail()
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    } finally {
      submitting.value = false
    }
  }).catch(() => {})
}

const handleReject = async () => {
  if (!auditForm.auditOpinion.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  ElMessageBox.confirm(
    `确定要驳回【${application.value.companyName}】的加盟申请吗？`,
    '审核驳回确认',
    {
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      submitting.value = true
      await auditApplication(route.params.id, {
        status: 'rejected',
        auditOpinion: auditForm.auditOpinion,
        auditor: '管理员'
      })
      ElMessage.success('已驳回')
      loadDetail()
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    } finally {
      submitting.value = false
    }
  }).catch(() => {})
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.application-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  border-radius: 10px;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  font-size: 18px;
  color: #3b82f6;
}

.audit-icon {
  color: #e6a23c;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.monospace {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-weight: 500;
}

.highlight {
  font-weight: 600;
  color: #303133;
}

.audit-opinion {
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  min-height: 40px;
  line-height: 1.6;
  color: #606266;
}

.audit-card {
  border-radius: 10px;
  border: 1px solid #e6a23c;
}

.audit-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px 10px 0 0;
  border-bottom: none;
}

.audit-form {
  max-width: 700px;
  margin: 0 auto;
}

.audit-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  width: 100%;
}

.audit-actions .el-button {
  min-width: 140px;
}

@media (max-width: 768px) {
  .audit-actions {
    flex-direction: column;
  }
  .audit-actions .el-button {
    width: 100%;
  }
}
</style>
