import { DateRange, NumericRange, Operator } from '../app';
import { formatDateForFilterInput, resolveTranslation } from '../utils';

const openFilterInSearchResults = (searchResultsId: string) => {
  cy.log(`Open filter in: ${searchResultsId}`);
  cy.findByTestId(searchResultsId)
    .findByTestId('search-results-header')
    .scrollIntoView()
    .clickButton('Filter');

  return cy.findByTestId('filter-menu').should('be.visible');
};

const typeInput = (
  menu: JQuery<HTMLElement>,
  inputTestId: string,
  value: string
) => {
  cy.wrap(menu).findByTestId(inputTestId).click().clear().type(value);
  return cy.wrap(menu);
};

const typeDate = (
  menu: JQuery<HTMLElement>,
  inputTestId: string,
  value: Date
) => {
  cy.wrap(menu)
    .findByTestId(inputTestId)
    .click()
    .type(formatDateForFilterInput(value));

  return cy.wrap(menu);
};

const searchOption = (menu: JQuery<HTMLElement>, option: string) => {
  cy.log(`Search option: ${option}`);
  return cy.wrap(menu).typeInput('search-input', option);
};

const clickOption = (menu: JQuery<HTMLElement>, option: string) => {
  cy.log(`Click option: ${option}`);
  cy.wrap(menu)
    .findByTestId('filter-menu-list')
    .containsExact(option)
    .scrollIntoView()
    .click();

  return cy.findByTestId('filter-menu').should('be.visible');
};

const searchAndClickOption = (menu: JQuery<HTMLElement>, option: string) => {
  return cy.wrap(menu).searchOption(option).clickOption(option);
};

const selectOperator = (menu: JQuery<HTMLElement>, operator: Operator) => {
  const operatorLabel = resolveTranslation(operator);

  cy.log(`Select operator: ${operatorLabel}`);
  cy.wrap(menu).findByTestId('operator-selector').click();
  cy.wrap(menu)
    .findByTestId('operator-selector')
    .containsExact(operatorLabel)
    .scrollIntoView()
    .click();

  return cy.wrap(menu);
};

const inputString = (menu: JQuery<HTMLElement>, value: string) => {
  cy.log(`Input string: ${value}`);
  return cy.wrap(menu).typeInput('string-input', value);
};

const inputNumber = (menu: JQuery<HTMLElement>, value: number) => {
  cy.log(`Input number: ${value}`);
  return cy.wrap(menu).typeInput('number-input', String(value));
};

const inputNumericRange = (menu: JQuery<HTMLElement>, range: NumericRange) => {
  const [min, max] = range;

  cy.log(`Input numeric range: ${min} - ${max}`);
  return cy
    .wrap(menu)
    .typeInput('number-input-min', String(min))
    .typeInput('number-input-max', String(max));
};

const inputDate = (menu: JQuery<HTMLElement>, value: Date) => {
  cy.log(`Input date: ${value.toDateString()}`);
  cy.wrap(menu).typeDate('date-input', value);

  return cy.wrap(menu);
};

const inputDateRange = (menu: JQuery<HTMLElement>, range: DateRange) => {
  const [min, max] = range;

  cy.log(`Input date range: ${min} - ${max}`);
  return cy
    .wrap(menu)
    .typeDate('date-input-min', min)
    .typeDate('date-input-max', max);
};

const clickFilterApplyButton = (menu: JQuery<HTMLElement>) => {
  cy.log('Apply filter');
  cy.wrap(menu).clickButton('Apply');

  return cy.wrap(menu);
};

const clickFilterBackButton = (menu: JQuery<HTMLElement>) => {
  cy.log('Go to previous filter menu');
  cy.wrap(menu).clickIconButton('menu-title-back');

  return cy.wrap(menu);
};

Cypress.Commands.add('openFilterInSearchResults', openFilterInSearchResults);
Cypress.Commands.add('typeInput', { prevSubject: true }, typeInput);
Cypress.Commands.add('typeDate', { prevSubject: true }, typeDate);
Cypress.Commands.add('searchOption', { prevSubject: true }, searchOption);
Cypress.Commands.add('clickOption', { prevSubject: true }, clickOption);
Cypress.Commands.add(
  'searchAndClickOption',
  { prevSubject: true },
  searchAndClickOption
);
Cypress.Commands.add('selectOperator', { prevSubject: true }, selectOperator);
Cypress.Commands.add('inputString', { prevSubject: true }, inputString);
Cypress.Commands.add('inputNumber', { prevSubject: true }, inputNumber);
Cypress.Commands.add(
  'inputNumericRange',
  { prevSubject: true },
  inputNumericRange
);
Cypress.Commands.add('inputDate', { prevSubject: true }, inputDate);
Cypress.Commands.add('inputDateRange', { prevSubject: true }, inputDateRange);
Cypress.Commands.add(
  'clickFilterApplyButton',
  { prevSubject: true },
  clickFilterApplyButton
);
Cypress.Commands.add(
  'clickFilterBackButton',
  { prevSubject: true },
  clickFilterBackButton
);

export interface FilterCommands {
  openFilterInSearchResults: (
    searchResultsId: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  typeInput: (
    inputTestId: string,
    value: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  typeDate: (
    inputTestId: string,
    value: Date
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchOption: (option: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickOption: (option: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchAndClickOption: (
    option: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  selectOperator: (
    operator: Operator
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  inputString: (value: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  inputNumber: (value: number) => Cypress.Chainable<JQuery<HTMLElement>>;
  inputNumericRange: (
    range: NumericRange
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  inputDate: (value: Date) => Cypress.Chainable<JQuery<HTMLElement>>;
  inputDateRange: (range: DateRange) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickFilterApplyButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  clickFilterBackButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
}
