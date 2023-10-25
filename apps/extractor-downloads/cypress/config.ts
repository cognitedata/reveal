export const org = Cypress.env('ORG');
export const project = Cypress.env('PROJECT');
export const cluster = Cypress.env('CLUSTER');
export const baseUrl = `https://${org}.local.cognite.ai:4200`;
export const targetAppPackageName = '@cognite/cdf-extractor-downloads';
export const idpInternalId = Cypress.env('IDP_INTERNAL_ID');
export const AADUsername = Cypress.env('COG_E2E_AAD_USERNAME_1');
export const AADPassword = Cypress.env('COG_E2E_AAD_PASSWORD_1');
