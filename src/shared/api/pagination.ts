export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type PageRequest = {
  page: number;
  pageSize: number;
};

export function normalizePagedResult<T>(data: unknown, fallback: PageRequest, mapItem: (item: Record<string, unknown>) => T): PagedResult<T> {
  const payload = (data ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  return {
    items: rawItems.map((item) => mapItem((item ?? {}) as Record<string, unknown>)),
    totalCount: Number(payload.totalCount ?? payload.total ?? rawItems.length ?? 0),
    page: Number(payload.page ?? fallback.page),
    pageSize: Number(payload.pageSize ?? fallback.pageSize)
  };
}

export function cleanQueryParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.entries(params).reduce<Partial<T>>((accumulator, [key, value]) => {
    if (value === undefined || value === null || value === '') {
      return accumulator;
    }

    accumulator[key as keyof T] = value as T[keyof T];
    return accumulator;
  }, {});
}
