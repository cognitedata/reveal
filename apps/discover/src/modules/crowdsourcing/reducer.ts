import {
  SORT_FIELD_DOCUMENT,
  SORT_ASCENDING_DOCUMENT,
  TOGGLE_SUBMITTEDBYME_DOCUMENT,
  RESET_DOCUMENT_TYPE_FIELDS,
  CLEAR_SEARCH_DOCUMENT_FEEDBACK,
  CrowdsourcingState,
  CrowdsourcingAction,
} from './types';

export const intialState: CrowdsourcingState = {
  loading: false,
  documentSortField: 'Id',
  documentSortAscending: false,
  numberCategoryFeedback: 0,
  documentSubmittedByMe: false,
  pagesCategoryFeedback: 1,
};

export function crowdsourcing(
  state: CrowdsourcingState = intialState,
  action: CrowdsourcingAction
) {
  switch (action.type) {
    case SORT_FIELD_DOCUMENT:
      return {
        ...state,
        documentSortField: action.field,
      };

    case SORT_ASCENDING_DOCUMENT:
      return {
        ...state,
        documentSortAscending: action.asc,
      };

    case TOGGLE_SUBMITTEDBYME_DOCUMENT:
      return {
        ...state,
        documentSubmittedByMe: !state.documentSubmittedByMe,
      };

    case RESET_DOCUMENT_TYPE_FIELDS:
      return {
        ...state,
        documentSortField: 'Id',
        documentSortAscending: false,
        documentSubmittedByMe: false,
      };

    case CLEAR_SEARCH_DOCUMENT_FEEDBACK:
      return {
        ...state,
        documentSortField: 'Id',
        documentSortAscending: false,
        documentSubmittedByMe: false,
      };

    default:
      return state;
  }
}

export default crowdsourcing;
