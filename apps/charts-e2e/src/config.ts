export const org = Cypress.env('ORG');
export const project = Cypress.env('PROJECT');
export const cluster = Cypress.env('CLUSTER');
export const baseUrl = `https://${org}.local.cognite.ai:4200`;
export const idpInternalId = Cypress.env('IDP_INTERNAL_ID');
export const AADUsername = Cypress.env('AAD_USERNAME');
export const AADPassword = Cypress.env('AAD_PASSWORD');
