import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Add data', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.ensureCanvasFinishedLoading();
  });

  it('User should be able to add files & time series to canvas', () => {
    cy.createNewCanvas();

    cy.addResources('Files', 'file');

    cy.addResources('Time series', 'timeSeries');

    cy.navigateToHomePage();

    cy.deleteCanvas();
  });

  it('User should be able to add assets & events to canvas', () => {
    cy.createNewCanvas();

    cy.addResources('Assets', 'asset');

    cy.addResources('Events', 'event');

    cy.navigateToHomePage();

    cy.deleteCanvas();
  });
});
