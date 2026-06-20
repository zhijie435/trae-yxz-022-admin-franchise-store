const formatNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const paginateList = ({ list, page = 1, pageSize = 10, total } = {}) => {
  const totalCount = total !== undefined ? total : list.length;
  let paginatedList = list;
  if (page && pageSize) {
    const start = (Number(page) - 1) * Number(pageSize);
    paginatedList = list.slice(start, start + Number(pageSize));
  }
  return {
    list: paginatedList,
    total: totalCount,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || totalCount
  };
};

const generateId = (prefix, counter) => {
  return prefix + String(counter).padStart(3, '0');
};

const generateBusinessNo = (prefix, counter) => {
  const now = formatNow();
  const today = now.substring(0, 10).replace(/-/g, '');
  return prefix + today + String(counter).padStart(4, '0');
};

module.exports = {
  formatNow,
  paginateList,
  generateId,
  generateBusinessNo
};
