import { Operator, formatDate } from '../support/app';

describe('Filter - Generic', () => {
  before(() => {
    cy.performEmptySearch();
  });

  beforeEach(() => {
    cy.interceptRequest('searchDataTypes');
  });

  it('Should be able to filter by string properties', () => {
    cy.selectSearchCategory('Work item');

    const value = 'Test work-item';

    cy.openFilterInSearchResults('generic-results-WorkItem')
      .searchAndClickOption('title')
      .selectOperator(Operator.NOT_STARTS_WITH)
      .inputString(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterWorkItem: {
        not: {
          title: {
            prefix: value,
          },
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove title doesn't start with ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by numeric properties', () => {
    cy.selectSearchCategory('Work order');

    const value = 24;

    cy.openFilterInSearchResults('generic-results-WorkOrder')
      .searchAndClickOption('durationHours')
      .selectOperator(Operator.LESS_THAN)
      .inputNumber(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterWorkOrder: {
        durationHours: {
          lt: value,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove durationHours is less than ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by boolean properties', () => {
    cy.selectSearchCategory('Work item');

    cy.openFilterInSearchResults('generic-results-WorkItem')
      .searchAndClickOption('isCompleted')
      .selectOperator(Operator.IS_SET)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterWorkItem: {
        isCompleted: {
          isNull: false,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove isCompleted is set`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by Date properties', () => {
    cy.selectSearchCategory('Asset');

    const value = new Date(`10/30/2020`);

    cy.openFilterInSearchResults('generic-results-Asset')
      .scrollIntoView()
      .searchAndClickOption('createdDate')
      .selectOperator(Operator.BEFORE)
      .inputDate(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterAsset: {
        createdDate: {
          lt: value,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove createdDate is before ${formatDate(value)}`);
    cy.waitForRequest('searchDataTypes');
  });
});
