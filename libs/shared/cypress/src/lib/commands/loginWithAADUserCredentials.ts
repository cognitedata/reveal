// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    loginWithAADUserCredentials(
      url: string,
      idpInternalId: string,
      project: string,
      username: string,
      password: string
    ): void;
  }
}

function loginViaAAD(
  url: string,
  idpInternalId: string,
  project: string,
  username: string,
  password: string
) {
  cy.visit(url);
  cy.getBySel(idpInternalId).click();

  // Login to your AAD tenant.
  cy.origin(
    'login.microsoftonline.com',
    {
      args: {
        username,
        password,
      },
    },
    ({ username, password }) => {
      cy.get('input[type="email"]').type(username, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
      cy.get('input[type="password"]').type(password, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
      cy.get('#idBtn_Back').click();
    }
  );

  cy.contains(project, { timeout: 10000 }).click();
}

Cypress.Commands.add(
  'loginWithAADUserCredentials',
  (url, idpInternalId, project, username, password) => {
    const log = Cypress.log({
      displayName: 'Azure Active Directory Login',
      message: [`🔐 Authenticating | ${username}`],
      // @ts-ignore
      autoEnd: false,
    });

    log.snapshot('before');

    loginViaAAD(url, idpInternalId, project, username, password);

    log.snapshot('after');
    log.end();
  }
);
