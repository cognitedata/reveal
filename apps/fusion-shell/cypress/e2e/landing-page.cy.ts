describe('fusion-shell', () => {
  beforeEach(() => {
    cy.navigate('');
  });

  it('should display welcome message', () => {
    cy.get('h2.cogs-title-2').contains(/Welcome to Cognite Data Fusion/);
  });

  // it('has quick access buttons', () => {
  //   // cy.findAllByTestId('landing-quick-access-btn-wrapper');
  //   // cy.get('[data-cy="landing-quick-access-btn-wrapper"]').within(() => {
  //   //   cy.get('[data-cy="suggestions"]').should('be.visible');
  //   //   cy.get('[data-cy="integrate"]').should('be.visible');
  //   //   cy.get('[data-cy="explore"]').should('be.visible');
  //   //   cy.get('[data-cy="build"]').should('be.visible');
  //   // });
  // });

  // it('check quick link navigation', () => {
  //   const quickAccessItems = ['suggestions', 'integrate', 'explore', 'build'];
  //   for (let i = 0; i < quickAccessItems.length; i++) {
  //     const currentItem = quickAccessItems[i];
  //     cy.get(`[data-cy="${currentItem}"]`).click();
  //     cy.get('[data-cy="quick-link-card-container"]')
  //       .children()
  //       .each(async ($element) => {
  //         let linkValue = $element[0].getAttribute('data-cy');
  //         // had to query again due to $element being invalid after cy.click() command
  //         cy.get(`[data-cy="${linkValue}"]`).click();
  //         cy.location().should((loc) => {
  //           const currentPath =
  //             loc.pathname.split('/')[loc.pathname.split('/').length - 1];
  //           expect(linkValue).contains(`/${currentPath}`);
  //         });
  //         cy.navigate('');
  //         cy.get(`[data-cy="${currentItem}"]`).click();
  //       });
  //   }
  // });

  // it('subapp navigation under Integrate', () => {
  //   // assuming topbar element internal ids wont change.
  //   const topBarItems = ['integrate', 'contextualize', 'explore', 'configure'];
  //   for (let i = 0; i < topBarItems.length; i++) {
  //     const topBarItem = topBarItems[i];
  //     cy.get(`[data-cy="topbar-${topBarItem}"`).click();
  //     cy.get(`[data-cy="menu-${topBarItem}"`)
  //       .children()
  //       .each(async ($element) => {
  //         let mappedApplicationID =
  //           $element[0].firstElementChild.getAttribute('data-cy');
  //         cy.wrap($element).click();
  //         cy.get(`[id="single-spa-application:${mappedApplicationID}"]`, {
  //           timeout: 60000,
  //         }).should('exist');
  //         cy.get(`[data-cy="topbar-${topBarItem}"`).click();
  //       });
  //   }
  // });

  // it('verify Resume your activity section', () => {
  //   cy.get('[data-cy="user-history-section"').should('be.visible');
  // });

  // it('verify Learning Resources label', () => {
  //   cy.get('[data-cy="learning-resources-section"')
  //     .find('h5')
  //     .should('be.visible');
  // });

  // it('verify Learning Resources links', () => {
  //   cy.get('[data-cy="learning-resource-links"]')
  //     .children()
  //     .each(async ($element) => {
  //       cy.request($element.find('a').prop('href'));
  //     });
  // });
});
