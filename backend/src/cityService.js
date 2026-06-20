const { PROVINCE_CITY_MAP, getProvinceByCity } = require('./constants');
const { formatNow, paginateList } = require('./utils');

const cityAssignments = [];

let nextAssignId = 1;

const initCityAssignments = (stores, applications) => {
  cityAssignments.length = 0;
  const cityMap = {};

  stores.forEach(store => {
    const key = `${store.province}-${store.city}`;
    if (!cityMap[key]) {
      cityMap[key] = {
        province: store.province,
        city: store.city,
        partners: [],
        stores: [],
        applicationIds: []
      };
    }
    cityMap[key].stores.push({
      storeId: store.id,
      storeNo: store.storeNo,
      storeName: store.storeName,
      partnerName: store.partnerName,
      status: store.status,
      account: store.account
    });
    if (!cityMap[key].partners.find(p => p.name === store.partnerName)) {
      cityMap[key].partners.push({
        name: store.partnerName,
        phone: store.partnerPhone,
        companyName: store.companyName
      });
    }
  });

  applications.forEach(app => {
    if (app.status === 'approved' || app.onboardingStage >= 2) {
      const key = `${app.province}-${app.city}`;
      if (!cityMap[key]) {
        cityMap[key] = {
          province: app.province,
          city: app.city,
          partners: [],
          stores: [],
          applicationIds: []
        };
      }
      if (!cityMap[key].applicationIds.includes(app.id)) {
        cityMap[key].applicationIds.push(app.id);
      }
      if (!cityMap[key].partners.find(p => p.name === app.legalPerson)) {
        cityMap[key].partners.push({
          name: app.legalPerson,
          phone: app.phone,
          companyName: app.companyName
        });
      }
    }
  });

  Object.values(cityMap).forEach(entry => {
    cityAssignments.push({
      id: String(nextAssignId++),
      province: entry.province,
      city: entry.city,
      partnerCount: entry.partners.length,
      storeCount: entry.stores.length,
      partners: entry.partners,
      stores: entry.stores,
      applicationIds: entry.applicationIds,
      status: entry.stores.length > 0 ? 'assigned' : 'pending',
      assignTime: entry.stores.length > 0 ? formatNow() : '',
      updateTime: formatNow()
    });
  });
};

const getCityAssignmentList = ({ page = 1, pageSize = 10, province, status, keyword } = {}) => {
  let result = [...cityAssignments];

  if (province) {
    result = result.filter(c => c.province === province);
  }

  if (status) {
    result = result.filter(c => c.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(c =>
      c.city.toLowerCase().includes(kw) ||
      c.province.toLowerCase().includes(kw) ||
      c.partners.some(p => p.name.toLowerCase().includes(kw) || p.companyName.toLowerCase().includes(kw))
    );
  }

  result.sort((a, b) => b.storeCount - a.storeCount);

  return paginateList({
    list: result,
    page,
    pageSize
  });
};

const getCityAssignmentByCity = (city) => {
  return cityAssignments.find(c => c.city === city) || null;
};

const getCityAssignmentStatistics = () => {
  const totalCities = cityAssignments.length;
  const assignedCities = cityAssignments.filter(c => c.status === 'assigned').length;
  const pendingCities = cityAssignments.filter(c => c.status === 'pending').length;
  const totalPartners = [...new Set(cityAssignments.flatMap(c => c.partners.map(p => p.name)))].length;
  const totalStores = cityAssignments.reduce((sum, c) => sum + c.storeCount, 0);
  const unassignedProvinces = [];
  const assignedProvinces = [];

  const provinceMap = {};
  cityAssignments.forEach(c => {
    if (!provinceMap[c.province]) {
      provinceMap[c.province] = { total: 0, assigned: 0 };
    }
    provinceMap[c.province].total++;
    if (c.status === 'assigned') {
      provinceMap[c.province].assigned++;
    }
  });

  Object.entries(provinceMap).forEach(([province, data]) => {
    if (data.assigned === 0) {
      unassignedProvinces.push(province);
    }
    if (data.assigned > 0) {
      assignedProvinces.push({
        province,
        totalCities: data.total,
        assignedCities: data.assigned,
        coverage: Math.round((data.assigned / data.total) * 100)
      });
    }
  });

  return {
    totalCities,
    assignedCities,
    pendingCities,
    totalPartners,
    totalStores,
    assignedProvinces,
    unassignedProvinces
  };
};

const assignCityToPartner = (city, partnerInfo) => {
  const assignment = cityAssignments.find(c => c.city === city);
  if (assignment) {
    if (!assignment.partners.find(p => p.name === partnerInfo.name)) {
      assignment.partners.push(partnerInfo);
      assignment.partnerCount = assignment.partners.length;
    }
    assignment.status = 'assigned';
    assignment.updateTime = formatNow();
    if (!assignment.assignTime) {
      assignment.assignTime = formatNow();
    }
    return assignment;
  }

  const province = getProvinceByCity(city);
  const newAssignment = {
    id: String(nextAssignId++),
    province,
    city,
    partnerCount: 1,
    storeCount: 0,
    partners: [partnerInfo],
    stores: [],
    applicationIds: [],
    status: 'assigned',
    assignTime: formatNow(),
    updateTime: formatNow()
  };
  cityAssignments.push(newAssignment);
  return newAssignment;
};

const updateCityAssignmentFromStore = (store) => {
  const assignment = cityAssignments.find(c => c.city === store.city);
  if (assignment) {
    if (!assignment.stores.find(s => s.storeId === store.id)) {
      assignment.stores.push({
        storeId: store.id,
        storeNo: store.storeNo,
        storeName: store.storeName,
        partnerName: store.partnerName,
        status: store.status,
        account: store.account
      });
      assignment.storeCount = assignment.stores.length;
    }
    if (!assignment.partners.find(p => p.name === store.partnerName)) {
      assignment.partners.push({
        name: store.partnerName,
        phone: store.partnerPhone,
        companyName: store.companyName
      });
      assignment.partnerCount = assignment.partners.length;
    }
    assignment.status = 'assigned';
    assignment.updateTime = formatNow();
    if (!assignment.assignTime) {
      assignment.assignTime = formatNow();
    }
  } else {
    assignCityToPartner(store.city, {
      name: store.partnerName,
      phone: store.partnerPhone,
      companyName: store.companyName
    });
    const newAssignment = cityAssignments.find(c => c.city === store.city);
    if (newAssignment) {
      newAssignment.stores.push({
        storeId: store.id,
        storeNo: store.storeNo,
        storeName: store.storeName,
        partnerName: store.partnerName,
        status: store.status,
        account: store.account
      });
      newAssignment.storeCount = 1;
    }
  }
};

module.exports = {
  initCityAssignments,
  getCityAssignmentList,
  getCityAssignmentByCity,
  getCityAssignmentStatistics,
  assignCityToPartner,
  updateCityAssignmentFromStore
};
