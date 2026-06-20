import request from '../utils/request'

export function getContractList(params) {
  return request({ url: '/contracts', method: 'get', params })
}

export function getContractStatistics() {
  return request({ url: '/contracts/statistics', method: 'get' })
}

export function getContractDetail(id) {
  return request({ url: `/contracts/${id}`, method: 'get' })
}

export function addContract(data) {
  return request({ url: '/contracts', method: 'post', data })
}

export function updateContract(id, data) {
  return request({ url: `/contracts/${id}`, method: 'put', data })
}

export function updateContractStatus(id, status) {
  return request({ url: `/contracts/${id}/status`, method: 'put', data: { status } })
}

export function deleteContract(id) {
  return request({ url: `/contracts/${id}`, method: 'delete' })
}
