import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.data;
    }
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getApplicationList = (params) => {
  return request.get('/franchise-applications', { params });
};

export const getApplicationDetail = (id) => {
  return request.get(`/franchise-applications/${id}`);
};

export const approveApplication = (id, data) => {
  return request.post(`/franchise-applications/${id}/approve`, data);
};

export const rejectApplication = (id, data) => {
  return request.post(`/franchise-applications/${id}/reject`, data);
};

export const getStatistics = () => {
  return request.get('/franchise-applications/statistics');
};

export const getStatusConfig = () => {
  return request.get('/status-config');
};

export const getBusinessTypes = () => {
  return request.get('/business-types');
};

export const getCityLevels = () => {
  return request.get('/city-levels');
};

export default request;
