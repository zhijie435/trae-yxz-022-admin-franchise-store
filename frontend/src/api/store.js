import request from '../utils/request'

export function getStores(params) {
  return request({
    url: '/stores',
    method: 'get',
    params
  })
}

export function getStoreStatistics() {
  return request({
    url: '/stores/statistics',
    method: 'get'
  })
}

export function getStoreDetail(id) {
  return request({
    url: `/stores/${id}`,
    method: 'get'
  })
}

export function addStore(data) {
  return request({
    url: '/stores',
    method: 'post',
    data
  })
}

export function updateStore(id, data) {
  return request({
    url: `/stores/${id}`,
    method: 'put',
    data
  })
}

export function deleteStore(id) {
  return request({
    url: `/stores/${id}`,
    method: 'delete'
  })
}

export function toggleStoreStatus(id, status) {
  return request({
    url: `/stores/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function resetPassword(id, newPassword) {
  return request({
    url: `/stores/${id}/reset-password`,
    method: 'put',
    data: { newPassword }
  })
}
