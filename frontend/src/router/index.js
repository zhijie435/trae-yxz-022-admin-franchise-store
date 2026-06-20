import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/applications'
  },
  {
    path: '/applications',
    name: 'ApplicationList',
    component: () => import('@/views/ApplicationList.vue'),
    meta: { title: '加盟商申请', activeMenu: 'applications' }
  },
  {
    path: '/applications/:id',
    name: 'ApplicationDetail',
    component: () => import('@/views/ApplicationDetail.vue'),
    meta: { title: '申请详情', activeMenu: 'applications' }
  },
  {
    path: '/stores',
    name: 'StoreList',
    component: () => import('@/views/StoreList.vue'),
    meta: { title: '门店管理', activeMenu: 'stores' }
  },
  {
    path: '/city-assignments',
    name: 'CityAssign',
    component: () => import('@/views/CityAssign.vue'),
    meta: { title: '城市归属', activeMenu: 'city-assignments' }
  },
  {
    path: '/levels',
    name: 'FranchiseLevel',
    component: () => import('@/views/FranchiseLevel.vue'),
    meta: { title: '等级管理', activeMenu: 'levels' }
  },
  {
    path: '/contracts',
    name: 'ContractManage',
    component: () => import('@/views/ContractManage.vue'),
    meta: { title: '合同管理', activeMenu: 'contracts' }
  },
  {
    path: '/deposits',
    name: 'DepositManage',
    component: () => import('@/views/DepositManage.vue'),
    meta: { title: '保证金管理', activeMenu: 'deposits' }
  },
  {
    path: '/service-fees',
    name: 'ServiceFeeManage',
    component: () => import('@/views/ServiceFeeManage.vue'),
    meta: { title: '服务费管理', activeMenu: 'service-fees' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
