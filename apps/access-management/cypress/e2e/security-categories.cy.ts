import { v4 as uuid } from 'uuid';

import { getUrl } from '../utils/getUrl';

const securityCategoryName = `test-security-category-${uuid()}`;

describe('Access Management - security categories', () => {
  it('can navigate to Security Categories tab', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-security-categories-tab').click();
    cy.getBySel('access-management-security-categories-table').should(
      'be.visible'
    );
  });

  it('can create a new security category', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-security-categories-tab').click();
    cy.getBySel('access-management-create-security-category-button').click();

    cy.getBySel('access-management-create-security-category-input').type(
      securityCategoryName
    );

    cy.get('.ant-modal-content > .ant-modal-footer > .ant-btn-primary')
      .should('have.text', 'Create')
      .click();
    cy.getToastNotification('success').contains('Category created');
  });

  it('can search security cataegory by name', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-security-categories-tab').click();

    cy.getBySel('access-management-security-categories-search').type(
      securityCategoryName
    );

    cy.getBySel('access-management-security-categories-table')
      .find('td')
      .eq(1)
      .should('have.text', securityCategoryName);
  });

  it('can search security cataegory by ID', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-security-categories-tab').click();

    cy.getBySel('access-management-security-categories-search').clear();

    cy.getBySel('access-management-security-categories-table')
      .find('td')
      .eq(0)
      .then(($el) => {
        const securityCategoryID = $el.text();
        cy.getBySel('access-management-security-categories-search').type(
          `${securityCategoryID}{enter}`
        );
        cy.getBySel('access-management-security-categories-table')
          .find('td')
          .eq(0)
          .should('have.text', securityCategoryID);
      });
  });

  it('can delete security category', () => {
    cy.visit(getUrl());

    cy.getBySel('access-management-security-categories-tab').click();

    cy.getBySel('access-management-security-categories-search').type(
      securityCategoryName
    );

    cy.getBySel('access-management-security-categories-table')
      .find('td')
      .eq(2)
      .click();
    cy.getBySel('access-management-delete-security-category-button').click();
    cy.get('.ant-modal-confirm-btns > .ant-btn-primary')
      .should('have.text', 'Delete')
      .click();

    cy.getToastNotification('success').contains('Category deleted');
  });
});
