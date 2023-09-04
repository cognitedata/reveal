import { map } from 'lodash';

import { sortAscending, sortDescending } from '../utils/sort';
const LOAD_MORE_BUTTON_TEXT = 'Load More';

const getTableById = (id: string) => {
  return cy.findAllByTestId(id);
};

const tableSholudBeVisible = (id: string) => {
  return cy.getTableById(id).should('be.visible');
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

const getNumberOfRows = (table: JQuery<HTMLElement>) => {
  return cy
    .wrap(table)
    .findAllByTestId('table-body')
    .findAllByTestId('table-row')
    .then((rows) => {
      return rows.length;
    });
};

const clickLoadMoreButton = (table: JQuery<HTMLElement>) => {
  cy.wrap(table)
    .contains(LOAD_MORE_BUTTON_TEXT)
    .scrollIntoView()
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

const shouldLoadMore = (table: JQuery<HTMLElement>, requestAlias?: string) => {
  let initialResultsCount: number;

  cy.wrap(table)
    .getNumberOfRows()
    .then((count) => {
      initialResultsCount = count;
    });

  cy.wrap(table).clickLoadMoreButton();

  if (requestAlias) {
    cy.wait(`@${requestAlias}`);
  }
  cy.wrap(table).contains(LOAD_MORE_BUTTON_TEXT).should('not.be.visible');

  cy.wrap(table)
    .getNumberOfRows()
    .then((newCount) => {
      expect(newCount).to.be.greaterThan(initialResultsCount);
    });
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
Cypress.Commands.add('getTableById', getTableById);
Cypress.Commands.add('tableSholudBeVisible', tableSholudBeVisible);
Cypress.Commands.add('getNumberOfRows', { prevSubject: true }, getNumberOfRows);
Cypress.Commands.add(
  'clickLoadMoreButton',
  { prevSubject: true },
  clickLoadMoreButton
);
Cypress.Commands.add('shouldLoadMore', { prevSubject: true }, shouldLoadMore);

export interface TableCommands {
  getTableById: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSortColoumn: (coloumnName: string) => void;
  getColomnValues: (coloumnid: string) => Cypress.Chainable<string[]>;
  shouldBeSortedAscending: () => void;
  shouldBeSortedDescending: () => void;
  tableSholudBeVisible: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  getNumberOfRows: () => Cypress.Chainable<number>;
  clickLoadMoreButton: () => void;
  shouldLoadMore: (requestAlias?: string) => void;
}
