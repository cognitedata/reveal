import { getUrl } from '../utils/getUrl';

describe('Home page', () => {
  it('Renders all elements', () => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
    cy.getBySel('new-chart-button').should('exist');
  });
});
