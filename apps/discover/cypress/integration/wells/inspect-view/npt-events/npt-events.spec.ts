import { DATA_AVAILABILITY } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
const DATA_AVAILABILITY_NPT = 'NPT events';

describe('Wells: NPT Events Graph view', () => {
  beforeEach(() => {
    cy.addWaitForWdlResources('npt/list', 'POST', 'getNptList');

    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

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
      select: 'ALL',
    });

    cy.openInspectView();

    cy.goToWellsInspectTab(TAB_NAMES.NPT_EVENTS);

    cy.wait('@getNptList');
  });

  it('should be able to open single wellbore view', () => {
    cy.log('npt events graph should visible');
    cy.findByTestId('npt-events-graph').should('be.visible');

    cy.log('click on first bar label');
    cy.findAllByTestId('bar-label').first().click();

    cy.log('npt durstion graph should visible');
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
    cy.getButton('Go back', 'aria-label')
      .eq(1)
      .should('be.visible')
      .click({ force: true });
  });

  it('verify chart zoom in, zoom out & reset button', () => {
    cy.log('zoom out & reset buttons should be disabled by default');
    cy.isButtonDisabled('ZoomOut', 'aria-label');
    cy.isButtonDisabled('ResetZoom', 'aria-label');

    cy.log('click on zoom in button');
    cy.getButton('ZoomIn', 'aria-label').eq(0).click({ force: true });

    cy.log('zoom out & reset buttons should be enabled');
    cy.getButton('ZoomOut', 'aria-label').eq(0).should('not.be.disabled');
    cy.getButton('ResetZoom', 'aria-label').eq(0).should('not.be.disabled');

    cy.log('Click on zoom out button');
    cy.getButton('ZoomOut', 'aria-label').eq(0).click({ force: true });

    cy.log('zoom out & reset buttons should be disabled');
    cy.getButton('ZoomOut', 'aria-label').eq(0).should('be.disabled');
    cy.getButton('ResetZoom', 'aria-label').eq(0).should('be.disabled');

    cy.log('click on zoom in button');
    cy.getButton('ZoomIn', 'aria-label').eq(0).click({ force: true });

    cy.log('click on reset button');
    cy.getButton('ResetZoom', 'aria-label').eq(0).click({ force: true });

    cy.log('zoom out & reset buttons should be disabled');
    cy.getButton('ZoomOut', 'aria-label').eq(0).should('be.disabled');
    cy.getButton('ResetZoom', 'aria-label').eq(0).should('be.disabled');
  });
});
