// import { SIDECAR } from '../../src/constants/app';

/**
 * ALIASES
 * */
export const DOCUMENTS_SEARCH_ALIAS = 'documentsSearch';
export const WELLS_SEARCH_ALIAS = 'wellsSearch';
export const WELLS_BY_IDS_ALIAS = 'getWellsByIds';
export const GEO_STREAMING_ALIAS = 'geoStreaming';
export const WELL_GEOMETRIES_ALIAS = 'wellGeometries';
export const DOCUMENTS_AGGREGATE_ALIAS = 'postAuthorsAggregate';
export const GET_FAVORITES_ALIAS = 'getFavorites';
export const POST_FAVORITES_ALIAS = 'postFavorites';
export const DUPLICATE_FAVORITE_ALIAS = 'duplicateFavorite';
export const PUT_SAVED_SEARCHES_ALIAS = 'putSavedSearches';
export const GET_SAVED_SEARCHES_ALIAS = 'getSavedSearches';
export const SHARE_SAVED_SEARCHES_ALIAS = 'shareSavedSearches';
export const REMOVE_SHARE_SAVED_SEARCHES_ALIAS = 'removeShareSavedSearches';
export const FRONTEND_METRICS_ALIAS = 'postMetrics';

export const MAPBOX_REQUESTS_ALIAS = 'mapboxRequests';
export const USERS_SEARCH_ALIAS = 'usersSearch';

export const UMS_ME_GET = 'getUMS';
export const UMS_ME_UPDATE = 'updateUMS';

export const NPT_CODE = 'nptCode';
export const NPT_DETAIL_CODE = 'nptDetailCode';

/**
 * INTERCEPTIONS
 * */
export const interceptDocumentsSearch = () => {
  cy.intercept({
    url: '**/documents/search',
    method: 'POST',
  }).as(DOCUMENTS_SEARCH_ALIAS);
};

export const interceptWellsSearch = () => {
  cy.intercept({
    url: '**/wdl/wells/search',
    method: 'POST',
  }).as(WELLS_SEARCH_ALIAS);
};

export const interceptWellsByIds = () => {
  cy.intercept({
    url: '**/wdl/wells/byids',
    method: 'POST',
  }).as(WELLS_BY_IDS_ALIAS);
};

export const interceptGeoStreaming = () => {
  cy.intercept({
    url: '**/features/search-streaming',
    method: 'POST',
  }).as(GEO_STREAMING_ALIAS);
};

export const interceptWellGeometries = () => {
  cy.intercept({
    url: '**/well/geometry',
    method: 'GET',
  }).as(WELL_GEOMETRIES_ALIAS);
};

export const interceptDocumentsAggregate = () => {
  cy.intercept({
    path: `**/documents/aggregate`,
    method: 'POST',
  }).as(DOCUMENTS_AGGREGATE_ALIAS);
};

export const interceptGetFavorites = () => {
  cy.intercept({
    url: '**/favorites',
    method: 'GET',
  }).as(GET_FAVORITES_ALIAS);
};

export const interceptPostFavorites = () => {
  cy.intercept({
    url: '**/favorites',
    method: 'POST',
  }).as(POST_FAVORITES_ALIAS);
};

export const interceptDuplicateFavorite = () => {
  cy.intercept({
    url: `**/favorites/duplicate/*`,
    method: 'POST',
  }).as(DUPLICATE_FAVORITE_ALIAS);
};

export const interceptPutSavedSearches = () => {
  cy.intercept({
    url: '**/savedSearches/*',
    method: 'PUT',
  }).as(PUT_SAVED_SEARCHES_ALIAS);
};

export const interceptGetSavedSearches = () => {
  cy.intercept({
    url: '**/savedSearches',
    method: 'GET',
  }).as(GET_SAVED_SEARCHES_ALIAS);
};

export const interceptShareSavedSearches = () => {
  cy.intercept({
    url: '**/savedSearches/share',
    method: 'POST',
  }).as(SHARE_SAVED_SEARCHES_ALIAS);
};

export const interceptRemoveShareSavedSearches = () => {
  cy.intercept({
    url: '**/savedSearches/removeshare',
    method: 'POST',
  }).as(REMOVE_SHARE_SAVED_SEARCHES_ALIAS);
};

export const interceptUsersSearch = () => {
  cy.intercept({
    url: '**/user/search',
    method: 'POST',
  }).as(USERS_SEARCH_ALIAS);
};

export const interceptMapboxRequests = () => {
  cy.intercept({
    url: 'https://api.mapbox.com/**',
    method: 'GET',
  }).as(MAPBOX_REQUESTS_ALIAS);

  cy.intercept({
    url: 'https://events.mapbox.com/**',
    method: 'POST',
  }).as(MAPBOX_REQUESTS_ALIAS);
};

export const interceptUMS = () => {
  cy.intercept({
    url: '**/user/me',
    method: 'GET',
  }).as(UMS_ME_GET);

  cy.intercept({
    url: '**/user/me',
    method: 'PATCH',
  }).as(UMS_ME_UPDATE);
};

export const cancelFrontendMetricsRequest = () => {
  cy.intercept('POST', `**/metrics`, (req) => {
    req.destroy();
  }).as(FRONTEND_METRICS_ALIAS);
};

export const interceptGetNptCodes = () => {
  cy.intercept({
    url: '**/well/legend/npt/code',
    method: 'GET',
  }).as(NPT_CODE);
};

export const interceptGetNptDetailCodes = () => {
  cy.intercept({
    url: '**/well/legend/npt/detailCode',
    method: 'GET',
  }).as(NPT_DETAIL_CODE);
};
