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
        <el-tag
          v-if="application?.status !== 'rejected'"
          :type="stageType"
          size="large"
          effect="dark"
          :style="{ marginLeft: '8px' }"
        >
          当前阶段：{{ application?.stageName }}
        </el-tag>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <el-card v-if="application" class="stage-stepper-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><Connection /></el-icon>
            <span class="card-title">准入流程进度</span>
          </div>
        </template>
        <el-steps :active="application.onboardingStage" finish-status="success" align-center>
          <el-step title="提交申请">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[0] }">
                <el-icon><Document /></el-icon>
              </div>
            </template>
          </el-step>
          <el-step title="资质审核">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[1] }">
                <el-icon><User /></el-icon>
              </div>
            </template>
          </el-step>
          <el-step title="合同签约">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[2] }">
                <el-icon><Notebook /></el-icon>
              </div>
            </template>
          </el-step>
          <el-step title="加盟培训">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[3] }">
                <el-icon><Reading /></el-icon>
              </div>
            </template>
          </el-step>
          <el-step title="账号开通">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[4] }">
                <el-icon><Key /></el-icon>
              </div>
            </template>
          </el-step>
          <el-step title="上线运营">
            <template #icon>
              <div class="step-icon-box" :style="{ background: stepColors[5] }">
                <el-icon><Shop /></el-icon>
              </div>
            </template>
          </el-step>
        </el-steps>
      </el-card>

      <el-card v-if="application && application.status !== 'rejected' && application.onboardingStage < 6" class="stage-action-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon action-icon"><Promotion /></el-icon>
            <span class="card-title">{{ currentStageActionTitle }}</span>
          </div>
        </template>
        <div class="stage-action-content">
          <div class="stage-desc">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ currentStageDesc }}</span>
          </div>

          <div v-if="application.onboardingStage === 2" class="stage-form">
            <el-form :model="contractForm" label-width="100px" size="default">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="合同编号">
                    <el-input v-model="contractForm.contractNo" placeholder="自动生成或手动输入" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="加盟等级">
                    <el-select v-model="contractForm.contractType" style="width: 100%">
                      <el-option label="标准加盟商" value="标准加盟商" />
                      <el-option label="银牌加盟商" value="银牌加盟商" />
                      <el-option label="金牌加盟商" value="金牌加盟商" />
                      <el-option label="钻石加盟商" value="钻石加盟商" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="签约日期">
                    <el-date-picker v-model="contractForm.signDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="开始日期">
                    <el-date-picker v-model="contractForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="结束日期">
                    <el-date-picker v-model="contractForm.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="保证金(元)">
                    <el-input-number v-model="contractForm.depositAmount" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="服务费率(%)">
                <el-input-number v-model="contractForm.serviceFeeRate" :min="0" :max="100" :precision="1" style="width: 200px" />
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="application.onboardingStage === 3" class="stage-form">
            <el-form :model="trainingForm" label-width="100px" size="default">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="培训讲师">
                    <el-input v-model="trainingForm.trainer" placeholder="请输入培训讲师姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="开始日期">
                    <el-date-picker v-model="trainingForm.trainingStartDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="结束日期">
                    <el-date-picker v-model="trainingForm.trainingEndDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="培训分数">
                    <el-input-number v-model="trainingForm.trainingScore" :min="0" :max="100" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="证书编号">
                    <el-input v-model="trainingForm.certificateNo" placeholder="自动生成" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <div v-else-if="application.onboardingStage === 4" class="stage-form">
            <el-form :model="accountForm" label-width="100px" size="default">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="门店编号">
                    <el-input v-model="accountForm.storeNo" placeholder="如 MD2026060001" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="门店名称">
                    <el-input v-model="accountForm.storeName" placeholder="请输入门店名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="登录账号">
                    <el-input v-model="accountForm.account" placeholder="字母数字组合" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="开通日期">
                <el-date-picker v-model="accountForm.openDate" type="date" value-format="YYYY-MM-DD" style="width: 200px" />
              </el-form-item>
              <el-form-item label="操作员">
                <el-input v-model="accountForm.operator" placeholder="系统管理员" style="width: 200px" />
              </el-form-item>
            </el-form>
          </div>

          <div v-else-if="application.onboardingStage === 5" class="stage-form">
            <el-alert title="确认该加盟商已完成全部准备工作，可以正式上线运营？" type="success" :closable="false" show-icon />
          </div>

          <div class="stage-action-btn">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="handleAdvanceStage"
            >
              <el-icon><Promotion /></el-icon>
              {{ advanceButtonText }}
            </el-button>
          </div>
        </div>
      </el-card>

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

      <el-card v-if="application && application.stageData?.contract && Object.keys(application.stageData.contract).length > 0" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><Notebook /></el-icon>
            <span class="card-title">合同信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="合同编号">
            <span class="monospace">{{ application.stageData.contract.contractNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="加盟等级">
            <el-tag type="success">{{ application.stageData.contract.contractType }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签约日期">
            {{ application.stageData.contract.signDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="合同期限">
            {{ application.stageData.contract.startDate }} ~ {{ application.stageData.contract.endDate }}
          </el-descriptions-item>
          <el-descriptions-item label="保证金">
            <span class="highlight">¥{{ formatMoney(application.stageData.contract.depositAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="服务费率">
            <span class="highlight">{{ application.stageData.contract.serviceFeeRate }}%</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="application && application.stageData?.training && Object.keys(application.stageData.training).length > 0" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><Reading /></el-icon>
            <span class="card-title">培训信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="培训讲师">
            {{ application.stageData.training.trainer || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="培训时间">
            {{ application.stageData.training.trainingStartDate }} ~ {{ application.stageData.training.trainingEndDate || '进行中' }}
          </el-descriptions-item>
          <el-descriptions-item label="培训成绩">
            <span class="highlight">{{ application.stageData.training.trainingScore || '-' }} 分</span>
          </el-descriptions-item>
          <el-descriptions-item label="证书编号">
            <span class="monospace">{{ application.stageData.training.certificateNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="培训结果">
            <el-tag v-if="application.stageData.training.result === 'passed'" type="success">通过</el-tag>
            <el-tag v-else-if="application.stageData.training.result === 'in_progress'" type="warning">进行中</el-tag>
            <el-tag v-else type="info">-</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="application && application.stageData?.account && Object.keys(application.stageData.account).length > 0" class="info-card" shadow="never">
        <template #header>
          <div class="card-title-wrap">
            <el-icon class="card-icon"><Key /></el-icon>
            <span class="card-title">账号信息</span>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="门店编号">
            <span class="monospace">{{ application.stageData.account.storeNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="门店名称">
            {{ application.stageData.account.storeName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="登录账号">
            <span class="monospace account-text">{{ application.stageData.account.account || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="开通日期">
            {{ application.stageData.account.openDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作员">
            {{ application.stageData.account.operator || '-' }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, User, OfficeBuilding, CircleCheck, CircleClose, EditPen,
  Document, Notebook, Reading, Key, Shop, Connection, Promotion, InfoFilled
} from '@element-plus/icons-vue'
import {
  getApplicationDetail,
  auditApplication,
  advanceStage
} from '../api/application.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const application = ref(null)

const stepColors = ['#667eea', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#22c55e']

const stageType = computed(() => application.value?.stageType || 'info')

const currentStageActionTitle = computed(() => {
  const stage = application.value?.onboardingStage
  const titles = {
    2: '资质审核通过 → 进入合同签约阶段',
    3: '合同签署完成 → 进入加盟培训阶段',
    4: '培训考核通过 → 进入账号开通阶段',
    5: '账号开通完成 → 正式上线运营'
  }
  return titles[stage] || ''
})

const currentStageDesc = computed(() => {
  const stage = application.value?.onboardingStage
  const descs = {
    2: '请确认资质审核结果，审核通过后将进入合同签约阶段。',
    3: '请填写合同相关信息，合同签署完成后将进入加盟培训阶段。',
    4: '请填写培训相关信息，培训考核通过后将进入账号开通阶段。',
    5: '请确认门店账号信息，账号开通后将正式上线运营。'
  }
  return descs[stage] || ''
})

const advanceButtonText = computed(() => {
  const stage = application.value?.onboardingStage
  const texts = {
    2: '进入签约阶段',
    3: '进入培训阶段',
    4: '进入账号开通阶段',
    5: '确认上线运营'
  }
  return texts[stage] || '推进'
})

const auditForm = reactive({
  auditOpinion: ''
})

const contractForm = reactive({
  contractNo: '',
  contractType: '标准加盟商',
  signDate: '',
  startDate: '',
  endDate: '',
  depositAmount: 50000,
  serviceFeeRate: 5
})

const trainingForm = reactive({
  trainer: '',
  trainingStartDate: '',
  trainingEndDate: '',
  trainingScore: null,
  certificateNo: ''
})

const accountForm = reactive({
  storeNo: '',
  storeName: '',
  account: '',
  openDate: '',
  operator: '系统管理员'
})

const formatMoney = (val) => {
  if (!val) return '0'
  return Number(val).toLocaleString()
}

const loadDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const data = await getApplicationDetail(id)
    application.value = data

    if (data.stageData?.contract) {
      Object.assign(contractForm, data.stageData.contract)
    }
    if (data.stageData?.training) {
      Object.assign(trainingForm, data.stageData.training)
    }
    if (data.stageData?.account) {
      Object.assign(accountForm, data.stageData.account)
    }
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
    `确定要通过【${application.value.companyName}】的加盟申请吗？通过后将进入资质审核阶段。`,
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

const handleAdvanceStage = async () => {
  const stage = application.value.onboardingStage
  let stageData = null
  let confirmText = ''

  if (stage === 2) {
    confirmText = `确定将【${application.value.companyName}】推进到合同签约阶段？`
    stageData = { ...contractForm }
  } else if (stage === 3) {
    if (!trainingForm.trainingScore && trainingForm.trainingScore !== 0) {
      ElMessage.warning('请输入培训分数')
      return
    }
    confirmText = `确定将【${application.value.companyName}】推进到加盟培训阶段？`
    stageData = { ...trainingForm }
  } else if (stage === 4) {
    if (!accountForm.storeNo || !accountForm.account) {
      ElMessage.warning('请填写门店编号和登录账号')
      return
    }
    confirmText = `确定为【${application.value.companyName}】开通账号并推进到上线运营阶段？`
    stageData = { ...accountForm }
  } else if (stage === 5) {
    confirmText = `确定【${application.value.companyName}】正式上线运营？`
  }

  ElMessageBox.confirm(confirmText, '推进阶段确认', {
    confirmButtonText: '确认推进',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      submitting.value = true
      await advanceStage(route.params.id, stageData)
      ElMessage.success('阶段推进成功')
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

.stage-stepper-card {
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.step-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  margin: 0 auto;
}

.stage-action-card {
  border-radius: 10px;
  border: 1px dashed #3b82f6;
  background: #f0f9ff;
}

.action-icon {
  color: #3b82f6;
}

.stage-action-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
}

.stage-desc .el-icon {
  color: #3b82f6;
  font-size: 16px;
}

.stage-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.stage-action-btn {
  display: flex;
  justify-content: center;
}

.stage-action-btn .el-button {
  min-width: 200px;
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

.account-text {
  color: #3b82f6;
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
