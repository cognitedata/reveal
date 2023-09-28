/* eslint-disable @typescript-eslint/no-explicit-any */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

type fieldType = {
  field: string;
  type: string;
  required: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    typeShouldExistInVisualizer(typeName: string | string[]): void;
    typeShouldHaveFieldInVisualizer(
      type: string,
      field: string | string[] | fieldType[]
    ): any;
    typeShouldNotExistInVisualizer(typeName: string | string[]): void;
    typeShouldNotHaveFieldInVisualizer(
      type: string,
      field: string | string[]
    ): any;
  }
}

Cypress.Commands.add(
  'typeShouldExistInVisualizer',
  (type: string | string[]) => {
    if (type instanceof Array) {
      type.forEach((type) => {
        cy.get(`div[title="${type}"]`).should('exist');
      });
    } else {
      cy.get(`div[title="${type}"]`).should('exist');
    }
  }
);

Cypress.Commands.add(
  'typeShouldHaveFieldInVisualizer',
  (type: string, field: string | string[] | fieldType[]) => {
    if (field instanceof Array) {
      field.forEach((field) => {
        if (typeof field === 'string') {
          cy.get(`div[title="${type}"]`).contains(field).should('exist');
        } else {
          cy.get(`div[title="${type}"]`)
            .contains(field.field)
            .as('field')
            .should('exist');
          cy.get('@field')
            .siblings()
            .contains(field.required ? `${field.type}!` : field.type)
            .should('exist');
        }
      });
    } else {
      cy.get(`div[title="${type}"]`).contains(field).should('exist');
    }
  }
);

Cypress.Commands.add(
  'typeShouldNotExistInVisualizer',
  (type: string | string[]) => {
    if (type instanceof Array) {
      type.forEach((type) => {
        cy.get(`div[title="${type}"]`).should('not.exist');
      });
    } else {
      cy.get(`div[title="${type}"]`).should('not.exist');
    }
  }
);

Cypress.Commands.add(
  'typeShouldNotHaveFieldInVisualizer',
  (type: string, field: string | string[]) => {
    if (field instanceof Array) {
      field.forEach((field) => {
        cy.get(`div[title="${type}"]`).contains(field).should('not.exist');
      });
    } else {
      cy.get(`div[title="${type}"]`).contains(field).should('not.exist');
    }
  }
);
