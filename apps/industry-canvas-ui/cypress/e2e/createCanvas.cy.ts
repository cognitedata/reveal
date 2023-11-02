import { targetAppPackageName } from '../config';
import { CANVAS_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Create Canvas', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.ensureCanvasFinishedLoading();
  });

  it('User should be able to create a new canvas', () => {
    cy.createNewCanvas();

    cy.renameCanvas(CANVAS_NAME);

    cy.navigateToHomePage();

    cy.deleteCanvas();
  });
});
