const LOAD_MORE_BUTTON_TEXT = 'Load More';

const getTableById = (id: string) => {
  return cy.findAllByTestId(id);
};

const tableShouldBeVisible = (id: string) => {
  return cy.getTableById(id).should('be.visible');
};

const tableContentShouldBeVisible = (id: string) => {
  return cy.getTableById(id).findByTestId('table-body').should('be.visible');
};

const findByColumnName = (table: JQuery<HTMLElement>, columnName: string) => {
  return cy.wrap(table).find(`[data-column-name="${columnName}"]`);
};

const clickSortColoumn = (table: JQuery<HTMLElement>, columnName: string) => {
  cy.wrap(table)
    .findAllByTestId('table-head')
    .containsExact(columnName)
    .parent()
    .find('button')
    .should('be.visible')
    .click();
};

const getNumberOfRows = (table: JQuery<HTMLElement>) => {
  return cy
    .wrap(table)
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

const getRowsWithColumnValues = (
  table: JQuery<HTMLElement>,
  columnName: string,
  columnValue: string
) => {
  return cy
    .wrap(table)
    .findAllByTestId('table-row')
    .findByColumnName(columnName)
    .filter(`:contains(${columnValue})`);
};

const shouldAllRowsHaveValueInColumn = (
  table: JQuery<HTMLElement>,
  columnName: string,
  columnValue: string
) => {
  cy.wrap(table)
    .getNumberOfRows()
    .then((numberOfTotalRows) => {
      cy.wrap(table)
        .getRowsWithColumnValues(columnName, columnValue)
        .should('have.length', numberOfTotalRows);
    });

  return cy.wrap(table);
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

const selectColumn = (table: JQuery<HTMLElement>, columnName: string) => {
  cy.wrap(table)
    .find('[aria-label="Column Selection"]')
    .as('column-toggle-button')
    .click();

  cy.wrap(table)
    .findByTestId('column-toggle-menu')
    .containsExact(columnName)
    .scrollIntoView()
    .should('be.visible')
    .as(`column-${columnName}`)
    .closest('label')
    .find('input[type="checkbox"]')
    .then((checkbox) => {
      if (checkbox.is(':not(:checked)')) {
        cy.log(`select column "${columnName}"`);
        cy.get(`@column-${columnName}`).click();
      } else {
        cy.log(`"${columnName}" column is already selected`);
      }
    });

  cy.log('close column toggle menu');
  cy.get('@column-toggle-button').click();

  return cy.wrap(table);
};

Cypress.Commands.add('getTableById', getTableById);
Cypress.Commands.add('tableShouldBeVisible', tableShouldBeVisible);
Cypress.Commands.add(
  'findByColumnName',
  { prevSubject: true },
  findByColumnName
);
Cypress.Commands.add(
  'clickSortColoumn',
  { prevSubject: true },
  clickSortColoumn
);
Cypress.Commands.add(
  'shouldAllRowsHaveValueInColumn',
  { prevSubject: true },
  shouldAllRowsHaveValueInColumn
);
Cypress.Commands.add('getTableById', getTableById);
Cypress.Commands.add('tableShouldBeVisible', tableShouldBeVisible);
Cypress.Commands.add(
  'tableContentShouldBeVisible',
  tableContentShouldBeVisible
);
Cypress.Commands.add('getNumberOfRows', { prevSubject: true }, getNumberOfRows);
Cypress.Commands.add(
  'clickLoadMoreButton',
  { prevSubject: true },
  clickLoadMoreButton
);
Cypress.Commands.add(
  'getRowsWithColumnValues',
  { prevSubject: true },
  getRowsWithColumnValues
);
Cypress.Commands.add('shouldLoadMore', { prevSubject: true }, shouldLoadMore);
Cypress.Commands.add('selectColumn', { prevSubject: true }, selectColumn);

export interface TableCommands {
  getTableById: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  findByColumnName: (
    columnName: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSortColoumn: (columnName: string) => void;
  shouldAllRowsHaveValueInColumn: (
    columnName: string,
    columnValue: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  tableShouldBeVisible: (id: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  tableContentShouldBeVisible: (
    id: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  getNumberOfRows: () => Cypress.Chainable<number>;
  clickLoadMoreButton: () => void;
  getRowsWithColumnValues: (
    columnName: string,
    columnValue: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  shouldLoadMore: (requestAlias?: string) => void;
  selectColumn: (columnName: string) => Cypress.Chainable<JQuery<HTMLElement>>;
}
