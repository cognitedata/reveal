import { Operator, formatDate } from '../support/app';

describe('Filter - Generic', () => {
  before(() => {
    cy.performEmptySearch();
  });

  beforeEach(() => {
    cy.interceptRequest('searchDataTypes');
  });

  it('Should be able to filter by string properties', () => {
    const value = 'Aamir Bashir';

    cy.openFilterInSearchResults('generic-results-Person')
      .searchAndClickOption('name')
      .selectOperator(Operator.NOT_STARTS_WITH)
      .inputString(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterPerson: {
        not: {
          name: {
            prefix: value,
          },
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove name doesn't start with ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by numeric properties', () => {
    const value = 35;

    cy.openFilterInSearchResults('generic-results-Person')
      .searchAndClickOption('age')
      .selectOperator(Operator.LESS_THAN)
      .inputNumber(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterPerson: {
        age: {
          lt: value,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove age is less than ${value}`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by boolean properties', () => {
    cy.openFilterInSearchResults('generic-results-Person')
      .searchAndClickOption('age')
      .selectOperator(Operator.IS_SET)

      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterPerson: {
        age: {
          isNull: false,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove age is set`);
    cy.waitForRequest('searchDataTypes');
  });

  it('Should be able to filter by Date properties', () => {
    const value = new Date(`10/30/2020`);

    cy.selectSearchCategory('Movie');

    cy.openFilterInSearchResults('generic-results-Movie')
      .scrollIntoView()
      .searchAndClickOption('releaseDate')
      .selectOperator(Operator.BEFORE)
      .inputDate(value)
      .clickFilterApplyButton();

    cy.waitForRequest('searchDataTypes').payloadShouldContain({
      filterMovie: {
        releaseDate: {
          lt: value,
        },
      },
    });

    cy.log('Remove applied filter');
    cy.clickIconButton(`Remove releaseDate is before ${formatDate(value)}`);
    cy.waitForRequest('searchDataTypes');
  });
});
