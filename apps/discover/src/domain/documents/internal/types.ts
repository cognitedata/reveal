import { DocumentCategories } from '@cognite/discover-api-types';

import {
  DocumentFilterCategoryTitles,
  DocumentsFacets,
} from 'modules/documentSearch/types';

import { GenericApiError, BaseAPIResult } from '../../types';

export type DocumentError = GenericApiError;

export interface DocumentCategoriesResult extends BaseAPIResult {
  data: DocumentCategories;
}

export type DocumentCategoriesFacets = Omit<
  DocumentCategories,
  'fileType' | 'documentType'
>;

export type DocumentFormatFilter = {
  [key in DocumentFilterCategoryTitles]: string[];
};

export const documentFacetsStructure: DocumentsFacets = {
  fileCategory: [],
  labels: [],
  location: [],
  lastmodified: [],
  lastcreated: [],
  pageCount: [],
};

export type DateRange = {
  min?: number;
  max?: number;
};
