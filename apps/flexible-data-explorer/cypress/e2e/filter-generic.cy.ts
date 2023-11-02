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

    const field = 'title';
    const value = 'Test work-item';

    cy.openFilterInSearchResults('generic-results-WorkItem')
      .searchAndClickOption(field)
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

    cy.removeAppliedFilter(`${field} doesn't start with ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by numeric properties', () => {
    cy.selectSearchCategory('Work order');

    const field = 'percentage progress';
    const value = 50;

    cy.openFilterInSearchResults('generic-results-WorkOrder')
      .searchAndClickOption(field)
      .selectOperator(Operator.LESS_THAN)
      .inputNumber(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterWorkOrder: {
        percentageProgress: {
          lt: value,
        },
      },
    });

    cy.removeAppliedFilter(`${field} is less than ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by boolean properties', () => {
    const field = 'completed';

    cy.selectSearchCategory('Work item');

    cy.openFilterInSearchResults('generic-results-WorkItem')
      .searchAndClickOption(field)
      .selectOperator(Operator.IS_SET)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterWorkItem: {
        isCompleted: {
          isNull: false,
        },
      },
    });

    cy.removeAppliedFilter(`${field} is set`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by Date properties', () => {
    cy.selectSearchCategory('Asset');

    const field = 'created date';
    const value = new Date(`10/30/2020`);

    cy.openFilterInSearchResults('generic-results-Asset')
      .scrollIntoView()
      .searchAndClickOption(field)
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

    cy.removeAppliedFilter(`${field} is before ${formatDate(value)}`);
    cy.waitForRequest('searchDataTypes');
  });
});
