import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Extract data page', () => {
  it('Extractor downloads application can be opened', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySel('extractor-download-page-title').should('exist');
  });
});
