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

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    getToastNotification<E extends Node = HTMLElement>(
      type: 'success' | 'error'
    ): Chainable<JQuery<E>>;
    deleteGroup: (groupName: string) => void;
    searchGroup: (groupName: string) => void;
    doesGroupExist: (groupName: string) => Cypress.Chainable<boolean>;
    createEmptyGroup: (groupName: string) => void;
  }
}

Cypress.Commands.add('getToastNotification', (type, ...args) => {
  const cogsTypeClass =
    type === 'success'
      ? 'ant-notification-notice-success'
      : 'ant-notification-notice-error';

  return cy.get(`.${cogsTypeClass}`, ...args);
});

Cypress.Commands.add('searchGroup', (groupName: string) => {
  cy.getBySel('access-management-group-search').clear();
  cy.getBySel('access-management-group-search').type(groupName);
});

Cypress.Commands.add('deleteGroup', (groupName: string) => {
  cy.searchGroup(groupName);

  cy.getBySel('access-management-groups-table').find('td').eq(3).click();
  cy.getBySel('access-management-delete-group-button').click();

  cy.getBySel('access-management-confirm-delete-group-button').click();
});

Cypress.Commands.add('doesGroupExist', (groupName: string) => {
  cy.searchGroup(groupName);

  cy.getBySel('access-management-groups-table')
    .find('td')
    .then(($td) => {
      if ($td.length > 0 && $td.eq(1).text() === groupName) {
        return true;
      } else {
        return false;
      }
    });
});

Cypress.Commands.add('createEmptyGroup', (groupName: string) => {
  cy.getBySel('access-management-groups-tab').click();

  cy.getBySel('access-management-create-group-button').click();

  cy.getBySel('access-management-create-group-name-input').type(groupName);

  cy.getBySel('access-management-create-group-submit-button').click();
  cy.getToastNotification('success').contains('Group created');
});
