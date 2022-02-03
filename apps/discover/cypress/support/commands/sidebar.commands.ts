const SELECT_TEXT = 'Select...';

Cypress.Commands.add(
  'validateSelect',
  (filter: string, toValidate: string[], toSelect?: string) => {
    cy.log(`Check ${filter} visibility`);
    cy.findByLabelText(`${filter} label`)
      .should('be.visible')
      .as(`${filter}-label`);

    cy.log(`Expand ${filter} filter and check visibility`);

    cy.findAllByTestId('filter-item-wrapper')
      .as('filter-items')
      .should('be.visible')
      .contains(filter)
      .should('be.visible');

    cy.findByLabelText(`${filter} list`)
      .should('be.visible')
      .as(`${filter}-select`);

    cy.get(`@${filter}-select`)
      .contains(SELECT_TEXT)
      .should('be.visible')
      .click();

    cy.log('Check select has right values');
    toValidate.forEach((value) => {
      //   cy.findAllByTestId('filter-item-wrapper')
      //     .contains(value)
      //     .should('be.visible');

      cy.get('@filter-items').contains(value);
      //   cy.contains(value).should('be.visible');
      //   cy.get(`@${filter}-select`).contains(value).should('be.visible');
    });

    if (toSelect) {
      cy.contains(toSelect).click();
    }

    cy.log(`Close ${filter} select list`);
    cy.get(`@${filter}-label`).scrollIntoView().click();
  }
);

Cypress.Commands.add('clickOnFilterCategory', (category: string) => {
  cy.log(`Click on ${category}`);
  cy.findByTestId('side-bar')
    .contains(category)
    .scrollIntoView()
    .should('be.visible')
    .click();
});

export interface SidebarCommands {
  validateSelect(filter: string, values: string[], toSelect?: string): void;
  clickOnFilterCategory(filter: string): void;
}
