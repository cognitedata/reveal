import { STATUS, FIELDS } from './constants';
import {
  FeedbackState,
  FeedbackAction,
  ADD,
  ADDING,
  GET_ALL_GENERAL,
  UPDATE_GENERAL,
  SORT_FIELD_GENERAL,
  SORT_ASCENDING_GENERAL,
  TOGGLE_DELETED_GENERAL,
  SORT_FIELD_OBJECT,
  SORT_ASCENDING_OBJECT,
  TOGGLE_DELETED_OBJECT,
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
  SET_ITEM,
  FAILED,
  SET_ROWS_PER_PAGE,
} from './types';

export const initialState: FeedbackState = {
  // Common
  isLoading: false,
  failed: false,
  rowsPerPage: 10,
  feedbackQuery: {
    assignedToMeOnly: false,
    notAssignedOnly: false,
    statuses: [0, 1],
    sortBy: FIELDS.status.field,
    searchTerm: '',
    pageNo: 1,
    itemsPrPage: 10,
    filterByFlags: [],
    filterByDeletedStatus: false,
  },
  filterStatus: [
    { key: 0, value: 'New' },
    { key: 1, value: 'In progress' },
    { key: 2, value: 'Resolved' },
    { key: 3, value: 'Dismissed' },
  ],
  filterAssigned: [
    { key: 0, value: 'Assigned to me' },
    { key: 1, value: 'Not assigned' },
  ],
  filterFlags: [
    { key: 0, value: 'Sensitive' },
    { key: 1, value: 'Geo' },
    { key: 2, value: 'Other' },
  ],
  // General feedback
  generalFeedback: [],
  generalFeedbackSearch: '',
  generalFeedbackSortField: FIELDS.status.field,
  generalFeedbackSortAscending: false,
  generalFeedbackShowDeleted: false,
  generalFeedbackStatusFilters: [STATUS.New, STATUS.Progress],
  generalFeedbackAssignedFilters: [],
  numberGeneralFeedback: 0,
  pagesGeneralFeedback: 1,
  generalFeedbackSearchquery: null,
  // Object feedback
  objectFeedback: [],
  objectFeedbackSearch: '',
  objectFeedbackSortField: FIELDS.status.field,
  objectFeedbackSortAscending: false,
  objectFeedbackShowDeleted: false,
  objectFeedbackStatusFilters: [STATUS.New, STATUS.Progress],
  objectFeedbackAssignedFilters: [],
  objectFeedbackFlagFilters: [],
  numberObjectFeedback: 0,
  pagesObjectFeedback: 1,
  objectFeedbackSearchquery: null,
};

export function feedback(
  state: FeedbackState = initialState,
  action?: FeedbackAction
) {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case FAILED:
      return {
        ...state,
        isLoading: false,
        item: {},
        failed: true,
      };
    case ADD:
      return {
        ...state,
        isLoading: false,
        item: {},
        failed: false,
      };
    case ADDING:
      return {
        ...state,
        isLoading: true,
        failed: false,
      };

    case SET_ITEM:
      return {
        ...state,
        item: { ...action.item },
      };

    case SET_ROWS_PER_PAGE:
      return {
        ...state,
        rowsPerPage: action.number,
      };

    // GENERAL FEEDBACK
    case GET_ALL_GENERAL:
      return {
        ...state,
        generalFeedback: action.items.generalFeedbacks,
        numberGeneralFeedback: action.items.nResults,
        pagesGeneralFeedback: action.items.pageCountTotal,
      };

    case UPDATE_GENERAL:
      return {
        ...state,
        generalFeedback: state.generalFeedback.map((item) => {
          if (item.id === action.item.id) {
            return { ...action.item };
          }
          return item;
        }),
      };

    case SORT_FIELD_GENERAL:
      return {
        ...state,
        generalFeedbackSortField: action.field,
      };

    case SORT_ASCENDING_GENERAL:
      return {
        ...state,
        generalFeedbackSortAscending: action.asc,
      };

    case TOGGLE_DELETED_GENERAL:
      return {
        ...state,
        generalFeedbackShowDeleted: !state.generalFeedbackShowDeleted,
      };

    // OBJECT FEEDBACK

    case SORT_FIELD_OBJECT:
      return {
        ...state,
        objectFeedbackSortField: action.field,
      };

    case SORT_ASCENDING_OBJECT:
      return {
        ...state,
        objectFeedbackSortAscending: action.asc,
      };

    case TOGGLE_DELETED_OBJECT:
      return {
        ...state,
        objectFeedbackShowDeleted: !state.objectFeedbackShowDeleted,
      };

    case SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID:
      return {
        ...state,
        objectFeedbackModalDocumentId: action.documentId,
      };

    default:
      return state;
  }
}
