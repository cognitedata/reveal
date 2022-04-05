import { FavoritePostSchema } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../src/constants/app';
import { PROJECT } from '../../app.constants';

import { getTokenHeaders } from './helpers';

const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;

function getAllFavorites(): Cypress.Chainable<Cypress.Response<[]>> {
  return cy.request({
    method: 'GET',
    url: getFavoritesEndpoint(PROJECT),
    headers: getTokenHeaders(),
  });
}

function createFavorite(body: FavoritePostSchema) {
  return cy.request({
    method: 'POST',
    url: getFavoritesEndpoint(PROJECT),
    headers: getTokenHeaders(),
    body,
  });
}

const deleteAllFavorites = () => {
  getAllFavorites().then((favoriteResponse) => {
    favoriteResponse.body.map((favorite: any) => {
      return cy.request({
        method: 'DELETE',
        url: `${getFavoritesEndpoint(PROJECT)}/${favorite.id}`,
        headers: getTokenHeaders(),
      });
    });
  });
};

const goToFavoritesPage = () => {
  cy.log('go to Favorites page');
  cy.findByTestId('top-bar').findByRole('tab', { name: 'Favorites' }).click();
  cy.url().should('include', '/favorites');
};

Cypress.Commands.add('listFavorites', getAllFavorites);
Cypress.Commands.add('createFavorite', createFavorite);
Cypress.Commands.add('deleteAllFavorites', deleteAllFavorites);
Cypress.Commands.add('goToFavoritesPage', goToFavoritesPage);

export interface FavoriteCommands {
  listFavorites(): Cypress.Chainable<Cypress.Response<[]>>;
  createFavorite(
    body: FavoritePostSchema
  ): Cypress.Chainable<Cypress.Response<string>>;
  deleteAllFavorites(): void;
  goToFavoritesPage(): void;
}
