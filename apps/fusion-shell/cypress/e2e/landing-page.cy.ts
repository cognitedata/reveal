describe('fusion-shell', () => {
  beforeEach(() => {
    cy.navigate('');
    cy.ensurePageFinishedLoading();
  });

  it('should display welcome message', () => {
    cy.get("[data-testid='fusion-landing-page-welcome-message']").should(
      'exist'
    );
  });

  it('has quick access buttons', () => {
    cy.findByTestId('landing-quick-access-btn-wrapper').within(() => {
      cy.findByTestId('suggestions').should('be.visible');
      cy.findByTestId('integrate').should('be.visible');
      cy.findByTestId('explore').should('be.visible');
      cy.findByTestId('build').should('be.visible');
    });
  });

  it('should have quick access buttons for categories if there is no recent activity', () => {
    const defaultQuickAccessItems = [
      'suggestions',
      'integrate',
      'explore',
      'build',
    ];
    for (let i = 0; i < defaultQuickAccessItems.length; i += 1) {
      const currentItem = defaultQuickAccessItems[i];
      cy.findByTestId(currentItem).should('exist');
    }
  });

  it('verify subapp navigation', () => {
    // assuming topbar element internal ids wont change.
    const topBarItems = ['integrate', 'contextualize', 'explore', 'configure'];
    for (let i = 0; i < topBarItems.length; i++) {
      const topBarItem = topBarItems[i];
      cy.findByTestId(`topbar-${topBarItem}`).click();
      cy.findByTestId(`menu-${topBarItem}`)
        .children()
        .each(async ($element) => {
          if ($element[0].firstElementChild) {
            const mappedApplicationID =
              $element[0].firstElementChild.getAttribute('data-testid');
            cy.wrap($element).click();
            cy.get(`[id="single-spa-application:${mappedApplicationID}"]`, {
              // this specific timeout is here due to inconsitent timings on app loading to the DOM.
              // did not configure this globally as this is only specifc to this scenario.
              timeout: 60000,
            }).should('exist');
            cy.findByTestId(`topbar-${topBarItem}`).click();
          }
        });
    }
  });

  it('verify Resume your activity section', () => {
    cy.findByTestId('user-history-section').should('be.visible');
  });

  it('verify Learning Resources label', () => {
    cy.findByTestId('learning-resources-section')
      .findByTestId('learning-resources-title')
      .should('be.visible');
  });

  it('verify Learning Resources links', () => {
    cy.findByTestId('learning-resource-links')
      .children()
      .each(async ($element) => {
        cy.request($element.find('a').prop('href'));
      });
  });

  it('verify global search behavior', () => {
    cy.findByTestId('global-search-input').type('asset');
    cy.findByTestId('global-search-menu').should('be.visible');

    cy.findByTestId('global-search-clear-input').click();
    cy.findByTestId('global-search-menu').should('not.exist');
  });
});
