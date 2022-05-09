import { TAB_NAMES } from '../../../../src/pages/authorized/search/well/inspect/constants';
import { STATIC_WELL_1 } from '../../../support/constants';

describe('Wells: Related documents', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });
  it('Should have zero results', () => {
    cy.performWellsSearch({
      search: { query: STATIC_WELL_1 },
      select: { wells: [STATIC_WELL_1] },
    });

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.RELATED_DOCUMENTS);

    cy.findByTestId('search-header-breadcrumb').contains('Documents: 0');
  });
});
