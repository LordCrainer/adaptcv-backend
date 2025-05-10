// DEPRECATED
export const getPagination = ({
  page,
  limit,
  skip,
  total
}: Pagination): Pagination => {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    totalPages,
    skip,
    total
  }
}
