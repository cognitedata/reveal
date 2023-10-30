import { getUrl } from '../utils/getUrl';

describe('Model details', () => {
  it('Shows empty state when there are no calculations', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/models/*/calculations?*', {
      modelCalculationList: [],
    }).as('getModelCalculations');

    cy.intercept('/apps/v1/projects/*/simconfig/definitions').as(
      'getDefinitions'
    );

    cy.intercept('/apps/v1/projects/*/simconfig/v2/simulators?').as(
      'getSimulators'
    );

    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();

    cy.wait('@getDefinitions');
    cy.wait('@getSimulators');

    cy.findByRole('tab', { name: /Calculation/i }).click();

    cy.findAllByTestId('no-calculation-results').should('exist');
  });
});
