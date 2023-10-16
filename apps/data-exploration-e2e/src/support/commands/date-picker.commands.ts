import { DaySuffix } from '../utils/date';

type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

type DateButtonText = `${Month} ${number}${DaySuffix}`;

type PivotRangeUnit =
  | 'years'
  | 'months'
  | 'weeks'
  | 'days'
  | 'hours'
  | 'minutes';

type PivotRangeDirection = 'before' | 'after' | 'before and after';

const openDatePicker = (filterLabel: string) => {
  cy.log(`Open date picker: ${filterLabel}`);
  return cy.findByTestId(`date-picker-${filterLabel}`).click();
};

const selectYear = (year: number) => {
  cy.log(`Select year: ${year}`);
  cy.findByTestId('yearSelect').select(String(year));
};

const selectMonth = (month: Month) => {
  cy.log(`Select month: ${month}`);
  cy.findByTestId('monthSelect').select(month);
};

const selectDate = (date: DateButtonText) => {
  cy.log(`Select date: ${date}`);
  cy.get(`[aria-label*="${date}"]`).click();
};

const getDatePickerValue = () => {
  return cy
    .findByTestId('date-picker-input')
    .find('input')
    .invoke('attr', 'value');
};

const setPivotRangeInput = (value: number) => {
  cy.log(`Set pivot range input: ${value}`);
  cy.findByTestId('pivot-range-input').clear().type(String(value));
};

const selectPivotRangeUnit = (unit: PivotRangeUnit) => {
  cy.log(`Select pivot range unit: ${unit}`);
  cy.findByTestId('pivot-range-unit').select(unit);
};

const selectPivotRangeDirection = (direction: PivotRangeDirection) => {
  cy.log(`Select pivot range direction: ${direction}`);
  cy.findByTestId('pivot-range-direction').select(direction);
};

Cypress.Commands.add('openDatePicker', openDatePicker);
Cypress.Commands.add('selectYear', selectYear);
Cypress.Commands.add('selectMonth', selectMonth);
Cypress.Commands.add('selectDate', selectDate);
Cypress.Commands.add('getDatePickerValue', getDatePickerValue);
Cypress.Commands.add('setPivotRangeInput', setPivotRangeInput);
Cypress.Commands.add('selectPivotRangeUnit', selectPivotRangeUnit);
Cypress.Commands.add('selectPivotRangeDirection', selectPivotRangeDirection);

export interface DatePickerCommands {
  openDatePicker: (
    filterLabel: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  selectYear: (year: number) => void;
  selectMonth: (month: Month) => void;
  selectDate: (date: DateButtonText) => void;
  getDatePickerValue: () => Cypress.Chainable<string>;
  setPivotRangeInput: (value: number) => void;
  selectPivotRangeUnit: (unit: PivotRangeUnit) => void;
  selectPivotRangeDirection: (direction: PivotRangeDirection) => void;
}
