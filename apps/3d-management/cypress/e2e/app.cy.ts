import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('3d-management', () => {
  it('should display welcome message', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
  });
});
