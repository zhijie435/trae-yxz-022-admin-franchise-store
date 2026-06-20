import { createRouter, createWebHashHistory } from 'vue-router';
import ApplicationList from '../views/ApplicationList.vue';
import ApplicationDetail from '../views/ApplicationDetail.vue';

const routes = [
  {
    path: '/',
    redirect: '/applications'
  },
  {
    path: '/applications',
    name: 'ApplicationList',
    component: ApplicationList
  },
  {
    path: '/applications/:id',
    name: 'ApplicationDetail',
    component: ApplicationDetail
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
