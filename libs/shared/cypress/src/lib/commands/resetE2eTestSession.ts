// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    resetE2eTestSession: () => void;
  }
}

Cypress.Commands.add('resetE2eTestSession', () => {
  sessionStorage.removeItem('isE2eTest');
});
