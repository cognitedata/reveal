describe('Favorites', () => {
  const firstFavoriteCard = `Favorite: ${Date.now()}`;
  const secondFavoriteCard = `Favorite: ${Date.now() + 1}`;
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.deleteAllFavorites();

    cy.log('Create 2 Favorites just for testing purposes');
    cy.createFavorite({ name: firstFavoriteCard });
    cy.createFavorite({ name: secondFavoriteCard });
  });
  it('this is demo', () => {
    cy.log('Go to favorites page');
    cy.findByTestId('top-bar')
      .findByRole('link', { name: 'Favorites' })
      .click();
    cy.url().should('include', '/favorites');

    cy.log('Check that we get the same number of favorites from API');
    cy.listFavorites().should((res) => {
      cy.findByTestId('favorite-card-container')
        .findAllByTestId(/^favorite-card-/)
        .should('have.length', res.body.length);
    });
  });

  it.skip('Should add, view and delete single well-bore to favorites', () => {
    cy.log('Go to well result table');
    cy.findByText('Click to expand the search result').click();
    cy.findByRole('tab', { name: 'Wells' }).click();

    cy.log('Select filter value');
    cy.findByTestId('side-bar').contains('Source').should('be.visible').click();
    cy.findByTestId('side-bar').contains('volve').should('be.visible').click();

    cy.log('Hover more option button and add a wellbore to favorite');
    cy.get('[data-testid="table-cell-expanded"]')
      .findAllByTestId('table-row')
      .first()
      .children()
      .last()
      .children()
      .first()
      .as('hoverFirstExpandedWellbore')
      .invoke('attr', 'style', 'opacity: 1')
      .findByTestId('menu-button')
      .trigger('mouseenter', { force: true });

    cy.findByText('Add to favorites').trigger('mouseenter', {
      force: true,
    });
    cy.findByText(firstFavoriteCard)
      .should('not.be.disabled')
      .click({ force: true });
    cy.get('[data-testid="favorite-star-icon"]').should('have.length', 2);

    cy.log('Added favorite set should be disabled for the same wellbore');
    cy.findByText(firstFavoriteCard).should('be.disabled');

    cy.log('Minimize expanded row');
    cy.get('[data-testid="table-row"]')
      .eq(0)
      .findAllByTestId('table-cell')
      .eq(1)
      .click();

    cy.log('Expand last well row');
    cy.get('[data-testid="table-row"]')
      .last()
      .findAllByTestId('table-cell')
      .eq(1)
      .click();

    cy.log('Add first wellbore of last well to favorite set');
    cy.get('@hoverFirstExpandedWellbore')
      .invoke('attr', 'style', 'opacity: 1')
      .findByTestId('menu-button')
      .trigger('mouseenter', {
        force: true,
      });
    cy.findByText('Add to favorites').trigger('mouseenter', {
      force: true,
    });
    cy.findByText(firstFavoriteCard)
      .should('not.be.disabled')
      .click({ force: true });

    cy.log('Check number of stars displayed in the table');
    cy.get('[data-testid="favorite-star-icon"]').should('have.length', 3);
    cy.findByText(firstFavoriteCard).should('be.disabled');

    cy.log('Navigate to favorite cards');
    cy.findByRole('link', { name: 'Favorites' }).click();
    cy.findByText(firstFavoriteCard).click();
    cy.findByText('Wells').click();

    cy.log('Check added wells to the favorite set');
    cy.get('[data-testid="table-row"]').should('have.length', 2);

    cy.log('Select first well in favorite set');
    cy.findAllByTestId('table-row')
      .first()
      .findAllByTestId('table-cell')
      .eq(1)
      .as('getFirstWell')
      .click();

    cy.log('Check number of wells added to first well');
    cy.get('[data-testid="table-cell-expanded"]')
      .findAllByTestId('table-row')
      .as('getExpandedWellboreTable')
      .should('have.length', 1);

    cy.log('Minimize the expanded well');
    cy.get('@getFirstWell').click();

    cy.log('Expand the second well in favorite set');
    cy.findAllByTestId('table-row')
      .last()
      .findAllByTestId('table-cell')
      .eq(1)
      .as('getLastWell')
      .click();

    cy.log('Check number of wells added to second well');
    cy.get('@getExpandedWellboreTable').should('have.length', 1);

    cy.log('Minimize the second well and expand the first well');
    cy.get('@getLastWell').click();
    cy.get('@getFirstWell').click();

    cy.log('Click `View` button in first wellbore of first well');
    cy.get('@hoverFirstExpandedWellbore')
      .invoke('attr', 'style', 'opacity: 1')
      .findByText('View')
      .click({ force: true });

    cy.log('Check number of wellbores displayed in overview page');
    cy.get('[data-testid="overview-result-table"]')
      .findAllByTestId('table-row')
      .should('have.length', 1);

    cy.log('Back to favorite set');
    cy.findByTestId('well-inspect-back-btn').click();

    cy.log('Expand first well and delete the wellbore inside that well');
    cy.get('@getFirstWell').click();
    cy.get('@hoverFirstExpandedWellbore')
      .invoke('attr', 'style', 'opacity: 1')
      .findByTestId('menu-button')
      .trigger('mouseenter', { force: true });

    cy.findByText('Remove from set').click({ force: true });
    cy.get('.cogs-btn').contains('Remove').click();

    cy.log('Check number of wells after removing first wellbore');
    cy.get('[data-testid="table-row"]').should('have.length', 1);

    cy.log('Expand the remaining well and delete wellbore using bulk actions');
    cy.findAllByTestId('table-row')
      .first()
      .findAllByTestId('table-cell')
      .first()
      .click();

    cy.get('[data-testid="table-bulk-actions"]')
      .should(
        'have.text',
        '1 well selectedWith 1 wellbore insideViewRemove from set'
      )
      .within(() => {
        cy.get('.cogs-btn').contains('Remove from set').click();
      });

    cy.get('.cogs-modal-footer-buttons')
      .contains('Remove')
      .click({ force: true });
  });
});
