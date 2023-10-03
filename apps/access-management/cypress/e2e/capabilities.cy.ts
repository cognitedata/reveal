import { v4 as uuid } from 'uuid';

import { getUrl } from '../utils/getUrl';

const groupName = `create-empty-group-search-test-${uuid()}`;

describe('Access Management - capabilities', () => {
  it('can search by group name', () => {
    cy.visit(getUrl());

    cy.createEmptyGroup(groupName);

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table')
      .find('td')
      .eq(1)
      .should('have.text', groupName);
  });

  it('can search by group ID', () => {
    cy.visit(getUrl());

    cy.searchGroup(groupName);

    cy.getBySel('access-management-groups-table').find('td').eq(0);

    cy.getBySel('group-cat-id').then(($el) => {
      const groupID = $el.text();
      cy.getBySel('access-management-group-search').clear();
      cy.getBySel('access-management-group-search').type(`${groupID}{enter}`);
      cy.getBySel('access-management-groups-table')
        .find('td')
        .eq(0)
        .should('have.text', groupID);
    });
  });

  it('can search by capability', () => {
    cy.visit(getUrl());

    cy.searchGroup('assets');

    cy.getBySel('access-management-groups-table')
      .find('td')
      .eq(2)
      .should('contains.text', 'assets');
  });

  after(() => {
    cy.deleteGroup(groupName);
  });
});
