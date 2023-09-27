export const org = Cypress.env('ORG');
export const project = Cypress.env('PROJECT');
export const cluster = Cypress.env('CLUSTER');
export const tenant = Cypress.env('TENANT');
export const baseUrl = `https://${org}.local.cognite.ai:4200`;
