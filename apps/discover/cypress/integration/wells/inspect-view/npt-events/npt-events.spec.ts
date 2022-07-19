import { RESET_TO_DEFAULT_BUTTON_TEXT } from '../../../../../src/components/Charts/common/ResetToDefault/constants';
import { NO_RESULTS_TEXT } from '../../../../../src/components/EmptyState/constants';
import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';
import { WELLS_SEARCH_ALIAS } from '../../../../support/interceptions';

const DATA_AVAILABILITY_NPT = 'NPT events';

describe('Wells: NPT Events Graph view', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('npt/list', 'POST', 'getNptList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');
    cy.clickOnFilterCategory(DATA_AVAILABILITY);

    cy.log('Checking source values');
    cy.validateSelect(
      DATA_AVAILABILITY,
      [DATA_AVAILABILITY_NPT],
      DATA_AVAILABILITY_NPT
    );
    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows('well-result-table');
    cy.openInspectView();
    cy.goToWellsInspectTab(TAB_NAMES.NPT_EVENTS);
    cy.findByTestId('loading-container').should('exist');
    cy.wait(['@getNptList']);
    cy.findByTestId('loading-container').should('not.exist');
  });

  it('should be able to open single wellbore view', () => {
    cy.log('npt events graph should visible');
    cy.findByTestId('npt-events-graph').should('be.visible');

    cy.log('click on first bar label');
    cy.findAllByTestId('bar-label').first().click();

    cy.log('npt duration graph should be visible');
    cy.findAllByTestId('selected-wellbore-npt-duration-graph').should(
      'be.visible'
    );

    cy.log('npt events graph should visible');
    cy.findAllByTestId('selected-wellbore-npt-events-graph').should(
      'be.visible'
    );

    cy.log('npt events table should visible');
    cy.findAllByTestId('npt-events-table').should('be.visible');

    cy.log('`previous` button should be disabled');
    cy.isButtonVisible('previous-wellbore', 'aria-label');
    cy.isButtonDisabled('previous-wellbore', 'aria-label');

    cy.log('when click on `next` button `previous` button should be enabled');
    cy.clickButton('next-wellbore', 'aria-label');
    cy.isButtonEnabled('previous-wellbore', 'aria-label');

    cy.log('click on back button');
    cy.getButton('Go back', 'aria-label').eq(1).should('be.visible').click();
  });

  it('verify chart zoom in, zoom out & reset button', () => {
    cy.log('zoom out & reset buttons should be disabled by default');
    cy.findByTestId('npt-events-graph')
      .findByLabelText('ZoomOut')
      .as('ZoomOutButton')
      .should('be.disabled');
    cy.findByTestId('npt-events-graph')
      .findByLabelText('ResetZoom')
      .as('ResetZoomButton')
      .should('be.disabled');

    cy.log('click on zoom in button');
    cy.findByTestId('npt-events-graph')
      .findByLabelText('ZoomIn')
      .as('ZoomInButton')
      .click();

    cy.log('zoom out & reset buttons should be enabled');
    cy.get('@ZoomInButton').should('not.be.disabled');
    cy.get('@ResetZoomButton').should('not.be.disabled');

    cy.log('Click on zoom out button');
    cy.get('@ZoomOutButton').click();

    cy.log('zoom out & reset buttons should be disabled');
    cy.get('@ZoomOutButton').should('be.disabled');
    cy.get('@ResetZoomButton').should('be.disabled');

    cy.log('click on zoom in button');
    cy.get('@ZoomInButton').click();

    cy.log('click on reset button');
    cy.get('@ResetZoomButton').click();

    cy.log('zoom out & reset buttons should be disabled');
    cy.get('@ZoomOutButton').should('be.disabled');
    cy.get('@ResetZoomButton').should('be.disabled');
  });

  it('should be able to deselect all the NPT Codes', () => {
    cy.log('uncheck all the NPT Codes');
    cy.findAllByTestId('legend-checkbox').click({ multiple: true });

    cy.log('empty state should visible');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log('click on reset button');
    cy.findAllByText(RESET_TO_DEFAULT_BUTTON_TEXT).click();

    cy.log('npt events graph should visible');
    cy.findByTestId('npt-events-graph').should('be.visible');
  });
});

describe('Wells: NPT Events Table view', () => {
  beforeEach(() => {
    cy.addWaitForWdlResources('npt/list', 'POST', 'getNptList');
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.expandResultTable();
    cy.goToTab('Wells');

    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_AVAILABILITY,
            subCategory: DATA_AVAILABILITY,
            value: {
              name: DATA_AVAILABILITY_NPT,
              type: 'select',
            },
          },
        ],
      },
    });

    cy.wait(`@${WELLS_SEARCH_ALIAS}`);
    cy.toggleSelectAllRows('well-result-table');

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.NPT_EVENTS);

    cy.wait('@getNptList');
  });

  it('should be able to navigate table view', () => {
    cy.log('click on table button');
    cy.findAllByText('Table').click();

    cy.log('table should display');
    cy.findAllByTestId('npt-table-wells').should('be.visible');
  });

  it('should be able to filter result by name', () => {
    cy.log('click on table button');
    cy.findAllByText('Table').click();

    cy.log('table should display');
    cy.findAllByTestId('npt-table-wells').should('be.visible');

    cy.log('filter results by name');
    cy.findAllByTestId('npt-table-wells')
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

    cy.log('result table should contain mor than one rows');
    cy.findAllByTestId('npt-table-wells')
      .findAllByTestId('table-row')
      .its('length')
      .should('be.greaterThan', 1);

    cy.log('clear filter');
    cy.findAllByTestId('search-box-input').clear().type('{enter}');
  });

  it('should be able to filter results by NPT Code filter', () => {
    cy.findAllByText('Table').click();

    cy.log('click on NPT Code filter');
    cy.findAllByText('NPT Code').eq(0).click();

    cy.log('bydefault `All` options should be selected');
    cy.get('[id="checkbox-option"]').as('checkbox-option').should('be.checked');

    cy.log('uncheck all checkboxes');
    cy.get('@checkbox-option').eq(0).click({ force: true });

    cy.log('all checkboxes should be unchecked');
    // cy.get('@checkbox-option').should('not.be.checked');

    cy.log('Select first option');
    cy.get('@checkbox-option').eq(1).click({ force: true });

    cy.log('Selected option should be checked ');
    // cy.get('@checkbox-option').eq(1).should('be.checked');

    cy.log('Selected fillter should be applied');
    cy.get('@checkbox-option')
      .eq(1)
      .parent()
      .invoke('text')
      .then((selectedCode) => {
        cy.findAllByTestId('table-cell-expanded')
          .findAllByTestId('npt-events-table')
          .findAllByTestId('table-cell')
          .eq(1)
          .invoke('text')
          .then((valInCell) => {
            expect(valInCell).eql(selectedCode);
          });
      });
  });
  it('should be able to filter results by NPT Detail Code filter', () => {
    cy.findAllByText('Table').click();

    cy.log('click on NPT Detail Code filter');
    cy.findAllByText('NPT Detail Code').eq(0).click();

    cy.log('bydefault `All` options should be selected');
    cy.get('[id="checkbox-option"]').as('checkbox-option').should('be.checked');

    cy.log('uncheck all checkboxes');
    cy.get('@checkbox-option').eq(0).click({ force: true });

    cy.log('all checkboxes should be unchecked');
    // cy.get('@checkbox-option').should('not.be.checked');

    cy.log('Select first option');
    cy.get('@checkbox-option').eq(1).click({ force: true });

    cy.log('Selected option should be checked ');
    // cy.get('@checkbox-option').eq(1).should('be.checked');

    cy.log('Selected fillter should be applied');
    cy.get('@checkbox-option')
      .eq(1)
      .parent()
      .invoke('text')
      .then((selectedCode) => {
        cy.findAllByTestId('table-cell-expanded')
          .findAllByTestId('npt-events-table')
          .findAllByTestId('table-cell')
          .eq(2)
          .invoke('text')
          .then((valInCell) => {
            expect(valInCell).eql(selectedCode);
          });
      });
  });
});
