import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { getUrl } from '../utils/getUrl';

describe('Run Browser', () => {
  it('Renders empty state when there are runs in the project', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/v2/calculations/runs?*', {
      calculationRunList: [],
    }).as('getCalculationRuns');

    cy.intercept(
      '/apps/v1/projects/*/simconfig/v2/simulators?hasDataSetDetails=true',
      {
        fixture: 'simulators',
      }
    ).as('getSimulators');

    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
    cy.findByRole('tab', { name: /run browser/i }).click();

    cy.findByTestId('no-results-container').should('exist');
  });

  it('Renders empty state when there are no runs in the project', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/v2/calculations/runs?*', {
      calculationRunList: [],
    }).as('getCalculationRuns');

    cy.fixture('simulators').then((simulators: SimulatorInstance[]) => {
      cy.intercept(
        '/apps/v1/projects/*/simconfig/v2/simulators?hasDataSetDetails=true',
        {
          simulators: simulators.map((simulator) => ({
            ...simulator,
            calculationsRuns: 0,
          })),
        }
      ).as('getSimulators');
    });

    // stub models response so we can be sure where the create button links to
    cy.intercept('/apps/v1/projects/*/simconfig/v2/models?*', {
      fixture: 'models',
    }).as('getModels');

    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
    cy.findByRole('tab', { name: /run browser/i }).click();

    cy.findByTestId('no-runs-container').should('exist');

    // create button goes to the right place
    cy.findByTestId('create-routine-button').click();
    cy.url().should(
      'include',
      'model-library/models/PetroSIM/CDU-100/calculations'
    );
  });

  it('Empty state "create" button links to correct place if project has no models', () => {
    cy.intercept('/apps/v1/projects/*/simconfig/v2/calculations/runs?*', {
      calculationRunList: [],
    }).as('getCalculationRuns');

    cy.fixture('simulators').then((simulators: SimulatorInstance[]) => {
      cy.intercept(
        '/apps/v1/projects/*/simconfig/v2/simulators?hasDataSetDetails=true',
        {
          simulators: simulators.map((simulator) => ({
            ...simulator,
            calculationsRuns: 0,
          })),
        }
      ).as('getSimulators');
    });

    // stub models response so we can be sure where the create button links to
    cy.intercept('/apps/v1/projects/*/simconfig/v2/models?*', {
      modelFileList: [],
    }).as('getModels');

    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
    cy.findByRole('tab', { name: /run browser/i }).click();

    // create button goes to the right place
    cy.findByTestId('create-routine-button').click();
    cy.url().should('include', 'model-library').and('not.include', 'models');
  });
});