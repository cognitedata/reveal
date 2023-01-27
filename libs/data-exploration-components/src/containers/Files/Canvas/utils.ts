export const getPagedContainerId = (
  fileId: number,
  page: number | undefined
) => {
  return `${fileId}-${page}`;
};
