import request from '../utils/request'

export function getServiceFeeList(params) {
  return request({ url: '/service-fees', method: 'get', params })
}

export function getServiceFeeStatistics() {
  return request({ url: '/service-fees/statistics', method: 'get' })
}

export function getServiceFeeDetail(id) {
  return request({ url: `/service-fees/${id}`, method: 'get' })
}

export function addServiceFee(data) {
  return request({ url: '/service-fees', method: 'post', data })
}

export function payServiceFee(id, data) {
  return request({ url: `/service-fees/${id}/pay`, method: 'put', data })
}
