import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Extraction Pipelines home page', () => {
  it('Extraction Pipelines  application can be opened', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySel('extraction-pipelines-page-title')
      .should('exist')
      .contains(/Extraction pipelines/);
    cy.get('[data-testId="extpipes-container"]');
  });
});
