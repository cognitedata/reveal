export const CLUSTER = Cypress.env('CLUSTER') || 'azure-dev';
export const PROJECT = Cypress.env('PROJECT') || `react-demo-app-${CLUSTER}`;
