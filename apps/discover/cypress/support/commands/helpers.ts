import { CLUSTER, PROJECT, USER_PREFIX } from '../constants';

const TOKEN_PREFIX = `discover-${USER_PREFIX}`;
const rawHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const headers = new Headers(rawHeaders);

const getTestUserId = (): string => {
  return Cypress.env('REACT_APP_E2E_USER');
};
export const getTokenHeaders = (accessToken?: boolean): Cypress.Chainable => {
  return cy
    .request<{
      // eslint-disable-next-line camelcase
      access_token: string;
      cluster: string;
      // eslint-disable-next-line camelcase
      id_token: string;
    }>({
      url: 'http://localhost:8200/login/token',
      method: 'POST',
      body: {
        cluster: CLUSTER,
        fakeApplicationId:
          CLUSTER === 'bluefield'
            ? '1f860e84-7353-4533-a088-8fbe3228400f' // bluefield
            : '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48', // azure-dev
        groups: ['defaultGroup', 'writeGroup'],
        roles: [],
        project: PROJECT,
        tokenId: TOKEN_PREFIX,
        userId: getTestUserId(),
      },
      headers,
    })
    .then((response) => {
      if (!response) {
        cy.log('--!!!!--');
        cy.log('Invalid response from Fake IdP');
        cy.log('--!!!!--');
        return {};
      }

      // useful for debugging invalid tokens!
      // console.log('Token response:', response);

      if (accessToken) {
        return { token: response.body.access_token };
      }

      return {
        ...rawHeaders,
        Authorization: `Bearer ${response.body.id_token}`,
      };
    });
};
