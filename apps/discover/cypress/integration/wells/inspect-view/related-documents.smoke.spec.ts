import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';

describe('Wells: Related documents', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });
  it('Should have zero results', () => {
    cy.performWellsSearch({
      search: { query: 'F-1' },
      select: { wells: ['F-1'] },
    });

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.RELATED_DOCUMENTS);

    cy.findByTestId('search-header-breadcrumb').contains('0 files');
  });
});
