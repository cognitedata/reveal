export const ASSET_LIST_ALIAS = 'assetList';
export const TIMESERIES_LIST_ALIAS = 'timeseriesList';
export const EVENT_LIST_ALIAS = 'eventList';
export const FILE_LIST_ALIAS = 'fileList';
export const SEQUENCE_LIST_ALIAS = 'sequenceList';
export const FILES_SEARCH_ALIAS = 'filesSearch';

export const interceptAssetList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/assets/list',
    method: 'POST',
  }).as(ASSET_LIST_ALIAS);
};

export const interceptTimeseriesList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/timeseries/list',
    method: 'POST',
  }).as(TIMESERIES_LIST_ALIAS);
};

export const interceptEventList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/events/list',
    method: 'POST',
  }).as(EVENT_LIST_ALIAS);
};

export const interceptFileList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/documents/search',
    method: 'POST',
  }).as(FILE_LIST_ALIAS);
};

export const interceptSequenceList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/sequences/list',
    method: 'POST',
  }).as(SEQUENCE_LIST_ALIAS);
};

export const interceptFilesSearch = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/files/search',
    method: 'POST',
  }).as(FILES_SEARCH_ALIAS);
};
