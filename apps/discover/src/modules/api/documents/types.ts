import { DocumentCategories } from '@cognite/discover-api-types';

import { GenericApiError, BaseAPIResult } from '../types';

export type DocumentError = GenericApiError;

export interface DocumentCategoriesResult extends BaseAPIResult {
  data: DocumentCategories;
}

export type DocumentCategoriesFacets = Omit<
  DocumentCategories,
  'fileType' | 'documentType'
>;
