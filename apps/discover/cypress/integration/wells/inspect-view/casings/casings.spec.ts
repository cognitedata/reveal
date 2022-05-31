import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
const DATA_AVAILABILITY_CASINGS = 'Casings';
const DATA_AVAILABILITY_NPT = 'NPT events';

describe('Wells: casings buttons', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.selectCategory('Wells');

    cy.log('click on source filter section');
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.log('select `casings` from side bar filters');
    cy.findAllByTestId('filter-item-wrapper').as('filter-items').eq(0).click();
    cy.findAllByText(DATA_AVAILABILITY_CASINGS).click();
    cy.findAllByText(DATA_AVAILABILITY_NPT).click();

    cy.log('select one row');
    cy.hoverOnNthWellbore(0);
    cy.clickNthWellboreViewButton(0);

    cy.log('navigate to casings tab');
    cy.goToWellsInspectTab(TAB_NAMES.CASINGS);
  });

  it('Should be able to navigate NPT events page by clicking details options', () => {
    cy.log('navigate NPT events page');
    cy.contains('Details').click({ force: true });
    cy.findByRole('button', { name: 'NPT events' }).click({ force: true });

    cy.log('NPT days & NPT events charts titles should visible ');
    cy.findAllByText('NPT days').should('be.visible');
    cy.findAllByText('NPT events').should('be.visible');

    cy.log('go back to casings page');
    cy.get('[aria-label="Go back"]').as('goBackBtn');
    cy.get('@goBackBtn').eq(1).click({ force: true });
    cy.findByTestId('schema-column').should('be.visible');
  });

  it('Should be able to click on `Both side` & `One side` buttons', () => {
    cy.log('Click on `both side` button');
    cy.contains('Both sides').click({ force: true });

    cy.findByTestId('schema-column')
      .findAllByTestId('depth-indicator-line')
      .then(($bothSideLines) => {
        const countOfBothSidesLines = $bothSideLines.length;

        cy.log('Click on `One side` button');
        cy.contains('One side').click({ force: true });

        cy.findByTestId('schema-column')
          .findAllByTestId('depth-indicator-line')
          .then(($oneSideLines) => {
            const countOfOneSidesLines = $oneSideLines.length;
            expect(countOfBothSidesLines).to.eql(countOfOneSidesLines * 2);
          });
      });
  });

  it('Should be able to click on `Table` & `Graph` buttons', () => {
    cy.log('Click on `Table` button');
    cy.contains('Table').click({ force: true });

    cy.log('Casings data table should visible');
    cy.findAllByRole('table').should('be.visible');

    cy.log('Click on `Graph` button');
    cy.contains('Graph').click({ force: true });
    cy.findByTestId('schema-column').should('be.visible');
  });
});
