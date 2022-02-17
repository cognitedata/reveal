import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`I see {string} in the page`, (text) => {
  cy.contains(text).should('exist');
});
