import request from '../utils/request'

export function getLevelList(params) {
  return request({ url: '/levels', method: 'get', params })
}

export function getLevelStatistics() {
  return request({ url: '/levels/statistics', method: 'get' })
}

export function getLevelDetail(id) {
  return request({ url: `/levels/${id}`, method: 'get' })
}

export function addLevel(data) {
  return request({ url: '/levels', method: 'post', data })
}

export function updateLevel(id, data) {
  return request({ url: `/levels/${id}`, method: 'put', data })
}

export function updateLevelStatus(id, status) {
  return request({ url: `/levels/${id}/status`, method: 'put', data: { status } })
}

export function deleteLevel(id) {
  return request({ url: `/levels/${id}`, method: 'delete' })
}
