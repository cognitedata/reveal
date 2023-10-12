import { getUrl } from '../utils/getUrl';

describe('Access Management - openid', () => {
  it('can navigate to OpenID Connect tab', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-openid-connect-tab').click();
    cy.getBySel('access-management-openid-connect-form').should('be.visible');
  });
});
