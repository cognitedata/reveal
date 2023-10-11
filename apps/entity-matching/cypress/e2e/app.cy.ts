import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('entity-matching', () => {
  it('should display the page', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
  });
});
