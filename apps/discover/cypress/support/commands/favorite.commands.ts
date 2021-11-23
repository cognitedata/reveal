import { FavoritePostSchema } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../src/constants/app';
import { PROJECT } from '../constants';

import { getTokenHeaders } from './helpers';

const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;

function getAllFavorites(): Cypress.Chainable<Cypress.Response<[]>> {
  return getTokenHeaders().then((res) => {
    return cy.request({
      method: 'GET',
      url: getFavoritesEndpoint(PROJECT),
      headers: res,
    });
  });
}

function createFavorite(body: FavoritePostSchema) {
  return getTokenHeaders().then((headers) => {
    return cy.request({
      method: 'POST',
      url: getFavoritesEndpoint(PROJECT),
      headers,
      body,
    });
  });
}

Cypress.Commands.add('listFavorites', getAllFavorites);
Cypress.Commands.add('createFavorite', createFavorite);

export interface FavoriteCommands {
  listFavorites(): Cypress.Chainable<Cypress.Response<[]>>;
  createFavorite(
    body: FavoritePostSchema
  ): Cypress.Chainable<Cypress.Response<string>>;
}
