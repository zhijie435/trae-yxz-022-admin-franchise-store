import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const getApplicationList = (params) => {
  return request.get('/applications', { params })
}

export const getApplicationDetail = (id) => {
  return request.get(`/applications/${id}`)
}

export const reviewApplication = (id, data) => {
  return request.put(`/applications/${id}/review`, data)
}

export const getStatistics = () => {
  return request.get('/statistics')
}

export default request
