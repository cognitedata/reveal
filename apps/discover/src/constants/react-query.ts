// the idea of co-locating all these keys
// is that it will make it easier to keep the
// format in sync

import { FeedbackType } from '../modules/api/feedback/types';
import { SAVED_SEARCHES_CURRENT_KEY } from '../modules/api/savedSearches/constants';

export const DOCUMENT_LABELS_QUERY_KEY = 'labels';

export const DOCUMENT_CATEGORIES_QUERY_KEY = ['documents', 'categories'];
export const DOCUMENT_TYPES_QUERY_KEY = ['documents', 'types'];
export const DOCUMENTS_BY_IDS_QUERY_KEY = ['documents'];

export const RELATED_DOCUMENT_KEY = 'relatedDocuments';

export const USER_KEY = {
  SYNC_QUERY: 'userSync',
  ALL_USERS: ['user', 'getAll'],
  USER: ['user'],
  ROLES: 'roles',
  USER_FAVORITES: ['user', 'favorites'],
};

export const FAVORITE_KEY = {
  ALL_FAVORITES: ['favorites', 'getAll'],
  FAVORITES: ['favorites'],
};

export const SURVEYS_QUERY_KEY = ['surveys'];

// start: Should be an object (just like STATS)
export const SAVED_SEARCHES_QUERY_KEY = 'savedSearches';

export const SAVED_SEARCHES_QUERY_KEY_CURRENT = [
  SAVED_SEARCHES_QUERY_KEY,
  SAVED_SEARCHES_CURRENT_KEY,
];
export const SAVED_SEARCHES_QUERY_KEY_SHARED = [
  SAVED_SEARCHES_QUERY_KEY,
  'shared',
];
// end

const FEEDBACK = 'feedback';
export const FEEDBACK_QUERY_KEY = {
  ALL: (type: FeedbackType) => [FEEDBACK, type, 'getAll'],
  ONE: (type: FeedbackType, id: string) => [FEEDBACK, type, id],
  OBJECT_ALL: [FEEDBACK, 'object', 'getAll'],
};

const STATS = 'stats';
export const STATS_QUERY_KEY = {
  FIND: [STATS, 'find'],
  GET: [STATS, 'get'],
  UPDATE: [STATS, 'update'],
};

export const ONLY_FETCH_ONCE = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

const WELLS = 'wells';
export const WELL_QUERY_KEY = {
  BY_ID: ['wellsById'],
  FILTER_OPTIONS: [WELLS, 'filterOptions'],
  CASINGS: ['casings'],
  TRAJECTORIES: ['trajectories'],
  NDS_EVENTS: ['ndsEvents'],
  NPT_EVENTS: ['nptEvents'],
};

const SEARCH_HISTORY = 'searchHistory';
export const SEARCH_HISTORY_KEY = {
  LIST: [SEARCH_HISTORY, 'list'],
};

export const DOCUMENTS_AGGREGATES = {
  labels: 'DOCUMENTS_LABELS_AGGREGATE',
  filetype: 'DOCUMENTS_FILE_TYPE_AGGREGATE',
  location: 'DOCUMENTS_LOCATION_AGGREGATE',
  lastcreated: 'DOCUMENTS_LASTCREATED_AGGREGATE',
  lastUpdatedTime: 'DOCUMENTS_LASTUPDATED_AGGREGATE',
};

const PROJECT_CONFIG = 'projectConfig';
export const PROJECT_CONFIG_QUERY_KEY = {
  CONFIG: [PROJECT_CONFIG, 'config'],
  METADATA: [PROJECT_CONFIG, 'metadata'],
};
