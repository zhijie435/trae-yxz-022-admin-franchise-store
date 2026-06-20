import request from '../utils/request'

export function getCityAssignmentList(params) {
  return request({ url: '/city-assignments', method: 'get', params })
}

export function getCityAssignmentStatistics() {
  return request({ url: '/city-assignments/statistics', method: 'get' })
}

export function getCityAssignmentDetail(city) {
  return request({ url: `/city-assignments/${encodeURIComponent(city)}`, method: 'get' })
}

export function assignCityToPartner(data) {
  return request({ url: '/city-assignments', method: 'post', data })
}
