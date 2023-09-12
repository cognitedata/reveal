export const ORG = Cypress.env('ORG');
export const PROJECT = Cypress.env('PROJECT');
export const CLUSTER = Cypress.env('CLUSTER');
export const TENANT = Cypress.env('TENANT');
export const ENV = Cypress.env('ENV');
export const BASE_URL = `https://${ORG}.local.cognite.ai:4200`;
export const OVERRIDE_URL = Cypress.env('OVERRIDE_URL');
