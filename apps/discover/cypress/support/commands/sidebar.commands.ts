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
      .findByLabelText(`${filter} label`)
      .siblings()
      .first()
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
      if (Array.isArray(toSelect)) {
        toSelect.forEach((text) => {
          cy.findByText(text)
            .scrollIntoView()
            .should('be.visible')
            .click({ waitForAnimations: true });
        });
      } else {
        cy.findByText(toSelect)
          .scrollIntoView()
          .should('be.visible')
          .click({ waitForAnimations: true });
      }
    }

    cy.log(`Close ${filter} select list`);
    cy.findByLabelText(`${filter} label`)
      .scrollIntoView()
      .should('be.visible')
      .click();
  }
);

Cypress.Commands.add(
  'validateCheck',
  (filter: string, toValidate: string[], toSelect?: string) => {
    cy.log(`Check ${filter} visibility`);
    cy.findByLabelText(`${filter} label`).should('be.visible');

    cy.log('Check if options available');
    toValidate.forEach((value) => {
      cy.findByLabelText(`${filter} label`).parent().contains(value);
    });

    if (toSelect) {
      cy.contains(toSelect).click();
    }
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

Cypress.Commands.add(
  'selectItemFromDropdownFilterCategory',
  (category: string, subCategory: string, toSelect?: string) => {
    cy.clickOnFilterCategory(category);
    cy.validateSelect(subCategory, [], toSelect);
  }
);

Cypress.Commands.add(
  'selectItemFromCheckboxFilterCategory',
  (category: string, subCategory: string, toSelect?: string) => {
    cy.clickOnFilterCategory(category);
    cy.validateCheck(category, [], toSelect);
  }
);
Cypress.Commands.add('clickOnNthFilterWrapper', (nth: number) => {
  cy.findAllByTestId('filter-item-wrapper').as('filter-items').eq(nth).click();
});

export interface SidebarCommands {
  validateSelect(
    filter: string,
    values: string[],
    toSelect?: string | string[]
  ): void;
  validateCheck(filter: string, values: string[], toSelect?: string): void;
  clickOnFilterCategory(filter: string): void;
  selectItemFromDropdownFilterCategory(
    category: string,
    subCategory: string,
    toSelect?: string
  ): void;
  selectItemFromCheckboxFilterCategory(
    category: string,
    subCategory: string,
    toSelect?: string
  ): void;
  clickOnNthFilterWrapper(nth: number): void;
}
