export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function paginate<T>(
  findMany: () => Promise<T[]>,
  count: () => Promise<number>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const [data, total] = await Promise.all([findMany(), count()]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
