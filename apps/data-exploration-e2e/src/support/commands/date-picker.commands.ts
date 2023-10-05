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

type DateSuffix = 'st' | 'nd' | 'rd' | 'th';
type DateButtonText = `${Month} ${number}${DateSuffix}`;

const openDatePicker = (filterLabel: string) => {
  cy.log(`Open date picker: ${filterLabel}`);
  return cy.findByTestId(`date-picker-${filterLabel}`).click();
};

const selectYear = (year: number) => {
  cy.findByTestId('yearSelect').select(String(year));
};

const selectMonth = (month: Month) => {
  cy.findByTestId('monthSelect').select(month);
};

const selectDate = (date: DateButtonText) => {
  cy.get(`[aria-label*="${date}"]`).click();
};

const getDatePickerValue = (filterLabel: string) => {
  return cy.findByTestId(`date-picker-${filterLabel}`).invoke('text');
};

Cypress.Commands.add('openDatePicker', openDatePicker);
Cypress.Commands.add('selectYear', selectYear);
Cypress.Commands.add('selectMonth', selectMonth);
Cypress.Commands.add('selectDate', selectDate);
Cypress.Commands.add('getDatePickerValue', getDatePickerValue);

export interface DatePickerCommands {
  openDatePicker: (
    filterLabel: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  selectYear: (year: number) => void;
  selectMonth: (month: Month) => void;
  selectDate: (date: DateButtonText) => void;
  getDatePickerValue: (filterLabel: string) => Cypress.Chainable<string>;
}
