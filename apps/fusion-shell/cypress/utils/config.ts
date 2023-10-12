export const ORG = Cypress.env('FUSION_SHELL_E2E_ORG');
export const PROJECT = Cypress.env('FUSION_SHELL_E2E_PROJECT');
export const CLUSTER = Cypress.env('FUSION_SHELL_E2E_CLUSTER');
export const BASE_URL = `https://${ORG}.local.cognite.ai:4200`;
export const AAD_IDP_INTERNAL_ID = Cypress.env(
  'FUSION_SHELL_E2E_AAD_IDP_INTERNAL_ID'
);
export const AAD_USERNAME = Cypress.env('FUSION_SHELL_E2E_AAD_USERNAME');
export const AAD_PASSWORD = Cypress.env('FUSION_SHELL_E2E_AAD_PASSWORD');
