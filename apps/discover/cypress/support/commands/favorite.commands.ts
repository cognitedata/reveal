import { FavoritePostSchema } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../src/constants/app';
import { PROJECT } from '../../app.constants';

import { getTokenHeaders } from './helpers';

const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;

function getAllFavorites(
  isAdmin = false
): Cypress.Chainable<Cypress.Response<[]>> {
  return cy.request({
    method: 'GET',
    url: getFavoritesEndpoint(PROJECT),
    headers: getTokenHeaders(isAdmin),
  });
}

function createFavorite(body: FavoritePostSchema, isAdmin = false) {
  return cy.request({
    method: 'POST',
    url: getFavoritesEndpoint(PROJECT),
    headers: getTokenHeaders(isAdmin),
    body,
  });
}

const deleteAllFavorites = (isAdmin = false) => {
  getAllFavorites(isAdmin).then((favoriteResponse) => {
    favoriteResponse.body.map((favorite: any) => {
      return cy.request({
        method: 'DELETE',
        url: `${getFavoritesEndpoint(PROJECT)}/${favorite.id}`,
        headers: getTokenHeaders(isAdmin),
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
    body: FavoritePostSchema,
    isAdmin?: boolean
  ): Cypress.Chainable<Cypress.Response<string>>;
  deleteAllFavorites(isAdmin?: boolean): void;
  goToFavoritesPage(): void;
}
