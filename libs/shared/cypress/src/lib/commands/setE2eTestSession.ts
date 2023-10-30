// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    setE2eTestSession: () => void;
  }
}

Cypress.Commands.add('setE2eTestSession', () => {
  sessionStorage.setItem('isE2eTest', 'true');
});
