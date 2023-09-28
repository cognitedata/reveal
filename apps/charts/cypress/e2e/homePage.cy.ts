import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Home page', () => {
  it('Renders all elements', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySel('new-chart-button').should('exist');
  });
});
