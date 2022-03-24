import {
  GeneralFeedbackResponse,
  ObjectFeedbackResponse,
  UserInfoSummary,
} from '@cognite/discover-api-types';

import { FIELDS } from 'modules/feedback/constants';

export const ADD = 'FEEDBACK_ADD';
export const ADDING = 'FEEDBACK_ADDING';

// GENERAL FEEDBACK
export const GET_ALL_GENERAL = 'GET_ALL_GENERAL';
export const UPDATE_GENERAL = 'UPDATE_GENERAL';
export const SORT_FIELD_GENERAL = 'SORT_FIELD_GENERAL';
export const SORT_ASCENDING_GENERAL = 'SORT_ASCENDING_GENERAL';
export const TOGGLE_DELETED_GENERAL = 'TOGGLE_DELETED_GENERAL';
export const UPDATE_GENERAL_SEARCH = 'UPDATE_GENERAL_SEARCH';
// OBJECT FEEDBACK
export const SORT_FIELD_OBJECT = 'SORT_FIELD_OBJECT';
export const SORT_ASCENDING_OBJECT = 'SORT_ASCENDING_OBJECT';
export const TOGGLE_DELETED_OBJECT = 'TOGGLE_DELETED_OBJECT';
// Object feedback modal visibility
export const SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID =
  'objectFeedback/setObjectFeedbackModalDocumentId';

export const SET_ITEM = 'FEEDBACK_SET_ITEM';
export const FAILED = 'FEEDBACK_FAILED';
export const SET_ROWS_PER_PAGE = 'SET_ROWS_PER_PAGE';

interface SimpleFilter {
  key: number;
  value: string;
}

export interface FeedbackQuery {
  assignedToMeOnly: boolean;
  notAssignedOnly: boolean;
  statuses: number[];
  sortBy: string;
  searchTerm: string;
  pageNo: number;
  itemsPrPage: number;
  filterByFlags: Filter[];
  filterByDeletedStatus: boolean;
}

export interface FeedbackState {
  isLoading: boolean;
  isSent?: boolean;
  failed: boolean;
  rowsPerPage: number;
  feedbackQuery: FeedbackQuery;
  filterStatus: SimpleFilter[];
  filterAssigned: SimpleFilter[];
  filterFlags: SimpleFilter[];

  generalFeedback: GeneralFeedbackResponse[];
  generalFeedbackSearch: string;
  generalFeedbackSortField: typeof FIELDS.status.field;
  generalFeedbackSortAscending: boolean;
  generalFeedbackShowDeleted: boolean;
  generalFeedbackStatusFilters: Filter[];
  generalFeedbackAssignedFilters: Filter[];
  numberGeneralFeedback: number;
  pagesGeneralFeedback: number;
  generalFeedbackSearchquery: '' | null;
  // Object feedback
  objectFeedback: ObjectFeedbackResponse[];
  objectFeedbackSearch: string;
  objectFeedbackSortField: typeof FIELDS.status.field;
  objectFeedbackSortAscending: boolean;
  objectFeedbackShowDeleted: boolean;
  objectFeedbackStatusFilters: Filter[];
  objectFeedbackAssignedFilters: Filter[];
  objectFeedbackFlagFilters: Filter[];
  numberObjectFeedback: number;
  pagesObjectFeedback: number;
  objectFeedbackSearchquery?: '' | null;
  objectFeedbackModalDocumentId?: string;
}

export type Filter = number;

interface Comment {
  comment: string;
  user: string;
  timestamp: string;
}

export interface FeedbackItem {
  id: string;
  query?: string;
  comment: string;
  assignee?: UserInfoSummary;
  user?: UserInfoSummary;
  handlingComments?: Comment[];
  comments?: Comment[];
  deleted?: boolean;
  status?: number; // Type?
  lastUpdatedTime: string;
  createdTime: string;
}

export interface FeedbackSetItem {
  type: typeof SET_ITEM;
  item: FeedbackItem;
}
export interface SetRowsPerPage {
  type: typeof SET_ROWS_PER_PAGE;
  number: number;
}

export interface FeedbackFailed {
  type: typeof FAILED;
}
export interface FeedbackAdd {
  type: typeof ADD;
}
export interface FeedbackAdding {
  type: typeof ADDING;
}

export interface GetAllGeneral {
  type: typeof GET_ALL_GENERAL;
  items: {
    generalFeedbacks: any;
    nResults: any;
    pageCountTotal: any;
  };
}
export interface UpdateGeneral {
  type: typeof UPDATE_GENERAL;
  item: GeneralFeedbackResponse;
}
export interface SortFieldGeneral {
  type: typeof SORT_FIELD_GENERAL;
  field: string;
}
export interface SortAscendingGeneral {
  type: typeof SORT_ASCENDING_GENERAL;
  asc: boolean;
}
export interface ToggleDeletedGeneral {
  type: typeof TOGGLE_DELETED_GENERAL;
}

export interface SortFieldObject {
  type: typeof SORT_FIELD_OBJECT;
  field: string;
}
export interface SortAscendingObject {
  type: typeof SORT_ASCENDING_OBJECT;
  asc: boolean;
}
export interface ToggleDeletedObject {
  type: typeof TOGGLE_DELETED_OBJECT;
}

export interface SetObjectFeedbackModalDocumentId {
  type: typeof SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID;
  documentId: string | undefined;
}

export type FeedbackAction =
  | FeedbackFailed
  | FeedbackAdd
  | FeedbackAdding
  | FeedbackSetItem
  | SetRowsPerPage
  | GetAllGeneral
  | UpdateGeneral
  | SortFieldGeneral
  | SortAscendingGeneral
  | ToggleDeletedGeneral
  | SortFieldObject
  | SortAscendingObject
  | ToggleDeletedObject
  | SetObjectFeedbackModalDocumentId;
