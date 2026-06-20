import request from '../utils/request'

export function getDepositList(params) {
  return request({ url: '/deposits', method: 'get', params })
}

export function getDepositStatistics() {
  return request({ url: '/deposits/statistics', method: 'get' })
}

export function getDepositDetail(id) {
  return request({ url: `/deposits/${id}`, method: 'get' })
}

export function addDeposit(data) {
  return request({ url: '/deposits', method: 'post', data })
}

export function payDeposit(id, data) {
  return request({ url: `/deposits/${id}/pay`, method: 'put', data })
}

export function refundDeposit(id, data) {
  return request({ url: `/deposits/${id}/refund`, method: 'put', data })
}
