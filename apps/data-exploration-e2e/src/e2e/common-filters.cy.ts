import {
  DATA_SET,
  ASSET_NAME,
  EXTERNAL_ID,
  INTERNAL_ID,
} from '../support/constant';

describe('Common filters', () => {
  beforeEach(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  it('Data set filter should work', () => {
    cy.log('click on data set filter');
    cy.findAllByTestId('filter-Data set').click();

    cy.log('search and select data set name');
    cy.get('input[placeholder="Filter by name"]').type(DATA_SET);
    cy.get('input[type="checkbox"]').check();

    cy.goToTab('Files');

    cy.log('filter label should display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'contain',
      `Data sets: ${DATA_SET}`
    );

    cy.log('click reset button');
    cy.clickButton('Reset');

    cy.log('filter label should not display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      `Data sets: ${DATA_SET}`
    );
  });

  it('Asset filter should work', () => {
    cy.log('click on asset filter');
    cy.findAllByTestId('filter-Asset').click();

    cy.log('search and select asset');
    cy.get('input[placeholder="Filter by name"]').type(ASSET_NAME);
    cy.get('input[type="checkbox"]').check();

    cy.goToTab('Assets');

    cy.log('filter label should display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'contain',
      `Asset: ${ASSET_NAME}`
    );

    cy.clickButton('Reset');

    cy.log('filter label should not display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      `Asset: ${ASSET_NAME}`
    );
  });

  it('Created time filter should work', () => {
    cy.log('click on created time filter');
    cy.findAllByTestId('common-created-time-filter').click();

    cy.log('select before option');
    cy.get('input[type="checkbox"]').eq(1).check();

    cy.log('change date to 2023/01/01');
    cy.findAllByTestId('common-created-time-filter').find('button').click();
    cy.findAllByTestId('yearSelect').select('2023');
    cy.findAllByTestId('monthSelect').select('January');
    cy.get('[aria-label*="January 1st"]').click();

    cy.goToTab('Assets');

    cy.log('filter label should display');
    // cy.findAllByTestId('sub-table-wrapper').should(
    //   'contain',
    //   'Created Time: Before 1 Jan. 2023'
    // );

    cy.clickButton('Reset');

    cy.log('filter label should not display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      'Created Time: Before 1 Jan. 2023'
    );
  });

  it('Updated time filter should work', () => {
    cy.log('click on created time filter');
    cy.findAllByTestId('common-updated-time-filter').click();

    cy.log('select before option');
    cy.get('input[type="checkbox"]').eq(1).check();

    cy.log('change date to 2023/01/01');
    cy.findAllByTestId('common-updated-time-filter').find('button').click();
    cy.findAllByTestId('yearSelect').select('2023');
    cy.findAllByTestId('monthSelect').select('January');
    cy.get('[aria-label*="January 1st"]').click();

    cy.goToTab('Assets');

    cy.log('filter label should display');
    // cy.findAllByTestId('sub-table-wrapper').should(
    //   'contain',
    //   'Updated Time: Before 1 Jan. 2023'
    // );

    cy.clickButton('Reset');

    cy.log('filter label should not display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      'Updated Time: Before 1 Jan. 2023'
    );
  });

  it('External ID filter should work', () => {
    cy.log('type external ID');
    cy.get('input[placeholder="Starts with..."]').type(EXTERNAL_ID, {
      delay: 500,
    });

    cy.goToTab('Assets');

    cy.log('filter label should display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'contain',
      `External ID: ${EXTERNAL_ID}`
    );

    cy.clickButton('Reset');

    cy.log('filter label should not display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      `External ID: ${EXTERNAL_ID}`
    );
  });

  it('Internal ID filter should work', () => {
    cy.log('type internal ID');
    cy.get('input[placeholder="Enter exact match..."]').type(INTERNAL_ID, {
      delay: 500,
    });

    cy.goToTab('Assets');

    cy.log('filter label should display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'contain',
      `Internal ID: ${INTERNAL_ID}`
    );

    cy.clickButton('Reset');

    cy.log('filter label should display');
    cy.findAllByTestId('sub-table-wrapper').should(
      'not.contain',
      `Internal ID: ${INTERNAL_ID}`
    );
  });
});
