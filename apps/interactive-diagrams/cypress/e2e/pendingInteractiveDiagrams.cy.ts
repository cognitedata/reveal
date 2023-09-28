import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Pending Interactive Diagrams', () => {
  it('Renders no pending interactive diagrams page', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();

    cy.getBySelector('create-new-interactive-diagrams-button').should('exist');
  });
});
