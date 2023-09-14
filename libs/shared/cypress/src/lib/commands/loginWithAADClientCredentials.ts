// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    loginWithAADClientCredentials(
      cluster: string,
      tenant: string,
      clientId: string,
      clientSecret: string
    ): void;
  }
}

Cypress.Commands.add(
  'loginWithAADClientCredentials',
  (cluster, tenant, clientId, clientSecret) => {
    cy.request({
      url: `https://login.microsoftonline.com/${encodeURIComponent(
        tenant
      )}/oauth2/v2.0/token`,
      method: 'POST',
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `https://${cluster}/.default`,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'no-cors': true,
      },
    }).then(({ body }) => {
      window.localStorage.setItem('CY_TOKEN', body.access_token);
      window.localStorage.setItem(
        '@cognite/fusion/selected-idp-details',
        JSON.stringify({
          internalId: '9f11f8b0-f3c2-4ca3-90ff-58e2e5e08c68',
          type: 'AZURE_AD',
          idpId:
            '9f11f8b0-f3c2-4ca3-90ff-58e2e5e08c68_963e089e-a007-4800-8b11-c04e39356cdd',
        })
      );
    });
  }
);
