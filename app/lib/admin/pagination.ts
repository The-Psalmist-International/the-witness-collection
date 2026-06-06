export const ADMIN_PAGE_SIZE = 10;

export function parsePageParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.trunc(page);
}

export function getTotalPages(totalItems: number, pageSize = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function getPageSlice<T>(items: T[], page: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = getTotalPages(items.length, pageSize);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}
