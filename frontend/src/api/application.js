import request from '../utils/request'

export function getApplications(params) {
  return request({
    url: '/applications',
    method: 'get',
    params
  })
}

export function getApplicationDetail(id) {
  return request({
    url: `/applications/${id}`,
    method: 'get'
  })
}

export function auditApplication(id, data) {
  return request({
    url: `/applications/${id}/audit`,
    method: 'put',
    data
  })
}

export function getStatistics() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}
