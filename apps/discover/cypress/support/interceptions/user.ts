export const GET_USER_ROLE_ALIAS = 'getUserRoles';

export const interceptGetUserRoles = () => {
  cy.intercept({
    url: '**/user/roles',
    method: 'GET',
  }).as(GET_USER_ROLE_ALIAS);
};
