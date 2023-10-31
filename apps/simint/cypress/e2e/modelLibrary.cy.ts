/// <reference types="cypress" />

import { getUrl } from '../utils/getUrl';

describe('Model library', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should have the correct tab active', () => {
    cy.get('[data-testid="topbar-left"]').as('modelLibraryTab');
    cy.get('@modelLibraryTab').should('not.be.null').should('be.visible');

    cy.get('[data-testid="model-library-container"]')
      .as('Model Library visible')
      .should('be.visible');
  });

  it('should display a list of models', () => {
    cy.get('[data-testid="model-element"]').should('have.length.gt', 0);
  });

  it('should display at least one model version', () => {
    cy.get('[data-testid="model-version-collapse-header"]').as(
      'modelVersionCollapseHeaders'
    );
    cy.get('@modelVersionCollapseHeaders').should('have.length.gt', 0);

    cy.get('@modelVersionCollapseHeaders')
      .first()
      .as('firstModelVersionCollapseHeader');

    cy.get('@firstModelVersionCollapseHeader').should('be.visible');

    cy.get('@firstModelVersionCollapseHeader')
      .get('[data-testid="model-version-number-value"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gte', 0);

    cy.get('@firstModelVersionCollapseHeader')
      .get('[data-testid="model-version-description-value"]')
      .invoke('text')
      .should('not.be.empty');
  });
});
