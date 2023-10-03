import { v4 as uuid } from 'uuid';

import { getUrl } from '../utils/getUrl';

const EXAMPLE_SOURCE_ID = 'ad5cc5b8-68c9-4486-8298-f1fb9c187a08';

const groupName = `create-empty-group-edit-test-${uuid()}`;

describe('Access Management - edit groups', () => {
  it('can edit an existing group by adding the capabilities', () => {
    cy.visit(getUrl());

    cy.createEmptyGroup(groupName);

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(3).click();
    cy.getBySel('access-management-edit-group-button').click();

    cy.getBySel('access-management-add-capability-button').click();

    cy.getBySel('access-management-capability-type-selector').click();
    cy.getBySel('access-management-capability-type-selector').type(
      'Assets{enter}'
    );

    cy.getBySel('access-management-capabilities-check-all-checkbox').click();

    cy.get('.ant-radio-input')
      .eq(1)
      .should('have.attr', 'value', 'all')
      .click();

    cy.getBySel('access-management-save-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group updated');
  });

  it('can edit an existing group by changing the capabilities scope', () => {
    cy.visit(getUrl());

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(3).click();
    cy.getBySel('access-management-edit-group-button').click();

    cy.getBySel('access-management-edit-capability-button').click();

    cy.get('.ant-radio-input')
      .eq(1)
      .should('have.attr', 'value', 'all')
      .click();

    cy.getBySel('access-management-save-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group updated');
  });

  it('can edit an existing group by removing the capabilities', () => {
    cy.visit(getUrl());

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(3).click();
    cy.getBySel('access-management-edit-group-button').click();

    cy.getBySel('access-management-remove-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group updated');
  });

  it('can edit an exisiting group by adding and removing the capabilities', () => {
    cy.visit(getUrl());

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(3).click();
    cy.getBySel('access-management-edit-group-button').click();

    cy.getBySel('access-management-add-capability-button').click();

    cy.getBySel('access-management-capability-type-selector').click();
    cy.getBySel('access-management-capability-type-selector').type(
      'Assets{enter}'
    );

    cy.getBySel('access-management-capabilities-check-all-checkbox').click();

    cy.get('.ant-radio-input')
      .eq(1)
      .should('have.attr', 'value', 'all')
      .click();

    cy.getBySel('access-management-save-capability-button').click();

    cy.getBySel('access-management-remove-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group updated');
  });

  it('can edit an existing group by changing the source id', () => {
    cy.visit(getUrl());

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(3).click();
    cy.getBySel('access-management-edit-group-button').click();

    cy.getBySel('access-management-group-source-id-input').clear();
    cy.getBySel('access-management-group-source-id-input').type(
      `${EXAMPLE_SOURCE_ID}`
    );

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group updated');
  });

  after(() => cy.deleteGroup(groupName));
});
