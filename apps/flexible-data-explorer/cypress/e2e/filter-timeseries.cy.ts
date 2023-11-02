import { Operator, formatDate } from '../support/app';

describe('Filter - Timeseries', () => {
  before(() => {
    cy.performEmptySearch();
    cy.selectSearchCategory('Time series');
  });

  beforeEach(() => {
    cy.interceptRequest('timeseriesList');
  });

  it('Should be able to filter by string properties', () => {
    const property = 'Name';
    const value = 'LOR';

    cy.openFilterInSearchResults('timeseries-results')
      .searchAndClickOption(property)
      .selectOperator(Operator.STARTS_WITH)
      .inputString(value)
      .clickFilterApplyButton();

    cy.waitForRequest('timeseriesList').payloadShouldContain({
      prefix: {
        property: ['name'],
        value,
      },
    });

    cy.removeAppliedFilter(`${property} starts with ${value}`);
    cy.waitForRequest('timeseriesList');
  });

  it('Should be able to filter by boolean properties', () => {
    const property = 'Is step';

    cy.openFilterInSearchResults('timeseries-results')
      .searchAndClickOption(property)
      .selectOperator(Operator.IS_TRUE)
      .clickFilterApplyButton();

    cy.waitForRequest('timeseriesList').payloadShouldContain({
      equals: {
        property: ['isStep'],
        value: true,
      },
    });

    cy.removeAppliedFilter(`${property} is true`);
    cy.waitForRequest('timeseriesList');
  });

  it('Should be able to filter by date properties', () => {
    const property = 'Created time';
    const value = new Date('01/01/2023');

    cy.openFilterInSearchResults('timeseries-results')
      .searchAndClickOption(property)
      .selectOperator(Operator.BEFORE)
      .inputDate(value)
      .clickFilterApplyButton();

    cy.waitForRequest('timeseriesList').payloadShouldContain({
      range: {
        property: ['createdTime'],
        lt: value.valueOf(),
      },
    });

    cy.removeAppliedFilter(`${property} is before ${formatDate(value)}`);
    cy.waitForRequest('timeseriesList');
  });

  it('Should be able to filter by metadata properties', () => {
    const property = 'product_type';
    const value = 'oil';

    cy.openFilterInSearchResults('timeseries-results')
      .searchAndClickOption(property)
      .selectOperator(Operator.EQUALS)
      .inputString(value)
      .clickFilterApplyButton();

    cy.waitForRequest('timeseriesList').payloadShouldContain({
      equals: {
        property: ['metadata', property],
        value,
      },
    });

    cy.removeAppliedFilter(`${property} is equal to ${value}`);
    cy.waitForRequest('timeseriesList');
  });
});
