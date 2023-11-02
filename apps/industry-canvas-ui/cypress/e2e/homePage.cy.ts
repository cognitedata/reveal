import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Home page', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.ensureCanvasFinishedLoading();
  });

  it('Renders all elements', () => {
    cy.get("[data-testid='homeHeader']", {
      timeout: 30000,
    }).should('exist');
  });

  it('User should be able to copy, duplicate & share created canvas', () => {
    cy.createNewCanvas();

    cy.navigateToHomePage();

    cy.duplicateCanvas();

    cy.shareCanvas();

    cy.navigateToHomePage();

    cy.contains('Public').click();
    cy.get('tbody').find('tr').should('have.length', 1);

    cy.contains('All').click();
    cy.get('tbody').find('tr').should('have.length.greaterThan', 1);

    cy.deleteCanvas();
    cy.contains('Private').click();
    cy.copyCanvas();
    cy.deleteCanvas();
  });
});
