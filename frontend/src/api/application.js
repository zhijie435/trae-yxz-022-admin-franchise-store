import request from '../utils/request'
import { getProvinces, getCitiesByProvince } from './region.js'

export { getProvinces, getCitiesByProvince }

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
