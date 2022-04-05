export const CLUSTER = Cypress.env('CLUSTER') || 'bluefield';
export const PROJECT = Cypress.env('PROJECT') || `discover-dev-${CLUSTER}`;
export const USER_PREFIX = Cypress.env('USER_PREFIX') || 'dev';
