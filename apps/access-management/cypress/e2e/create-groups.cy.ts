import { v4 as uuid } from 'uuid';

import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

const id = uuid();

const E2E_TEST_GROUP_NAMES = [
  `create-empty-group-test-${id}`,
  `create-all-scope-group-test-${id}`,
  `create-datasets-scope-group-test-${id}`,
  `create-space-ids-scope-group-test-${id}`,
];

describe('Access Management - create groups', () => {
  it('renders the access management app by visiting url', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySelLike('access-management-title').should(
      'contain',
      'Access management'
    );
  });

  it('can create a new empty group', () => {
    cy.visit(getUrl());

    cy.createEmptyGroup(E2E_TEST_GROUP_NAMES[0]);
  });

  it('can create a new group with capabilities with All scope', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-create-group-button').click();
    cy.getBySel('access-management-create-group-name-input').type(
      E2E_TEST_GROUP_NAMES[1]
    );

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
    cy.getToastNotification('success').contains('Group created');
  });

  it('can create a new group with capabilities with Data sets scope', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-create-group-button').click();
    cy.getBySel('access-management-create-group-name-input').type(
      E2E_TEST_GROUP_NAMES[2]
    );

    cy.getBySel('access-management-add-capability-button').click();

    cy.getBySel('access-management-capability-type-selector').click();
    cy.getBySel('access-management-capability-type-selector').type(
      'Assets{enter}'
    );

    cy.getBySel('access-management-capabilities-check-all-checkbox').click();

    cy.get('.ant-radio-input')
      .eq(0)
      .should('have.attr', 'value', 'datasetScope')
      .click();

    cy.get(
      `.ant-select > .ant-select-selector > .ant-select-selection-overflow`
    )
      .click()
      .type('{enter}{enter}');

    cy.getBySel('access-management-save-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group created');
  });

  it('can create a new group with capabilities with Space IDs scope', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-create-group-button').click();
    cy.getBySel('access-management-create-group-name-input').type(
      E2E_TEST_GROUP_NAMES[3]
    );

    cy.getBySel('access-management-add-capability-button').click();

    cy.getBySel('access-management-capability-type-selector').click();
    cy.getBySel('access-management-capability-type-selector').type(
      'Data models{enter}'
    );

    cy.getBySel('access-management-capabilities-check-all-checkbox').click();

    cy.get('.ant-radio-input')
      .eq(0)
      .should('have.attr', 'value', 'spaceIdScope')
      .click();

    cy.get(
      `.ant-select > .ant-select-selector > .ant-select-selection-overflow`
    )
      .click()
      .type('{enter}{enter}{esc}');

    cy.getBySel('access-management-save-capability-button').click();

    cy.getBySel('access-management-create-group-submit-button').click();
    cy.getToastNotification('success').contains('Group created');
  });

  after(() => {
    cy.getBySel('access-management-groups-tab').click();

    E2E_TEST_GROUP_NAMES.forEach((groupName) => {
      cy.searchGroup(groupName);
      cy.doesGroupExist(groupName).then((doesGroupExist) => {
        if (doesGroupExist) {
          cy.deleteGroup(groupName);
        }
      });
    });
  });
});
