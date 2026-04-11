const normalizePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const normalizePagination = (
  pagination = {},
  options = { defaultLimit: 20, maxLimit: 100 }
) => {
  const defaultLimit = options.defaultLimit || 20;
  const maxLimit = options.maxLimit || 100;
  const page = normalizePositiveInteger(pagination.page, 1);
  const requestedLimit = normalizePositiveInteger(pagination.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const buildPaginationMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: total > 0 ? Math.ceil(total / limit) : 0,
});

module.exports = {
  normalizePagination,
  buildPaginationMeta,
};
