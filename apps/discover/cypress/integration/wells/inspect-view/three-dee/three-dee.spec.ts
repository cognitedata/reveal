import { DATA_SOURCE } from '../../../../../src/modules/wellSearch/constantsSidebarFilters';
import { TAB_NAMES } from '../../../../../src/pages/authorized/search/well/inspect/constants';
import { interceptCoreNetworkRequests } from '../../../../support/commands/helpers';

describe('Three-dee component', () => {
  before(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.addWaitForWdlResources('sources', 'GET', 'getSources');
    cy.addWaitForWdlResources(
      'trajectories/data',
      'POST',
      'postTrajectoriesData'
    );
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
    cy.wait(coreRequests);

    cy.selectCategory('Wells');
    cy.wait('@getSources');
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: DATA_SOURCE,
            subCategory: DATA_SOURCE,
            value: {
              name: 'ophiuchus',
              type: 'select',
            },
          },
          {
            category: 'Data Availability',
            subCategory: 'Data Availability',
            value: {
              name: 'NDS events',
              type: 'select',
            },
          },
        ],
      },
    });
    cy.selectFirstWellInResults();

    cy.openInspectView(1);

    cy.goToWellsInspectTab(TAB_NAMES.THREE_DEE);

    cy.wait('@postTrajectoriesData');
  });

  it('should render log filter, wells and wellbores correctly', () => {
    cy.findByText('Log filter').should('be.visible');

    cy.log('expand log filter');
    cy.findAllByRole('treeitem')
      .first()
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.findByText('Casing').should('be.visible');

    cy.findByText('NDS Risk Event').should('be.visible');

    cy.log('click on log filter');
    cy.findByText('Log filter').click();

    cy.findByText('General Settings').should('be.visible');

    cy.log('expand well name');
    cy.findAllByRole('treeitem')
      .last()
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.log('expand wellbore name');
    cy.findAllByRole('rowgroup')
      .findAllByRole('treeitem')
      .eq(5)
      .children()
      .first()
      .children()
      .first()
      .should('be.visible')
      .click();

    cy.log('select all wells');
    cy.findAllByRole('rowgroup')
      .eq(5)
      .findAllByRole('treeitem')
      .first()
      .children()
      .first()
      .children()
      .eq(2)
      .children()
      .first()
      .as('selectAllWellbores')
      .should('not.have.class', 'checked')
      .click();
  });

  it('verify tool options', () => {
    cy.log('click on navigation button');
    cy.findByTestId('3d-tools-navigation').click();

    cy.log('click on `select or edit` button');
    cy.findByTestId('3d-tools-select-or-edit').click();

    cy.log('click on `zoom to target` button');
    cy.findByTestId('3d-tools-zoom-to-target').click();

    cy.log('click on `measure distance` button');
    cy.findByTestId('3d-tools-measure-distance').click();
  });

  it('verify action buttons', () => {
    cy.log('click on `view-all` button');
    cy.findByTestId('3d-actions-view-all').click();

    cy.log('click on `hide or show axis` button');
    cy.findByTestId('3d-actions-hide-or-show-axis').click();

    cy.log('click on `hide or show north arrow` button');
    cy.findByTestId('3d-actions-hide-or-show-north-arrow').click();

    cy.log('click on `copy` button');
    cy.findByTestId(
      '3d-actions-copy-a-image-of-the-viewer-to-the-clipboard'
    ).click();

    cy.log('click on `toggle between black white` button');
    cy.findByTestId(
      '3d-actions-toggle-between-black-and-white-backgroud'
    ).click();

    cy.log('click on `full-screen` button');
    cy.findByTestId('3d-actions-full-screen').click();

    cy.log('click on `view in 2d` button');
    cy.findByTestId('3d-actions-view-in-2d').click();
  });

  it('verify view buttons', () => {
    cy.log('click on `view from top` button');
    cy.findByTestId('3d-viewfrom-view-from-top').click();

    cy.log('click on `view from bottom` button');
    cy.findByTestId('3d-viewfrom-view-from-bottom').click();

    cy.log('click on `view from south` button');
    cy.findByTestId('3d-viewfrom-view-from-south').click();

    cy.log('click on `view from north` button');
    cy.findByTestId('3d-viewfrom-view-from-north').click();

    cy.log('click on `view from west` button');
    cy.findByTestId('3d-viewfrom-view-from-west').click();

    cy.log('click on `view from east` button');
    cy.findByTestId('3d-viewfrom-view-from-east').click();
  });

  it('Should be able to change view mode', () => {
    cy.log('set view mode - overlay');
    cy.findByText('Normal').click();
    cy.findByText('Overlay').click();

    cy.log('change z-scale');
    cy.findByText(1).click();
    cy.contains(0.25).click();
  });
});
