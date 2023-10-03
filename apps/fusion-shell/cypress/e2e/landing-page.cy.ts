describe('fusion-shell', () => {
  beforeEach(() => {
    cy.navigate('');
  });

  it('should display welcome message', () => {
    cy.get('h2.cogs-title-2').contains(/Welcome to Cognite Data Fusion/);
  });

  it('has quick access buttons', () => {
    cy.findByTestId('landing-quick-access-btn-wrapper').within(() => {
      cy.findByTestId('suggestions').should('be.visible');
      cy.findByTestId('integrate').should('be.visible');
      cy.findByTestId('explore').should('be.visible');
      cy.findByTestId('build').should('be.visible');
    });
  });

  it('check quick link navigation', () => {
    const quickAccessItems = ['suggestions', 'integrate', 'explore', 'build'];
    for (let i = 0; i < quickAccessItems.length; i++) {
      const currentItem = quickAccessItems[i];
      cy.findByTestId(currentItem).click();
      cy.findByTestId('quick-link-card-container')
        .children()
        .each(async ($element) => {
          let linkValue = $element[0].getAttribute('data-testid') ?? '';
          // had to query again due to $element being invalid after cy.click() command
          cy.findByTestId(linkValue).click();
          cy.location().should((loc) => {
            const currentPath =
              loc.pathname.split('/')[loc.pathname.split('/').length - 1];
            expect(linkValue).contains(`/${currentPath}`);
          });
          cy.navigate('');
          cy.findByTestId(currentItem).click();
        });
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
            let mappedApplicationID =
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
      .find('h5')
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

  // below will be completed when login flow is connected
  // it('verify user sign out', () => {
  //   cy.findByTestId('topbar-user-profile-area').find('.cogs-dropdown').click();
  //   cy.findByTestId('topbar-user-logout-btn').click();
  // });
});
