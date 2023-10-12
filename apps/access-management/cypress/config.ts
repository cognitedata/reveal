export const org = Cypress.env('ORG');
export const project = Cypress.env('PROJECT');
export const cluster = Cypress.env('CLUSTER');
export const tenant = Cypress.env('TENANT');
export const clientId = Cypress.env('CLIENT_ID_AZURE_DATA_ENABLERS_TEST');
export const clientSecret = Cypress.env(
  'CLIENT_SECRET_AZURE_DATA_ENABLERS_TEST'
);
export const baseUrl = `https://${org}.local.cognite.ai:4200`;
export const targetAppPackageName = '@cognite/cdf-access-management';
