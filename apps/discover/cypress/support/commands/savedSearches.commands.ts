import { SavedSearch } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../src/constants/app';
import { PROJECT } from '../../app.constants';

import { getTokenHeaders } from './helpers';

const getSavedSearchesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/savedSearches`;

function getAllSavedSearches(
  isAdmin = false
): Cypress.Chainable<Cypress.Response<[]>> {
  return cy.request({
    method: 'GET',
    url: getSavedSearchesEndpoint(PROJECT),
    headers: getTokenHeaders(isAdmin),
  });
}

const deleteAllSavedSearches = (isAdmin = false) => {
  getAllSavedSearches(isAdmin).then((savedSearchResponse: any) => {
    savedSearchResponse.body.data.list.map((savedSearch: any) => {
      return cy.request({
        method: 'DELETE',
        url: `${getSavedSearchesEndpoint(PROJECT)}/${savedSearch.id}`,
        headers: getTokenHeaders(isAdmin),
      });
    });
  });
};

const createSavedSearch = (searchName, isAdmin = false) => {
  const body: SavedSearch = {
    query: '',
    filters: {},
  };
  return cy.request({
    method: 'PUT',
    url: `${getSavedSearchesEndpoint(PROJECT)}/${searchName}`,
    headers: getTokenHeaders(isAdmin),
    body,
  });
};

Cypress.Commands.add('deleteAllSavedSearches', deleteAllSavedSearches);
Cypress.Commands.add('createSavedSearch', createSavedSearch);

export interface SavedSearchCommands {
  deleteAllSavedSearches(isAdmin?: boolean): void;
  createSavedSearch(
    searchName: string,
    isAdmin?: boolean
  ): Cypress.Chainable<Cypress.Response<string>>;
}
