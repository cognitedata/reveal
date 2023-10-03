export const ASSET_LIST_ALIAS = 'assetList';
export const TIMESERIES_LIST_ALIAS = 'timeseriesList';
export const EVENT_LIST_ALIAS = 'eventList';
export const FILE_LIST_ALIAS = 'fileList';
export const SEQUENCE_LIST_ALIAS = 'sequenceList';

export const ASSET_AGGREGATE_ALIAS = 'assetAggregate';
export const TIMESERIES_AGGREGATE_ALIAS = 'timeseriesAggregate';
export const FILE_AGGREGATE_ALIAS = 'fileAggregate';
export const EVENT_AGGREGATE_ALIAS = 'interceptEventsAggregate';

export const interceptAssetList = (alias = ASSET_LIST_ALIAS) => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/assets/list',
    method: 'POST',
  }).as(alias);
};

export const interceptTimeseriesList = (alias = TIMESERIES_LIST_ALIAS) => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/timeseries/list',
    method: 'POST',
  }).as(alias);
};

export const interceptEventList = (alias = EVENT_LIST_ALIAS) => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/events/list',
    method: 'POST',
  }).as(alias);
};

export const interceptFileList = (alias = FILE_LIST_ALIAS) => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/documents/search',
    method: 'POST',
  }).as(alias);
};

export const interceptSequenceList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/sequences/list',
    method: 'POST',
  }).as(SEQUENCE_LIST_ALIAS);
};

export const interceptAssetAggregate = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/assets/aggregate',
    method: 'POST',
  }).as(ASSET_AGGREGATE_ALIAS);
};

export const interceptTimeseriesAggregate = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/timeseries/aggregate',
    method: 'POST',
  }).as(TIMESERIES_AGGREGATE_ALIAS);
};

export const interceptFileAggregate = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/documents/aggregate',
    method: 'POST',
  }).as(FILE_AGGREGATE_ALIAS);
};

export const interceptEventsAggregate = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/events/aggregate',
    method: 'POST',
  }).as(EVENT_AGGREGATE_ALIAS);
};
