const getResultsTable = (tableDataTestId?: string) => {
  return tableDataTestId ? cy.findByTestId(tableDataTestId) : cy;
};

const toggleSelectAllRows = (tableDataTestId?: string) => {
  cy.getResultsTable(tableDataTestId)
    .get('[name="Toggle All Rows Selected"]')
    //.should('be.visible') // 08-08-22 this doesnt work on new cogs.js checkboxes
    .click({ force: true });
};

const checkIfAllRowsSelected = (selected = true, tableDataTestId?: string) => {
  cy.getResultsTable(tableDataTestId)
    .get('[name="Toggle All Rows Selected"]')
    //.find('input[type=checkbox]')
    .should(selected ? 'be.checked' : 'not.be.checked');
};

const toggleSelectNthRow = (nth: number, tableDataTestId?: string) => {
  cy.getResultsTable(tableDataTestId)
    .findAllByTestId('table-row')
    .eq(nth)
    .get('[name="Toggle Row Selected"]')
    /*.then(item => {
      console.log("Item toggler", item);
      //item.parent().should('be.visible');
      return item;
    })*/
    .click({ force: true });
};

const clickNthWellViewButton = (nth: number) => {
  cy.findAllByTestId('button-view-document').eq(nth).click({ force: true });
};

const clickNthWellboreViewButton = (nth: number) => {
  cy.findAllByTestId('button-view-wellbore').eq(nth).click({ force: true });
};

const checkIfNthRowIsSelected = (
  nth: number,
  selected = true,
  tableDataTestId?: string
) => {
  cy.log('checkIfNthRowIsSelected');
  cy.getResultsTable(tableDataTestId)
    .findAllByTestId('table-row')
    .eq(nth)
    .get('[name="Toggle Row Selected"]')
    //.find('input[type=checkbox]')
    .should(selected ? 'be.checked' : 'not.be.checked');
};

const hoverOnNthWell = (nth: number) => {
  cy.findAllByTestId('table-row').eq(nth).invoke('attr', 'style', 'opacity: 1');
};

const hoverOnNthWellbore = (nth: number, tableType: string) => {
  cy.findAllByTestId(`well-${tableType}-table`)
    .first()
    .findAllByTestId('table-row')
    .eq(nth)
    .invoke('attr', 'style', 'opacity: 1');
};

Cypress.Commands.add('getResultsTable', getResultsTable);
Cypress.Commands.add('toggleSelectAllRows', toggleSelectAllRows);
Cypress.Commands.add('checkIfAllRowsSelected', checkIfAllRowsSelected);
Cypress.Commands.add('toggleSelectNthRow', toggleSelectNthRow);
Cypress.Commands.add('checkIfNthRowIsSelected', checkIfNthRowIsSelected);
Cypress.Commands.add('hoverOnNthWell', hoverOnNthWell);
Cypress.Commands.add('hoverOnNthWellbore', hoverOnNthWellbore);
Cypress.Commands.add('clickNthWellViewButton', clickNthWellViewButton);
Cypress.Commands.add('clickNthWellboreViewButton', clickNthWellboreViewButton);

export interface TableCommands {
  getResultsTable(
    tableDataTestId?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  toggleSelectAllRows(tableDataTestId?: string): void;
  checkIfAllRowsSelected(
    selected?: boolean,
    tableDataTestId?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  toggleSelectNthRow(nth: number, tableDataTestId?: string): void;
  checkIfNthRowIsSelected(
    nth: number,
    selected?: boolean,
    tableDataTestId?: string
  ): void;
  hoverOnNthWell(nth: number): void;
  hoverOnNthWellbore(nth: number, tableType: string): void;
  clickNthWellViewButton(nth: number): void;
  clickNthWellboreViewButton(nth: number): void;
}
