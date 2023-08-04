import type { ModelFile } from '@cognite/simconfig-api-sdk/rtk';

export const INITIAL_ITEMS_PER_PAGE = 10;

export const paginateData = (
  data: ModelFile[],
  currentPage: number,
  itemsPerPage = INITIAL_ITEMS_PER_PAGE
) => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

export const getTotalPages = (
  data: ModelFile[],
  itemsPerPage = INITIAL_ITEMS_PER_PAGE
) => Math.ceil(data.length / itemsPerPage);
