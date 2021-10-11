export const GET_CATEGORY_FEEDBACK =
  'prettypoly/crowdsourcing/GET_CATEGORY_FEEDBACK';
export const SORT_FIELD_DOCUMENT =
  'prettypoly/crowdsourcing/SORT_FIELD_DOCUMENT';
export const SORT_ASCENDING_DOCUMENT =
  'prettypoly/crowdsourcing/SORT_ASCENDING_DOCUMENT';
export const TOGGLE_SUBMITTEDBYME_DOCUMENT =
  'prettypoly/crowdsourcing/TOGGLE_SUBMITTEDBYME_DOCUMENT';
export const RESET_DOCUMENT_TYPE_FIELDS =
  'prettypoly/crowdsourcing/RESET_DOCUMENT_TYPE_FIELDS';
export const CLEAR_SEARCH_DOCUMENT_FEEDBACK =
  'prettypoly/crowdsourcing/CLEAR_SEARCH_DOCUMENT_FEEDBACK';

interface SortFieldDocument {
  type: typeof SORT_FIELD_DOCUMENT;
  field: string;
}

interface SortAscendingDocument {
  type: typeof SORT_ASCENDING_DOCUMENT;
  asc: boolean;
}

interface ToggleSubmittedbymeDocument {
  type: typeof TOGGLE_SUBMITTEDBYME_DOCUMENT;
}

interface ResetDocumentTypeFields {
  type: typeof RESET_DOCUMENT_TYPE_FIELDS;
}

interface ClearSearchDocumentFeedback {
  type: typeof CLEAR_SEARCH_DOCUMENT_FEEDBACK;
}

export type CrowdsourcingAction =
  | SortFieldDocument
  | SortAscendingDocument
  | ToggleSubmittedbymeDocument
  | ResetDocumentTypeFields
  | ClearSearchDocumentFeedback;

export interface CrowdsourcingState {
  loading: boolean;
  documentSortField: string;
  documentSortAscending: boolean;
  numberCategoryFeedback: number;
  documentSubmittedByMe: boolean;
  pagesCategoryFeedback: number;
}
