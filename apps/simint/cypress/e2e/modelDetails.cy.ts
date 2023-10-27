import { getUrl } from '../utils/getUrl';

describe('Model details', () => {
  it('Shows empty state when there are no calculations', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/models/*/calculations?*', {
      modelCalculationList: [],
    });

    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();

    cy.findByRole('tab', { name: /Calculation/i }).click();

    cy.findAllByTestId('no-calculation-results').should('exist');
  });
});
