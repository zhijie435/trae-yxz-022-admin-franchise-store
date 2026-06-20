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
