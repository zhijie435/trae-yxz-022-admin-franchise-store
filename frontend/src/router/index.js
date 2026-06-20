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
    meta: { title: '门店列表', activeMenu: 'stores' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
