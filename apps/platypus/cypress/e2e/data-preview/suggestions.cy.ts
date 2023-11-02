import { getUrl } from '../../utils/url';

describe('Platypus Data Preview Page - Suggestions', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    window.localStorage.setItem(
      '@cognite.fusion.data-modeling.platypus.DEVX_MANUAL_POPULATION',
      'TRUE'
    );
    window.localStorage.setItem(
      '@cognite.fusion.data-modeling.platypus.DEVX_MATCHMAKER_SUGGESTIONS_UI',
      'true'
    );
    cy.request('http://localhost:4201/reset');
    cy.visit(getUrl('/blog/blog/latest/data-management/preview'));
    cy.ensurePageFinishedLoading();
  });

  it('should be able to open and close modal', () => {
    cy.getBySel('suggestions-button').should('contain.text', 'Suggestions');
    cy.getBySel('suggestions-button').click();
    cy.get('.cogs-modal-footer-buttons > .cogs-button--type-ghost').click();
  });

  // skipping as this is low priority
  it.skip('should be able to see suggestions with incomplete direct relationship', () => {
    // add a new row
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.getBySel('draft-row').should('be.visible');
    cy.get('div[role="gridcell"][col-id="title"]')
      .first()
      .click()
      .type('{enter}TestName{enter}');
    cy.get('div[role="gridcell"][col-id="views"]')
      .first()
      .click()
      .type('{enter}123{enter}');

    cy.getBySel('handle-add-row-button').first().click();

    cy.getBySel('suggestions-button-active').click();
    cy.get('input#suggestion-target')
      .click({ force: true })
      .type('{enter}', { force: true });
    cy.get('input#select-all').click({ force: true });
    cy.get('button[data-testid="accept-selection"]').click({ force: true });
    cy.get('.cogs-modal-footer-buttons > .cogs-button--type-primary').click({
      force: true,
    });

    cy.get('.ReactModal__Content').should('not.exist');
  });
});
