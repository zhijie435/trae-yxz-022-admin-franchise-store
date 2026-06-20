const { APPLICATION_STATUS, ONBOARDING_STAGES } = require('./constants');

const mockApplications = [
  {
    id: '1',
    applyNo: 'SQ202606010001',
    companyName: '北京市鑫源商贸有限公司',
    legalPerson: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    city: '北京市',
    district: '朝阳区',
    businessLicense: '91110000MA1K3XXX01',
    registeredCapital: '500万元',
    businessScope: '日用品、食品、饮料批发零售',
    experience: '10年快消品行业经验，曾任职于多家知名连锁企业',
    teamSize: '50-100人',
    warehouseArea: '2000㎡',
    distributionVehicles: '10辆',
    applyTime: '2026-06-15 10:30:00',
    status: APPLICATION_STATUS.PENDING,
    onboardingStage: 1,
    stageStatus: 'pending',
    stageData: {
      qualification: {},
      contract: {},
      training: {},
      account: {}
    },
    auditOpinion: '',
    auditor: '',
    auditTime: ''
  },
  {
    id: '2',
    applyNo: 'SQ202606020002',
    companyName: '上海市恒达贸易有限公司',
    legalPerson: '李四',
    phone: '13900139002',
    email: 'lisi@example.com',
    city: '上海市',
    district: '浦东新区',
    businessLicense: '91310000MA1K3XXX02',
    registeredCapital: '800万元',
    businessScope: '服装、鞋帽、箱包批发零售',
    experience: '8年服装行业经验，自有品牌运营经验',
    teamSize: '100-200人',
    warehouseArea: '3000㎡',
    distributionVehicles: '15辆',
    applyTime: '2026-06-14 14:20:00',
    status: APPLICATION_STATUS.APPROVED,
    onboardingStage: 3,
    stageStatus: 'in_progress',
    stageData: {
      qualification: {
        reviewer: '王总',
        reviewTime: '2026-06-16 09:15:00',
        result: 'passed',
        opinion: '资质优秀，资金实力雄厚，同意进入签约阶段'
      },
      contract: {
        contractNo: 'HT2026060002',
        contractType: '银牌加盟商',
        startDate: '2026-07-01',
        endDate: '2028-06-30',
        depositAmount: 100000,
        serviceFeeRate: 4
      },
      training: {},
      account: {}
    },
    auditOpinion: '资质优秀，资金实力雄厚，同意加盟',
    auditor: '王总',
    auditTime: '2026-06-16 09:15:00'
  },
  {
    id: '3',
    applyNo: 'SQ202606030003',
    companyName: '广州市盛达商业有限公司',
    legalPerson: '王五',
    phone: '13700137003',
    email: 'wangwu@example.com',
    city: '广州市',
    district: '天河区',
    businessLicense: '91440000MA1K3XXX03',
    registeredCapital: '300万元',
    businessScope: '电子产品、数码产品销售',
    experience: '5年电子行业经验',
    teamSize: '20-50人',
    warehouseArea: '800㎡',
    distributionVehicles: '5辆',
    applyTime: '2026-06-13 16:45:00',
    status: APPLICATION_STATUS.PENDING,
    onboardingStage: 2,
    stageStatus: 'pending',
    stageData: {
      qualification: {},
      contract: {},
      training: {},
      account: {}
    },
    auditOpinion: '',
    auditor: '',
    auditTime: ''
  },
  {
    id: '4',
    applyNo: 'SQ202606040004',
    companyName: '深圳市创新科技有限公司',
    legalPerson: '赵六',
    phone: '13600136004',
    email: 'zhaoliu@example.com',
    city: '深圳市',
    district: '南山区',
    businessLicense: '91440300MA1K3XXX04',
    registeredCapital: '1000万元',
    businessScope: '智能硬件、智能家居产品研发与销售',
    experience: '12年科技行业经验，连续创业者',
    teamSize: '200-500人',
    warehouseArea: '5000㎡',
    distributionVehicles: '20辆',
    applyTime: '2026-06-12 09:00:00',
    status: APPLICATION_STATUS.APPROVED,
    onboardingStage: 6,
    stageStatus: 'completed',
    stageData: {
      qualification: {
        reviewer: '王总',
        reviewTime: '2026-06-13 10:00:00',
        result: 'passed',
        opinion: '行业资深，资金雄厚，团队完善，快速通过'
      },
      contract: {
        contractNo: 'HT2026060004',
        contractType: '金牌加盟商',
        signDate: '2026-06-14',
        startDate: '2026-06-15',
        endDate: '2029-06-14',
        depositAmount: 200000,
        serviceFeeRate: 3
      },
      training: {
        trainer: '李培训师',
        trainingStartDate: '2026-06-16',
        trainingEndDate: '2026-06-18',
        trainingScore: 95,
        certificateNo: 'PX2026060001',
        result: 'passed'
      },
      account: {
        account: 'shenzhen_cx01',
        openDate: '2026-06-19',
        storeNo: 'MD2026060004',
        storeName: '深圳南山旗舰店',
        operator: '系统管理员'
      }
    },
    auditOpinion: '资质优秀，同意加盟',
    auditor: '王总',
    auditTime: '2026-06-13 10:00:00'
  },
  {
    id: '5',
    applyNo: 'SQ202606050005',
    companyName: '杭州市西湖商贸有限公司',
    legalPerson: '钱七',
    phone: '13500135005',
    email: 'qianqi@example.com',
    city: '杭州市',
    district: '西湖区',
    businessLicense: '91330000MA1K3XXX05',
    registeredCapital: '600万元',
    businessScope: '茶叶、茶具、土特产批发零售',
    experience: '6年茶行业经验',
    teamSize: '50-100人',
    warehouseArea: '1500㎡',
    distributionVehicles: '8辆',
    applyTime: '2026-06-11 11:30:00',
    status: APPLICATION_STATUS.APPROVED,
    onboardingStage: 4,
    stageStatus: 'in_progress',
    stageData: {
      qualification: {
        reviewer: '王总',
        reviewTime: '2026-06-13 15:00:00',
        result: 'passed',
        opinion: '行业经验丰富，区域资源良好'
      },
      contract: {
        contractNo: 'HT2026060005',
        contractType: '银牌加盟商',
        signDate: '2026-06-14',
        startDate: '2026-07-01',
        endDate: '2028-06-30',
        depositAmount: 100000,
        serviceFeeRate: 4
      },
      training: {
        trainer: '张培训师',
        trainingStartDate: '2026-06-18',
        trainingEndDate: '',
        trainingScore: null,
        certificateNo: '',
        result: 'in_progress'
      },
      account: {}
    },
    auditOpinion: '行业经验丰富，区域资源良好，同意加盟',
    auditor: '王总',
    auditTime: '2026-06-13 15:00:00'
  },
  {
    id: '6',
    applyNo: 'SQ202606060006',
    companyName: '成都市蓉城贸易有限公司',
    legalPerson: '孙八',
    phone: '13400134006',
    email: 'sunba@example.com',
    city: '成都市',
    district: '武侯区',
    businessLicense: '91510000MA1K3XXX06',
    registeredCapital: '200万元',
    businessScope: '食品、调味品批发',
    experience: '3年行业经验',
    teamSize: '10-20人',
    warehouseArea: '500㎡',
    distributionVehicles: '3辆',
    applyTime: '2026-06-10 15:20:00',
    status: APPLICATION_STATUS.REJECTED,
    onboardingStage: 2,
    stageStatus: 'rejected',
    stageData: {
      qualification: {
        reviewer: '李经理',
        reviewTime: '2026-06-12 10:30:00',
        result: 'rejected',
        opinion: '注册资金较少，团队规模不足，暂不合作'
      }
    },
    auditOpinion: '注册资金较少，团队规模不足，暂不合作',
    auditor: '李经理',
    auditTime: '2026-06-12 10:30:00'
  },
  {
    id: '7',
    applyNo: 'SQ202606070007',
    companyName: '武汉市江城商业有限公司',
    legalPerson: '周九',
    phone: '13300133007',
    email: 'zhoujiu@example.com',
    city: '武汉市',
    district: '江汉区',
    businessLicense: '91420000MA1K3XXX07',
    registeredCapital: '400万元',
    businessScope: '餐饮服务、食品加工',
    experience: '7年餐饮行业经验',
    teamSize: '30-50人',
    warehouseArea: '1000㎡',
    distributionVehicles: '6辆',
    applyTime: '2026-06-09 08:45:00',
    status: APPLICATION_STATUS.APPROVED,
    onboardingStage: 5,
    stageStatus: 'in_progress',
    stageData: {
      qualification: {
        reviewer: '王总',
        reviewTime: '2026-06-10 14:00:00',
        result: 'passed',
        opinion: '餐饮经验丰富，团队稳定'
      },
      contract: {
        contractNo: 'HT2026060007',
        contractType: '标准加盟商',
        signDate: '2026-06-12',
        startDate: '2026-07-01',
        endDate: '2028-06-30',
        depositAmount: 50000,
        serviceFeeRate: 5
      },
      training: {
        trainer: '李培训师',
        trainingStartDate: '2026-06-15',
        trainingEndDate: '2026-06-17',
        trainingScore: 88,
        certificateNo: 'PX2026060002',
        result: 'passed'
      },
      account: {
        account: 'wuhan_jc01',
        openDate: '',
        storeNo: 'MD2026060007',
        storeName: '武汉江汉标准店',
        operator: ''
      }
    },
    auditOpinion: '餐饮经验丰富，团队稳定，同意加盟',
    auditor: '王总',
    auditTime: '2026-06-10 14:00:00'
  },
  {
    id: '8',
    applyNo: 'SQ202606080008',
    companyName: '南京市金陵商贸有限公司',
    legalPerson: '吴十',
    phone: '13200132008',
    email: 'wushi@example.com',
    city: '南京市',
    district: '鼓楼区',
    businessLicense: '91320000MA1K3XXX08',
    registeredCapital: '350万元',
    businessScope: '百货零售、日用品批发',
    experience: '5年零售行业经验',
    teamSize: '20-30人',
    warehouseArea: '1200㎡',
    distributionVehicles: '4辆',
    applyTime: '2026-06-08 13:10:00',
    status: APPLICATION_STATUS.APPROVED,
    onboardingStage: 6,
    stageStatus: 'completed',
    stageData: {
      qualification: {
        reviewer: '李经理',
        reviewTime: '2026-06-09 11:00:00',
        result: 'passed',
        opinion: '基础条件达标，同意加盟'
      },
      contract: {
        contractNo: 'HT2026060008',
        contractType: '标准加盟商',
        signDate: '2026-06-10',
        startDate: '2026-06-15',
        endDate: '2028-06-14',
        depositAmount: 50000,
        serviceFeeRate: 5
      },
      training: {
        trainer: '张培训师',
        trainingStartDate: '2026-06-12',
        trainingEndDate: '2026-06-14',
        trainingScore: 92,
        certificateNo: 'PX2026060003',
        result: 'passed'
      },
      account: {
        account: 'nanjing_jl01',
        openDate: '2026-06-15',
        storeNo: 'MD2026060008',
        storeName: '南京鼓楼标准店',
        operator: '系统管理员'
      }
    },
    auditOpinion: '基础条件达标，同意加盟',
    auditor: '李经理',
    auditTime: '2026-06-09 11:00:00'
  }
];

module.exports = {
  mockApplications
};
