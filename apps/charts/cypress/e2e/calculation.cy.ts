import { TIMESERIES_NAME } from '../support/constant';
import { getUrl } from '../utils/getUrl';

describe('Add calculation', () => {
  beforeEach(() => {
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('should be able to add new calculation', () => {
    cy.createChart();

    cy.addTimeseries(TIMESERIES_NAME);

    cy.addCalculation();

    cy.log('close node editor');
    cy.getBySel('close-button').click();

    cy.log('new calculation should be added to the table');
    cy.get('tbody').find('tr').should('have.length', 2);

    cy.deleteChart();
  });
});
