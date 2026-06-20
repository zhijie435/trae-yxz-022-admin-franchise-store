import request from '../utils/request'

export function getProvinces() {
  return request({
    url: '/regions/provinces',
    method: 'get'
  })
}

export function getCitiesByProvince(province) {
  return request({
    url: '/regions/cities',
    method: 'get',
    params: { province }
  })
}

export function getApplicationList(params) {
  return request({
    url: '/applications',
    method: 'get',
    params
  })
}

export function getStatistics() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}

export function getStageStatistics() {
  return request({
    url: '/applications/stats/stage',
    method: 'get'
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

export function advanceStage(id, stageData) {
  return request({
    url: `/applications/${id}/advance-stage`,
    method: 'put',
    data: { stageData }
  })
}

export function updateStageData(id, stage, data) {
  return request({
    url: `/applications/${id}/stage-data/${stage}`,
    method: 'put',
    data
  })
}
