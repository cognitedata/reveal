import { getUrl } from '../utils/getUrl';

describe('Access Management - user profiles', () => {
  it('can navigate to User Profiles tab', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-user-profiles-tab').click();
    cy.getBySel('access-management-user-profiles-form').should('be.visible');
  });
});
