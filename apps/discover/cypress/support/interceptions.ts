/**
 * ALIASES
 * */
export const DOCUMENTS_SEARCH_ALIAS = 'documentsSearch';
export const WELLS_SEARCH_ALIAS = 'wellsSearch';
export const GEO_STREAMING_ALIAS = 'geoStreaming';
export const WELL_GEOMETRIES_ALIAS = 'wellGeometries';
export const DOCUMENTS_AGGREGATE_ALIAS = 'postAuthorsAggregate';
export const FAVORITES = 'getFavorites';

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

export const interceptFavorites = () => {
  cy.intercept({
    url: '**/favorites',
    method: 'GET',
  }).as(FAVORITES);
};
