import { getUrl } from '../utils/getUrl';

describe('Model details', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('Shows empty state when there are no calculations', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/models/*/calculations?*', {
      modelCalculationList: [],
    });

    cy.findByRole('tab', { name: /Calculation/i }).click();

    cy.findAllByTestId('no-calculation-results').should('exist');
  });
});
