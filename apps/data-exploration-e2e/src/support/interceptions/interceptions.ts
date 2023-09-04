export const ASSET_LIST_ALIAS = 'assetList';
export const TIMESERIES_LIST_ALIAS = 'timeseriesList';
export const EVENT_LIST_ALIAS = 'eventList';

export const interceptAssetList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/assets/list',
    method: 'POST',
  }).as(ASSET_LIST_ALIAS);
};

export const interceptTimeseriesList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/timeseries/data/list',
    method: 'POST',
  }).as(TIMESERIES_LIST_ALIAS);
};

export const interceptEventList = () => {
  cy.intercept({
    url: '**/api/v1/projects/dss-dev/events/list',
    method: 'POST',
  }).as(EVENT_LIST_ALIAS);
};
