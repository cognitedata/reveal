import { map } from 'lodash';

import { sortAscending, sortDescending } from '../utils/sort';

const getTableById = (id: string) => {
  return cy.findAllByTestId(id);
};

const tableSholudBeVisible = (id: string) => {
  cy.getTableById(id).should('be.visible');
};

const clickSortColoumn = (table: JQuery<HTMLElement>, columnName: string) => {
  cy.wrap(table)
    .findAllByTestId('table-head')
    .contains(columnName)
    .parent()
    .find('button')
    .should('be.visible')
    .click();
};

const getColomnValues = (table: JQuery<HTMLElement>, coloumnId: string) => {
  return cy
    .wrap(table)
    .findAllByTestId('table-body')
    .findAllByTestId(coloumnId)
    .then((cells) => {
      return map(cells, 'innerText');
    });
};

const shouldBeSortedAscending = (values: string[]) => {
  const sortedValues = sortAscending(values);
  expect(sortedValues).to.deep.equal(values);
};

const shouldBeSortedDescending = (values: string[]) => {
  const sortedValues = sortDescending(values);
  expect(sortedValues).to.deep.equal(values);
};

Cypress.Commands.add('getTableById', getTableById);
Cypress.Commands.add('tableSholudBeVisible', tableSholudBeVisible);
Cypress.Commands.add(
  'clickSortColoumn',
  { prevSubject: true },
  clickSortColoumn
);
Cypress.Commands.add('getColomnValues', { prevSubject: true }, getColomnValues);
Cypress.Commands.add(
  'shouldBeSortedAscending',
  { prevSubject: true },
  shouldBeSortedAscending
);
Cypress.Commands.add(
  'shouldBeSortedDescending',
  { prevSubject: true },
  shouldBeSortedDescending
);

export interface TableCommands {
  getTableById: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  tableSholudBeVisible: (id: string) => void;
  clickSortColoumn: (coloumnName: string) => void;
  getColomnValues: (coloumnid: string) => Cypress.Chainable<string[]>;
  shouldBeSortedAscending: () => void;
  shouldBeSortedDescending: () => void;
}
