import { NO_RESULTS_TEXT } from '../../../../../src/components/EmptyState/constants';
import { UserPreferredUnit } from '../../../../../src/constants/units';
import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../../support/interceptions';

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
    cy.hoverOnNthWellbore(0, 'result');
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

describe('Casings: Table view', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('casings/list', 'POST', 'casingsList');
    cy.addWaitForWdlResources('npt/list', 'POST', 'nptList');
    cy.addWaitForWdlResources('nds/list', 'POST', 'ndsList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');

    cy.log(`click on ${DATA_AVAILABILITY} filter section`);
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.log(
      `select ${DATA_AVAILABILITY_NPT} and ${DATA_AVAILABILITY_CASINGS} from side bar filters`
    );
    cy.validateSelect(
      DATA_AVAILABILITY,
      [DATA_AVAILABILITY_NPT, DATA_AVAILABILITY_CASINGS],
      [DATA_AVAILABILITY_NPT, DATA_AVAILABILITY_CASINGS]
    );

    cy.log('select all rows');
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows();
    cy.openInspectView();

    cy.log('navigate to casings tab');
    cy.goToWellsInspectTab(TAB_NAMES.CASINGS);
  });

  it('Should be able to filter results by Well/Wellbore', () => {
    cy.log('Click on `Table` button');
    cy.wait('@casingsList');
    cy.wait('@nptList');
    cy.wait('@ndsList');

    cy.contains('Table').click({ force: true });

    cy.log('filter results by well');
    cy.findAllByTestId('table-cell')
      .eq(1)
      .invoke('text')
      .then((wellName) => {
        cy.findByTestId('search-box-input')
          .click()
          .type('{selectall}')
          .type(`${wellName}{enter}`);
      });

    cy.log('clear search input box');
    cy.findAllByTestId('search-box-input').clear().type('{enter}');

    cy.log('filter results by wellbore');
    cy.findAllByTestId('wellbore-casings-table')
      .findAllByTestId('table-cell')
      .eq(1)
      .invoke('text')
      .then((wellBoreName) => {
        cy.log(`Found: ${wellBoreName}`);
        cy.findByTestId('search-box-input')
          .click()
          .type('{selectall}')
          .type(`${wellBoreName}{enter}`);
      });

    cy.log('result table should contain at least 1 wellbore');
    cy.findByTestId('wellbore-casings-table')
      .findAllByTestId('table-row')
      .its('length')
      .should('be.gte', 1);

    cy.log('clear search input box');
    cy.findAllByTestId('search-box-input').clear().type('{enter}');

    cy.log('verify incorrect filter string');
    cy.findByTestId('search-box-input')
      .click()
      .type('{selectall}')
      .type(`test-string {enter}`);

    cy.log('casings table should not be visible');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log('clear search input box');
    cy.findAllByTestId('search-box-input').clear().type('{enter}');
  });

  it('Should be able to click on `Show casings` button', () => {
    cy.log('hover on first wellbore');
    cy.hoverOnNthWellbore(0, 'casings');

    cy.log('Click on `Show casings` button');
    cy.contains('Show casings').click({ force: true });
    cy.findByTestId('schema-column').should('be.visible');

    cy.log('go back to table view');
    cy.get('[aria-label="Go back"]').as('goBackBtn');
    cy.get('@goBackBtn').eq(1).click({ force: true });
  });

  it('Measurement unit changes should apply to "Top MD" & "Bottom MD" column', () => {
    cy.changeMeasurementUnit('Meter');

    cy.contains('Table').click({ force: true });

    cy.log(`verify Top MD column header`);
    cy.findByTestId('table-header-row')
      .findByText(`Top MD (${UserPreferredUnit.METER})`)
      .should('be.visible');

    cy.log(`verify Bottom MD column header`);
    cy.findByTestId('table-header-row')
      .findByText(`Bottom MD (${UserPreferredUnit.METER})`)
      .should('be.visible');

    cy.contains('Table').click({ force: true });
    cy.log(
      'Top MD values should change according to selected measurement unit'
    );

    cy.findByTestId('wellbore-casings-table')
      .findAllByTestId('table-cell')
      .eq(3)
      .invoke('text')
      .then(parseFloat)
      .then((valInMeter) => {
        cy.changeMeasurementUnit('Feet');

        cy.findAllByTestId('wellbore-casings-table')
          .findAllByTestId('table-cell')
          .eq(3)
          .invoke('text')
          .then(parseFloat)
          .then((valInFeet) => {
            expect(valInFeet).to.greaterThan(valInMeter);
          });
      });

    cy.log(
      'Bottom MD values should change according to selected measurement unit'
    );
    cy.changeMeasurementUnit('Meter');

    cy.findAllByTestId('wellbore-casings-table')
      .findAllByTestId('table-cell')
      .eq(4)
      .invoke('text')
      .then(parseFloat)
      .then((valInMeter) => {
        cy.changeMeasurementUnit('Feet');

        cy.findAllByTestId('wellbore-casings-table')
          .findAllByTestId('table-cell')
          .eq(4)
          .invoke('text')
          .then(parseFloat)
          .then((valInFeet) => {
            expect(valInFeet).to.greaterThan(valInMeter);
          });
      });
  });
});
